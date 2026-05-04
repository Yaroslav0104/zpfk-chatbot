-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Час створення: Бер 24 2026 р., 11:48
-- Версія сервера: 10.4.32-MariaDB
-- Версія PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База даних: `chatbot_system`
--

-- --------------------------------------------------------

--
-- Структура таблиці `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `role` varchar(20) DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `admins`
--

INSERT INTO `admins` (`id`, `username`, `password_hash`, `full_name`, `role`, `created_at`) VALUES
(1, 'admin', 'temporary_hash_here', 'Головний Адміністратор', 'admin', '2026-03-19 12:19:34');

-- --------------------------------------------------------

--
-- Структура таблиці `attachments`
--

CREATE TABLE `attachments` (
  `id` int(11) NOT NULL,
  `complaint_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(150) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Структура таблиці `complaints`
--

CREATE TABLE `complaints` (
  `id` int(11) NOT NULL,
  `tracking_code` varchar(20) NOT NULL,
  `is_anonymous` tinyint(1) DEFAULT 0,
  `full_name` varchar(100) DEFAULT NULL,
  `student_course` int(11) DEFAULT NULL,
  `student_group` varchar(50) DEFAULT NULL,
  `contact_type` varchar(20) DEFAULT NULL,
  `contact_value` varchar(150) DEFAULT NULL,
  `appeal_type` varchar(50) DEFAULT 'complaint',
  `category` varchar(50) DEFAULT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','in_progress','awaiting_review','resolved','rejected','spam','archived') DEFAULT 'new',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `assigned_admin_id` int(11) DEFAULT NULL,
  `internal_comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `complaints`
--

INSERT INTO `complaints` (`id`, `tracking_code`, `is_anonymous`, `full_name`, `student_course`, `student_group`, `contact_type`, `contact_value`, `appeal_type`, `category`, `message`, `status`, `priority`, `assigned_admin_id`, `internal_comment`, `created_at`, `updated_at`) VALUES
(4, 'ZPFK-1E17DB', 0, 'dfghjkjhgf', NULL, 'dfghjhgf', 'phone', 'dfghjk', 'complaint', 'Навчальний процес', 'fghjkl', 'in_progress', 'medium', NULL, NULL, '2026-03-19 12:54:25', '2026-03-19 15:07:46'),
(5, 'ZPFK-3E3237', 0, 'dfyghkhjgyter', NULL, 'rtyukuytr', 'phone', 'wertyuiuyt', 'proposal', 'Гуртожиток', 'ertyuiuytr', 'rejected', 'medium', NULL, NULL, '2026-03-19 14:02:11', '2026-03-24 10:11:32'),
(6, 'ZPFK-5DA71D', 1, 'fghgf', NULL, 'rtyuytre', 'email', 'rtyuiiuyt', 'inquiry', 'Поведінка викладачів/студентів', 'rtyuiuytrer', 'resolved', 'medium', NULL, NULL, '2026-03-19 14:02:45', '2026-03-19 15:07:51'),
(7, 'ZPFK-58722F', 0, 'енгшнекуцй', NULL, 'уекнгнек', 'none', '', 'complaint', 'Технічна проблема', 'уекнгне', 'rejected', 'medium', NULL, NULL, '2026-03-19 15:10:45', '2026-03-19 15:11:15'),
(8, 'ZPFK-455A23', 0, 'енгшгнен', NULL, 'К-228', 'phone', '+3809876567', 'inquiry', 'Гуртожиток', 'кекуцуке', 'in_progress', 'medium', NULL, NULL, '2026-03-23 17:02:12', '2026-03-24 10:11:29'),
(9, 'ZPFK-5AB87D', 0, 'qwertyuiyutre', NULL, 'retryioiyutre', 'phone', '+38098765567', 'proposal', 'Навчальний процес', 'bvc', 'resolved', 'medium', NULL, NULL, '2026-03-24 10:06:45', '2026-03-24 10:16:33');

-- --------------------------------------------------------

--
-- Структура таблиці `complaint_history`
--

CREATE TABLE `complaint_history` (
  `id` int(11) NOT NULL,
  `complaint_id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action_description` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп даних таблиці `complaint_history`
--

INSERT INTO `complaint_history` (`id`, `complaint_id`, `admin_id`, `action_description`, `created_at`) VALUES
(4, 4, NULL, 'Звернення створено користувачем', '2026-03-19 12:54:25'),
(5, 5, NULL, 'Звернення створено користувачем', '2026-03-19 14:02:11'),
(6, 6, NULL, 'Звернення створено користувачем', '2026-03-19 14:02:45'),
(7, 7, NULL, 'Звернення створено користувачем', '2026-03-19 15:10:45'),
(8, 8, NULL, 'Звернення створено користувачем', '2026-03-23 17:02:12'),
(9, 9, NULL, 'Звернення створено користувачем', '2026-03-24 10:06:45');

--
-- Індекси збережених таблиць
--

--
-- Індекси таблиці `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Індекси таблиці `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complaint_id` (`complaint_id`);

--
-- Індекси таблиці `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_code` (`tracking_code`),
  ADD KEY `assigned_admin_id` (`assigned_admin_id`);

--
-- Індекси таблиці `complaint_history`
--
ALTER TABLE `complaint_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complaint_id` (`complaint_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- AUTO_INCREMENT для збережених таблиць
--

--
-- AUTO_INCREMENT для таблиці `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблиці `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблиці `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблиці `complaint_history`
--
ALTER TABLE `complaint_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Обмеження зовнішнього ключа збережених таблиць
--

--
-- Обмеження зовнішнього ключа таблиці `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE;

--
-- Обмеження зовнішнього ключа таблиці `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`assigned_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Обмеження зовнішнього ключа таблиці `complaint_history`
--
ALTER TABLE `complaint_history`
  ADD CONSTRAINT `complaint_history_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `complaint_history_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
