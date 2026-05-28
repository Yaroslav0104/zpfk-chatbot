<?php
// 1. Заголовки CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type");

// 2. Відловлюємо OPTIONS-запит від React і миттєво даємо добро
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(); // Зупиняємо скрипт, щоб не навантажувати БД
}

// 3. Підключення до БД та отримання даних
try {
    $pdo = new PDO("mysql:host=localhost;dbname=chatbot_system;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT * FROM complaints ORDER BY created_at DESC");
    $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Щоб React не плутався, можемо віддавати просто масив, як він звик
    echo json_encode($complaints);

} catch (Exception $e) {
    // Якщо помилка бази, віддаємо правильний HTTP-статус
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>