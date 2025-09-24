<?php
// Database connection helper (PDO) - edit credentials below
// Save this file as UTF-8 without BOM

$DB_HOST = '127.0.0.1';
$DB_PORT = '3306';
$DB_NAME = 'hoadon';
$DB_USER = 'root';
$DB_PASS = ''; // set your mysql password

$dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ]);
} catch (PDOException $e) {
    // For production, don't output raw errors
    die('Database connection failed: ' . $e->getMessage());
}

return $pdo;
