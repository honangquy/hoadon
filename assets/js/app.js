// App JS - Dynamic tab system & basic navigation
(function() {
  const menu = document.getElementById('menu');
  const tabBar = document.getElementById('tabBar');
  const contentArea = document.getElementById('contentArea');
  const goBackBtn = document.getElementById('goBack');
  const goHomeBtn = document.getElementById('goHome');

  // (company data helpers moved to assets/js/congty.js)
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const sidebar = document.getElementById('sidebar');
  const tabScrollPrev = document.getElementById('tabScrollPrev');
  const tabScrollNext = document.getElementById('tabScrollNext');

  const stateHistory = [];
  let currentPage = null;

  // Menu open groups persistence key
  const MENU_STATE_KEY = 'hoadon_open_groups';
  // helper used to tell loadPage to tag the next-created tab with a specific group id
  let pendingGroupTag = null;

  function getGroupId(li) {
    const span = li.querySelector('.group-toggle span');
    if (span) return span.textContent.trim();
    // fallback to index
    return Array.from(menu.querySelectorAll('.menu-group')).indexOf(li).toString();
  }

  function saveOpenGroups() {
    const opens = Array.from(menu.querySelectorAll('.menu-group.open')).map(getGroupId);
    try { localStorage.setItem(MENU_STATE_KEY, JSON.stringify(opens)); } catch (e) { /* ignore */ }
  }

  function restoreOpenGroups() {
    let raw = null;
    try { raw = localStorage.getItem(MENU_STATE_KEY); } catch (e) { raw = null; }
    if (!raw) {
      // ensure no groups are force-opened by default
      menu.querySelectorAll('.menu-group').forEach(li => li.classList.remove('open'));
      return;
    }
    let ids = [];
    try { ids = JSON.parse(raw) || []; } catch (e) { ids = []; }
    // normalize ids (trim and remove empties) to be more robust against older/dirty stored values
    ids = ids.map(id => String(id || '').trim()).filter(Boolean);
    menu.querySelectorAll('.menu-group').forEach(li => {
      const id = getGroupId(li);
      if (ids.includes(id)) li.classList.add('open'); else li.classList.remove('open');
    });
  }


  function loadPage(pageId) {
    // Prevent duplicates - if exists, just activate
    const existing = tabBar.querySelector(`[data-tab='${pageId}']`);
    if (existing) {
      // If a pendingGroupTag exists (set by a recent group header click), attach it to
      // the existing tab immediately and consume the pending tag so it doesn't
      // accidentally get applied to the next-created tab (which would cause submenu
      // item tabs like "Công ty" to show the group popup).
      try {
        if (pendingGroupTag) {
          const existingLi = existing.closest('li');
          if (existingLi) {
            existingLi.dataset.group = pendingGroupTag;
            existingLi.classList.add('group-tab');
          }
          pendingGroupTag = null;
        }
      } catch (e) { /* ignore */ }
      activateTab(existing.closest('li'));
      return;
    }

    // Build tab label map and extract icon (if menu item has an SVG)
    const labelEl = menu.querySelector(`[data-page='${pageId}']`);
    const label = labelEl ? labelEl.textContent.trim() : pageId;
    let iconHtml = '';
    if (labelEl) {
      const sv = labelEl.querySelector('svg');
      if (sv) iconHtml = sv.outerHTML;
    }

  const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.tab = pageId;
  // include icon (if present) and label
  btn.innerHTML = `${iconHtml}<span class="label">${label}</span>`;

  const close = document.createElement('button');
  close.className = 'close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Đóng tab');
  close.innerHTML = '<span aria-hidden="true">×</span>';
    close.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentLi = li;
      const isActive = parentLi.classList.contains('active');
      parentLi.remove();
      // remove content pane
      const pane = contentArea.querySelector(`[data-pane='${pageId}']`);
      if (pane) pane.remove();
      if (isActive) {
        // Activate last tab or show welcome
        const last = tabBar.querySelector('li:last-child button.tab');
        if (last) {
          activateTab(last.parentElement);
        } else {
          showWelcome();
        }
      }
    });

  // append tab button and close button as siblings to avoid nesting buttons
  btn.addEventListener('click', () => activateTab(li));
  li.appendChild(btn);
  li.appendChild(close);
  tabBar.appendChild(li);

    // If a pending group tag was set (via clicking a group header), attach it to the tab.
    // Otherwise attempt to infer group from the menu item that produced this tab.
    try {
      if (pendingGroupTag) {
        // Tag tabs explicitly created by clicking a group header and mark as group-tab
        li.dataset.group = pendingGroupTag;
        li.classList.add('group-tab');
        pendingGroupTag = null;
      }
      // NOTE: do not infer groups from menu items automatically — only tabs created by group clicks
    } catch (e) { /* ignore */ }

    // Create content pane
    const pane = document.createElement('div');
    pane.dataset.pane = pageId;
    pane.className = 'pane';
    // render with guard so a JS error doesn't leave a blank page
    try {
      pane.innerHTML = renderPage(pageId);
    } catch (err) {
      console.error('Error rendering page', pageId, err);
      pane.innerHTML = `<div class="card"><h2>Lỗi khi tải trang</h2><pre style="white-space:pre-wrap;color:#a00">${String(err.message || err)}</pre><p>Kiểm tra console để biết thêm chi tiết.</p></div>`;
    }
    contentArea.appendChild(pane);

    activateTab(li);
    queueMicrotask(scrollActiveTabIntoView);

    // Company page wiring moved to assets/js/congty.js which exposes renderCompanyPage() and initCompanyPage()
    if (pageId === 'congty') {
      // initCompanyPage will attach events after the pane is added to DOM
      if (window.initCompanyPage) setTimeout(() => window.initCompanyPage(), 20);
    }
  }

  function activateTab(li) {
    tabBar.querySelectorAll('li').forEach(l => l.classList.remove('active'));
    li.classList.add('active');
    const tabId = li.querySelector('.tab').dataset.tab;
    currentPage = tabId;

    contentArea.querySelectorAll('[data-pane]').forEach(p => p.style.display = 'none');
    const pane = contentArea.querySelector(`[data-pane='${tabId}']`);
    if (pane) pane.style.display = '';

    // push history
    if (!stateHistory.length || stateHistory[stateHistory.length-1] !== tabId) {
      stateHistory.push(tabId);
    }
    goBackBtn.disabled = stateHistory.length <= 1;

    // Sync menu selection: find the menu item with matching data-page and mark active
    try {
      menu.querySelectorAll('[data-page]').forEach(m => m.classList.remove('active'));
      const menuEl = menu.querySelector(`[data-page='${tabId}']`);
      if (menuEl) menuEl.classList.add('active');
    } catch (e) { /* ignore in case menu isn't available */ }
  }

  function showWelcome() {
    currentPage = null;
    contentArea.querySelectorAll('[data-pane]').forEach(p => p.remove());
    // Ẩn luôn phần chào mừng
    const existing = contentArea.querySelector('[data-initial]');
    if (existing) existing.style.display = 'none';
    goBackBtn.disabled = true;
  }

  function renderPage(pageId) {
    // synthetic group pages start with 'group:'
    if (String(pageId).startsWith('group:')) {
      const name = String(pageId).slice(6);
      return card(name, `<p>Trang nhóm: ${name}</p>`);
    }

    switch(pageId) {
      case 'congty':
        return renderCompanyPage();
      case 'nhansu':
        return card('Danh sách nhân sự', '<p>Đang cập nhật...</p>');
      case 'chamcong':
        return card('Nhập công', '<p>Module nhập công đang được phát triển.</p>');
      case 'taodonxinphep':
        setTimeout(() => {
          const modal = document.getElementById('modal-xinphep');
          modal.style.display = '';
          const form = document.getElementById('xinphepForm');
          form.reset();
          setTimeout(()=>form.hoten.focus(), 50);
          document.getElementById('modalXinphepCancel').onclick = function() {
            modal.style.display = 'none';
          };
          modal.querySelector('.modal-backdrop').onclick = function() {
            modal.style.display = 'none';
          };
          form.onsubmit = function(e) {
            e.preventDefault();
            alert('Đã gửi đơn (demo):\n' + JSON.stringify(Object.fromEntries(new FormData(form)),null,2));
            modal.style.display = 'none';
          };
        }, 10);
        return card('Tạo đơn xin phép', '<p><em>Nhấn nút bên dưới để mở form xin phép.</em></p><button id="openXinphep" class="action-btn" style="margin-top:10px"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#1976ff" stroke-width="2"/><path d="M8 11h8M8 15h5" stroke="#1976ff" stroke-width="2" stroke-linecap="round"/></svg> Mở form xin phép</button>');
      default:
        return card('Trang: ' + pageId, '<p>Đang cập nhật nội dung.</p>');
    }
  }

  function card(title, bodyHtml) {
    return `<div class="card"><h2>${title}</h2>${bodyHtml}</div>`;
  }

  function renderCompanyPage() {
    if (window.renderCompanyPage) return window.renderCompanyPage();
    return card('Danh sách công ty', '<p>Module Công ty chưa sẵn sàng.</p>');
  }

  // Attach per-group toggle handlers and a simple delegated page-link handler.
  try {
    // Per-group toggle: robust, less ambiguity than large delegated toggles
    menu.querySelectorAll('.menu-group').forEach(li => {
      const btn = li.querySelector('.group-toggle');
      const submenu = li.querySelector('.submenu');
      // ensure initial visual state matches class
      if (submenu) submenu.style.display = li.classList.contains('open') ? 'block' : 'none';
      if (!btn) return;
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        try {
          const beforeDisplay = submenu ? window.getComputedStyle(submenu).display : '(no submenu)';
          const wasOpen = li.classList.contains('open');
          const nowOpen = !wasOpen;
          if (nowOpen) li.classList.add('open'); else li.classList.remove('open');
          // force menu visible via inline style to avoid unexpected CSS conflicts
          if (submenu) submenu.style.display = nowOpen ? 'block' : 'none';
          // small reflow to ensure browser paints correctly
          void li.offsetHeight;
          const afterDisplay = submenu ? window.getComputedStyle(submenu).display : '(no submenu)';
          saveOpenGroups();
          // After toggling, open a group-labelled tab (so the tab shows the group name)
          try {
            const gid = getGroupId(li);
            if (gid) {
              // create a synthetic page id for the group tab to avoid colliding with submenu pages
              const groupPageId = 'group:' + gid;
              // tell loadPage to attach this group id to the new tab
              pendingGroupTag = gid;
              // load a lightweight group page (could be replaced with a real render function)
              loadPage(groupPageId);
              // populate a simple pane if not already handled by renderPage
              const pane = contentArea.querySelector(`[data-pane='${groupPageId}']`);
              if (pane && pane.innerHTML.trim() === '') pane.innerHTML = `<div class="card"><h2>${gid}</h2><p>Trang nhóm: ${gid}</p></div>`;
            }
          } catch (e) { /* ignore */ }
        } catch (err) { /* ignore */ }
      });
    });

    // Delegated page link handler (keeps submenu handling separate)
    menu.addEventListener('click', (e) => {
      const a = e.target.closest('[data-page]');
      if (!a) return;
      e.preventDefault();
      // hide welcome and open page
      const welcome = contentArea.querySelector('[data-initial]');
      if (welcome) welcome.style.display = 'none';
      const pid = a.dataset.page;
      if (pid === 'taodonxinphep') loadPage('taodonxinphep'); else loadPage(pid);
      menu.querySelectorAll('a').forEach(x=>x.classList.remove('active'));
      if (a.tagName === 'A') a.classList.add('active');
    });
  } catch (e) { /* ignore */ }

  goBackBtn.addEventListener('click', () => {
    if (stateHistory.length > 1) {
      stateHistory.pop(); // remove current
      const prev = stateHistory[stateHistory.length -1];
      if (prev) {
        const tab = tabBar.querySelector(`[data-tab='${prev}']`);
        if (tab) activateTab(tab.closest('li')); else showWelcome();
      } else {
        showWelcome();
      }
    }
    goBackBtn.disabled = stateHistory.length <= 1;
  });

  if (goHomeBtn) {
    // make sure SVG or other non-button element behaves like a button for mouse and keyboard
    const goHomeAction = () => {
      tabBar.innerHTML = '';
      showWelcome();
    };

    goHomeBtn.addEventListener('click', goHomeAction);
    // support Enter and Space keys for keyboard users (SVG with role="button" needs this)
    goHomeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        goHomeAction();
      }
    });
    // ensure non-button elements show pointer cursor
    try { goHomeBtn.style.cursor = goHomeBtn.style.cursor || 'pointer'; } catch (e) { /* ignore */ }
  }

  toggleSidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });

  // Theme toggle removed — app uses the single light theme defined in CSS :root

  // Sanitize persisted menu state so older/dirty entries for our new groups don't reopen them
  try {
    const raw = localStorage.getItem(MENU_STATE_KEY);
    if (raw) {
      let ids = [];
      try { ids = JSON.parse(raw) || []; } catch (e) { ids = []; }
      // normalize and filter out our forced-closed groups (trim to catch whitespace variants)
      const normalized = ids.map(id => String(id || '').trim()).filter(Boolean);
      const filtered = normalized.filter(id => !['Biểu mẫu', 'Điều khiển sản phẩm'].includes(id));
      try { localStorage.setItem(MENU_STATE_KEY, JSON.stringify(filtered)); } catch (e) { /* ignore */ }
    }
  } catch (e) { /* ignore */ }

  // restore menu groups open/closed state
  restoreOpenGroups();

  // Keep specific new groups closed by default as a safety (remove open class if present)
  try {
    const forcedClosed = ['Biểu mẫu', 'Điều khiển sản phẩm'];
    menu.querySelectorAll('.menu-group').forEach(li => {
      try {
        const span = li.querySelector('.group-toggle span');
        const txt = span ? span.textContent.trim() : '';
        if (forcedClosed.includes(txt)) li.classList.remove('open');
      } catch (e) { /* ignore individual errors */ }
    });
  } catch (e) { /* ignore */ }

  function scrollActiveTabIntoView() {
    const active = tabBar.querySelector('.tab.active');
    if (active) {
      const rect = active.getBoundingClientRect();
      const wrapRect = tabBar.getBoundingClientRect();
      if (rect.left < wrapRect.left) {
        tabBar.scrollLeft -= (wrapRect.left - rect.left) + 20;
      } else if (rect.right > wrapRect.right) {
        tabBar.scrollLeft += (rect.right - wrapRect.right) + 20;
      }
    }
  }

  // Floating submenu popup when hovering a tab that belongs to a grouped menu
  const tabSubmenuPopup = document.createElement('div');
  tabSubmenuPopup.className = 'tab-submenu-popup';
  tabSubmenuPopup.style.display = 'none';
  document.body.appendChild(tabSubmenuPopup);

  let popupHideTimer = null;

  function showTabSubmenuForGroup(groupId, anchorRect) {
    // anchorRect can be null; optionally record origin tab for focus return
    popupOriginTabBtn = popupOriginTabBtn || null;
    // find menu-group by groupId
    const groupLi = Array.from(menu.querySelectorAll('.menu-group')).find(li => getGroupId(li) === groupId);
    if (!groupLi) return hideTabSubmenu();
    const submenu = groupLi.querySelector('.submenu');
    if (!submenu) return hideTabSubmenu();

    // build popup content
    const links = Array.from(submenu.querySelectorAll('[data-page]'));
    if (!links.length) return hideTabSubmenu();
    tabSubmenuPopup.innerHTML = '';
    links.forEach(a => {
      const item = document.createElement('div');
      item.className = 'tab-submenu-item';
      item.innerHTML = `<span class="lbl">${a.textContent.trim()}</span>`;
      item.tabIndex = 0; // make focusable
      item.setAttribute('role','menuitem');
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        hideTabSubmenu();
        loadPage(a.dataset.page);
      });
      tabSubmenuPopup.appendChild(item);
    });

    // position popup under the anchor (tab button rect)
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let left = Math.round(anchorRect.left);
    // clamp so it doesn't go out of viewport
    if (left + 240 > vw - 8) left = Math.max(8, vw - 248);
    const top = Math.round(anchorRect.bottom + 6);
    tabSubmenuPopup.style.left = left + 'px';
    tabSubmenuPopup.style.top = top + 'px';
    tabSubmenuPopup.style.display = 'block';
    tabSubmenuPopup.style.opacity = '1';
    // reset keyboard focus index
    popupFocusedIndex = -1;
  }

  function hideTabSubmenu() {
    if (popupHideTimer) { clearTimeout(popupHideTimer); popupHideTimer = null; }
    tabSubmenuPopup.style.opacity = '0';
    // small timeout to allow CSS transition
    popupHideTimer = setTimeout(()=> { tabSubmenuPopup.style.display = 'none'; }, 180);
    popupOriginTabBtn = null;
  }

  // show popup on hover over a tab that has data-group (use pointerover/pointerout with relatedTarget checks)
  let lastHoverTab = null;
  tabBar.addEventListener('pointerover', (e) => {
    const tabBtn = e.target.closest('button.tab');
    if (!tabBtn) return;
    // if we moved between children of the same tab, ignore
    if (lastHoverTab === tabBtn) return;
    lastHoverTab = tabBtn;
  const parentLi = tabBtn.closest('li');
  const groupId = parentLi?.dataset.group;
  // require explicit group-tab marker to avoid showing popup for submenu-item tabs
  if (!groupId || !parentLi.classList.contains('group-tab')) return;
    const rect = tabBtn.getBoundingClientRect();
    if (popupHideTimer) { clearTimeout(popupHideTimer); popupHideTimer = null; }
    popupOriginTabBtn = tabBtn;
    showTabSubmenuForGroup(groupId, rect);
  });

  tabBar.addEventListener('pointerout', (e) => {
    // pointerout bubbles; use relatedTarget to determine where pointer went
    const related = e.relatedTarget;
    // if moving into the popup, keep it open
    if (related && tabSubmenuPopup.contains(related)) return;
    // if moving to another tab inside tabBar, let pointerover handler handle it
    const toTab = related && related.closest ? related.closest('button.tab') : null;
    if (toTab && tabBar.contains(related)) return;
    // otherwise start hide timer
    if (popupHideTimer) clearTimeout(popupHideTimer);
    popupHideTimer = setTimeout(() => { hideTabSubmenu(); lastHoverTab = null; }, 180);
  });
  tabSubmenuPopup.addEventListener('mouseenter', () => { if (popupHideTimer) { clearTimeout(popupHideTimer); popupHideTimer = null; } });
  tabSubmenuPopup.addEventListener('mouseleave', () => { hideTabSubmenu(); });

  // Track popup origin and keyboard focus state
  let popupOriginTabBtn = null;
  let popupFocusedIndex = -1;

  // Keyboard navigation for tabs and popup
  tabBar.addEventListener('keydown', (e) => {
    const tabBtn = e.target.closest('button.tab');
    if (!tabBtn) return;
    // Left/Right move between tabs (focus only)
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const all = Array.from(tabBar.querySelectorAll('button.tab'));
      const idx = all.indexOf(tabBtn);
      const next = all[(idx + 1) % all.length];
      if (next) next.focus();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const all = Array.from(tabBar.querySelectorAll('button.tab'));
      const idx = all.indexOf(tabBtn);
      const prev = all[(idx - 1 + all.length) % all.length];
      if (prev) prev.focus();
      return;
    }
    // Down opens group popup (if any) and focuses first item
    if (e.key === 'ArrowDown') {
      const groupId = tabBtn.closest('li')?.dataset.group;
      if (groupId) {
        e.preventDefault();
        popupOriginTabBtn = tabBtn;
        showTabSubmenuForGroup(groupId, tabBtn.getBoundingClientRect());
        // focus first item after a short delay to let popup render
        setTimeout(() => {
          const items = tabSubmenuPopup.querySelectorAll('.tab-submenu-item');
          if (items.length) { popupFocusedIndex = 0; items[0].focus(); }
        }, 10);
      }
    }
  });

  // Keyboard inside popup
  tabSubmenuPopup.addEventListener('keydown', (e) => {
    const items = Array.from(tabSubmenuPopup.querySelectorAll('.tab-submenu-item'));
    if (!items.length) return;
    const active = document.activeElement;
    let idx = items.indexOf(active);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      idx = (idx + 1) % items.length;
      items[idx].focus();
      popupFocusedIndex = idx;
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      idx = (idx - 1 + items.length) % items.length;
      items[idx].focus();
      popupFocusedIndex = idx;
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (active && active.classList.contains('tab-submenu-item')) active.click();
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      hideTabSubmenu();
      if (popupOriginTabBtn) popupOriginTabBtn.focus();
      return;
    }
  });

  // Touch behavior: first tap on tab shows popup (if group exists), second tap activates
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
  if (isTouch) {
    tabBar.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType !== 'touch') return;
      const tabBtn = ev.target.closest('button.tab');
      if (!tabBtn) return;
      const li = tabBtn.closest('li');
      const groupId = li?.dataset.group;
      // If group exists and popup not visible for this tab, show popup and prevent default activation
      const popupVisibleForThis = popupOriginTabBtn === tabBtn && tabSubmenuPopup.style.display !== 'none';
      if (groupId && !popupVisibleForThis) {
        ev.preventDefault();
        popupOriginTabBtn = tabBtn;
        showTabSubmenuForGroup(groupId, tabBtn.getBoundingClientRect());
        return;
      }
      // else allow normal activation (second tap)
    }, { passive: false });
    // Tap outside hides the popup
    document.addEventListener('pointerdown', (ev) => {
      if (ev.pointerType !== 'touch') return;
      if (tabSubmenuPopup.contains(ev.target)) return;
      if (tabBar.contains(ev.target)) return;
      hideTabSubmenu();
    });
  }

  tabScrollPrev.addEventListener('click', ()=> {
    tabBar.scrollBy({left: -150, behavior:'smooth'});
  });
  tabScrollNext.addEventListener('click', ()=> {
    tabBar.scrollBy({left: 150, behavior:'smooth'});
  });

  // Example: open some default tabs for demonstration
  // loadPage('congty');

  // Theme handling: custom popover switcher
  const THEME_KEY = 'hoadon_theme';
  const themeSwitcher = document.getElementById('themeSwitcher');
  const themeBtn = document.getElementById('themeBtn');
  const themeMenu = document.getElementById('themeMenu');

  function applyTheme(name) {
    try {
      document.documentElement.setAttribute('data-theme', name);
      // Fallback: set a few CSS vars on :root in case attribute selectors aren't applied immediately
      const presets = {
        blue: { '--color-primary': '#0057d8', '--color-primary-accent': '#1976ff', '--color-sidebar-top': '#0a4da8', '--color-sidebar-bottom': '#003f8f' },
        red: { '--color-primary': '#8b0000', '--color-primary-accent': '#b22222', '--color-sidebar-top': '#6e0000', '--color-sidebar-bottom': '#4a0000' },
        green: { '--color-primary': '#006400', '--color-primary-accent': '#007a1f', '--color-sidebar-top': '#0f6b2b', '--color-sidebar-bottom': '#004d18' }
      };
      const p = presets[name] || presets.blue;
      Object.keys(p).forEach(k => document.documentElement.style.setProperty(k, p[k]));
    } catch (e) { /* ignore */ }
  }

  function setBtnSwatch(name) {
    if (!themeBtn) return;
    const sw = themeBtn.querySelector('.swatch');
    if (!sw) return;
    sw.classList.remove('blue','red','green');
    sw.classList.add(name);
  }

  function setSelectedTheme(name, persist = true) {
    applyTheme(name);
    setBtnSwatch(name);
    if (themeBtn) themeBtn.setAttribute('data-theme', name);
    try { if (persist) localStorage.setItem(THEME_KEY, name); } catch (e) {}
  }

  function openThemeMenu() {
    if (!themeMenu || !themeSwitcher || !themeBtn) return;
    themeMenu.hidden = false;
    themeBtn.classList.add('open');
    themeBtn.setAttribute('aria-expanded','true');
    // Position menu fixed in the viewport, centered under the button, clamped to viewport
    const btnRect = themeBtn.getBoundingClientRect();
    const menuRect = themeMenu.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    // compute ideal left so menu is centered under button
    let left = btnRect.left + (btnRect.width / 2) - (menuRect.width / 2);
    // clamp within viewport with 6px margin
    const minLeft = 6;
    const maxLeft = vw - menuRect.width - 6;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = Math.max(minLeft, maxLeft);
    // compute top (place below button if enough space, otherwise place above)
    const spaceBelow = vh - (btnRect.bottom);
    let top = btnRect.bottom + 8; // default below
    if (spaceBelow < menuRect.height + 8) {
      // not enough space below -> place above
      top = btnRect.top - menuRect.height - 8;
      // if still negative, clamp to 6
      if (top < 6) top = 6;
    }
    themeMenu.style.left = left + 'px';
    themeMenu.style.top = top + 'px';
    const opt = themeMenu.querySelector('.theme-option');
    if (opt) opt.focus();
    document.addEventListener('mousedown', onDocClickClose);
    window.addEventListener('resize', onWindowResize);
  }

  function closeThemeMenu() {
    if (!themeMenu || !themeBtn) return;
    themeMenu.hidden = true;
    themeBtn.classList.remove('open');
    themeBtn.setAttribute('aria-expanded','false');
    themeBtn.focus();
    document.removeEventListener('mousedown', onDocClickClose);
    window.removeEventListener('resize', onWindowResize);
  }

  function onDocClickClose(e) {
    if (!themeSwitcher) return;
    if (!themeSwitcher.contains(e.target)) closeThemeMenu();
  }

  function onWindowResize() { if (themeMenu && !themeMenu.hidden) openThemeMenu(); }

  // Initialize: load saved theme and update button swatch
  try {
    const saved = localStorage.getItem(THEME_KEY) || 'blue';
    setSelectedTheme(saved, false);
  } catch (e) { setSelectedTheme('blue', false); }

  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      if (themeMenu && !themeMenu.hidden) closeThemeMenu(); else openThemeMenu();
    });
    themeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); if (themeMenu && !themeMenu.hidden) closeThemeMenu(); else openThemeMenu();
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); openThemeMenu(); }
    });
  }

  if (themeMenu) {
    themeMenu.addEventListener('click', (e) => {
      const btn = e.target.closest('.theme-option');
      if (!btn) return;
      const name = btn.dataset.theme;
      if (name) setSelectedTheme(name, true);
      closeThemeMenu();
    });
    themeMenu.addEventListener('keydown', (e) => {
      const items = Array.from(themeMenu.querySelectorAll('.theme-option'));
      const idx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); const next = items[(idx + 1) % items.length]; if (next) next.focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); const prev = items[(idx - 1 + items.length) % items.length]; if (prev) prev.focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeThemeMenu(); }
      else if (e.key === 'Enter' && document.activeElement.classList.contains('theme-option')) { e.preventDefault(); document.activeElement.click(); }
    });
  }
})();
