<?php
require_once 'db.php';

// Справжній пароль
$password = 'admin123';

// PHP сам правильно його зашифрує
$real_hash = password_hash($password, PASSWORD_BCRYPT);

// Видаляємо старого адміна з фейковим хешем
$pdo->query("DELETE FROM system_users WHERE username = 'admin'");

// Створюємо нового з правильним хешем
$stmt = $pdo->prepare("I
о оновлено! Тепер у базі лежить правильний хеш. Можеш видалити цей файл і пробувати входити.";
?>