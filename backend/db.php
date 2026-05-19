<?php
// 1. НАЛАШТУВАННЯ CORS (Дозволяємо React-у спілкуватися з PHP)
header("Access-Control-Allow-Origin: *"); // Дозволяє запити з будь-якого порту
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// 2. ОБРОБКА PREFLIGHT-ЗАПИТУ (React завжди спочатку питає "чи можна відправити дані?")
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// 3. Твій стандартний код
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';

try {
    // Переконайся, що у config.php вказано правильні дані (root і порожній пароль для XAMPP)
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Помилка підключення до бази даних',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
?>