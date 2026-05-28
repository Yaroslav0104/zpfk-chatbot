-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 28 2026 г., 20:02
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `chatbot_system`
--

-- --------------------------------------------------------

--
-- Структура таблицы `admins`
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
-- Дамп данных таблицы `admins`
--

INSERT INTO `admins` (`id`, `username`, `password_hash`, `full_name`, `role`, `created_at`) VALUES
(1, 'admin', 'temporary_hash_here', 'Головний Адміністратор', 'admin', '2026-03-19 12:19:34');

-- --------------------------------------------------------

--
-- Структура таблицы `ai_corrections`
--

CREATE TABLE `ai_corrections` (
  `id` int(11) NOT NULL,
  `text` text NOT NULL,
  `correct_label` int(11) NOT NULL,
  `is_trained` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `ai_corrections`
--

INSERT INTO `ai_corrections` (`id`, `text`, `correct_label`, `is_trained`, `created_at`) VALUES
(1, 'Гарно попрацювали! Мені дуже сподобалось!', 0, 0, '2026-05-11 13:27:23'),
(2, 'Ви гавно ненавиджу коледж!', 2, 0, '2026-05-11 13:27:43'),
(3, 'тестова скарга, все погано!', 2, 0, '2026-05-11 13:27:57'),
(4, 'Гарно попрацювали! Мені дуже сподобалось!', 0, 0, '2026-05-11 20:30:45'),
(10, 'Гарно попрацювали! Мені дуже сподобалось!', 2, 0, '2026-05-14 12:48:41'),
(11, 'Гарно попрацювали! Мені дуже сподобалось!', 1, 0, '2026-05-14 12:48:43'),
(12, 'тестова скарга, все погано!', 0, 0, '2026-05-14 12:48:55'),
(13, 'Гарно попрацювали! Мені дуже сподобалось!', 0, 0, '2026-05-14 12:56:49'),
(14, 'Ви гавно ненавиджу коледж!', 1, 0, '2026-05-14 12:56:52'),
(15, 'тестова скарга, все погано!', 0, 0, '2026-05-14 12:56:53'),
(16, 'Ви гавно ненавиджу коледж!', 0, 0, '2026-05-14 12:57:28'),
(17, 'тестова скарга, все погано!', 2, 0, '2026-05-14 12:57:54'),
(18, 'Гарно попрацювали! Мені дуже сподобалось!', 1, 0, '2026-05-14 13:08:49'),
(19, 'іви ', 0, 0, '2026-05-14 13:10:27'),
(20, 'іви ', 1, 0, '2026-05-14 13:14:55'),
(21, 'Треба робити захід до Випуску 2026', 0, 0, '2026-05-14 16:47:57'),
(22, 'Ви гавно ненавиджу коледж!', 2, 0, '2026-05-14 17:55:39'),
(23, 'Гарно попрацювали! Мені дуже сподобалось!', 0, 0, '2026-05-14 17:55:46'),
(24, 'Гарно попрацювали! Мені дуже сподобалось!', 0, 0, '2026-05-14 17:55:59'),
(25, 'долрпаро', 1, 0, '2026-05-15 12:56:23'),
(26, 'долрпаро', 2, 0, '2026-05-15 12:56:26'),
(27, 'долрпаро', 0, 0, '2026-05-15 12:56:27'),
(28, 'тестова скарга, все погано!', 0, 0, '2026-05-15 12:56:29'),
(29, 'долрпаро', 1, 0, '2026-05-15 12:56:45'),
(30, 'Треба робити захід до Випуску 2026', 0, 0, '2026-05-15 14:25:28'),
(31, 'ідіть нахуй', 0, 0, '2026-05-20 10:14:21'),
(32, 'ідіть нахуй', 1, 0, '2026-05-20 10:14:30'),
(33, 'ідіть нахуй', 2, 0, '2026-05-20 10:14:36'),
(34, 'Коледж дуже крутий, тільки як на мене потрібно зробити захід в честь Дня Європи', 2, 0, '2026-05-26 11:12:06'),
(35, 'Коледж дуже крутий, тільки як на мене потрібно зробити захід в честь Дня Європи', 1, 0, '2026-05-26 11:12:17'),
(36, 'Коледж дуже крутий, тільки як на мене потрібно зробити захід в честь Дня Європи', 2, 0, '2026-05-26 11:13:32');

-- --------------------------------------------------------

--
-- Структура таблицы `attachments`
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
-- Структура таблицы `bot_ratings`
--

CREATE TABLE `bot_ratings` (
  `id` int(11) NOT NULL,
  `stars` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_spam` tinyint(1) DEFAULT 0,
  `sentiment` varchar(50) DEFAULT 'neutral'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `bot_ratings`
--

INSERT INTO `bot_ratings` (`id`, `stars`, `comment`, `created_at`, `is_spam`, `sentiment`) VALUES
(1, 5, '', '2026-05-28 14:02:49', 0, 'neutral'),
(2, 5, '', '2026-05-28 14:04:36', 0, 'neutral'),
(3, 5, '', '2026-05-28 14:06:27', 0, 'neutral'),
(4, 1, 'фу гамно', '2026-05-28 14:24:46', 1, 'negative');

-- --------------------------------------------------------

--
-- Структура таблицы `bot_texts`
--

CREATE TABLE `bot_texts` (
  `id` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `bot_texts`
--

INSERT INTO `bot_texts` (`id`, `message`, `updated_at`) VALUES
('bot_start_btns', 'Привіт! 😊 Звягельський  політехнічний фаховий коледж - це твій крок у світ сучасних технологій.<br/> Давай разом знайдемо відповіді на твої питання!🔍<br/><br/><br/>Оберіть категорію нижче ⬇️<br/>', '2026-05-25 15:03:30'),
('contacts', '✅ Ось контакти Звягельського політехнічного фахового коледжу:<br/>📞 Телефон: +38 (068) 816 88 80<br/>📧 Email: nvpet@i.ua<br/>📍 Адреса: вул. Шевченка, 38, м. Звягель 🎯<a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://maps.app.goo.gl/kZBN4ncy2dWkUUcr7\">Ми на мапі</a>', '2026-05-15 13:00:56'),
('cost_of_studiyng', '🔎 Яка спеціальність вас цікавить? Оберіть одну з наведених нижче, щоб дізнатися про вартість навчання:', '2026-05-26 10:04:51'),
('hostel', '✅ Оберіть, що вас саме цікавить:', '2026-05-25 12:14:02'),
('news', '✅ Є контакт!<br/><br/>Усі свіжі новини та події - тут: 🔗<a target=\"_blank\" rel=\"noopener noreferrer\" href=\"http://nvpet.novograd.info\">тут</a>', '2026-05-25 15:19:14'),
('schedule', '✅ Окей, тримай розклад!<br/><br/><br/>Перевір актуальний розклад занять<br/> 🔗<a target=\"_blank\" rel=\"noopener noreferrer\" href=\"http://nvpet.novograd.info/?cat=47\">тут</a>.', '2026-05-14 13:42:34'),
('start', '👋Вітаю,<br/>      Щоб розпочати спілкування натискай кнопку «Привіт» нижче. ', '2026-05-25 17:12:53');

-- --------------------------------------------------------

--
-- Структура таблицы `complaints`
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
  `urgency` enum('low','medium','high') DEFAULT 'medium',
  `message` text NOT NULL,
  `status` enum('new','read','in_progress','awaiting_review','resolved','rejected','spam','archived') DEFAULT 'new',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `assigned_admin_id` int(11) DEFAULT NULL,
  `internal_comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sentiment` varchar(20) NOT NULL DEFAULT 'neutral',
  `is_spam` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `complaints`
--

INSERT INTO `complaints` (`id`, `tracking_code`, `is_anonymous`, `full_name`, `student_course`, `student_group`, `contact_type`, `contact_value`, `appeal_type`, `category`, `urgency`, `message`, `status`, `priority`, `assigned_admin_id`, `internal_comment`, `created_at`, `updated_at`, `sentiment`, `is_spam`) VALUES
(24, 'ZPFK-9ACA2F', 0, 'назарій корнійчук', NULL, 'к-67', 'none', '', 'proposal', 'Навчальний процес', 'medium', 'задонатьте в робукс', 'spam', 'medium', NULL, NULL, '2026-05-03 15:11:37', '2026-05-03 17:48:42', 'neutral', 0),
(32, 'ZPFK-DF3017', 0, 'рн', NULL, 'рн', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'тестова скарга, все погано!', 'rejected', 'medium', NULL, NULL, '2026-05-04 09:22:37', '2026-05-25 12:19:07', 'positive', 0),
(43, 'ZPFK-C0CD80', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'як мене це все заєбало', 'spam', 'medium', NULL, NULL, '2026-05-11 10:50:37', '2026-05-11 11:07:06', 'negative', 1),
(49, 'ZPFK-4A5C72', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'Ви найкращі, обожнюю коледж', 'spam', 'medium', NULL, NULL, '2026-05-11 11:06:04', '2026-05-11 11:07:04', 'positive', 1),
(50, 'ZPFK-E12BCE', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'Ви гавно ненавиджу коледж!', 'spam', 'medium', NULL, NULL, '2026-05-11 11:06:23', '2026-05-14 17:55:42', 'negative', 0),
(51, 'ZPFK-7162BD', 1, '', NULL, '', 'none', '', 'inquiry', 'Навчальний процес', 'medium', 'Гарно попрацювали! Мені дуже сподобалось!', 'in_progress', 'medium', NULL, NULL, '2026-05-11 11:07:53', '2026-05-12 11:25:03', 'negative', 0),
(52, 'ZPFK-CDA8BD', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'жбдлтоирмасп', 'new', 'medium', NULL, NULL, '2026-05-14 12:46:05', '2026-05-14 12:46:05', 'negative', 1),
(54, 'ZPFK-8B190D', 1, '', NULL, '', 'none', '', 'proposal', 'Інше', 'low', 'Треба робити захід до Випуску 2026', 'rejected', 'medium', NULL, NULL, '2026-05-14 16:47:38', '2026-05-15 14:25:30', 'positive', 1),
(55, 'ZPFK-8B8528', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'high', 'долрпаро', 'new', 'medium', NULL, NULL, '2026-05-14 18:00:58', '2026-05-15 12:56:45', 'neutral', 0),
(56, 'ZPFK-834DFE', 1, '', NULL, '', 'none', '', 'proposal', 'Навчальний процес', 'low', 'Захід в честь Хеловіну', 'new', 'medium', NULL, NULL, '2026-05-15 14:22:17', '2026-05-15 14:26:27', 'positive', 1),
(57, 'ZPFK-0BF01A', 1, '', NULL, '', 'none', '', 'inquiry', 'Інше', 'medium', 'ВИ всє гніди', 'new', 'medium', NULL, NULL, '2026-05-15 14:25:04', '2026-05-15 14:25:04', 'negative', 1),
(58, 'ZPFK-84FF42', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'high', 'ідіть нахуй', 'new', 'medium', NULL, NULL, '2026-05-20 10:12:57', '2026-05-20 10:14:36', 'negative', 1),
(59, 'ZPFK-6E0B6B', 1, '', NULL, '', 'none', '', 'inquiry', 'Навчальний процес', 'medium', 'Виправіть інтернет в аудиторії 311', 'resolved', 'medium', NULL, NULL, '2026-05-20 12:31:05', '2026-05-21 13:31:49', 'neutral', 0),
(60, 'ZPFK-FC6CC5', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'Ого, а цей коледж дуже крутий', 'new', 'medium', NULL, NULL, '2026-05-20 12:38:26', '2026-05-20 12:38:26', 'neutral', 0),
(61, 'ZPFK-E20F56', 0, 'Назарій', NULL, 'К-413', 'phone', '+380 (63) 151-49-45', 'proposal', 'Навчальний процес', 'low', 'Зробіть стипендію вище', 'new', 'medium', NULL, NULL, '2026-05-20 12:40:48', '2026-05-20 12:40:48', 'neutral', 0),
(62, 'ZPFK-7008C3', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'dfghjf', 'new', 'medium', NULL, NULL, '2026-05-20 12:43:05', '2026-05-20 12:43:05', 'neutral', 0),
(63, 'ZPFK-17A7B5', 1, '', NULL, '', 'none', '', 'proposal', 'Інше', 'low', 'Ваня куку', 'resolved', 'medium', NULL, NULL, '2026-05-20 13:10:11', '2026-05-25 12:14:12', 'neutral', 0),
(64, 'ZPFK-43EC74', 0, 'Назар і Ярик', NULL, 'К-413', 'phone', '+380 (67) 767-67-67', 'inquiry', 'Технічна проблема', 'high', 'Добрий день. Як справи?', 'new', 'medium', NULL, NULL, '2026-05-20 13:33:10', '2026-05-20 13:33:10', 'neutral', 0),
(65, 'ZPFK-692DFF', 1, '', NULL, '', 'none', '', 'proposal', 'Навчальний процес', 'high', 'Добрий день', 'in_progress', 'medium', NULL, NULL, '2026-05-20 13:34:00', '2026-05-25 12:03:48', 'neutral', 0),
(67, 'ZPFK-635DA6', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'low', 'куку', 'new', 'medium', NULL, NULL, '2026-05-21 11:25:12', '2026-05-21 11:25:12', 'negative', 1),
(68, 'ZPFK-0BB7FA', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'куку', 'new', 'medium', NULL, NULL, '2026-05-21 11:26:25', '2026-05-21 11:26:25', 'negative', 1),
(69, 'ZPFK-680397', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'прарап', 'new', 'medium', NULL, NULL, '2026-05-21 11:33:42', '2026-05-21 11:33:42', 'positive', 1),
(70, 'ZPFK-992462', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'фівапрорпсачві', 'new', 'medium', NULL, NULL, '2026-05-21 11:39:37', '2026-05-21 11:39:37', 'positive', 1),
(71, 'ZPFK-B7914E', 1, '', NULL, '', 'none', '', 'complaint', 'Технічна проблема', 'low', 'іавіаіава', 'new', 'medium', NULL, NULL, '2026-05-21 11:43:39', '2026-05-21 11:43:39', 'negative', 1),
(72, 'ZPFK-D108F3', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'dfghfds', 'new', 'medium', NULL, NULL, '2026-05-21 11:45:17', '2026-05-21 11:45:17', 'positive', 1),
(73, 'ZPFK-54C70B', 1, '', NULL, '', 'none', '', 'proposal', 'Інше', 'medium', 'sdfhgjkhjgf', 'new', 'medium', NULL, NULL, '2026-05-21 11:47:49', '2026-05-21 11:47:49', 'positive', 1),
(74, 'ZPFK-69298F', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'Привіт', 'new', 'medium', NULL, NULL, '2026-05-21 11:49:10', '2026-05-21 11:49:10', 'neutral', 1),
(75, 'ZPFK-20EF20', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'іваіаіваіваіаіваіавіаіаічяіфваваівіФ', 'new', 'medium', NULL, NULL, '2026-05-21 11:52:02', '2026-05-21 11:52:02', 'positive', 1),
(76, 'ZPFK-3196CB', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'аррпарар', 'new', 'medium', NULL, NULL, '2026-05-21 11:59:15', '2026-05-21 11:59:15', 'negative', 1),
(77, 'ZPFK-CA52D1', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'fghdhjgj', 'new', 'medium', NULL, NULL, '2026-05-21 12:12:12', '2026-05-21 12:12:12', 'negative', 1),
(78, 'ZPFK-9DE6E7', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'ыпапорпа', 'new', 'medium', NULL, NULL, '2026-05-21 12:15:38', '2026-05-21 12:15:38', 'negative', 1),
(79, 'ZPFK-79FFAC', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'Привіт', 'new', 'medium', NULL, NULL, '2026-05-25 11:24:08', '2026-05-25 11:24:08', 'neutral', 1),
(80, 'ZPFK-2722EE', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'авапвапвпв', 'new', 'medium', NULL, NULL, '2026-05-25 11:37:22', '2026-05-25 11:37:22', 'neutral', 1),
(81, 'ZPFK-D75953', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'паппвап', 'new', 'medium', NULL, NULL, '2026-05-25 11:40:29', '2026-05-25 11:40:29', 'negative', 1),
(82, 'ZPFK-B72FDF', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'к', 'new', 'medium', NULL, NULL, '2026-05-25 11:40:59', '2026-05-25 11:40:59', 'neutral', 1),
(83, 'ZPFK-30AA5A', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'исмисмс', 'resolved', 'medium', NULL, NULL, '2026-05-25 11:43:47', '2026-05-25 12:03:31', 'negative', 1),
(84, 'ZPFK-20AC5E', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'прапрп', 'rejected', 'medium', NULL, NULL, '2026-05-25 12:12:02', '2026-05-25 12:12:12', 'positive', 1),
(85, 'A22B5C', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'low', 'dgdfgdgdfgdfg', 'new', 'medium', NULL, NULL, '2026-05-25 14:10:03', '2026-05-25 14:10:03', 'positive', 1),
(86, 'FDD0F7', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'хзщгекуікв', 'new', 'medium', NULL, NULL, '2026-05-25 14:20:00', '2026-05-25 14:20:00', 'negative', 1),
(87, '01AA11', 1, '', NULL, '', 'none', '', 'complaint', 'Технічна проблема', 'medium', 'кенгшщекуке', 'new', 'medium', NULL, NULL, '2026-05-25 14:20:32', '2026-05-25 14:20:32', 'neutral', 1),
(88, '17A4A2', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'Привіт', 'new', 'medium', NULL, NULL, '2026-05-25 14:22:09', '2026-05-25 14:22:09', 'neutral', 1),
(89, 'C7D88B', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'wererwerwe', 'new', 'medium', NULL, NULL, '2026-05-25 14:51:40', '2026-05-25 14:51:40', 'negative', 1),
(90, 'E423C7', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'вапвапвап', 'new', 'medium', NULL, NULL, '2026-05-25 14:54:06', '2026-05-25 14:54:06', 'negative', 1),
(91, '3E7E96', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'аівавііва', 'new', 'medium', NULL, NULL, '2026-05-25 14:55:00', '2026-05-25 14:55:00', 'negative', 1),
(92, '22D795', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'іавпвпвап', 'new', 'medium', NULL, NULL, '2026-05-25 14:58:10', '2026-05-25 14:58:10', 'negative', 1),
(93, 'D2AEA3', 0, 'Костянтин', NULL, 'К-130', 'phone', '+380 (63) 900-22-34', 'complaint', 'Навчальний процес', 'medium', 'Коледж дуже крутий, тільки як на мене потрібно зробити захід в честь Дня Європи', 'new', 'medium', NULL, NULL, '2026-05-25 15:01:49', '2026-05-26 11:13:32', 'negative', 0),
(94, '801D17', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'dsfffsdfdsfs', 'new', 'medium', NULL, NULL, '2026-05-26 10:02:33', '2026-05-26 10:02:33', 'positive', 1),
(95, '96A2AC', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'sfssfdsfdsfsf', 'new', 'medium', NULL, NULL, '2026-05-26 10:03:21', '2026-05-26 10:03:21', 'positive', 1),
(96, 'CDF508', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'Eh the', 'new', 'medium', NULL, NULL, '2026-05-26 10:56:45', '2026-05-26 10:56:45', 'neutral', 1),
(97, '2C10DE', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'pr', 'resolved', 'medium', NULL, NULL, '2026-05-26 10:58:26', '2026-05-26 10:59:57', 'neutral', 1),
(98, 'A1A57D', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'Коледж круто ', 'in_progress', 'medium', NULL, NULL, '2026-05-26 19:50:19', '2026-05-26 19:51:03', 'positive', 1),
(99, 'C3412D', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'fdgfdgfgdg', 'new', 'medium', NULL, NULL, '2026-05-27 09:03:57', '2026-05-27 09:03:57', 'positive', 1),
(100, '57B3B4', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'Добрий день', 'new', 'medium', NULL, NULL, '2026-05-27 09:10:31', '2026-05-27 09:10:31', 'positive', 1),
(101, 'CB5BE1', 0, 'ргшщз', NULL, '', 'phone', '+380 (57) 887-65-44', 'complaint', 'Навчальний процес', 'medium', 'апролджент', 'new', 'medium', NULL, NULL, '2026-05-27 09:14:37', '2026-05-27 09:14:37', 'positive', 1),
(102, '5EBD0E', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'лгпоарвпраполд', 'new', 'medium', NULL, NULL, '2026-05-28 13:49:26', '2026-05-28 13:49:26', 'positive', 1),
(103, '7C4754', 1, '', NULL, '', 'none', '', 'complaint', 'Навчальний процес', 'medium', 'дло', 'new', 'medium', NULL, NULL, '2026-05-28 13:50:15', '2026-05-28 13:50:15', 'negative', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `complaint_history`
--

CREATE TABLE `complaint_history` (
  `id` int(11) NOT NULL,
  `complaint_id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action_description` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `complaint_history`
--

INSERT INTO `complaint_history` (`id`, `complaint_id`, `admin_id`, `action_description`, `created_at`) VALUES
(24, 24, NULL, 'Звернення створено користувачем', '2026-05-03 15:11:37'),
(32, 32, NULL, 'Звернення створено користувачем', '2026-05-04 09:22:38'),
(43, 43, NULL, 'Звернення створено користувачем', '2026-05-11 10:50:37'),
(49, 49, NULL, 'Звернення створено користувачем', '2026-05-11 11:06:04'),
(50, 50, NULL, 'Звернення створено користувачем', '2026-05-11 11:06:23'),
(51, 51, NULL, 'Звернення створено користувачем', '2026-05-11 11:07:53'),
(52, 52, NULL, 'Звернення створено користувачем', '2026-05-14 12:46:05'),
(54, 54, NULL, 'Звернення створено користувачем', '2026-05-14 16:47:38'),
(55, 55, NULL, 'Звернення створено користувачем', '2026-05-14 18:00:58'),
(56, 56, NULL, 'Звернення створено користувачем', '2026-05-15 14:22:17'),
(57, 57, NULL, 'Звернення створено користувачем', '2026-05-15 14:25:04'),
(58, 58, NULL, 'Звернення створено користувачем', '2026-05-20 10:12:57'),
(59, 59, NULL, 'Звернення створено користувачем', '2026-05-20 12:31:05'),
(60, 60, NULL, 'Звернення створено користувачем', '2026-05-20 12:38:26'),
(61, 61, NULL, 'Звернення створено користувачем', '2026-05-20 12:40:48'),
(62, 62, NULL, 'Звернення створено користувачем', '2026-05-20 12:43:05'),
(63, 63, NULL, 'Звернення створено користувачем', '2026-05-20 13:10:11'),
(64, 64, NULL, 'Звернення створено користувачем', '2026-05-20 13:33:10'),
(65, 65, NULL, 'Звернення створено користувачем', '2026-05-20 13:34:00'),
(67, 67, NULL, 'Звернення створено користувачем', '2026-05-21 11:25:12'),
(68, 68, NULL, 'Звернення створено користувачем', '2026-05-21 11:26:25'),
(69, 69, NULL, 'Звернення створено користувачем', '2026-05-21 11:33:42'),
(70, 70, NULL, 'Звернення створено користувачем', '2026-05-21 11:39:37'),
(71, 71, NULL, 'Звернення створено користувачем', '2026-05-21 11:43:39'),
(72, 72, NULL, 'Звернення створено користувачем', '2026-05-21 11:45:17'),
(73, 73, NULL, 'Звернення створено користувачем', '2026-05-21 11:47:49'),
(74, 74, NULL, 'Звернення створено користувачем', '2026-05-21 11:49:10'),
(75, 75, NULL, 'Звернення створено користувачем', '2026-05-21 11:52:02'),
(76, 76, NULL, 'Звернення створено користувачем', '2026-05-21 11:59:15'),
(77, 77, NULL, 'Звернення створено користувачем', '2026-05-21 12:12:12'),
(78, 78, NULL, 'Звернення створено користувачем', '2026-05-21 12:15:38'),
(79, 79, NULL, 'Звернення створено користувачем', '2026-05-25 11:24:08'),
(80, 80, NULL, 'Звернення створено користувачем', '2026-05-25 11:37:22'),
(81, 81, NULL, 'Звернення створено користувачем', '2026-05-25 11:40:29'),
(82, 82, NULL, 'Звернення створено користувачем', '2026-05-25 11:40:59'),
(83, 83, NULL, 'Звернення створено користувачем', '2026-05-25 11:43:47'),
(84, 84, NULL, 'Звернення створено користувачем', '2026-05-25 12:12:02'),
(85, 85, NULL, 'Звернення створено користувачем', '2026-05-25 14:10:03'),
(86, 86, NULL, 'Звернення створено користувачем', '2026-05-25 14:20:00'),
(87, 87, NULL, 'Звернення створено користувачем', '2026-05-25 14:20:32'),
(88, 88, NULL, 'Звернення створено користувачем', '2026-05-25 14:22:09'),
(89, 89, NULL, 'Звернення створено користувачем', '2026-05-25 14:51:40'),
(90, 90, NULL, 'Звернення створено користувачем', '2026-05-25 14:54:06'),
(91, 91, NULL, 'Звернення створено користувачем', '2026-05-25 14:55:00'),
(92, 92, NULL, 'Звернення створено користувачем', '2026-05-25 14:58:10'),
(93, 93, NULL, 'Звернення створено користувачем', '2026-05-25 15:01:49'),
(94, 94, NULL, 'Звернення створено користувачем', '2026-05-26 10:02:33'),
(95, 95, NULL, 'Звернення створено користувачем', '2026-05-26 10:03:21'),
(96, 96, NULL, 'Звернення створено користувачем', '2026-05-26 10:56:45'),
(97, 97, NULL, 'Звернення створено користувачем', '2026-05-26 10:58:26'),
(98, 98, NULL, 'Звернення створено користувачем', '2026-05-26 19:50:19'),
(99, 99, NULL, 'Звернення створено користувачем', '2026-05-27 09:03:57'),
(100, 100, NULL, 'Звернення створено користувачем', '2026-05-27 09:10:31'),
(101, 101, NULL, 'Звернення створено користувачем', '2026-05-27 09:14:37'),
(102, 102, NULL, 'Звернення створено користувачем', '2026-05-28 13:49:26'),
(103, 103, NULL, 'Звернення створено користувачем', '2026-05-28 13:50:15');

-- --------------------------------------------------------

--
-- Структура таблицы `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`) VALUES
(1, 'sender_email', 'zpfkbot@gmail.com', 'Пошта, з якої бот відправляє сповіщення (Від кого)'),
(2, 'admin_email', 'nazarij2101@gmail.com', 'Пошта, на яку приходять скарги (Кому)'),
(3, 'smtp_password', 'rorxicgwujawwltv', 'Пароль додатка Gmail для SMTP');

-- --------------------------------------------------------

--
-- Структура таблицы `system_users`
--

CREATE TABLE `system_users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','teacher') DEFAULT 'teacher',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `system_users`
--

INSERT INTO `system_users` (`id`, `username`, `email`, `password_hash`, `role`, `created_at`) VALUES
(2, 'admin', NULL, '$2y$10$daQBDPh6hAFrUTz18bVRQeuz.xnvBEGU3NzEBugm8BJBlttfAgFnu', 'admin', '2026-05-14 10:24:33');

-- --------------------------------------------------------

--
-- Структура таблицы `visits`
--

CREATE TABLE `visits` (
  `id` int(11) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `visit_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `visits`
--

INSERT INTO `visits` (`id`, `ip_address`, `visit_date`) VALUES
(1, '::1', '2026-05-21 00:00:00'),
(5, '::1', '2026-05-21 16:10:56'),
(6, '::1', '2026-05-25 14:21:55'),
(7, '::1', '2026-05-25 17:09:49'),
(8, '::1', '2026-05-25 20:14:26'),
(9, '::1', '2026-05-26 13:02:06'),
(10, '192.168.1.32', '2026-05-26 13:55:53'),
(11, '192.168.1.22', '2026-05-26 13:58:03'),
(12, '192.168.1.21', '2026-05-26 14:02:06'),
(13, '192.168.1.4', '2026-05-26 14:03:57'),
(14, '192.168.1.16', '2026-05-26 14:04:49'),
(15, '192.168.1.23', '2026-05-26 14:08:03'),
(16, '192.168.1.32', '2026-05-26 15:55:17'),
(17, '192.168.50.70', '2026-05-26 22:39:50'),
(18, '192.168.50.113', '2026-05-26 22:39:50'),
(19, '192.168.50.6', '2026-05-26 22:44:13'),
(20, '172.20.10.3', '2026-05-27 12:03:50'),
(21, '172.20.10.3', '2026-05-28 16:27:20');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Индексы таблицы `ai_corrections`
--
ALTER TABLE `ai_corrections`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `attachments`
--
ALTER TABLE `attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complaint_id` (`complaint_id`);

--
-- Индексы таблицы `bot_ratings`
--
ALTER TABLE `bot_ratings`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `bot_texts`
--
ALTER TABLE `bot_texts`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tracking_code` (`tracking_code`),
  ADD KEY `assigned_admin_id` (`assigned_admin_id`);

--
-- Индексы таблицы `complaint_history`
--
ALTER TABLE `complaint_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `complaint_id` (`complaint_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Индексы таблицы `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Индексы таблицы `system_users`
--
ALTER TABLE `system_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Индексы таблицы `visits`
--
ALTER TABLE `visits`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `ai_corrections`
--
ALTER TABLE `ai_corrections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT для таблицы `attachments`
--
ALTER TABLE `attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `bot_ratings`
--
ALTER TABLE `bot_ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT для таблицы `complaint_history`
--
ALTER TABLE `complaint_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT для таблицы `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT для таблицы `system_users`
--
ALTER TABLE `system_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `visits`
--
ALTER TABLE `visits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `attachments`
--
ALTER TABLE `attachments`
  ADD CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`assigned_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Ограничения внешнего ключа таблицы `complaint_history`
--
ALTER TABLE `complaint_history`
  ADD CONSTRAINT `complaint_history_ibfk_1` FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `complaint_history_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
