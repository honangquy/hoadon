// Company page rendering and event wiring (moved out of app.js to keep app.js smaller)
(function(){
  function getDefaultCompanies() { return []; }

  function loadCompaniesFromLocal() {
    try {
      const stored = localStorage.getItem('companies');
      return stored ? JSON.parse(stored) : getDefaultCompanies();
    } catch (e) {
      console.error('Error loading companies from localStorage:', e);
      return getDefaultCompanies();
    }
  }

  function saveCompaniesToLocal(companies) {
    try { localStorage.setItem('companies', JSON.stringify(companies)); } catch (e) { console.error('Error saving companies to localStorage:', e); }
  }

  // Render function returns the HTML for the company page
  window.renderCompanyPage = function() {
    const companies = loadCompaniesFromLocal();
    let tableRows = '';
    companies.forEach((company, index) => {
      tableRows += `
        <tr>
          <td><input type="checkbox" class="row-check" title="Chọn dòng này" /></td>
          <td>${index + 1}</td>
          <td>${company.ma}</td>
          <td>${company.ten}</td>
          <td>${company.diachi}</td>
          <td>${company.giamdoc}</td>
          <td>${company.dt}</td>
          <td>${company.fax}</td>
          <td>${company.web}</td>
          <td>${company.mst}</td>
          <td style="text-align:center;vertical-align:middle;">
            <div style="display:flex;justify-content:center;align-items:center;gap:6px;min-width:110px;">
              <button class="action-btn" data-row-action="edit" title="Sửa"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16.862 5.487a2.1 2.1 0 0 1 2.97 2.97L8.5 19.79l-4 1 1-4 12.362-12.303Z" stroke="#1976ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
              <button class="action-btn" data-row-action="delete" title="Xoá"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12Z" stroke="#e54848" stroke-width="2" stroke-linecap="round"/></svg></button>
              <button class="action-btn" data-row-action="lock" title="Khóa"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="8" rx="2" stroke="#f5a623" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#f5a623" stroke-width="2"/></svg></button>
              <button class="action-btn" data-row-action="unlock" title="Mở khóa"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="8" rx="2" stroke="#2d9d50" stroke-width="2"/><path d="M17 11V7a5 5 0 0 0-10 0" stroke="#2d9d50" stroke-width="2"/></svg></button>
            </div>
          </td>
        </tr>`;
    });

    return `<div class="card">
      <h2>Danh sách công ty</h2>
      <div class="table-toolbar">
        <button class="action-btn" data-action="add" title="Thêm">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="#1976ff" stroke-width="2" stroke-linecap="round"/></svg> Thêm
        </button>
        <button class="action-btn" data-action="edit" title="Sửa">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16.862 5.487a2.1 2.1 0 0 1 2.97 2.97L8.5 19.79l-4 1 1-4 12.362-12.303Z" stroke="#1976ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Sửa
        </button>
        <button class="action-btn" data-action="delete" title="Xoá">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12Z" stroke="#e54848" stroke-width="2" stroke-linecap="round"/></svg> Xoá
        </button>
        <button class="action-btn" data-action="lock" title="Khóa">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="8" rx="2" stroke="#f5a623" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#f5a623" stroke-width="2"/></svg> Khóa
        </button>
        <button class="action-btn" data-action="unlock" title="Mở khóa">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="8" rx="2" stroke="#2d9d50" stroke-width="2"/><path d="M17 11V7a5 5 0 0 0-10 0" stroke="#2d9d50" stroke-width="2"/></svg> Mở khóa
        </button>
        <button class="action-btn" data-action="reload" title="Nạp lại">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M4 4v5h.582M20 20v-5h-.581M19.418 9A7.978 7.978 0 0 0 12 4a8 8 0 1 0 7.418 5" stroke="#1976ff" stroke-width="2" stroke-linecap="round"/></svg> Nạp lại
        </button>
        <button class="action-btn" data-action="filter" title="Lọc">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 5h18M6 10h12M10 15h4" stroke="#1976ff" stroke-width="2" stroke-linecap="round"/></svg> Lọc
        </button>
        <button class="action-btn" data-action="help" title="Trợ giúp">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#f5a623" stroke-width="2"/><path d="M12 16v-1m0-4a2 2 0 1 1 2 2c0 1-2 1-2 3" stroke="#f5a623" stroke-width="2" stroke-linecap="round"/></svg> Trợ giúp
        </button>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th><input type="checkbox" id="checkAllCompany" title="Chọn tất cả" /></th>
              <th>STT</th>
              <th>Mã công ty</th>
              <th>Tên công ty</th>
              <th>Địa chỉ</th>
              <th>Giám đốc</th>
              <th>Điện thoại</th>
              <th>Fax</th>
              <th>Web</th>
              <th>Mã số thuế</th>
              <th style="min-width:120px;width:130px;text-align:center;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </div>`;
  };

  // Attach events after the company pane has been inserted into DOM
  window.initCompanyPage = function() {
    // Delay tiny bit to ensure DOM elements are present
    setTimeout(() => {
      const table = document.querySelector('.table');
      const modalConfirm = document.getElementById('modal-confirm');
      const modalForm = document.getElementById('modal-form');
      const form = document.getElementById('companyForm');

  // Checkbox behaviors
  const checkAll = document.getElementById('checkAllCompany');
      const rowChecks = document.querySelectorAll('.row-check');
      if (checkAll) {
        checkAll.onclick = function() {
          rowChecks.forEach(cb => { cb.checked = checkAll.checked; cb.closest('tr').classList.toggle('selected', cb.checked); });
        };
      }
      rowChecks.forEach(cb => {
        cb.onclick = function() {
          cb.closest('tr').classList.toggle('selected', cb.checked);
          if (!cb.checked && checkAll) checkAll.checked = false;
          if ([...rowChecks].every(x=>x.checked) && checkAll) checkAll.checked = true;
        };
      });

      // Toolbar actions
      document.querySelectorAll('.table-toolbar .action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const act = this.dataset.action;
          if (act === 'add') openForm('add');
          else if (act === 'edit') {
            const checked = table.querySelector('tbody .row-check:checked');
            if (checked) openForm('edit', checked.closest('tr')); else alert('Chọn dòng cần sửa!');
          } else if (act === 'delete') {
            const checked = table.querySelectorAll('tbody .row-check:checked');
            if (checked.length) {
              if (confirm('Bạn có chắc chắn muốn xoá các dòng đã chọn?')) {
                const companies = loadCompaniesFromLocal();
                const masToDelete = [];
                checked.forEach(cb => { const row = cb.closest('tr'); const ma = row.children[2].textContent.trim(); masToDelete.push(ma); row.remove(); });
                const updatedCompanies = companies.filter(c => !masToDelete.includes(c.ma));
                saveCompaniesToLocal(updatedCompanies);
              }
            } else alert('Chọn dòng cần xoá!');
          } else if (act === 'reload') { window.loadPage && window.loadPage('congty'); }
          else if (act === 'filter') {
            let filterInput = document.getElementById('companyFilterInput');
            let filterClose = document.getElementById('companyFilterClose');
            if (!filterInput) {
              const group = document.createElement('span');
              group.style = 'display:inline-flex;align-items:center;gap:2px;';
              filterInput = document.createElement('input');
              filterInput.type = 'search';
              filterInput.id = 'companyFilterInput';
              filterInput.placeholder = 'Tìm kiếm công ty...';
              filterInput.style = 'margin-left:12px; min-width:180px; max-width:260px; padding:6px 10px; border-radius:4px; border:1px solid #d9e1ec; font-size:15px;';
              filterClose = document.createElement('button');
              filterClose.type = 'button';
              filterClose.id = 'companyFilterClose';
              filterClose.title = 'Đóng tìm kiếm';
              filterClose.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f5f7fb" stroke="#e54848" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="#e54848" stroke-width="2" stroke-linecap="round"/></svg>';
              filterClose.style = 'background:none;border:none;cursor:pointer;padding:0 2px;';
              group.appendChild(filterInput);
              group.appendChild(filterClose);
              this.parentNode.appendChild(group);
              filterInput.addEventListener('input', function() {
                const val = this.value.trim().toLowerCase();
                table.querySelectorAll('tbody tr').forEach(tr => {
                  const ma = (tr.children[2]?.textContent||'').toLowerCase();
                  const ten = (tr.children[3]?.textContent||'').toLowerCase();
                  tr.style.display = (!val || ma.includes(val) || ten.includes(val)) ? '' : 'none';
                });
              });
              filterClose.addEventListener('click', function() { group.remove(); table.querySelectorAll('tbody tr').forEach(tr => { tr.style.display = ''; }); });
            }
            filterInput.focus();
          } else alert('Bạn vừa nhấn: ' + this.title);
        });
      });

      // Row actions
      document.querySelectorAll('button[data-row-action]').forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          const act = this.dataset.rowAction;
          const row = this.closest('tr');
          if (act === 'edit') openForm('edit', row);
          else if (act === 'delete') {
            if (confirm('Bạn có chắc chắn muốn xoá dòng này?')) {
              const companies = loadCompaniesFromLocal();
              const ma = row.children[2].textContent.trim();
              const updatedCompanies = companies.filter(c => c.ma !== ma);
              saveCompaniesToLocal(updatedCompanies);
              row.remove();
            }
          } else if (act === 'lock') row.classList.add('locked');
          else if (act === 'unlock') row.classList.remove('locked');
        });
      });

      // Modal confirm
      function openConfirm(row) {
        if (!modalConfirm) return;
        modalConfirm.style.display = '';
        setTimeout(()=>modalConfirm.querySelector('button').focus(), 50);
      }
      const modalConfirmYes = document.getElementById('modalConfirmYes');
      const modalConfirmNo = document.getElementById('modalConfirmNo');
      if (modalConfirmYes) modalConfirmYes.onclick = function() { modalConfirm.style.display = 'none'; };
      if (modalConfirmNo) modalConfirmNo.onclick = function() { modalConfirm.style.display = 'none'; };
      if (modalConfirm && modalConfirm.querySelector('.modal-backdrop')) modalConfirm.querySelector('.modal-backdrop').onclick = function() { modalConfirm.style.display = 'none'; };

      // Modal form logic
      function openForm(type, row) {
        if (!modalForm) return;
        modalForm.style.display = '';
        const titleEl = document.getElementById('modalFormTitle');
  if (titleEl) titleEl.innerHTML = `<span style="display:inline-flex;align-items:center"><svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4" stroke="#1976ff" stroke-width="2"/><path d="M8 11h8M8 15h5" stroke="#1976ff" stroke-width="2" stroke-linecap="round"/></svg></span> <span>${type==='add' ? 'Thêm công ty' : 'Sửa công ty'}</span>`;
        if (form) form.reset();
        if (type==='edit' && row && form) {
          const tds = row.querySelectorAll('td');
          form.ma.value = tds[2].textContent.trim();
          form.ten.value = tds[3].textContent.trim();
          form.diachi.value = tds[4].textContent.trim();
          form.giamdoc.value = tds[5].textContent.trim();
          form.dt.value = tds[6].textContent.trim();
          form.fax.value = tds[7].textContent.trim();
          form.web.value = tds[8].textContent.trim();
          form.mst.value = tds[9].textContent.trim();
          form._editRow = row;
        } else if (form) form._editRow = null;
        setTimeout(()=> form && form.ma && form.ma.focus(), 50);
      }
      if (document.getElementById('modalFormCancel')) document.getElementById('modalFormCancel').onclick = function() { if (modalForm) modalForm.style.display = 'none'; };
      if (modalForm && modalForm.querySelector('.modal-backdrop')) modalForm.querySelector('.modal-backdrop').onclick = function() { modalForm.style.display = 'none'; };

      if (form) form.onsubmit = function(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));
        const companies = loadCompaniesFromLocal();
        if (form._editRow) {
          const oldMa = form._editRow.children[2].textContent.trim();
          const index = companies.findIndex(c => c.ma === oldMa);
          if (index !== -1) { companies[index] = data; saveCompaniesToLocal(companies); }
          const tds = form._editRow.querySelectorAll('td');
          tds[2].textContent = data.ma; tds[3].textContent = data.ten; tds[4].textContent = data.diachi; tds[5].textContent = data.giamdoc; tds[6].textContent = data.dt; tds[7].textContent = data.fax; tds[8].textContent = data.web; tds[9].textContent = data.mst;
        } else {
          companies.push(data); saveCompaniesToLocal(companies);
          const tableBody = document.querySelector('.table tbody');
          if (tableBody) {
            const stt = tableBody.children.length+1;
            const row = document.createElement('tr');
            row.innerHTML = `
              <td><input type="checkbox" class="row-check" title="Chọn dòng này" /></td>
              <td>${stt}</td>
              <td>${data.ma}</td>
              <td>${data.ten}</td>
              <td>${data.diachi}</td>
              <td>${data.giamdoc}</td>
              <td>${data.dt}</td>
              <td>${data.fax}</td>
              <td>${data.web}</td>
              <td>${data.mst}</td>
              <td style="text-align:center;vertical-align:middle;">
                <div style="display:flex;justify-content:center;align-items:center;gap:6px;min-width:110px;">
                  <button class="action-btn" data-row-action="edit" title="Sửa"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16.862 5.487a2.1 2.1 0 0 1 2.97 2.97L8.5 19.79l-4 1 1-4 12.362-12.303Z" stroke="#1976ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                  <button class="action-btn" data-row-action="delete" title="Xoá"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12Z" stroke="#e54848" stroke-width="2" stroke-linecap="round"/></svg></button>
                  <button class="action-btn" data-row-action="lock" title="Khóa"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="8" rx="2" stroke="#f5a623" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#f5a623" stroke-width="2"/></svg></button>
                  <button class="action-btn" data-row-action="unlock" title="Mở khóa"><svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="8" rx="2" stroke="#2d9d50" stroke-width="2"/><path d="M17 11V7a5 5 0 0 0-10 0" stroke="#2d9d50" stroke-width="2"/></svg></button>
                </div>
              </td>`;
            tableBody.appendChild(row);
          }
        }
        if (modalForm) modalForm.style.display = 'none';
      };
    }, 10);
  };

})();
