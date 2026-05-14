<?php
// Дозволяємо доступ з React (дозволяємо CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Обробка обов'язкового попереднього (preflight) запиту від браузера
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

    // 2. ОТРИМАННЯ ДАНИХ ВІД REACT
$data = $_POST;

if (empty($data)) {
    echo json_encode(["success" => false, "message" => "Порожні дані запиту. Перевірте, чи React відправляє FormData."]);
    exit;
}

// 3. ПІДКЛЮЧЕННЯ ДО БД (через спільний файл)
require_once 'db.php';

try {
    // Починаємо транзакцію (щоб записати дані у 2 таблиці безпечно)
    $pdo->beginTransaction(); 

    // 4. ГЕНЕРАЦІЯ УНІКАЛЬНОГО КОДУ ЗВЕРНЕННЯ (напр. ZPFK-9B3F2A)
    $tracking_code = 'ZPFK-' . strtoupper(substr(uniqid(), -6));

    // 4.5 АНАЛІЗ ЧЕРЕЗ ШІ-СЕРВЕР (PYTHON)
    $ai_sentiment = 'neutral'; 
    $ai_is_spam = 0;           
    $text_to_analyze = $data['message'] ?? '';

    // 5. ЗАПИС У ТАБЛИЦЮ COMPLAINTS
    $sql = "INSERT INTO complaints (
        tracking_code, full_name, student_group, category, message, 
        is_anonymous, contact_type, contact_value, appeal_type, 
        sentiment, is_spam
    ) VALUES (
        :tracking_code, :full_name, :student_group, :category, :message, 
        :is_anonymous, :contact_type, :contact_value, :appeal_type, 
        :sentiment, :is_spam
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':tracking_code' => $tracking_code,
        ':full_name'     => $data['full_name'] ?? null,
        ':student_group' => $data['student_group'] ?? null,
        ':category'      => $data['category'] ?? 'other',
        ':message'       => $data['message'] ?? '',
        ':is_anonymous'  => (int)($data['is_anonymous'] ?? 0),
        ':contact_type'  => $data['contact_type'] ?? 'none',
        ':contact_value' => $data['contact_value'] ?? null,
        ':appeal_type'   => $data['appeal_type'] ?? 'complaint',
        ':sentiment'     => $ai_sentiment, 
        ':is_spam'       => $ai_is_spam
    ]);

    // Отримуємо ID щойно створеної скарги
    $complaint_id = $pdo->lastInsertId();

    // 6. ЗАПИС У ТАБЛИЦЮ ІСТОРІЇ (complaint_history)
    $history_sql = "INSERT INTO complaint_history (complaint_id, action_description) VALUES (:complaint_id, :action_description)";
    $history_stmt = $pdo->prepare($history_sql);
    $history_stmt->execute([
        ':complaint_id' => $complaint_id,
        ':action_description' => 'Звернення створено користувачем'
    ]);

    // Підтверджуємо транзакцію (зберігаємо все в БД)
    $pdo->commit();

    // 7. ВІДПРАВЛЯЄМО ВІДПОВІДЬ У REACT
    echo json_encode([
        "success" => true, 
        "message" => "Скаргу успішно створено!",
        "tracking_code" => $tracking_code // Віддаємо номер користувачу!
    ]);

} catch (Exception $e) {
    // Якщо сталася помилка — скасовуємо всі записи
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "success" => false, 
        "message" => "Помилка при записі в базу: " . $e->getMessage()
    ]);
}
?>