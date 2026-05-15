<?php
// Дозволяємо доступ з твого React (дозволяємо CORS)
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
    
    // Починаємо записувати лог
    $debug_info = "Час: " . date('H:i:s') . "\nТекст: " . $text_to_analyze . "\n";

    if (!empty($text_to_analyze)) {
        $ch = curl_init('http://127.0.0.1:8000/analyze');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['text' => $text_to_analyze]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        $ai_response = curl_exec($ch);
        $curl_err = curl_error($ch);
        curl_close($ch);

        $debug_info .= "Помилка cURL: " . ($curl_err ? $curl_err : "Немає") . "\n";
        $debug_info .= "Відповідь від Python: " . $ai_response . "\n";

        if ($ai_response) {
            $ai_data = json_decode($ai_response, true);
            if (isset($ai_data['sentiment'])) {
                $ai_sentiment = $ai_data['sentiment'];
            }
            if (isset($ai_data['is_spam'])) {
                $ai_is_spam = (int)$ai_data['is_spam'];
            }
        }
    }
    
    $debug_info .= "Збережено Тональність: $ai_sentiment | Збережено Спам: $ai_is_spam\n-----------------\n";
    
    // Зберігаємо лог у файл ai_log.txt у тій самій папці, де лежить скрипт
    file_put_contents(__DIR__ . '/ai_log.txt', $debug_info, FILE_APPEND);

    // 5. ЗАПИС У ТАБЛИЦЮ COMPLAINTS (додано urgency)
    $sql = "INSERT INTO complaints (
        tracking_code, full_name, student_group, category, urgency, message, 
        is_anonymous, contact_type, contact_value, appeal_type, 
        sentiment, is_spam
    ) VALUES (
        :tracking_code, :full_name, :student_group, :category, :urgency, :message, 
        :is_anonymous, :contact_type, :contact_value, :appeal_type, 
        :sentiment, :is_spam
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':tracking_code' => $tracking_code,
        ':full_name'     => $data['full_name'] ?? null,
        ':student_group' => $data['student_group'] ?? null,
        ':category'      => $data['category'] ?? 'other',
        ':urgency'       => $data['urgency'] ?? 'medium', // Терміновість
        ':message'       => $data['message'] ?? '',
        ':is_anonymous'  => (int)($data['is_anonymous'] ?? 0),
        ':contact_type'  => $data['contact_type'] ?? 'none',
        ':contact_value' => $data['contact_value'] ?? null,
        ':appeal_type'   => $data['appeal_type'] ?? 'complaint',
        
        // ДАНІ З PYTHON
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

    // =========================================================
    // --- ВІДПРАВКА СПОВІЩЕННЯ НА ПОШТУ АДМІНІСТРАТОРА ---
    // =========================================================
    
    $admin_email = "zpgpfk@gmail.com"; 
    $subject = "Нове звернення в боті ZPFK [Код: $tracking_code]";
    
    // Підготовка змінних для уникнення помилок
    $cat = $data['category'] ?? 'Не вказано';
    $msg = $data['message'] ?? '';
    $anon = (int)($data['is_anonymous'] ?? 1);
    
    // Виправлено $$body на $body
    $body = "Студент залишив нове звернення!\n\n";
    $body .= "📌 Категорія: " . $cat . "\n";
    
    // ДОДАЄМО КРАСИВЕ ВІДОБРАЖЕННЯ ТЕРМІНОВОСТІ
    $urgency_labels = ['low' => '🟢 Низька', 'medium' => '🟡 Середня', 'high' => '🔴 Висока'];
    $urg_text = $urgency_labels[$data['urgency'] ?? 'medium'];
    $body .= "⚡ Терміновість: " . $urg_text . "\n";
    
    $body .= "📝 Повідомлення: " . $msg . "\n";
    
    if ($anon === 0) {
        $body .= "👤 Від: " . ($data['full_name'] ?? 'Не вказано') . " (Група: " . ($data['student_group'] ?? '-') . ")\n";
        $body .= "📞 Контакт: " . ($data['contact_value'] ?? '-') . "\n";
    } else {
        $body .= "👻 Тип: Анонімне звернення\n";
    }

    $headers = "From: bot@zpfk.edu.ua\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Відправляємо листа (@ ігнорує помилки локального сервера)
    @mail($admin_email, $subject, $body, $headers);

    // =========================================================

    // 7. ВІДПРАВЛЯЄМО ВІДПОВІДЬ У REACT
    echo json_encode([
        "success" => true, 
        "message" => "Скаргу успішно створено!",
        "tracking_code" => $tracking_code 
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