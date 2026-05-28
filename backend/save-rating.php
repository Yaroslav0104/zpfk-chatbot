<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['stars'])) {
    $stars = (int)$data['stars'];
    $comment = trim($data['comment'] ?? '');

    // =========================================================
    // АНАЛІЗ КОМЕНТАРЯ ЧЕРЕЗ ШІ-СЕРВЕР (PYTHON)
    // =========================================================
    $ai_is_spam = 0;
    $ai_sentiment = 'neutral';
    
    // Аналізуємо тільки якщо користувач написав хоч якийсь текст
    if (!empty($comment)) {
        $ch = curl_init('http://127.0.0.1:8000/analyze');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['text' => $comment]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); // 10 секунд таймауту

        $ai_response = curl_exec($ch);
        curl_close($ch);

        if ($ai_response) {
            $ai_data = json_decode($ai_response, true);
            if (isset($ai_data['is_spam'])) {
                $ai_is_spam = (int)$ai_data['is_spam'];
            }
            if (isset($ai_data['sentiment'])) {
                $ai_sentiment = $ai_data['sentiment'];
            }
        }
    }
    // =========================================================

    // Зберігаємо оцінку, коментар та результати ШІ-аналізу
    $stmt = $pdo->prepare("INSERT INTO bot_ratings (stars, comment, is_spam, sentiment) VALUES (:stars, :comment, :is_spam, :sentiment)");
    
    if ($stmt->execute([
        ':stars' => $stars, 
        ':comment' => $comment,
        ':is_spam' => $ai_is_spam,
        ':sentiment' => $ai_sentiment
    ])) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Помилка бази даних"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Немає даних"]);
}
?>