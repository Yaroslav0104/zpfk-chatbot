<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require 'config.php';

$date = date('Y-m-d');

try {
    // Рахуємо скільки унікальних записів є за сьогодні
    $stmt = $pdo->prepare("SELECT COUNT(id) as today_visits FROM visits WHERE visit_date = ?");
    $stmt->execute([$date]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["today_visits" => (int)$result['today_visits']]);
} catch (PDOException $e) {
    echo json_encode(["today_visits" => 0, "error" => $e->getMessage()]);
}
?>