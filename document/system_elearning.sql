-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: system_elearning
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `academic_class_courses`
--

DROP TABLE IF EXISTS `academic_class_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_class_courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `class_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `instructor_id` bigint NOT NULL COMMENT 'Instructor sở hữu khóa học',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_course_instructor` (`class_id`,`course_id`,`instructor_id`),
  KEY `course_id` (`course_id`),
  KEY `instructor_id` (`instructor_id`),
  CONSTRAINT `academic_class_courses_class_fk` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`),
  CONSTRAINT `academic_class_courses_course_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `academic_class_courses_instructor_fk` FOREIGN KEY (`instructor_id`) REFERENCES `user_instructors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_class_courses`
--

LOCK TABLES `academic_class_courses` WRITE;
/*!40000 ALTER TABLE `academic_class_courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `academic_class_courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `academic_class_instructors`
--

DROP TABLE IF EXISTS `academic_class_instructors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_class_instructors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `class_id` bigint NOT NULL,
  `instructor_id` bigint NOT NULL COMMENT 'ID của user_instructors',
  `role` enum('main','assistant') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'main' COMMENT 'Vai trò trong lớp',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_instructor` (`class_id`,`instructor_id`),
  KEY `instructor_id` (`instructor_id`),
  CONSTRAINT `academic_class_instructors_class_fk` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`),
  CONSTRAINT `academic_class_instructors_instructor_fk` FOREIGN KEY (`instructor_id`) REFERENCES `user_instructors` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_class_instructors`
--

LOCK TABLES `academic_class_instructors` WRITE;
/*!40000 ALTER TABLE `academic_class_instructors` DISABLE KEYS */;
/*!40000 ALTER TABLE `academic_class_instructors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `academic_classes`
--

DROP TABLE IF EXISTS `academic_classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_classes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `class_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã lớp',
  `class_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `semester` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Học kỳ (VD: 20231)',
  `status` enum('active','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_code_semester` (`class_code`,`semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_classes`
--

LOCK TABLES `academic_classes` WRITE;
/*!40000 ALTER TABLE `academic_classes` DISABLE KEYS */;
/*!40000 ALTER TABLE `academic_classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `academic_grades`
--

DROP TABLE IF EXISTS `academic_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `academic_grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL COMMENT 'ID từ user_students_academic',
  `academic_class_id` bigint NOT NULL,
  `assessment_type` enum('quiz','assignment') COLLATE utf8mb4_unicode_ci NOT NULL,
  `assessment_id` bigint NOT NULL COMMENT 'ID của quiz hoặc assignment',
  `score` decimal(5,2) DEFAULT NULL,
  `max_score` decimal(5,2) NOT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `graded_by` bigint DEFAULT NULL COMMENT 'ID của instructor chấm điểm',
  `comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_grade` (`student_id`,`assessment_type`,`assessment_id`),
  KEY `academic_class_id` (`academic_class_id`),
  KEY `graded_by` (`graded_by`),
  CONSTRAINT `academic_grades_class_fk` FOREIGN KEY (`academic_class_id`) REFERENCES `academic_classes` (`id`),
  CONSTRAINT `academic_grades_grader_fk` FOREIGN KEY (`graded_by`) REFERENCES `user_instructors` (`id`),
  CONSTRAINT `academic_grades_student_fk` FOREIGN KEY (`student_id`) REFERENCES `user_students_academic` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_grades`
--

LOCK TABLES `academic_grades` WRITE;
/*!40000 ALTER TABLE `academic_grades` DISABLE KEYS */;
/*!40000 ALTER TABLE `academic_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` bigint NOT NULL,
  `name` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('student','instructor','both') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'both',
  `description` text COLLATE utf8mb4_unicode_ci,
  `point` int DEFAULT NULL,
  `requirements` json DEFAULT NULL,
  `criteria` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `assignment_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `submission_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `file_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `score` decimal(5,2) DEFAULT NULL,
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('submitted','graded','late','resubmit') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'submitted',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `assignment_id` (`assignment_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `assignment_submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`),
  CONSTRAINT `assignment_submissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `academic_class_id` bigint DEFAULT NULL COMMENT 'Lớp học nếu là bài tập học thuật',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `due_date` timestamp NULL DEFAULT NULL,
  `max_score` int DEFAULT NULL,
  `file_requirements` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `assignment_type` enum('practice','homework','midterm','final','project') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'practice',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `assignments_academic_class_fk` (`academic_class_id`),
  CONSTRAINT `assignments_academic_class_fk` FOREIGN KEY (`academic_class_id`) REFERENCES `academic_classes` (`id`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Quản trị khách sạn','Các khóa học về quản trị khánh sạn','active','2025-03-08 07:57:20','2025-03-25 03:03:12'),(2,'Công nghệ thông tin','Các khóa học về CNTT và phát triển phần mềm','active','2025-03-08 07:57:20','2025-03-25 03:03:12'),(3,'Mạng máy tính','Các khóa học về mạng, bảo mật và giao thức truyền thông','active','2025-03-08 07:57:20','2025-03-25 03:03:12'),(4,'Kinh tế','Các khóa học về kinh tế vi mô, vĩ mô và thị trường tài chính','active','2025-03-08 07:57:20','2025-03-25 03:03:12'),(5,'Quản trị kinh doanh','Các khóa học về quản lý, chiến lược và lãnh đạo tổ chức','active','2025-03-08 07:57:20','2025-03-25 03:03:12'),(6,'Trí tuệ nhân tạo','Học máy, deep learning và ứng dụng AI','active','2025-03-08 07:57:20','2025-03-25 03:03:12'),(7,'An toàn thông tin','Nguyên tắc bảo mật, mã hóa và hacking có đạo đức','active','2025-03-08 07:57:20','2025-03-25 03:03:12'),(8,'Khoa học dữ liệu','Dữ liệu lớn, phân tích dữ liệu và trí tuệ kinh doanh','active','2025-03-08 07:57:20','2025-03-25 03:03:12'),(9,'Tài chính','Ngân hàng, đầu tư và tài chính doanh nghiệp','active','2025-03-08 07:57:20','2025-03-25 03:03:12'),(10,'Marketing','Tiếp thị số, xây dựng thương hiệu và hành vi khách hàng','active','2025-03-08 07:57:20','2025-03-25 03:03:12');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `certificate_number` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificate_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issue_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expiry_date` timestamp NULL DEFAULT NULL,
  `status` enum('active','expired','revoked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `certificate_number` (`certificate_number`),
  KEY `user_id` (`user_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES (1,2,2,'CERT-2-2-2024','certificates/cert-2-2.pdf','2024-03-26 00:54:57',NULL,'active','2025-03-31 01:17:47','2025-03-31 01:17:47'),(2,2,9,'CERT-2-9-2024','certificates/cert-2-9.pdf','2024-03-26 00:54:57',NULL,'active','2025-03-31 01:17:47','2025-03-31 01:17:47'),(3,1,1,'CERT-2-3-2024','certificates/cert-2-3.pdf','2024-03-26 00:54:57',NULL,'active','2025-03-31 01:19:27','2025-03-31 01:19:27');
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_attendance`
--

DROP TABLE IF EXISTS `class_attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_attendance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `schedule_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `status` enum('present','absent','late','excused') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `check_in_time` timestamp NULL DEFAULT NULL,
  `check_out_time` timestamp NULL DEFAULT NULL,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `schedule_id` (`schedule_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `class_attendance_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `class_schedules` (`id`),
  CONSTRAINT `class_attendance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_attendance`
--

LOCK TABLES `class_attendance` WRITE;
/*!40000 ALTER TABLE `class_attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_schedules`
--

DROP TABLE IF EXISTS `class_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_schedules` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `instructor_id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NOT NULL,
  `recurring_type` enum('once','daily','weekly','monthly') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'once',
  `recurring_days` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Format: 1,2,3,4,5,6,7 for days of week',
  `recurring_until` date DEFAULT NULL,
  `location_type` enum('online','offline','hybrid') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'online',
  `physical_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `online_meeting_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `online_meeting_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `online_meeting_password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_participants` int DEFAULT NULL,
  `status` enum('scheduled','ongoing','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'scheduled',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `schedule_history` json DEFAULT NULL COMMENT 'Lịch sử thay đổi lịch học',
  `last_modified_by` bigint DEFAULT NULL,
  `modification_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `instructor_id` (`instructor_id`),
  KEY `schedules_modifier_fk` (`last_modified_by`),
  CONSTRAINT `class_schedules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `class_schedules_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `schedules_modifier_fk` FOREIGN KEY (`last_modified_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_schedules`
--

LOCK TABLES `class_schedules` WRITE;
/*!40000 ALTER TABLE `class_schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_completion_grades`
--

DROP TABLE IF EXISTS `course_completion_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_completion_grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `final_grade` decimal(5,2) NOT NULL COMMENT 'Điểm tổng kết',
  `grade_status` enum('pass','fail','incomplete') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `completion_date` timestamp NULL DEFAULT NULL,
  `assignments_average` decimal(5,2) DEFAULT NULL COMMENT 'Điểm trung bình bài tập',
  `quizzes_average` decimal(5,2) DEFAULT NULL COMMENT 'Điểm trung bình bài kiểm tra',
  `midterm_grade` decimal(5,2) DEFAULT NULL COMMENT 'Điểm giữa kỳ',
  `final_exam_grade` decimal(5,2) DEFAULT NULL COMMENT 'Điểm cuối kỳ',
  `participation_grade` decimal(5,2) DEFAULT NULL COMMENT 'Điểm tham gia',
  `attendance_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Tỷ lệ tham gia lớp học',
  `instructor_comments` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_course` (`user_id`,`course_id`),
  KEY `course_id` (`course_id`),
  KEY `idx_completion_date` (`completion_date`),
  KEY `idx_grade_status` (`grade_status`),
  CONSTRAINT `course_completion_grades_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `course_completion_grades_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_completion_grades`
--

LOCK TABLES `course_completion_grades` WRITE;
/*!40000 ALTER TABLE `course_completion_grades` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_completion_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_lesson_discussions`
--

DROP TABLE IF EXISTS `course_lesson_discussions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_lesson_discussions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL COMMENT 'NULL cho thảo luận chính, ID của thảo luận cha cho phản hồi',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_pinned` tinyint(1) DEFAULT '0' COMMENT 'Chỉ áp dụng cho thảo luận chính',
  `status` enum('active','hidden','locked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `is_solution` tinyint(1) DEFAULT '0' COMMENT 'Đánh dấu phản hồi là giải pháp',
  `replies_count` int DEFAULT '0' COMMENT 'Số lượng phản hồi (cho thảo luận chính)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `user_id` (`user_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `course_lesson_discussions_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_lesson_discussions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `course_lesson_discussions_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `course_lesson_discussions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_lesson_discussions`
--

LOCK TABLES `course_lesson_discussions` WRITE;
/*!40000 ALTER TABLE `course_lesson_discussions` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_lesson_discussions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_lessons`
--

DROP TABLE IF EXISTS `course_lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_lessons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `section_id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type` enum('video','document','quiz','assignment') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `duration` int DEFAULT NULL COMMENT 'Duration in minutes',
  `order_number` int NOT NULL,
  `is_free` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `course_lessons_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `course_sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_lessons`
--

LOCK TABLES `course_lessons` WRITE;
/*!40000 ALTER TABLE `course_lessons` DISABLE KEYS */;
INSERT INTO `course_lessons` VALUES (1,1,'Tổng quan về Python','video','https://example.com/python_intro.mp4','Tìm hiểu về Python và ứng dụng của nó.',15,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(2,1,'Cài đặt môi trường','document',NULL,'Hướng dẫn cài đặt Python trên Windows, MacOS, Linux.',NULL,2,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(3,1,'Bài tập lập trình cơ bản','quiz',NULL,'Các câu hỏi trắc nghiệm về Python cơ bản.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(4,2,'Khái niệm OOP','video','https://example.com/python_oop.mp4','Giới thiệu về lập trình hướng đối tượng.',20,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(5,2,'Kế thừa và đa hình','document',NULL,'Tìm hiểu về kế thừa, đa hình trong Python.',NULL,2,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(6,2,'Bài tập thực hành OOP','assignment',NULL,'Xây dựng lớp và đối tượng trong Python.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(7,3,'Phát triển ứng dụng web với Flask','video','https://example.com/python_flask.mp4','Xây dựng ứng dụng web với Flask.',25,1,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(8,3,'Xử lý dữ liệu với Pandas','document',NULL,'Hướng dẫn sử dụng Pandas để xử lý dữ liệu.',NULL,2,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(9,3,'Bài tập dự án nhỏ','assignment',NULL,'Thực hành xây dựng một dự án nhỏ.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(10,4,'Ngành khách sạn là gì?','video','https://example.com/hotel_intro.mp4','Giới thiệu về ngành khách sạn.',15,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(11,4,'Xu hướng trong ngành khách sạn','document',NULL,'Báo cáo về xu hướng phát triển ngành.',NULL,2,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(12,4,'Bài tập tình huống','quiz',NULL,'Trả lời các câu hỏi về ngành khách sạn.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(13,5,'Kỹ năng giao tiếp với khách hàng','video','https://example.com/customer_service.mp4','Cách xử lý tình huống với khách hàng.',20,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(14,5,'Xử lý phàn nàn của khách hàng','document',NULL,'Hướng dẫn cách giải quyết vấn đề khách hàng.',NULL,2,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(15,5,'Bài tập tình huống','assignment',NULL,'Tình huống thực tế về chăm sóc khách hàng.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(16,6,'Tuyển dụng nhân viên','video','https://example.com/hotel_hr.mp4','Cách tuyển dụng và đào tạo nhân sự.',18,1,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(17,6,'Đào tạo nhân viên khách sạn','document',NULL,'Quy trình đào tạo nhân viên mới.',NULL,2,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(18,6,'Bài kiểm tra cuối khóa','quiz',NULL,'Câu hỏi đánh giá kiến thức.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(19,7,'Những mối đe dọa an ninh mạng','video','https://example.com/cybersecurity.mp4','Tìm hiểu về các rủi ro an ninh mạng.',25,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(20,7,'Tấn công mạng phổ biến','document',NULL,'Các hình thức tấn công mạng thường gặp.',NULL,2,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(21,7,'Bài tập thực hành bảo mật','assignment',NULL,'Thực hành kiểm tra lỗ hổng bảo mật.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(22,8,'Nguyên tắc mã hóa dữ liệu','video','https://example.com/encryption.mp4','Các phương pháp mã hóa phổ biến.',22,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(23,8,'Thực hành mã hóa dữ liệu','document',NULL,'Mã hóa dữ liệu bằng AES, RSA.',NULL,2,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(24,8,'Bài tập thực hành','assignment',NULL,'Mã hóa và giải mã một chuỗi dữ liệu.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(25,9,'Các hình thức tấn công phổ biến','video','https://example.com/hacking_methods.mp4','Tìm hiểu về các phương pháp tấn công mạng.',30,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(26,9,'Cách phòng chống tấn công','document',NULL,'Biện pháp bảo vệ hệ thống khỏi hacker.',NULL,2,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(27,9,'Bài tập tình huống','quiz',NULL,'Trắc nghiệm về bảo mật hệ thống.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(28,10,'Lịch sử và khái niệm AI','video','https://example.com/ai_intro.mp4','Tìm hiểu sự phát triển của trí tuệ nhân tạo.',20,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(29,10,'Ứng dụng của AI trong đời sống','document',NULL,'Cách AI đang thay đổi các ngành công nghiệp.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(30,10,'Bài tập trắc nghiệm AI','quiz',NULL,'Các câu hỏi trắc nghiệm về AI.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(31,11,'Giới thiệu về Deep Learning','video','https://example.com/deep_learning.mp4','Cơ bản về mạng neuron và Deep Learning.',25,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(32,11,'Cấu trúc của mạng neuron','document',NULL,'Tìm hiểu về các lớp mạng neuron.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(33,11,'Thực hành xây dựng mô hình DL','assignment',NULL,'Bài tập lập trình với TensorFlow.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(34,12,'AI trong y tế','video','https://example.com/ai_healthcare.mp4','Ứng dụng AI trong chẩn đoán y khoa.',18,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(35,12,'AI trong tài chính','document',NULL,'AI được sử dụng trong giao dịch tài chính như thế nào?',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(36,12,'Bài tập phân tích dữ liệu với AI','assignment',NULL,'Thực hành sử dụng AI để phân tích dữ liệu.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(37,13,'Tổng quan về SQL','video','https://example.com/sql_intro.mp4','Cơ bản về SQL và cách sử dụng.',15,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(38,13,'Các loại câu lệnh SQL','document',NULL,'Tìm hiểu về SELECT, INSERT, UPDATE, DELETE.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(39,13,'Bài tập viết câu lệnh SQL','quiz',NULL,'Trả lời các câu hỏi về SQL.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(40,14,'Sử dụng GROUP BY và HAVING','video','https://example.com/sql_groupby.mp4','Cách nhóm và lọc dữ liệu.',20,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(41,14,'Truy vấn nâng cao với JOIN','document',NULL,'Hướng dẫn cách sử dụng JOIN.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(42,14,'Bài tập thực hành SQL nâng cao','assignment',NULL,'Thực hành các câu lệnh SQL phức tạp.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(43,15,'Sử dụng SQL trong Python','video','https://example.com/python_sql.mp4','Kết hợp Python với SQL để xử lý dữ liệu.',22,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(44,15,'Thực hành với SQLite','document',NULL,'Hướng dẫn sử dụng SQLite trong Python.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(45,15,'Bài tập xây dựng ứng dụng nhỏ','assignment',NULL,'Tạo một ứng dụng CRUD sử dụng SQL.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(46,16,'Tổng quan về quản trị kinh doanh','video','https://example.com/business_management.mp4','Những nguyên tắc cơ bản của quản trị kinh doanh.',18,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(47,16,'Vai trò của quản trị viên','document',NULL,'Các kỹ năng cần có của một nhà quản trị.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(48,16,'Bài tập tình huống quản trị','assignment',NULL,'Giải quyết các vấn đề kinh doanh giả định.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(49,17,'Xây dựng chiến lược kinh doanh','video','https://example.com/business_strategy.mp4','Cách lập kế hoạch kinh doanh hiệu quả.',20,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(50,17,'Các mô hình kinh doanh phổ biến','document',NULL,'Phân tích SWOT, PESTEL, 5 Forces.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(51,17,'Bài tập phân tích mô hình kinh doanh','quiz',NULL,'Các câu hỏi phân tích tình huống.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(52,18,'Nguyên tắc quản lý tài chính','video','https://example.com/finance_management.mp4','Quản lý dòng tiền và đầu tư.',25,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(53,18,'Phân tích rủi ro tài chính','document',NULL,'Các phương pháp đánh giá rủi ro.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(54,18,'Bài tập quản lý ngân sách','assignment',NULL,'Thực hành lập kế hoạch tài chính.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(55,19,'Machine Learning là gì?','video','https://example.com/ml_intro.mp4','Giới thiệu về Machine Learning.',20,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(56,19,'Các thuật toán cơ bản','document',NULL,'Hướng dẫn về thuật toán Linear Regression.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(57,19,'Bài tập lập trình với Scikit-Learn','assignment',NULL,'Thực hành xây dựng mô hình ML.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(58,20,'K-Means Clustering','video','https://example.com/kmeans.mp4','Thuật toán phân cụm dữ liệu.',22,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(59,20,'Random Forest và ứng dụng','document',NULL,'Tìm hiểu về thuật toán Random Forest.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(60,20,'Bài tập phân loại dữ liệu','quiz',NULL,'Các câu hỏi về thuật toán phân loại.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(61,21,'ML trong xử lý ảnh','video','https://example.com/ml_image_processing.mp4','Ứng dụng ML trong xử lý ảnh.',25,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(62,21,'ML trong xử lý ngôn ngữ tự nhiên','document',NULL,'Ứng dụng ML trong NLP.',NULL,2,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(63,21,'Bài tập dự án thực tế','assignment',NULL,'Xây dựng một mô hình Machine Learning.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(64,22,'Tổng quan về Digital Marketing','video','https://example.com/digital_marketing_intro.mp4','Giới thiệu các kênh và chiến lược Digital Marketing.',18,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(65,22,'Các kênh tiếp thị trực tuyến','document',NULL,'Tìm hiểu về SEO, SEM, Social Media Marketing.',NULL,2,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(66,22,'Bài tập lập kế hoạch Digital Marketing','assignment',NULL,'Thực hành tạo chiến dịch tiếp thị số.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(67,23,'Cách hoạt động của SEO','video','https://example.com/seo_basics.mp4','Tìm hiểu nguyên lý SEO và cách tối ưu trang web.',20,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(68,23,'Google Ads và Facebook Ads','document',NULL,'Hướng dẫn chạy quảng cáo hiệu quả.',NULL,2,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(69,23,'Bài tập tối ưu hóa chiến dịch quảng cáo','assignment',NULL,'Thực hành cài đặt và tối ưu chiến dịch.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(70,24,'Tại sao thương hiệu cá nhân quan trọng?','video','https://example.com/personal_branding.mp4','Giới thiệu về thương hiệu cá nhân và lợi ích.',15,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(71,24,'Xây dựng hình ảnh trên mạng xã hội','document',NULL,'Cách tối ưu hồ sơ cá nhân trên LinkedIn, Facebook.',NULL,2,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(72,24,'Bài tập xây dựng thương hiệu cá nhân','assignment',NULL,'Thực hành viết bài giới thiệu bản thân.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(73,25,'Nguyên tắc tài chính doanh nghiệp','video','https://example.com/corporate_finance.mp4','Tổng quan về tài chính doanh nghiệp.',22,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(74,25,'Quản lý dòng tiền','document',NULL,'Hướng dẫn lập kế hoạch dòng tiền.',NULL,2,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(75,25,'Bài tập lập kế hoạch tài chính','quiz',NULL,'Các câu hỏi trắc nghiệm về tài chính.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(76,26,'Các loại hình đầu tư','video','https://example.com/investment_basics.mp4','Giới thiệu các loại hình đầu tư như cổ phiếu, trái phiếu.',25,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(77,26,'Cách xây dựng danh mục đầu tư hiệu quả','document',NULL,'Nguyên tắc đa dạng hóa và quản lý rủi ro.',NULL,2,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(78,26,'Bài tập xây dựng danh mục đầu tư','assignment',NULL,'Thực hành phân tích danh mục đầu tư.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(79,27,'Rủi ro tài chính là gì?','video','https://example.com/financial_risk.mp4','Phân loại rủi ro tài chính.',20,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(80,27,'Các công cụ phòng ngừa rủi ro','document',NULL,'Hướng dẫn sử dụng bảo hiểm, hợp đồng phái sinh.',NULL,2,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(81,27,'Bài tập đánh giá rủi ro','quiz',NULL,'Câu hỏi về phân tích rủi ro tài chính.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(82,28,'Giới thiệu về mạng máy tính','video','https://example.com/network_basics.mp4','Các khái niệm cơ bản về mạng.',18,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(83,28,'Giao thức mạng phổ biến','document',NULL,'Tìm hiểu TCP/IP, HTTP, DNS.',NULL,2,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(84,28,'Bài tập thiết lập mạng cơ bản','assignment',NULL,'Thực hành cấu hình mạng nội bộ.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(85,29,'Các nguy cơ bảo mật mạng','video','https://example.com/network_security.mp4','Tổng quan về các mối đe dọa bảo mật.',22,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(86,29,'Mô hình bảo mật Zero Trust','document',NULL,'Giới thiệu mô hình bảo mật không tin tưởng.',NULL,2,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(87,29,'Bài tập kiểm tra lỗ hổng bảo mật','assignment',NULL,'Thực hành phân tích lỗ hổng trong hệ thống.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(88,30,'Tại sao an toàn thông tin quan trọng?','video','https://example.com/cybersecurity_business.mp4','Giới thiệu về an toàn thông tin.',20,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(89,30,'Các chính sách bảo mật doanh nghiệp','document',NULL,'Hướng dẫn xây dựng chính sách bảo mật.',NULL,2,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(90,30,'Bài tập kiểm tra an toàn thông tin','quiz',NULL,'Câu hỏi thực hành đánh giá bảo mật.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14');
/*!40000 ALTER TABLE `course_lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_progress`
--

DROP TABLE IF EXISTS `course_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_progress` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `lesson_id` bigint NOT NULL,
  `status` enum('not_started','in_progress','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'not_started',
  `progress_percentage` decimal(5,2) DEFAULT '0.00',
  `last_accessed` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_progress` (`user_id`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `course_progress_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `course_progress_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_progress`
--

LOCK TABLES `course_progress` WRITE;
/*!40000 ALTER TABLE `course_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `course_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_sections`
--

DROP TABLE IF EXISTS `course_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_sections` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `order_number` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `course_sections_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_sections`
--

LOCK TABLES `course_sections` WRITE;
/*!40000 ALTER TABLE `course_sections` DISABLE KEYS */;
INSERT INTO `course_sections` VALUES (1,1,'Giới thiệu về Python','Tổng quan về Python, cài đặt môi trường, cú pháp cơ bản.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(2,1,'Lập trình hướng đối tượng trong Python','Tìm hiểu về OOP, các lớp, đối tượng và kế thừa.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(3,1,'Ứng dụng thực tế với Python','Xây dựng dự án nhỏ với Python.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(4,2,'Tổng quan về ngành khách sạn','Giới thiệu về ngành, xu hướng và cơ hội nghề nghiệp.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(5,2,'Quản lý dịch vụ khách hàng','Kỹ năng giao tiếp, chăm sóc khách hàng trong khách sạn.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(6,2,'Quản lý nhân sự trong khách sạn','Tuyển dụng, đào tạo và duy trì nhân viên khách sạn.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(7,3,'Giới thiệu về bảo mật thông tin','Tổng quan về các mối đe dọa an ninh mạng.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(8,3,'Mã hóa và bảo vệ dữ liệu','Cách mã hóa dữ liệu và bảo vệ thông tin cá nhân.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(9,3,'Tấn công mạng và phòng chống','Các hình thức tấn công và biện pháp bảo vệ.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(10,4,'Nhập môn trí tuệ nhân tạo','Các khái niệm cơ bản về AI và học sâu.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(11,4,'Mô hình học sâu (Deep Learning)','Mô hình mạng nơ-ron, TensorFlow, PyTorch.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(12,4,'Ứng dụng AI trong thực tế','AI trong y tế, tài chính, công nghiệp.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(13,5,'Giới thiệu về SQL','Các câu lệnh cơ bản trong SQL.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(14,5,'Phân tích dữ liệu với SQL','Sử dụng SQL để phân tích dữ liệu doanh nghiệp.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(15,5,'Kết hợp Python và SQL','Tích hợp Python để xử lý và trực quan hóa dữ liệu.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(16,6,'Nguyên tắc quản trị kinh doanh','Các lý thuyết và nguyên tắc cơ bản.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(17,6,'Chiến lược kinh doanh','Lập kế hoạch chiến lược cho doanh nghiệp.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(18,6,'Quản lý tài chính và rủi ro','Kiểm soát tài chính và đánh giá rủi ro.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(19,7,'Tổng quan về Machine Learning','Các khái niệm cốt lõi của học máy.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(20,7,'Thuật toán Machine Learning','Học có giám sát, không giám sát, reinforcement learning.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(21,7,'Ứng dụng Machine Learning','Áp dụng vào nhận diện hình ảnh, dự đoán, xử lý ngôn ngữ.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(22,8,'Marketing kỹ thuật số là gì?','Tổng quan về Digital Marketing.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(23,8,'SEO và quảng cáo trực tuyến','Tối ưu hóa công cụ tìm kiếm và chạy quảng cáo.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(24,8,'Xây dựng thương hiệu cá nhân','Kỹ năng tạo dựng và duy trì thương hiệu.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(25,9,'Giới thiệu về tài chính doanh nghiệp','Tìm hiểu về tài chính, kế toán doanh nghiệp.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(26,9,'Đầu tư và quản lý danh mục','Chiến lược đầu tư và quản lý tài sản.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(27,9,'Quản lý rủi ro tài chính','Phân tích và kiểm soát rủi ro.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(28,10,'Mạng máy tính cơ bản','Các khái niệm về mạng, giao thức và mô hình OSI.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(29,10,'Bảo mật mạng nâng cao','Firewall, IDS, IPS, VPN, bảo vệ dữ liệu.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(30,10,'An toàn thông tin trong doanh nghiệp','Các giải pháp bảo mật thông tin trong tổ chức.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33');
/*!40000 ALTER TABLE `course_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category_id` bigint NOT NULL,
  `instructor_id` bigint NOT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `level` enum('beginner','intermediate','advanced') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('draft','published','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `thumbnail_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required` text COLLATE utf8mb4_unicode_ci,
  `learned` text COLLATE utf8mb4_unicode_ci,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `courses_fk_2_idx` (`instructor_id`),
  CONSTRAINT `courses_fk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `courses_fk_2` FOREIGN KEY (`instructor_id`) REFERENCES `user_instructors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Lập trình Python từ cơ bản đến nâng cao','Khóa học giúp bạn nắm vững Python từ cơ bản đến nâng cao.',2,1,499990.00,'beginner','published','/src/assets/logo.png','Không yêu cầu kinh nghiệm lập trình.\nChỉ cần máy tính có kết nối internet.\nPhù hợp cho người mới bắt đầu.\nKiên nhẫn và ham học hỏi.','Nắm vững cú pháp Python.\nViết chương trình từ cơ bản đến nâng cao.\nXử lý tệp và dữ liệu.\nLập trình hướng đối tượng.\nXây dựng ứng dụng nhỏ.','2025-04-01','2025-06-30','2025-03-25 03:51:46','2025-03-26 01:28:07'),(2,'Quản lý khách sạn chuyên nghiệp','Học cách vận hành và quản lý khách sạn hiệu quả.',1,2,399990.00,'intermediate','published','/src/assets/logo.png','Không cần kinh nghiệm trước.\nPhù hợp cho người muốn làm việc trong ngành khách sạn.\nCó tinh thần trách nhiệm và chăm chỉ.\nYêu thích dịch vụ khách hàng.','Biết cách vận hành khách sạn.\nQuản lý nhân sự và chăm sóc khách hàng.\nKiểm soát chi phí và doanh thu.\nXây dựng chiến lược kinh doanh khách sạn.','2025-04-05','2025-07-10','2025-03-25 03:51:46','2025-03-26 01:28:07'),(3,'An toàn thông tin và bảo mật hệ thống','Học cách bảo vệ hệ thống trước các mối đe dọa an ninh.',7,3,599990.00,'advanced','published','/src/assets/logo.png','Có kiến thức cơ bản về hệ điều hành và mạng máy tính.\nHiểu cách hoạt động của internet.\nĐam mê về bảo mật thông tin.\nKhông cần kinh nghiệm lập trình.','Biết cách bảo vệ hệ thống.\nPhát hiện và xử lý lỗ hổng bảo mật.\nSử dụng các công cụ kiểm thử bảo mật.\nXây dựng kế hoạch bảo vệ dữ liệu.','2025-04-10','2025-08-15','2025-03-25 03:51:46','2025-03-26 01:28:07'),(4,'Trí tuệ nhân tạo và Deep Learning','Tìm hiểu về các mô hình AI hiện đại.',6,2,699990.00,'advanced','published','/src/assets/logo.png','Hiểu biết cơ bản về toán và lập trình.\nCó kiến thức về xác suất thống kê là lợi thế.\nĐam mê về trí tuệ nhân tạo.\nKhông cần kinh nghiệm chuyên sâu.','Ứng dụng Deep Learning vào bài toán thực tế.\nXây dựng mô hình AI từ đầu.\nSử dụng TensorFlow và PyTorch.\nTối ưu mô hình và triển khai.','2025-04-15','2025-09-01','2025-03-25 03:51:46','2025-03-26 01:28:07'),(5,'Phân tích dữ liệu với SQL và Python','Ứng dụng SQL và Python trong phân tích dữ liệu.',8,3,549990.00,'intermediate','published','/src/assets/logo.png','Biết lập trình Python hoặc SQL cơ bản là lợi thế.\nKhông cần kinh nghiệm phân tích dữ liệu.\nTư duy logic và khả năng đọc hiểu số liệu.\nCó máy tính để thực hành.','Thành thạo SQL trong phân tích dữ liệu.\nSử dụng Python để trực quan hóa dữ liệu.\nHiểu cách xử lý dữ liệu lớn.\nỨng dụng phân tích trong thực tế.','2025-04-20','2025-07-20','2025-03-25 03:51:46','2025-03-26 01:28:07'),(6,'Quản trị kinh doanh và chiến lược','Các chiến lược quản lý doanh nghiệp hiệu quả.',5,1,479990.00,'intermediate','published','/src/assets/logo.png','Phù hợp cho sinh viên, nhân viên, quản lý muốn hiểu về chiến lược kinh doanh.\nKhông cần kinh nghiệm trước.\nKhả năng tư duy chiến lược.\nĐam mê lĩnh vực kinh doanh.','Xây dựng chiến lược kinh doanh hiệu quả.\nPhân tích tài chính và thị trường.\nQuản lý nhân sự và điều hành doanh nghiệp.\nỨng dụng thực tế trong công ty.','2025-05-01','2025-08-01','2025-03-25 03:51:46','2025-03-26 01:28:07'),(7,'Học máy và ứng dụng thực tế','Cách triển khai mô hình học máy vào thực tế.',6,2,629990.00,'advanced','published','/src/assets/logo.png','Có kiến thức lập trình cơ bản.\nHiểu về toán xác suất và thống kê.\nĐam mê học máy và trí tuệ nhân tạo.\nSẵn sàng thực hành trên dữ liệu thực tế.','Xây dựng và triển khai mô hình Machine Learning.\nSử dụng Scikit-learn và TensorFlow.\nTối ưu và đánh giá mô hình.\nỨng dụng trong nhiều lĩnh vực thực tế.','2025-05-10','2025-09-10','2025-03-25 03:51:46','2025-03-26 01:28:07'),(8,'Marketing số và tối ưu hóa thương hiệu','Tối ưu chiến lược marketing số.',10,3,419990.00,'beginner','published','/src/assets/logo.png','Không cần kinh nghiệm trước.\nPhù hợp cho người mới tìm hiểu về marketing số.\nCó tư duy sáng tạo.\nSẵn sàng thử nghiệm các chiến lược marketing mới.','Biết cách tối ưu chiến lược marketing số.\nXây dựng thương hiệu trên nền tảng số.\nSử dụng quảng cáo Facebook, Google hiệu quả.\nPhân tích và đo lường chiến dịch.','2025-05-15','2025-07-31','2025-03-25 03:51:46','2025-03-26 01:28:07'),(9,'Tài chính doanh nghiệp và đầu tư','Học về tài chính và chiến lược đầu tư.',9,1,579990.00,'advanced','published','/src/assets/logo.png','Có kiến thức cơ bản về tài chính doanh nghiệp là lợi thế.\nKhông cần kinh nghiệm đầu tư trước đó.\nTư duy phân tích và quản lý rủi ro.\nQuan tâm đến kinh tế và tài chính.','Biết cách phân tích tài chính.\nQuản lý dòng tiền và lập kế hoạch đầu tư.\nTìm hiểu về chứng khoán, bất động sản.\nGiảm thiểu rủi ro trong đầu tư.','2025-06-01','2025-09-30','2025-03-25 03:51:46','2025-03-26 01:28:07'),(10,'Mạng máy tính và bảo mật nâng cao','Tìm hiểu về mạng máy tính và bảo mật chuyên sâu.',3,2,499990.00,'intermediate','published','/src/assets/logo.png','Nên có kiến thức về mạng máy tính cơ bản.\nKhông yêu cầu kinh nghiệm bảo mật trước.\nTư duy logic và giải quyết vấn đề.\nĐam mê về an ninh mạng.','Hiểu về bảo mật mạng nâng cao.\nTriển khai hệ thống an toàn.\nPhát hiện và xử lý sự cố an ninh.\nBảo vệ dữ liệu khỏi các cuộc tấn công mạng.','2025-06-10','2025-10-01','2025-03-25 03:51:46','2025-03-26 01:28:07');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `instructor_id` bigint NOT NULL,
  `course_section_id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `file_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` enum('pdf','slide','code','link','txt','docx') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int DEFAULT NULL,
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `download_count` int DEFAULT '0',
  `status` enum('active','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `documents_ibfk_1_idx` (`course_section_id`),
  KEY `documents_ibfk_1` (`instructor_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `user_instructors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`course_section_id`) REFERENCES `course_sections` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,1,1,'Tài liệu Python cơ bản','Giới thiệu tổng quan về ngôn ngữ lập trình Python','/documents/python/intro.pdf','pdf',2048,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(2,1,2,'Hướng dẫn OOP Python','Tài liệu về lập trình hướng đối tượng trong Python','/documents/python/oop.pdf','pdf',3072,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(3,1,3,'Ứng dụng Python thực tế','Các ví dụ và project thực tế với Python','/documents/python/projects.pdf','pdf',4096,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(4,2,4,'Tổng quan ngành khách sạn','Giới thiệu về ngành quản trị khách sạn','/documents/hotel/overview.pdf','pdf',2560,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(5,2,5,'Quản lý dịch vụ khách hàng','Kỹ năng và quy trình phục vụ khách hàng','/documents/hotel/customer_service.pdf','pdf',3584,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(6,2,6,'Quản lý nhân sự khách sạn','Chiến lược quản lý nhân sự trong khách sạn','/documents/hotel/hr_management.pdf','pdf',2816,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(7,3,7,'Nhập môn bảo mật thông tin','Các khái niệm cơ bản về bảo mật','/documents/security/basics.pdf','pdf',3328,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(8,3,8,'Kỹ thuật mã hóa dữ liệu','Phương pháp mã hóa và bảo vệ dữ liệu','/documents/security/encryption.pdf','pdf',4352,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(9,3,9,'Phòng chống tấn công mạng','Các biện pháp phòng chống tấn công','/documents/security/defense.pdf','pdf',3840,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(10,2,10,'Cơ bản về AI','Giới thiệu về trí tuệ nhân tạo','/documents/ai/intro.pdf','pdf',5120,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(11,2,11,'Deep Learning cơ bản','Kiến thức về học sâu và neural networks','/documents/ai/deep_learning.pdf','pdf',6144,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(12,2,12,'AI trong thực tế','Ứng dụng AI trong các lĩnh vực','/documents/ai/applications.pdf','pdf',4608,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(13,3,13,'Nhập môn SQL','Cơ bản về ngôn ngữ truy vấn SQL','/documents/sql/basics.pdf','pdf',2944,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(14,3,14,'Phân tích dữ liệu SQL','Kỹ thuật phân tích dữ liệu với SQL','/documents/sql/analysis.pdf','pdf',3712,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(15,3,15,'Python và SQL','Tích hợp Python với SQL','/documents/sql/python_sql.pdf','pdf',4224,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(16,2,16,'Quản trị doanh nghiệp','Nguyên tắc cơ bản trong quản trị','/documents/business/management.pdf','pdf',3968,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(17,2,17,'Chiến lược kinh doanh','Xây dựng và phát triển chiến lược','/documents/business/strategy.pdf','pdf',4736,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(18,2,18,'Quản lý tài chính','Quản lý tài chính và rủi ro','/documents/business/finance.pdf','pdf',5248,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(19,3,19,'Machine Learning Overview','Tổng quan về học máy','/documents/ml/overview.pdf','pdf',4480,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(20,3,20,'ML Algorithms','Các thuật toán học máy','/documents/ml/algorithms.pdf','pdf',5504,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(21,3,21,'ML Applications','Ứng dụng ML trong thực tế','/documents/ml/applications.pdf','pdf',4992,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(22,2,22,'Digital Marketing Basics','Cơ bản về marketing số','/documents/marketing/basics.pdf','pdf',3456,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(23,2,23,'SEO & Advertising','Chiến lược SEO và quảng cáo','/documents/marketing/seo.pdf','pdf',4096,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(24,2,24,'Personal Branding','Xây dựng thương hiệu cá nhân','/documents/marketing/branding.pdf','pdf',3584,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(25,1,25,'Corporate Finance','Tài chính doanh nghiệp','/documents/finance/corporate.pdf','pdf',4864,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(26,1,26,'Investment Management','Quản lý đầu tư','/documents/finance/investment.pdf','pdf',5632,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(27,1,27,'Risk Management','Quản lý rủi ro tài chính','/documents/finance/risk.pdf','pdf',4224,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(28,3,28,'Network Basics','Cơ bản về mạng máy tính','/documents/network/basics.pdf','pdf',3840,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(29,3,29,'Advanced Security','Bảo mật mạng nâng cao','/documents/network/security.pdf','pdf',4736,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(30,3,30,'Enterprise Security','Bảo mật trong doanh nghiệp','/documents/network/enterprise.pdf','pdf',5120,'2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `enrollment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','completed','dropped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `completion_date` timestamp NULL DEFAULT NULL,
  `progress` float DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`user_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,13,1,'2025-03-26 00:54:57','active',NULL,20.5,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(2,13,4,'2025-03-26 00:54:57','completed','2025-03-26 00:54:57',100,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(3,14,2,'2025-03-26 00:54:57','active',NULL,10,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(4,14,7,'2025-03-26 00:54:57','active',NULL,5,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(5,15,3,'2025-03-26 00:54:57','completed','2025-03-26 00:54:57',100,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(6,15,5,'2025-03-26 00:54:57','active',NULL,30,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(7,16,6,'2025-03-26 00:54:57','dropped',NULL,15,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(8,16,9,'2025-03-26 00:54:57','active',NULL,25,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(9,17,8,'2025-03-26 00:54:57','completed','2025-03-26 00:54:57',100,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(10,17,10,'2025-03-26 00:54:57','active',NULL,50,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(11,1,1,'2025-03-26 00:54:57','active',NULL,100,'2025-03-26 00:54:57','2025-03-31 01:18:29'),(12,1,3,'2025-03-26 00:54:57','active',NULL,60,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(13,2,2,'2025-03-26 00:54:57','completed','2025-03-26 00:54:57',100,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(14,2,5,'2025-03-26 00:54:57','active',NULL,35,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(15,4,4,'2025-03-26 00:54:57','dropped',NULL,20,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(16,4,6,'2025-03-26 00:54:57','active',NULL,55,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(17,1,7,'2025-03-26 00:54:57','active',NULL,10,'2025-03-26 00:54:57','2025-03-26 02:05:01'),(18,2,9,'2025-03-26 00:54:57','completed','2025-03-26 00:54:57',100,'2025-03-26 00:54:57','2025-03-26 02:05:01'),(19,12,8,'2025-03-26 00:54:57','active',NULL,45,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(20,12,10,'2025-03-26 00:54:57','active',NULL,70,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(21,14,1,'2025-03-26 00:54:57','active',NULL,0,'2025-03-26 00:54:57','2025-03-26 00:54:57');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_likes`
--

DROP TABLE IF EXISTS `forum_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_likes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `forum_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_topic_like` (`user_id`,`forum_id`),
  KEY `forum_likes_topic_fk_idx` (`forum_id`),
  CONSTRAINT `forum_likes_topic_fk` FOREIGN KEY (`forum_id`) REFERENCES `forums` (`id`),
  CONSTRAINT `forum_likes_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_likes`
--

LOCK TABLES `forum_likes` WRITE;
/*!40000 ALTER TABLE `forum_likes` DISABLE KEYS */;
INSERT INTO `forum_likes` VALUES (1,1,1,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(2,2,1,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(3,3,1,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(4,4,2,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(5,5,2,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(6,6,2,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(7,7,4,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(8,8,4,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(9,9,4,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(10,10,5,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(11,1,5,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(12,2,5,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(13,3,6,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(14,4,6,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(15,5,6,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(16,6,7,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(17,7,7,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(18,8,7,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(19,9,8,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(20,10,8,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(21,1,8,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(22,2,9,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(23,3,9,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(24,4,9,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(25,5,10,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(26,6,10,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(27,7,10,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(28,8,11,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(29,9,11,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(30,10,11,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(31,1,12,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(32,2,12,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(33,3,12,'2025-03-28 03:46:11','2025-03-28 03:46:11');
/*!40000 ALTER TABLE `forum_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_replies`
--

DROP TABLE IF EXISTS `forum_replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forum_replies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `forum_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `reply_id` bigint DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_solution` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `forum_replies_ibfk_1_idx` (`forum_id`),
  KEY `forum_replies_ibfk_3_idx` (`reply_id`),
  CONSTRAINT `forum_replies_ibfk_1` FOREIGN KEY (`forum_id`) REFERENCES `forums` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forum_replies_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `forum_replies_ibfk_3` FOREIGN KEY (`reply_id`) REFERENCES `forum_replies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_replies`
--

LOCK TABLES `forum_replies` WRITE;
/*!40000 ALTER TABLE `forum_replies` DISABLE KEYS */;
INSERT INTO `forum_replies` VALUES (1,1,2,NULL,'Tôi gặp vấn đề với vòng lặp for trong Python, có ai giúp được không?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(2,1,2,NULL,'Bạn có thể chia sẻ code cụ thể không? Tôi sẽ giúp bạn debug.',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(3,1,4,NULL,'Đây là cách tôi thường xử lý vòng lặp for trong Python...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(4,2,5,NULL,'Làm thế nào để tối ưu hóa quy trình check-in?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(5,2,6,NULL,'Chúng tôi đang sử dụng phần mềm XYZ, nó khá hiệu quả...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(6,3,7,NULL,'Các bạn có kinh nghiệm với penetration testing không?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(7,3,8,NULL,'Tôi đề xuất sử dụng các công cụ sau để test bảo mật...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(8,4,9,NULL,'Có ai đã thử implement BERT model chưa?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(9,4,10,NULL,'Tôi có kinh nghiệm với BERT, đây là một số lưu ý quan trọng...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(10,5,2,NULL,'Cách tối ưu query trong PostgreSQL?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(11,5,6,NULL,'Bạn nên sử dụng index và partition table để cải thiện hiệu suất...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(12,6,4,NULL,'Chia sẻ kinh nghiệm về quản lý team remote?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(13,6,5,NULL,'Chúng tôi sử dụng kết hợp các công cụ sau để quản lý hiệu quả...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(14,7,6,NULL,'So sánh hiệu quả giữa Random Forest và XGBoost?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(15,7,7,NULL,'Dựa trên kinh nghiệm của tôi với cả hai model...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(16,8,8,NULL,'Chiến lược SEO hiệu quả trong năm 2024?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(17,8,9,NULL,'Một số xu hướng SEO mới mà bạn nên chú ý...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(18,9,10,NULL,'Phương pháp định giá startup hiệu quả?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(19,9,2,NULL,'Có nhiều phương pháp, nhưng tôi thường sử dụng...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(20,10,11,NULL,'Best practices cho việc thiết lập firewall?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(21,10,4,NULL,'Đây là checklist tôi sử dụng khi cấu hình firewall...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(22,1,4,1,'Bạn gặp vấn đề gì cụ thể với vòng lặp for vậy?',0,'2025-03-27 20:32:49','2025-03-27 20:32:49'),(23,1,2,1,'Mình bị lỗi khi dùng nested loop, code cứ chạy vô hạn',0,'2025-03-27 20:33:49','2025-03-27 20:33:49'),(24,1,6,2,'Bạn cần thêm điều kiện dừng cho vòng lặp trong',1,'2025-03-27 20:34:49','2025-03-27 20:34:49'),(25,2,7,4,'Chúng tôi đang gặp vấn đề tương tự',0,'2025-03-27 20:35:49','2025-03-27 20:35:49'),(26,2,8,5,'Phần mềm XYZ có hỗ trợ tích hợp với PMS không?',0,'2025-03-27 20:36:49','2025-03-27 20:36:49'),(27,3,9,6,'Tôi có kinh nghiệm với Burp Suite',0,'2025-03-27 20:37:49','2025-03-27 20:37:49'),(28,3,10,7,'Burp Suite kết hợp với OWASP ZAP rất hiệu quả',1,'2025-03-27 20:38:49','2025-03-27 20:38:49'),(29,4,5,8,'BERT có thực sự cần thiết cho task của bạn không?',0,'2025-03-27 20:39:49','2025-03-27 20:39:49'),(30,4,11,9,'Có thể dùng DistilBERT để giảm độ phức tạp',1,'2025-03-27 20:40:49','2025-03-27 20:40:49'),(31,5,12,10,'Bạn đã thử phân tích EXPLAIN ANALYZE chưa?',0,'2025-03-27 20:41:49','2025-03-27 20:41:49'),(32,5,13,11,'Cảm ơn, mình sẽ thử các giải pháp bạn đề xuất',0,'2025-03-27 20:42:49','2025-03-27 20:42:49'),(33,6,14,12,'Chúng tôi dùng Slack và Trello rất hiệu quả',0,'2025-03-27 20:43:49','2025-03-27 20:43:49'),(34,6,15,13,'Làm sao để đảm bảo team engagement?',0,'2025-03-27 20:44:49','2025-03-27 20:44:49'),(35,7,16,14,'Với dataset của tôi, Random Forest cho accuracy cao hơn',0,'2025-03-27 20:45:49','2025-03-27 20:45:49'),(36,7,17,15,'Bạn có thể chia sẻ chi tiết về hyperparameter tuning không?',0,'2025-03-27 20:46:49','2025-03-27 20:46:49'),(37,8,2,16,'Video marketing đang là xu hướng mạnh',0,'2025-03-27 20:47:49','2025-03-27 20:47:49'),(38,8,4,17,'Làm sao để tối ưu chi phí cho video marketing?',0,'2025-03-27 20:48:49','2025-03-27 20:48:49'),(39,9,5,18,'DCF là phương pháp phổ biến nhất',0,'2025-03-27 20:49:49','2025-03-27 20:49:49'),(40,9,6,19,'Các yếu tố vĩ mô cũng rất quan trọng',0,'2025-03-27 20:50:49','2025-03-27 20:50:49'),(41,10,7,20,'Zero Trust là xu hướng mới trong bảo mật',0,'2025-03-27 20:51:49','2025-03-27 20:51:49'),(42,10,8,21,'Bạn có thể chia sẻ template checklist không?',0,'2025-03-27 20:52:49','2025-03-27 20:52:49');
/*!40000 ALTER TABLE `forum_replies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forums`
--

DROP TABLE IF EXISTS `forums`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forums` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `course_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `thumbnail_url` text COLLATE utf8mb4_unicode_ci,
  `status` enum('active','archived','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `forums_ibfk_2_idx` (`user_id`),
  CONSTRAINT `forums_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `forums_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forums`
--

LOCK TABLES `forums` WRITE;
/*!40000 ALTER TABLE `forums` DISABLE KEYS */;
INSERT INTO `forums` VALUES (1,1,6,'Thảo luận Python','<h3>Chào mừng bạn đến với Diễn đàn Python!</h3>\n<p>Đây là nơi trao đổi kiến thức và giải đáp thắc mắc về:</p>\n<ul>\n  <li>Python cơ bản: cú pháp, kiểu dữ liệu, vòng lặp, hàm</li>\n  <li>Lập trình hướng đối tượng với Python</li>\n  <li>Các thư viện phổ biến: NumPy, Pandas, Matplotlib</li>\n  <li>Web Framework: Django, Flask</li>\n  <li>Xử lý dữ liệu và AI với Python</li>\n</ul>\n<p>Hãy tham gia thảo luận và chia sẻ kinh nghiệm của bạn!</p>',NULL,'active','2025-03-28 03:07:06','2025-03-30 01:10:36'),(2,2,8,'Diễn đàn Quản lý Khách sạn','<h3>Diễn đàn Quản lý Khách sạn Chuyên nghiệp</h3>\n<p>Nơi trao đổi các chủ đề:</p>\n<ul>\n  <li>Quy trình vận hành khách sạn tiêu chuẩn</li>\n  <li>Quản lý nhân sự trong ngành hospitality</li>\n  <li>Chiến lược marketing và bán hàng</li>\n  <li>Công nghệ và phần mềm quản lý khách sạn</li>\n  <li>Xử lý khủng hoảng và tình huống đặc biệt</li>\n</ul>\n<p>Chia sẻ kinh nghiệm của bạn để cùng phát triển!</p>',NULL,'active','2025-03-28 03:07:06','2025-03-30 01:10:36'),(3,3,6,'Forum An toàn thông tin','<h3>Forum An toàn thông tin</h3>\n<p>Thảo luận chuyên sâu về:</p>\n<ul>\n  <li>Bảo mật hệ thống và mạng</li>\n  <li>Phân tích và phòng chống tấn công mạng</li>\n  <li>Mã hóa và giải mã</li>\n  <li>Quản lý rủi ro an ninh mạng</li>\n  <li>Tuân thủ quy định về bảo mật</li>\n</ul>\n<p>Cùng xây dựng một không gian mạng an toàn!</p>',NULL,'active','2025-03-28 03:07:06','2025-03-30 01:10:36'),(4,4,9,'AI & Deep Learning Discussion','<h3>AI & Deep Learning Discussion</h3>\n<p>Explore advanced topics in AI:</p>\n<ul>\n  <li>Neural Networks Architecture</li>\n  <li>Computer Vision and Image Processing</li>\n  <li>Natural Language Processing</li>\n  <li>Reinforcement Learning</li>\n  <li>AI Ethics and Future Trends</li>\n</ul>\n<p>Join us in shaping the future of AI!</p>',NULL,'active','2025-03-28 03:07:06','2025-03-30 01:10:36'),(5,5,9,'Data Analysis Forum','<h3>Data Analysis Forum</h3>\n<p>Khám phá thế giới dữ liệu với:</p>\n<ul>\n  <li>SQL nâng cao và tối ưu hóa query</li>\n  <li>Phân tích dữ liệu với Python</li>\n  <li>Visualization và Reporting</li>\n  <li>Big Data Processing</li>\n  <li>Business Intelligence</li>\n</ul>\n<p>Biến dữ liệu thành thông tin hữu ích!</p>',NULL,'active','2025-03-28 03:07:06','2025-03-30 01:10:36'),(6,6,8,'Business Management Hub','<h3>Business Management Hub</h3>\n<p>Thảo luận về:</p>\n<ul>\n  <li>Chiến lược phát triển doanh nghiệp</li>\n  <li>Quản lý nhân sự và văn hóa công ty</li>\n  <li>Tối ưu hóa quy trình kinh doanh</li>\n  <li>Quản lý dự án chuyên nghiệp</li>\n  <li>Leadership và Decision Making</li>\n</ul>\n<p>Nâng tầm quản trị doanh nghiệp của bạn!</p>',NULL,'active','2025-03-28 03:07:06','2025-03-30 01:10:36'),(7,7,9,'Machine Learning Community','<h3>Machine Learning Community</h3>\n<p>Cùng trao đổi về:</p>\n<ul>\n  <li>Các thuật toán Machine Learning cơ bản và nâng cao</li>\n  <li>Feature Engineering</li>\n  <li>Model Evaluation và Optimization</li>\n  <li>MLOps và Deployment</li>\n  <li>Real-world ML Applications</li>\n</ul>\n<p>Ứng dụng ML vào thực tiễn!</p>',NULL,'active','2025-03-28 03:07:06','2025-03-30 01:10:36'),(8,8,8,'Digital Marketing Forum','<h3>Digital Marketing Forum</h3>\n<p>Thảo luận về:</p>\n<ul>\n  <li>SEO và Content Marketing</li>\n  <li>Social Media Strategy</li>\n  <li>Email Marketing</li>\n  <li>Google Ads và Facebook Ads</li>\n  <li>Analytics và Conversion Optimization</li>\n</ul>\n<p>Tối ưu chiến lược marketing của bạn!</p>',NULL,'active','2025-03-28 03:07:06','2025-03-30 01:10:36'),(9,9,8,'Finance & Investment Hub','<h3>Finance & Investment Hub</h3>\n<p>Trao đổi kiến thức về:</p>\n<ul>\n  <li>Phân tích tài chính doanh nghiệp</li>\n  <li>Đầu tư chứng khoán</li>\n  <li>Quản lý rủi ro tài chính</li>\n  <li>Định giá doanh nghiệp</li>\n  <li>Chiến lược đầu tư dài hạn</li>\n</ul>\n<p>Đầu tư thông minh, tương lai vững chắc!</p>',NULL,'active','2025-03-28 03:07:06','2025-03-30 01:10:36'),(10,10,9,'Network Security Forum','<h3>Network Security Forum</h3>\n<p>Thảo luận chuyên sâu về:</p>\n<ul>\n  <li>Network Architecture và Design</li>\n  <li>Firewall và IDS/IPS</li>\n  <li>VPN và Remote Access Security</li>\n  <li>Cloud Security</li>\n  <li>Security Compliance và Audit</li>\n</ul>\n<p>Bảo vệ hệ thống mạng của bạn!</p>',NULL,'active','2025-03-28 03:07:06','2025-03-30 01:10:36');
/*!40000 ALTER TABLE `forums` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructor_availability`
--

DROP TABLE IF EXISTS `instructor_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructor_availability` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `instructor_id` bigint NOT NULL,
  `day_of_week` tinyint NOT NULL COMMENT '1-7 for Monday-Sunday',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `repeat_weekly` tinyint(1) DEFAULT '1',
  `effective_from` date DEFAULT NULL,
  `effective_until` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `instructor_id` (`instructor_id`),
  CONSTRAINT `instructor_availability_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructor_availability`
--

LOCK TABLES `instructor_availability` WRITE;
/*!40000 ALTER TABLE `instructor_availability` DISABLE KEYS */;
/*!40000 ALTER TABLE `instructor_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sender_id` bigint NOT NULL,
  `receiver_id` bigint NOT NULL,
  `message_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('course','assignment','quiz','system','message','schedule') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint DEFAULT NULL COMMENT 'ID of the related entity',
  `schedule_id` bigint DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `notification_time` timestamp NULL DEFAULT NULL,
  `is_sent` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `notifications_schedule_fk` (`schedule_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `notifications_schedule_fk` FOREIGN KEY (`schedule_id`) REFERENCES `class_schedules` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('credit_card','bank_transfer','e_wallet') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `quiz_id` bigint NOT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `score` decimal(5,2) DEFAULT NULL,
  `status` enum('in_progress','completed','abandoned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'in_progress',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_options`
--

DROP TABLE IF EXISTS `quiz_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_options` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `option_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  `order_number` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `quiz_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_options`
--

LOCK TABLES `quiz_options` WRITE;
/*!40000 ALTER TABLE `quiz_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_questions`
--

DROP TABLE IF EXISTS `quiz_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint NOT NULL,
  `question_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` enum('multiple_choice','true_false','essay') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int DEFAULT '1',
  `order_number` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_questions`
--

LOCK TABLES `quiz_questions` WRITE;
/*!40000 ALTER TABLE `quiz_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_responses`
--

DROP TABLE IF EXISTS `quiz_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_responses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `attempt_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  `selected_option_id` bigint DEFAULT NULL,
  `essay_response` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `score` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `attempt_id` (`attempt_id`),
  KEY `question_id` (`question_id`),
  KEY `selected_option_id` (`selected_option_id`),
  CONSTRAINT `quiz_responses_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`),
  CONSTRAINT `quiz_responses_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`),
  CONSTRAINT `quiz_responses_ibfk_3` FOREIGN KEY (`selected_option_id`) REFERENCES `quiz_options` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_responses`
--

LOCK TABLES `quiz_responses` WRITE;
/*!40000 ALTER TABLE `quiz_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `quiz_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `lesson_id` bigint NOT NULL,
  `academic_class_id` bigint DEFAULT NULL COMMENT 'Lớp học nếu là bài kiểm tra học thuật',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `time_limit` int DEFAULT NULL COMMENT 'Time limit in minutes',
  `passing_score` int DEFAULT NULL,
  `attempts_allowed` int DEFAULT '1',
  `quiz_type` enum('practice','homework','midterm','final') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'practice',
  `start_time` datetime DEFAULT NULL COMMENT 'Thời gian bắt đầu làm bài',
  `end_time` datetime DEFAULT NULL COMMENT 'Thời gian kết thúc',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `quizzes_academic_class_fk` (`academic_class_id`),
  CONSTRAINT `quizzes_academic_class_fk` FOREIGN KEY (`academic_class_id`) REFERENCES `academic_classes` (`id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_student_id` bigint NOT NULL,
  `course_id` bigint NOT NULL COMMENT 'Khóa học liên quan',
  `review_type` enum('instructor','course') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `review_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_review` (`user_student_id`,`review_type`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `reviews_course_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `reviews_user_fk` FOREIGN KEY (`user_student_id`) REFERENCES `user_students` (`id`),
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,1,'course',5,'Khóa học rất bổ ích, giúp tôi nắm vững Python từ cơ bản đến nâng cao.','approved','2025-03-25 10:15:44','2025-03-26 02:23:53'),(2,2,5,'course',4,'Nội dung phân tích dữ liệu khá chi tiết, nhưng cần thêm ví dụ thực tế.','approved','2025-03-25 10:15:44','2025-03-26 02:23:53'),(3,3,3,'course',5,'Khoá học cung cấp nhiều kiến thức bổ ích về an toàn thông tin.','approved','2025-03-25 10:15:44','2025-03-25 10:15:44'),(4,4,4,'course',4,'Bài giảng dễ hiểu, tuy nhiên phần AI nâng cao cần thêm bài tập thực hành.','approved','2025-03-25 10:15:44','2025-03-25 10:15:44'),(5,5,2,'course',3,'Quản lý khách sạn là lĩnh vực mới với tôi, nhưng bài giảng còn khá lý thuyết.','approved','2025-03-25 10:15:44','2025-03-25 10:15:44'),(6,1,7,'course',5,'Khóa học tuyệt vời, rất phù hợp với những ai muốn tìm hiểu về AI.','approved','2025-03-25 10:15:44','2025-03-25 10:15:44'),(7,2,8,'course',4,'Nội dung marketing số có nhiều thông tin hay, nhưng chưa có case study thực tế.','approved','2025-03-25 10:15:44','2025-03-25 10:15:44'),(8,3,10,'course',5,'Khoá học giúp tôi hiểu sâu về bảo mật mạng.','approved','2025-03-25 10:15:44','2025-03-25 10:15:44'),(9,4,9,'course',4,'Khóa học tài chính doanh nghiệp cung cấp kiến thức bổ ích nhưng hơi khó.','approved','2025-03-25 10:15:44','2025-03-25 10:15:44'),(10,5,6,'course',3,'Chiến lược kinh doanh khá hữu ích, nhưng nội dung chưa thực sự chuyên sâu.','approved','2025-03-25 10:15:44','2025-03-25 10:15:44'),(11,2,1,'course',4,'Khóa học rất hay ạ!','approved','2025-03-26 02:24:43','2025-03-26 02:24:43');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_achievements`
--

DROP TABLE IF EXISTS `user_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_achievements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `achievement_id` bigint NOT NULL,
  `earned_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','revoked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `progress` int DEFAULT '0' COMMENT 'Tiến độ đạt được (nếu có)',
  `revoked_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `revoked_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_achievement` (`user_id`,`achievement_id`),
  KEY `user_id` (`user_id`),
  KEY `achievement_id` (`achievement_id`),
  CONSTRAINT `user_achievements_achievement_fk` FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`),
  CONSTRAINT `user_achievements_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_achievements`
--

LOCK TABLES `user_achievements` WRITE;
/*!40000 ALTER TABLE `user_achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_admins`
--

DROP TABLE IF EXISTS `user_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_level` enum('super_admin','admin','moderator') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'admin',
  `permissions` json DEFAULT NULL,
  `emergency_contact` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `office_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_admins`
--

LOCK TABLES `user_admins` WRITE;
/*!40000 ALTER TABLE `user_admins` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_grades`
--

DROP TABLE IF EXISTS `user_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `course_id` bigint NOT NULL,
  `graded_by` bigint NOT NULL COMMENT 'ID của giảng viên chấm điểm',
  `lesson_id` bigint DEFAULT NULL,
  `assignment_id` bigint DEFAULT NULL,
  `quiz_id` bigint DEFAULT NULL,
  `grade_type` enum('assignment','quiz','midterm','final','participation') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `max_score` decimal(5,2) NOT NULL,
  `weight` decimal(5,2) DEFAULT '1.00' COMMENT 'Trọng số điểm',
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `graded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `course_id` (`course_id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `assignment_id` (`assignment_id`),
  KEY `quiz_id` (`quiz_id`),
  KEY `idx_user_course` (`user_id`,`course_id`),
  KEY `idx_grade_type` (`grade_type`),
  KEY `user_grades_ibfk_6_idx` (`graded_by`),
  CONSTRAINT `user_grades_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_grades_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `user_grades_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`),
  CONSTRAINT `user_grades_ibfk_4` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`),
  CONSTRAINT `user_grades_ibfk_5` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`),
  CONSTRAINT `user_grades_ibfk_6` FOREIGN KEY (`graded_by`) REFERENCES `user_instructors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_grades`
--

LOCK TABLES `user_grades` WRITE;
/*!40000 ALTER TABLE `user_grades` DISABLE KEYS */;
INSERT INTO `user_grades` VALUES (20,1,1,1,NULL,NULL,NULL,'assignment',85.00,100.00,1.00,'Good work on the assignment','2025-03-31 03:30:11','2025-03-31 03:30:11','2025-03-31 03:30:11');
/*!40000 ALTER TABLE `user_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_instructors`
--

DROP TABLE IF EXISTS `user_instructors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_instructors` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `professional_title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialization` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education_background` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `teaching_experience` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `expertise_areas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `certificates` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `linkedin_profile` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_info` json DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `verification_documents` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_instructors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_instructors`
--

LOCK TABLES `user_instructors` WRITE;
/*!40000 ALTER TABLE `user_instructors` DISABLE KEYS */;
INSERT INTO `user_instructors` VALUES (1,6,'Quang Hiếu','Giảng viên cao cấp','Kỹ thuật phần mềm','Tiến sĩ Kỹ thuật phần mềm','10 năm kinh nghiệm giảng dạy','Chuyên gia trong kiến trúc phần mềm','Thiết kế phần mềm, Microservices, DevOps','Chứng chỉ AWS Architect',NULL,NULL,NULL,'verified',NULL,'2025-03-25 03:43:22','2025-03-25 06:22:25'),(2,8,'Trần Phong','Phó giáo sư','Trí tuệ nhân tạo','Tiến sĩ AI','8 năm nghiên cứu và giảng dạy','Tập trung vào AI và Machine Learning','Deep Learning, Xử lý ngôn ngữ tự nhiên, Khoa học dữ liệu','Chứng chỉ TensorFlow Developer',NULL,NULL,NULL,'verified',NULL,'2025-03-25 03:43:22','2025-03-25 06:22:45'),(3,9,'Lê Trang','Giảng viên','Khoa học dữ liệu','Thạc sĩ Khoa học dữ liệu','6 năm giảng dạy và nghiên cứu','Đam mê dữ liệu lớn và phân tích','Big Data, SQL, Python','Chứng chỉ Data Analyst',NULL,NULL,NULL,'verified',NULL,'2025-03-25 03:43:22','2025-03-25 06:22:41');
/*!40000 ALTER TABLE `user_instructors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_students`
--

DROP TABLE IF EXISTS `user_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_students` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `education_level` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `occupation` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `interests` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `learning_goals` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `preferred_language` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notification_preferences` json DEFAULT NULL,
  `total_courses_enrolled` int DEFAULT '0',
  `total_courses_completed` int DEFAULT '0',
  `achievement_points` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_students`
--

LOCK TABLES `user_students` WRITE;
/*!40000 ALTER TABLE `user_students` DISABLE KEYS */;
INSERT INTO `user_students` VALUES (1,1,'Thanh Toàn','2000-05-15','male','Cử nhân','Lập trình viên','Đam mê công nghệ và lập trình','Đọc sách, Lập trình, Du lịch','123 Đường ABC','TP. Hồ Chí Minh','Việt Nam','Trở thành kỹ sư phần mềm','Tiếng Anh',NULL,2,1,100,'2025-03-25 10:12:05','2025-03-25 10:12:05'),(2,2,'Linh Chi','2002-07-20','female','Trung học phổ thông','Nhân viên phân tích dữ liệu','Yêu thích khoa học dữ liệu','Toán học, AI, Leo núi','456 Đường DEF','Hà Nội','Việt Nam','Thành thạo AI và Machine Learning','Tiếng Anh',NULL,3,2,150,'2025-03-25 10:12:05','2025-03-25 10:12:05'),(3,4,'Hoàng Nam','1999-12-10','male','Cử nhân','Chuyên viên an ninh mạng','Quan tâm đến bảo mật thông tin','Hack, Cờ vua, Âm nhạc','789 Đường GHI','Đà Nẵng','Việt Nam','Làm việc trong lĩnh vực an ninh mạng','Tiếng Việt',NULL,1,0,50,'2025-03-25 10:12:05','2025-03-25 10:12:05'),(4,6,'Quang Hiếu','2001-03-25','male','Cao đẳng','Kỹ sư robot','Đam mê robot và trí tuệ nhân tạo','Robot, Game, Bóng đá','321 Đường JKL','Huế','Việt Nam','Phát triển robot sáng tạo','Tiếng Anh',NULL,4,3,200,'2025-03-25 10:12:05','2025-03-25 10:12:05'),(5,12,'Nguyễn Toàn','2003-08-05','male','Trung học phổ thông','Hướng dẫn viên du lịch','Thích khám phá ngôn ngữ mới','Đọc sách, Du lịch, Ngôn ngữ','654 Đường MNO','Cần Thơ','Việt Nam','Thành thạo nhiều ngôn ngữ','Tiếng Pháp',NULL,2,1,120,'2025-03-25 10:12:05','2025-03-25 10:12:05'),(6,18,'Nguyễn Văn A',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,'2025-03-30 03:46:45','2025-03-30 03:46:45'),(7,19,'tonii',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,'2025-03-30 04:34:37','2025-03-30 04:34:37'),(8,20,'tonii2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,'2025-03-30 06:39:33','2025-03-30 06:39:33'),(9,21,'tonii3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0,0,'2025-03-30 07:32:54','2025-03-30 07:32:54');
/*!40000 ALTER TABLE `user_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_students_academic`
--

DROP TABLE IF EXISTS `user_students_academic`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_students_academic` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `academic_class_id` bigint NOT NULL COMMENT 'Lớp học thuật',
  `student_code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã sinh viên',
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `academic_year` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Khóa học (K65, K66...)',
  `major` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Chuyên ngành',
  `status` enum('studying','graduated','suspended','dropped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'studying',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_code` (`student_code`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `academic_class_id` (`academic_class_id`),
  CONSTRAINT `user_students_academic_class_fk` FOREIGN KEY (`academic_class_id`) REFERENCES `academic_classes` (`id`),
  CONSTRAINT `user_students_academic_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_students_academic`
--

LOCK TABLES `user_students_academic` WRITE;
/*!40000 ALTER TABLE `user_students_academic` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_students_academic` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('student','instructor','admin','student_academic') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive','banned') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `avatar_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `two_factor_secret` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_login_provider` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_login_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `refresh_token` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'thanhtoan','toan@gmail.com','0775844074','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student','active','img',0,'12425',NULL,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0b2FuQGdtYWlsLmNvbSIsImlhdCI6MTc0MzM4OTI4NCwiZXhwIjoxNzQzOTk0MDg0fQ.if3hGl_kmgsPbANCW_MuBuC-o4EsDfY7h0d_HPRwhPQ','2025-03-08 02:48:23','2025-03-31 02:48:04'),(2,'linhchi','linhchi@edu.vn','0123456789','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','student','active','avatar1.png',0,NULL,NULL,NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-03-25 08:01:47'),(4,'hoangnam','hoangnam@edu.vn','0123456788','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','student','active','avatar2.png',0,NULL,NULL,NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-03-25 03:29:30'),(5,'minhphuc','minhphuc@edu.vn','0123456787','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','instructor','inactive','avatar3.png',0,NULL,NULL,NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-03-25 03:29:30'),(6,'quanghieu','quanghieu@edu.vn','0123456786','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','instructor','active','avatar4.png',1,'secretKey',NULL,NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-03-26 02:04:17'),(7,'nguyenthuy','nguyenthuy@edu.vn','0123456785','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','instructor','active','avatar5.png',0,NULL,NULL,NULL,'2025-03-08 03:00:00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZW1haWwiOiJldmVAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDI4MDAxODYsImV4cCI6MTc0MzQwNDk4Nn0.xadiaJvzNhqN0Cr90CZCywkDhXcTGTirslaUWOB7Epg','2025-03-08 07:53:05','2025-03-25 03:29:30'),(8,'tranphong','tranphong@edu.vn','0123456784','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','instructor','active','avatar6.png',0,NULL,'google',NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-03-25 03:29:30'),(9,'letrang','letrang@edu.vn','0123456783','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','instructor','active','avatar7.png',0,NULL,'facebook',NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-03-25 03:29:30'),(10,'thuha','thuha@edu.vn','0123456782','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','admin','active','avatar8.png',0,NULL,NULL,NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-03-25 03:29:30'),(11,'hoanganh','hoanganh@edu.vn','0123456781','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','admin','inactive','avatar9.png',1,'2FAsecret',NULL,NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-03-25 03:29:30'),(12,'nguyentoan','nguyentoan@edu.vn','0775844074','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student','active','img',0,'12425',NULL,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMiIsImVtYWlsIjoibmd1eWVudG9hbkBlZHUudm4iLCJpYXQiOjE3NDMzODQxODksImV4cCI6MTc0Mzk4ODk4OX0.1ezoloQDwPnDBkPfiIcuKGbUGmL2J9QMtsOEDD1M_VE','2025-03-09 02:39:34','2025-03-31 01:23:09'),(13,'nguyenminh','nguyenminh@example.com','0987123456','$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student_academic','active','https://example.com/avatar1.png',0,NULL,NULL,NULL,NULL,NULL,'2025-03-26 00:50:55','2025-03-30 13:39:59'),(14,'phamthanh','phamthanh@example.com','0912345678','hashed_password_2','student_academic','active','https://example.com/avatar2.png',1,'secret_2','google','social_id_2',NULL,NULL,'2025-03-26 00:50:55','2025-03-26 00:50:55'),(15,'hoanganh','hoanganh@example.com','0978123456','hashed_password_3','student_academic','active','https://example.com/avatar3.png',0,NULL,'facebook','social_id_3',NULL,NULL,'2025-03-26 00:50:55','2025-03-26 00:50:55'),(16,'lethanh','lethanh@example.com','0967891234','hashed_password_4','student_academic','inactive','https://example.com/avatar4.png',1,'secret_4',NULL,NULL,NULL,NULL,'2025-03-26 00:50:55','2025-03-26 00:50:55'),(17,'tranhai','tranhai@example.com','0956789123','hashed_password_5','student_academic','active','https://example.com/avatar5.png',0,NULL,NULL,NULL,NULL,NULL,'2025-03-26 00:50:55','2025-03-26 00:50:55'),(18,'student1','student1@gmail.com',NULL,'$2b$10$TSJF1w4I7gR6sK1L8kjxk.DBSkOn4YF1gPOlQxA3mjIW1I1c8rJTm','student','active',NULL,0,NULL,NULL,NULL,NULL,NULL,'2025-03-30 03:46:45','2025-03-30 03:46:45'),(19,'thanhtoantonii','tonii@gmail.com',NULL,'$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student','active',NULL,0,NULL,NULL,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxOSIsImVtYWlsIjoidG9uaWlAZ21haWwuY29tIiwiaWF0IjoxNzQzMzc4NDAzLCJleHAiOjE3NDM5ODMyMDN9.zPd6zjNjHOr8QpzUTX1ExkUVqh6GjVezN0V7NCwkU8k','2025-03-30 04:34:37','2025-03-30 23:46:43'),(20,'thanhtoantonii2','tonii2@gmail.com',NULL,'$2b$10$fBLo4uItsz94ZzLL13b.BeL5OUOzmU1AUl6CZjEXpD4Gt00MJoeoW','student','active',NULL,0,NULL,NULL,NULL,NULL,NULL,'2025-03-30 06:39:33','2025-03-30 06:39:33'),(21,'thanhtoantonii3','tonii3@gmail.com',NULL,'$2b$10$EIM1bY9IfOR0LtuYlFcrwO./sz09WsTXhpssQ4kIOm1iOX.MIKGye','student','active',NULL,0,NULL,NULL,NULL,NULL,NULL,'2025-03-30 07:32:54','2025-03-30 07:33:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-31 10:48:30
