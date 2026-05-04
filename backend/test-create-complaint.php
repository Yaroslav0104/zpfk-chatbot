<?php
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'db.php';

$full_name = 'Ярослав Ковбасюк';
$student_group = 'КН-21';
$category = 'administration';
$subject = 'Тестова скарга';
$message = 'Це тестове повідомлення для перевірки додавання скарги в базу даних.';
$is_anonymous = 0;

$sql = "INSERT INTO complaints 
(full_name, student_group, category, subject, message, is_anonymous) 
VALUES (:full_name, :student_group, :category, :subject, :message, :is_anonymous)";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':full_name' => $full_name,
    ':student_group' => $student_group,
    ':category' => $category,
    ':subject' => $subject,
    ':message' => $message,
    ':is_anonymous' => $is_anonymous
]);

echo json_encode([
    'success' => true,
    'message' => 'Тестову скаргу успішно додано'
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>