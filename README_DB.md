Database import and setup for Hoá Đơn project

1) Importing the SQL schema into MySQL (XAMPP)

- Using phpMyAdmin:
  - Open http://localhost/phpmyadmin
  - Create a new database named `hoadon` (utf8mb4_unicode_ci)
  - Import the file `db_schema.sql` (choose SQL file and upload)

- Using MySQL CLI (PowerShell)
  - If MySQL is in PATH:
```powershell
mysql -u root -p < db_schema.sql
```
  - If using XAMPP default MySQL binary path:
```powershell
"C:\\xampp\\mysql\\bin\\mysql.exe" -u root -p < db_schema.sql
```

2) After import
- Set an admin password: update the `users` table with a secure password hash (recommend using PHP's password_hash()).
  Example SQL to set password for id=1 (do from PHP or your app):
  - In PHP:
    $hash = password_hash('your-password-here', PASSWORD_DEFAULT);
    UPDATE users SET password_hash = '$hash' WHERE id = 1;

- Verify `Content-Type` header for your pages is `text/html; charset=UTF-8`.

3) DB connection example (see `config/db.php`) — edit credentials there.

4) Next steps / recommendations
- Add migration tooling (Phinx or Laravel migrations) for maintainability.
- Add more seed data relevant to your organization (departments, currencies).
- Ensure all PHP/JS files with Vietnamese text are saved as UTF-8 without BOM.
