<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'db.php';

$ip = $_SERVER['REMOTE_ADDR'];
if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    $ip = $_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
}

$timeout_minutes = 30; 

try {
    $stmt = $pdo->prepare("SELECT visit_date FROM visits WHERE ip_address = ? ORDER BY visit_date DESC LIMIT 1");
    $stmt->execute([$ip]);
    $last_visit = $stmt->fetchColumn();

    $should_insert = true;

    if ($last_visit) {
        $last_visit_time = strtotime($last_visit);
        $current_time = time();

        $last_visit_date = date('Y-m-d', $last_visit_time);
        $current_date = date('Y-m-d', $current_time);

        if ($last_visit_date === $current_date) {
            $minutes_diff = round(($current_time - $last_visit_time) / 60);
            
            if ($minutes_diff < $timeout_minutes) {
                $should_insert = false; 
            }
        }
    }

    if ($should_insert) {
        $insert_stmt = $pdo->prepare("INSERT INTO visits (ip_address, visit_date) VALUES (?, NOW())");
        $insert_stmt->execute([$ip]);
        
        echo json_encode(["success" => true, "message" => "Візит успішно зафіксовано"]);
    } else {
        echo json_encode(["success" => true, "message" => "Візит проігноровано (діє тайм-аут поточного дня)"]);
    }

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Помилка БД: " . $e->getMessage()]);
}
?>