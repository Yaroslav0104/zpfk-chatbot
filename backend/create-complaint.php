<?php
// =========================================================
// 1. ПІДКЛЮЧЕННЯ PHPMAILER ТА НАЛАШТУВАННЯ CORS
// =========================================================
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// =========================================================
// 2. ОТРИМАННЯ ДАНИХ ВІД REACT
// =========================================================
$data = json_decode(file_get_contents("php://input"), true);
if (empty($data)) {
    $data = $_POST;
}

if (empty($data)) {
    echo json_encode(["success" => false, "message" => "Порожні дані запиту."]);
    exit;
}

// =========================================================
// 3. ПІДКЛЮЧЕННЯ ДО БД
// =========================================================
require_once 'db.php';

try {
    $pdo->beginTransaction(); 

    // 4. ГЕНЕРАЦІЯ УНІКАЛЬНОГО КОДУ ЗВЕРНЕННЯ
    $tracking_code = 'ZPFK-' . strtoupper(substr(uniqid(), -6));

    // 4.5 АНАЛІЗ ЧЕРЕЗ ШІ-СЕРВЕР (PYTHON)
    $ai_sentiment = 'neutral'; 
    $ai_is_spam = 0;            
    $text_to_analyze = $data['message'] ?? '';
    
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
    file_put_contents(__DIR__ . '/ai_log.txt', $debug_info, FILE_APPEND);

    // 5. ЗАПИС У ТАБЛИЦЮ COMPLAINTS
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
        ':urgency'       => $data['urgency'] ?? 'medium', 
        ':message'       => $data['message'] ?? '',
        ':is_anonymous'  => (int)($data['is_anonymous'] ?? 0),
        ':contact_type'  => $data['contact_type'] ?? 'none',
        ':contact_value' => $data['contact_value'] ?? null,
        ':appeal_type'   => $data['appeal_type'] ?? 'complaint',
        ':sentiment'     => $ai_sentiment, 
        ':is_spam'       => $ai_is_spam
    ]);

    $complaint_id = $pdo->lastInsertId();

    // 6. ЗАПИС У ТАБЛИЦЮ ІСТОРІЇ (complaint_history)
    $history_sql = "INSERT INTO complaint_history (complaint_id, action_description) VALUES (:complaint_id, :action_description)";
    $history_stmt = $pdo->prepare($history_sql);
    $history_stmt->execute([
        ':complaint_id' => $complaint_id,
        ':action_description' => 'Звернення створено користувачем'
    ]);

    $pdo->commit();

    // =========================================================
    // 7. ВІДПРАВКА СПОВІЩЕННЯ НА ПОШТУ АДМІНІСТРАТОРА (PHPMailer)
    // =========================================================
    // Твій Gmail, куди мають приходити всі листи
    $admin_email = 'kornijcuknazarij13@gmail.com'; 
    $subject = "Нове звернення в боті ZPFK";
    
    $cat = $data['category'] ?? 'Не вказано';
    $msg = $data['message'] ?? '';
    $anon = (int)($data['is_anonymous'] ?? 1);
    
    $body = "Студент залишив нове звернення!\n\n";
    $body .= "📌 Категорія: " . $cat . "\n";
    
    $urgency_labels = ['low' => '🟢 Низька', 'medium' => '🟡 Середня', 'high' => '🔴 Висока'];
    $urg_text = $urgency_labels[$data['urgency'] ?? 'medium'];
    $body .= "⚡ Терміновість: " . $urg_text . "\n";
    
    $body .= "📝 Повідомлення: " . $msg . "\n\n";
    
    if ($anon === 0) {
        $body .= "👤 Від: " . ($data['full_name'] ?? 'Не вказано') . " (Група: " . ($data['student_group'] ?? '-') . ")\n";
        $body .= "📞 Контакт: " . ($data['contact_value'] ?? '-') . "\n";
    } else {
        $body .= "👻 Тип: Анонімне звернення\n";
    }

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Сервер Gmail
        $mail->SMTPAuth   = true;
        
        // 🔴 ВПИШИ СВОЮ НОВУ ПОШТУ Gmail ЗАМІСТЬ 'твоя_пошта@gmail.com'
        $mail->Username   = 'zpfkbot@gmail.com'; 
        $mail->Password   = 'rorxicgwujawwltv'; // Твій новий пароль додатка Gmail
        
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Захист для Gmail
        $mail->Port       = 587;                            // Порт для Gmail
        $mail->CharSet    = 'UTF-8';

        // 🔴 ТУТ ТЕЖ ВПИШИ СВОЮ ПОШТУ Gmail
        $mail->setFrom('zpfkbot@gmail.com', 'ZPFK Bot'); 
        $mail->addAddress($admin_email); 

        $mail->isHTML(false); 
        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
    } catch (Exception $e) {
        file_put_contents(__DIR__ . '/ai_log.txt', "Помилка пошти: {$mail->ErrorInfo}\n", FILE_APPEND);
    }
    // =========================================================

    echo json_encode([
        "success" => true, 
        "message" => "Скаргу успішно створено!",
        "tracking_code" => $tracking_code 
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "success" => false, 
        "message" => "Помилка при записі в базу: " . $e->getMessage()
    ]);
}
?>