<?php
require_once 'db.php';
$data = json_decode(file_get_contents("php://input"));

if(isset($data->step_id) && isset($data->message)) {
    try {
        // Якщо такого text_id ще немає - створюємо. Якщо є - оновлюємо!
        $sql = "INSERT INTO bot_texts (text_id, message) 
                VALUES (:step_id, :message)
                ON DUPLICATE KEY UPDATE message = VALUES(message)";
                
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':message' => $data->message,
            ':step_id' => $data->step_id
        ]);
        
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>