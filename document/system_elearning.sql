CREATE DATABASE  IF NOT EXISTS `system_elearning` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `system_elearning`;
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `class_instructor` (`class_id`,`instructor_id`),
  KEY `instructor_id` (`instructor_id`),
  CONSTRAINT `academic_class_instructors_class_fk` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`),
  CONSTRAINT `academic_class_instructors_instructor_fk` FOREIGN KEY (`instructor_id`) REFERENCES `user_instructors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_class_instructors`
--

LOCK TABLES `academic_class_instructors` WRITE;
/*!40000 ALTER TABLE `academic_class_instructors` DISABLE KEYS */;
INSERT INTO `academic_class_instructors` VALUES (1,1,1,'2025-04-13 01:19:27','2025-04-13 01:19:27'),(2,2,2,'2025-04-13 01:19:27','2025-04-13 01:19:27'),(3,3,1,'2025-04-13 01:19:27','2025-04-13 01:19:27'),(4,4,1,'2025-04-13 01:19:27','2025-04-13 01:19:27'),(5,5,1,'2025-04-13 01:19:27','2025-04-13 01:19:27'),(6,6,2,'2025-04-13 01:19:27','2025-04-13 01:19:27'),(7,7,2,'2025-04-13 01:19:27','2025-04-13 01:19:27'),(8,8,4,'2025-04-13 01:19:27','2025-04-13 01:19:27'),(9,9,3,'2025-04-13 01:19:27','2025-04-13 01:19:27'),(10,10,5,'2025-04-13 01:19:27','2025-04-13 01:19:27');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `academic_classes`
--

LOCK TABLES `academic_classes` WRITE;
/*!40000 ALTER TABLE `academic_classes` DISABLE KEYS */;
INSERT INTO `academic_classes` VALUES (1,'CNTT01','Công nghệ thông tin','20251','active','2025-04-05 00:10:27','2025-04-12 09:32:38'),(2,'KHMT01','Khoa học máy tính','20251','active','2025-04-05 00:10:27','2025-04-12 09:32:38'),(3,'KTPM01','Kỹ thuật phần mềm','20251','active','2025-04-05 00:10:27','2025-04-12 09:32:38'),(4,'HTTT01','Hệ thống thông tin','20251','active','2025-04-05 00:10:27','2025-04-12 09:32:38'),(5,'ATTT01','An toàn thông tin','20251','active','2025-04-05 00:10:27','2025-04-12 09:32:38'),(6,'TTNT01','Trí tuệ nhân tạo','20252','active','2025-04-05 00:10:27','2025-04-12 09:32:38'),(7,'MMT01','Mạng máy tính và truyền thông dữ liệu','20252','active','2025-04-05 00:10:27','2025-04-12 09:32:38'),(8,'QTKD01','Quản trị kinh doanh','20252','active','2025-04-05 00:10:27','2025-04-12 09:32:38'),(9,'KHDT01','Khoa học dữ liệu','20252','active','2025-04-05 00:10:27','2025-04-12 09:32:38'),(10,'TTKS01','Marketing số','20252','completed','2025-04-05 00:10:27','2025-04-12 09:32:38');
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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
INSERT INTO `assignment_submissions` VALUES (1,3,15,'Đây là bài nộp cho bài tập thực hành về cấu trúc điều khiển trong C/C++','uploads/assignments/user15_assignment3.cpp','2025-04-06 11:22:16',NULL,NULL,'submitted','2025-04-06 11:22:16','2025-04-06 11:22:16'),(2,1,1,'Cho em nộp bài Python OOP','uploads/assignments/user1_assignment.py','2025-04-06 11:22:16',NULL,NULL,'submitted','2025-04-06 11:22:16','2025-04-06 11:22:16'),(12,5,15,'e nộp bài cuối kì ạ','https://drive.google.com/file/d/1Or9an-XIT0fqWRlwE0MEkWFo2IWAqHdW/view?usp=drive_link','2025-04-19 01:12:52',NULL,NULL,'submitted','2025-04-19 01:12:52','2025-04-19 01:12:52');
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
  `lesson_id` bigint DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES (1,6,NULL,'Bài tập Python cơ bản','Làm các bài tập về biến và kiểu dữ liệu ','2024-04-30 09:59:00',100,'File .py hoặc .zip','midterm','2024-04-01 00:00:00','2024-04-15 23:59:59','2025-03-31 04:16:22','2025-04-18 10:20:28'),(2,21,NULL,'Bài tập thực hành bảo mật','Thực hành kỹ năng bảo mật','2024-04-30 09:59:00',100,'File .py hoặc .zip','homework','2024-04-05 00:00:00','2024-04-20 23:59:59','2025-04-03 04:16:22','2025-04-19 02:43:59'),(3,NULL,1,'Bài tập thực hành: Cấu trúc điều khiển','Làm các bài tập về cấu trúc điều khiển trong lập trình C/C++','2025-04-12 09:13:29',100,'File .cpp hoặc .c, kích thước tối đa 5MB','practice','2025-04-05 16:13:29','2025-04-12 16:13:29','2025-04-05 09:13:29','2025-04-05 09:13:29'),(4,NULL,1,'Kiểm tra giữa kỳ: Lập trình cơ bản','Bài kiểm tra giữa kỳ về các kiến thức cơ bản của ngôn ngữ C/C++','2025-05-05 09:13:29',100,'Nộp file .cpp và chụp ảnh kết quả chạy chương trình','midterm','2025-05-04 16:13:29','2025-05-05 16:13:29','2025-04-05 09:13:29','2025-04-05 09:13:29'),(5,NULL,1,'Thi cuối kỳ: Lập trình cơ bản','Bài thi tổng hợp kiến thức môn lập trình cơ bản','2025-07-04 09:13:29',100,'Nộp file .cpp và file word giải thích','final','2025-07-03 16:13:29','2025-07-04 16:13:29','2025-04-05 09:13:29','2025-04-05 09:13:29'),(13,9,NULL,'Bài tập dự án nhỏ Thực hành xây dựng một dự án nhỏ.','Bài tập dự án nhỏ','2025-04-28 01:26:00',99,NULL,'project',NULL,NULL,'2025-04-19 01:27:16','2025-04-19 01:27:16');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES (1,1,1,'CERT-4-4-2024','certificates/cert-2-2.pdf','2024-03-26 00:54:57',NULL,'active','2025-03-31 01:17:47','2025-04-04 13:59:18');
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
  `status` enum('active','hidden','locked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `user_id` (`user_id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `course_lesson_discussions_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `course_lesson_discussions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `course_lesson_discussions_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `course_lesson_discussions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_lesson_discussions`
--

LOCK TABLES `course_lesson_discussions` WRITE;
/*!40000 ALTER TABLE `course_lesson_discussions` DISABLE KEYS */;
INSERT INTO `course_lesson_discussions` VALUES (1,1,13,NULL,'Python thực sự là ngôn ngữ dễ học! Tôi rất thích cú pháp đơn giản của nó.','active','2025-03-27 01:15:22','2025-04-02 01:34:11'),(2,1,1,1,'Đồng ý! Bạn đã có kinh nghiệm với ngôn ngữ lập trình nào khác chưa?','active','2025-03-27 02:30:15','2025-04-02 01:34:11'),(3,1,13,1,'Tôi đã từng làm việc với JavaScript nhưng Python dễ hiểu hơn nhiều.','active','2025-03-27 03:45:33','2025-04-02 01:34:11'),(4,1,14,NULL,'Có ai biết cách cài đặt thư viện NumPy không? Tôi gặp lỗi khi cài đặt.','active','2025-03-28 07:22:17','2025-04-02 01:34:11'),(5,1,1,4,'Bạn có thể dùng lệnh: pip install numpy. Nếu vẫn lỗi, hãy chia sẻ thông báo lỗi để được hỗ trợ.','active','2025-03-28 08:10:45','2025-04-02 01:34:11'),(6,2,1,NULL,'List comprehension trong Python thực sự tiện lợi. Nó làm code của tôi ngắn gọn hơn nhiều.','active','2025-03-29 01:45:12','2025-04-02 01:34:11'),(7,2,14,6,'Bạn có thể chia sẻ một ví dụ về cách bạn sử dụng nó không?','active','2025-03-29 02:22:31','2025-04-02 01:34:11'),(8,2,1,6,'Chắc chắn rồi! Ví dụ: [x**2 for x in range(10) if x % 2 == 0] để tạo list bình phương của các số chẵn từ 0-9.','active','2025-03-29 03:15:20','2025-04-02 01:34:11'),(9,2,13,NULL,'Tôi hơi bối rối với khái niệm tuple. Nó khác với list như thế nào?','active','2025-03-30 04:30:45','2025-04-02 01:34:11'),(10,2,1,9,'Tuple không thể thay đổi (immutable) trong khi list có thể. Tuple dùng () còn list dùng []. Tuple thường nhanh hơn list một chút.','active','2025-03-30 05:45:18','2025-04-02 01:34:11'),(11,3,14,NULL,'Bài tập số 3 khó quá! Có ai hoàn thành được chưa?','active','2025-04-01 02:15:33','2025-04-02 01:34:11'),(12,3,13,11,'Tôi đã làm được. Gợi ý: hãy thử sử dụng hàm enumerate() cho bài này!','active','2025-04-01 03:22:45','2025-04-02 01:34:11'),(13,3,14,11,'Cảm ơn! Tôi sẽ thử lại với gợi ý của bạn.','active','2025-04-01 04:45:22','2025-04-02 01:34:11'),(14,3,1,NULL,'Có ai gặp lỗi \"IndentationError\" không? Làm sao để tránh lỗi này?','active','2025-04-02 07:10:55','2025-04-02 01:34:11'),(15,3,13,14,'Lỗi này do Python rất nhạy cảm với khoảng trắng. Hãy đảm bảo bạn sử dụng tab hoặc space một cách nhất quán.','active','2025-04-02 08:30:12','2025-04-02 01:34:11'),(16,4,13,NULL,'Tôi thấy việc viết docstring cho mọi hàm hơi mất thời gian. Nó có thực sự cần thiết không?','active','2025-04-03 01:45:33','2025-04-02 01:34:11'),(17,4,1,16,'Docstring rất quan trọng khi làm việc trong team hoặc khi bạn xem lại code sau này. Nó là một phần của coding standard chuyên nghiệp.','active','2025-04-03 02:22:17','2025-04-02 01:34:11'),(18,4,14,16,'Tôi đồng ý với @user1. Nhiều IDE cũng hiển thị docstring khi bạn hover chuột lên hàm, rất hữu ích!','active','2025-04-03 03:45:55','2025-04-02 01:34:11'),(19,5,14,NULL,'Tôi chưa hiểu rõ về đa hình trong Python. Có ai giải thích được không?','active','2025-04-04 06:15:22','2025-04-02 01:34:11'),(20,5,1,19,'Đa hình cho phép các lớp con ghi đè phương thức của lớp cha. Khi gọi phương thức đó trên đối tượng, phiên bản phù hợp sẽ được thực thi dựa trên loại đối tượng.','active','2025-04-04 07:30:45','2025-04-02 01:34:11'),(21,5,14,19,'Cảm ơn! Vậy nó giống với overriding trong Java phải không?','active','2025-04-04 08:22:17','2025-04-02 01:34:11'),(22,5,1,19,'Đúng vậy! Nhưng Python linh hoạt hơn vì dynamic typing.','active','2025-04-04 09:10:33','2025-04-02 01:34:11'),(23,7,13,NULL,'Có ai biết cách đọc file CSV hiệu quả nhất trong Python không?','active','2025-04-05 02:15:45','2025-04-02 01:34:11'),(24,7,14,23,'Tôi khuyên bạn nên dùng thư viện pandas với pd.read_csv(). Nó rất mạnh mẽ và linh hoạt.','active','2025-04-05 03:22:33','2025-04-02 01:34:11'),(25,7,1,23,'Hoặc nếu bạn không muốn dùng pandas, thư viện csv trong Python chuẩn cũng khá tốt.','active','2025-04-05 04:45:12','2025-04-02 01:34:11'),(63,3,1,NULL,'có ai làm được hết không ạ ?','active','2025-04-09 01:10:08','2025-04-09 01:10:08'),(64,4,1,NULL,'có ai hiểu đoạn 3:67 nói gì không ?','active','2025-04-09 02:51:33','2025-04-09 02:51:33'),(67,1,1,NULL,'bài này hay thật sự !','active','2025-04-10 14:24:35','2025-04-10 14:24:35'),(68,1,1,67,'rất chuẩn ạ','active','2025-04-10 14:24:45','2025-04-10 14:24:45'),(69,1,6,67,'cảm ơn em','active','2025-04-14 02:39:26','2025-04-14 02:39:26'),(71,9,1,NULL,'có ai đã nộp bài chưa','active','2025-04-19 00:25:51','2025-04-19 00:25:51');
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
  `content_type` enum('video','slide','txt','docx','pdf','xlsx','quiz','assignment') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_lessons`
--

LOCK TABLES `course_lessons` WRITE;
/*!40000 ALTER TABLE `course_lessons` DISABLE KEYS */;
INSERT INTO `course_lessons` VALUES (1,1,'Tổng quan về Python','video','https://www.youtube.com/watch?v=NZj6LI5a9vc&list=PL33lvabfss1xczCv2BA0SaNJHu_VXsFtg','Tìm hiểu về Python và ứng dụng của nó.',15,1,1,'2025-03-25 08:14:48','2025-04-15 23:29:35'),(2,1,'Các cấu trúc cơ bản trong Python','slide','https://drive.google.com/file/d/1BRNOzNf5rqTDWzyKKj8Yjziz1FBi21t3/view?usp=drive_link','Các cấu trúc cơ bản trong Python',NULL,2,1,'2025-03-25 08:14:48','2025-04-15 23:29:57'),(3,1,'Trắc nghiệm lập trình cơ bản','quiz',NULL,'Các câu hỏi trắc nghiệm về Python cơ bản.',NULL,3,0,'2025-03-25 08:14:48','2025-04-15 23:29:57'),(4,2,'Comment trong Python','video','https://www.youtube.com/watch?v=t3dERE9T5yg&list=PL33lvabfss1xczCv2BA0SaNJHu_VXsFtg&index=4','Giới thiệu về comment.',20,1,1,'2025-03-25 08:14:48','2025-04-01 05:56:50'),(5,2,'Kế thừa và đa hình','txt','https://drive.google.com/file/d/1VS2UAM2i_0UTw9zhT3zkfukDkA7IBuDG/view?usp=sharing','Tìm hiểu về kế thừa, đa hình trong Python.',NULL,2,0,'2025-03-25 08:14:48','2025-04-02 00:39:03'),(6,2,'Bài tập thực hành OOP','assignment',NULL,'Xây dựng lớp và đối tượng trong Python.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(7,3,'Xử lý File trong Python','video','https://www.youtube.com/watch?v=6J8-jkoRBXw&list=PL33lvabfss1xczCv2BA0SaNJHu_VXsFtg&index=19','Cách xử lý File trong Python',25,1,0,'2025-03-25 08:14:48','2025-04-01 05:56:50'),(8,3,'Xử lý dữ liệu với Pandas','xlsx','https://docs.google.com/spreadsheets/d/1u4Xk5_R_IyBW_TRI_Yo0Dz4dYhcHRyci/edit?usp=drive_link&ouid=112476471943415591446&rtpof=true&sd=true','Hướng dẫn sử dụng Pandas để xử lý dữ liệu.',NULL,2,0,'2025-03-25 08:14:48','2025-04-15 07:39:27'),(9,3,'Bài tập dự án nhỏ','assignment',NULL,'Thực hành xây dựng một dự án nhỏ.',NULL,3,0,'2025-03-25 08:14:48','2025-04-15 07:39:27'),(10,4,'Ngành khách sạn là gì?','video','https://example.com/hotel_intro.mp4','Giới thiệu về ngành khách sạn.',15,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(11,4,'Xu hướng trong ngành khách sạn','txt',NULL,'Báo cáo về xu hướng phát triển ngành.',NULL,2,0,'2025-03-25 08:14:48','2025-04-01 09:07:20'),(12,4,'Bài tập tình huống','quiz',NULL,'Trả lời các câu hỏi về ngành khách sạn.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(13,5,'Kỹ năng giao tiếp với khách hàng','video','https://example.com/customer_service.mp4','Cách xử lý tình huống với khách hàng.',20,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(14,5,'Xử lý phàn nàn của khách hàng','pdf',NULL,'Hướng dẫn cách giải quyết vấn đề khách hàng.',NULL,2,0,'2025-03-25 08:14:48','2025-04-01 09:07:20'),(15,5,'Bài tập tình huống','assignment',NULL,'Tình huống thực tế về chăm sóc khách hàng.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(16,6,'Tuyển dụng nhân viên','video','https://example.com/hotel_hr.mp4','Cách tuyển dụng và đào tạo nhân sự.',18,1,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(17,6,'Đào tạo nhân viên khách sạn','docx',NULL,'Quy trình đào tạo nhân viên mới.',NULL,2,0,'2025-03-25 08:14:48','2025-04-01 09:07:20'),(18,6,'Bài kiểm tra cuối khóa','quiz',NULL,'Câu hỏi đánh giá kiến thức.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(19,7,'Những mối đe dọa an ninh mạng','video','https://example.com/cybersecurity.mp4','Tìm hiểu về các rủi ro an ninh mạng.',25,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(20,7,'Tấn công mạng phổ biến','txt',NULL,'Các hình thức tấn công mạng thường gặp.',NULL,2,0,'2025-03-25 08:14:48','2025-04-01 09:07:20'),(21,7,'Bài tập thực hành bảo mật','assignment',NULL,'Thực hành kiểm tra lỗ hổng bảo mật.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(22,8,'Nguyên tắc mã hóa dữ liệu','video','https://example.com/encryption.mp4','Các phương pháp mã hóa phổ biến.',22,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(23,8,'Thực hành mã hóa dữ liệu','xlsx',NULL,'Mã hóa dữ liệu bằng AES, RSA.',NULL,2,0,'2025-03-25 08:14:48','2025-04-01 09:07:20'),(24,8,'Bài tập thực hành','assignment',NULL,'Mã hóa và giải mã một chuỗi dữ liệu.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(25,9,'Các hình thức tấn công phổ biến','video','https://example.com/hacking_methods.mp4','Tìm hiểu về các phương pháp tấn công mạng.',30,1,1,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(26,9,'Cách phòng chống tấn công','txt',NULL,'Biện pháp bảo vệ hệ thống khỏi hacker.',NULL,2,0,'2025-03-25 08:14:48','2025-04-01 09:07:20'),(27,9,'Bài tập tình huống','quiz',NULL,'Trắc nghiệm về bảo mật hệ thống.',NULL,3,0,'2025-03-25 08:14:48','2025-03-25 08:14:48'),(28,10,'Lịch sử và khái niệm AI','video','https://example.com/ai_intro.mp4','Tìm hiểu sự phát triển của trí tuệ nhân tạo.',20,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(29,10,'Ứng dụng của AI trong đời sống','txt',NULL,'Cách AI đang thay đổi các ngành công nghiệp.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(30,10,'Bài tập trắc nghiệm AI','quiz',NULL,'Các câu hỏi trắc nghiệm về AI.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(31,11,'Giới thiệu về Deep Learning','video','https://example.com/deep_learning.mp4','Cơ bản về mạng neuron và Deep Learning.',25,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(32,11,'Cấu trúc của mạng neuron','pdf',NULL,'Tìm hiểu về các lớp mạng neuron.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(33,11,'Thực hành xây dựng mô hình DL','assignment',NULL,'Bài tập lập trình với TensorFlow.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(34,12,'AI trong y tế','video','https://example.com/ai_healthcare.mp4','Ứng dụng AI trong chẩn đoán y khoa.',18,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(35,12,'AI trong tài chính','pdf',NULL,'AI được sử dụng trong giao dịch tài chính như thế nào?',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(36,12,'Bài tập phân tích dữ liệu với AI','assignment',NULL,'Thực hành sử dụng AI để phân tích dữ liệu.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(37,13,'Tổng quan về SQL','video','https://example.com/sql_intro.mp4','Cơ bản về SQL và cách sử dụng.',15,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(38,13,'Các loại câu lệnh SQL','slide',NULL,'Tìm hiểu về SELECT, INSERT, UPDATE, DELETE.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(39,13,'Bài tập viết câu lệnh SQL','quiz',NULL,'Trả lời các câu hỏi về SQL.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(40,14,'Sử dụng GROUP BY và HAVING','video','https://example.com/sql_groupby.mp4','Cách nhóm và lọc dữ liệu.',20,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(41,14,'Truy vấn nâng cao với JOIN','slide',NULL,'Hướng dẫn cách sử dụng JOIN.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(42,14,'Bài tập thực hành SQL nâng cao','assignment',NULL,'Thực hành các câu lệnh SQL phức tạp.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(43,15,'Sử dụng SQL trong Python','video','https://example.com/python_sql.mp4','Kết hợp Python với SQL để xử lý dữ liệu.',22,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(44,15,'Thực hành với SQLite','pdf',NULL,'Hướng dẫn sử dụng SQLite trong Python.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(45,15,'Bài tập xây dựng ứng dụng nhỏ','assignment',NULL,'Tạo một ứng dụng CRUD sử dụng SQL.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(46,16,'Tổng quan về quản trị kinh doanh','video','https://example.com/business_management.mp4','Những nguyên tắc cơ bản của quản trị kinh doanh.',18,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(47,16,'Vai trò của quản trị viên','slide',NULL,'Các kỹ năng cần có của một nhà quản trị.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(48,16,'Bài tập tình huống quản trị','assignment',NULL,'Giải quyết các vấn đề kinh doanh giả định.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(49,17,'Xây dựng chiến lược kinh doanh','video','https://example.com/business_strategy.mp4','Cách lập kế hoạch kinh doanh hiệu quả.',20,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(50,17,'Các mô hình kinh doanh phổ biến','slide',NULL,'Phân tích SWOT, PESTEL, 5 Forces.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(51,17,'Bài tập phân tích mô hình kinh doanh','quiz',NULL,'Các câu hỏi phân tích tình huống.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(52,18,'Nguyên tắc quản lý tài chính','video','https://example.com/finance_management.mp4','Quản lý dòng tiền và đầu tư.',25,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(53,18,'Phân tích rủi ro tài chính','txt',NULL,'Các phương pháp đánh giá rủi ro.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(54,18,'Bài tập quản lý ngân sách','assignment',NULL,'Thực hành lập kế hoạch tài chính.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(55,19,'Machine Learning là gì?','video','https://example.com/ml_intro.mp4','Giới thiệu về Machine Learning.',20,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(56,19,'Các thuật toán cơ bản','docx',NULL,'Hướng dẫn về thuật toán Linear Regression.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(57,19,'Bài tập lập trình với Scikit-Learn','assignment',NULL,'Thực hành xây dựng mô hình ML.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(58,20,'K-Means Clustering','video','https://example.com/kmeans.mp4','Thuật toán phân cụm dữ liệu.',22,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(59,20,'Random Forest và ứng dụng','slide',NULL,'Tìm hiểu về thuật toán Random Forest.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(60,20,'Bài tập phân loại dữ liệu','quiz',NULL,'Các câu hỏi về thuật toán phân loại.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(61,21,'ML trong xử lý ảnh','video','https://example.com/ml_image_processing.mp4','Ứng dụng ML trong xử lý ảnh.',25,1,1,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(62,21,'ML trong xử lý ngôn ngữ tự nhiên','slide',NULL,'Ứng dụng ML trong NLP.',NULL,2,0,'2025-03-25 08:16:19','2025-04-01 09:07:20'),(63,21,'Bài tập dự án thực tế','assignment',NULL,'Xây dựng một mô hình Machine Learning.',NULL,3,0,'2025-03-25 08:16:19','2025-03-25 08:16:19'),(64,22,'Tổng quan về Digital Marketing','video','https://example.com/digital_marketing_intro.mp4','Giới thiệu các kênh và chiến lược Digital Marketing.',18,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(65,22,'Các kênh tiếp thị trực tuyến','docx',NULL,'Tìm hiểu về SEO, SEM, Social Media Marketing.',NULL,2,0,'2025-03-25 08:19:14','2025-04-01 09:07:20'),(66,22,'Bài tập lập kế hoạch Digital Marketing','assignment',NULL,'Thực hành tạo chiến dịch tiếp thị số.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(67,23,'Cách hoạt động của SEO','video','https://example.com/seo_basics.mp4','Tìm hiểu nguyên lý SEO và cách tối ưu trang web.',20,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(68,23,'Google Ads và Facebook Ads','pdf',NULL,'Hướng dẫn chạy quảng cáo hiệu quả.',NULL,2,0,'2025-03-25 08:19:14','2025-04-01 09:07:20'),(69,23,'Bài tập tối ưu hóa chiến dịch quảng cáo','assignment',NULL,'Thực hành cài đặt và tối ưu chiến dịch.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(70,24,'Tại sao thương hiệu cá nhân quan trọng?','video','https://example.com/personal_branding.mp4','Giới thiệu về thương hiệu cá nhân và lợi ích.',15,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(71,24,'Xây dựng hình ảnh trên mạng xã hội','docx',NULL,'Cách tối ưu hồ sơ cá nhân trên LinkedIn, Facebook.',NULL,2,0,'2025-03-25 08:19:14','2025-04-01 09:07:20'),(72,24,'Bài tập xây dựng thương hiệu cá nhân','assignment',NULL,'Thực hành viết bài giới thiệu bản thân.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(73,25,'Nguyên tắc tài chính doanh nghiệp','video','https://example.com/corporate_finance.mp4','Tổng quan về tài chính doanh nghiệp.',22,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(74,25,'Quản lý dòng tiền','docx',NULL,'Hướng dẫn lập kế hoạch dòng tiền.',NULL,2,0,'2025-03-25 08:19:14','2025-04-01 09:07:20'),(75,25,'Bài tập lập kế hoạch tài chính','quiz',NULL,'Các câu hỏi trắc nghiệm về tài chính.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(76,26,'Các loại hình đầu tư','video','https://example.com/investment_basics.mp4','Giới thiệu các loại hình đầu tư như cổ phiếu, trái phiếu.',25,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(77,26,'Cách xây dựng danh mục đầu tư hiệu quả','slide',NULL,'Nguyên tắc đa dạng hóa và quản lý rủi ro.',NULL,2,0,'2025-03-25 08:19:14','2025-04-01 09:07:20'),(78,26,'Bài tập xây dựng danh mục đầu tư','assignment',NULL,'Thực hành phân tích danh mục đầu tư.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(79,27,'Rủi ro tài chính là gì?','video','https://example.com/financial_risk.mp4','Phân loại rủi ro tài chính.',20,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(80,27,'Các công cụ phòng ngừa rủi ro','pdf',NULL,'Hướng dẫn sử dụng bảo hiểm, hợp đồng phái sinh.',NULL,2,0,'2025-03-25 08:19:14','2025-04-01 09:07:20'),(81,27,'Bài tập đánh giá rủi ro','quiz',NULL,'Câu hỏi về phân tích rủi ro tài chính.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(82,28,'Giới thiệu về mạng máy tính','video','https://example.com/network_basics.mp4','Các khái niệm cơ bản về mạng.',18,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(83,28,'Giao thức mạng phổ biến','slide',NULL,'Tìm hiểu TCP/IP, HTTP, DNS.',NULL,2,0,'2025-03-25 08:19:14','2025-04-01 09:07:20'),(84,28,'Bài tập thiết lập mạng cơ bản','assignment',NULL,'Thực hành cấu hình mạng nội bộ.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(85,29,'Các nguy cơ bảo mật mạng','video','https://example.com/network_security.mp4','Tổng quan về các mối đe dọa bảo mật.',22,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(86,29,'Mô hình bảo mật Zero Trust','txt',NULL,'Giới thiệu mô hình bảo mật không tin tưởng.',NULL,2,0,'2025-03-25 08:19:14','2025-04-01 09:07:20'),(87,29,'Bài tập kiểm tra lỗ hổng bảo mật','assignment',NULL,'Thực hành phân tích lỗ hổng trong hệ thống.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(88,30,'Tại sao an toàn thông tin quan trọng?','video','https://example.com/cybersecurity_business.mp4','Giới thiệu về an toàn thông tin.',20,1,1,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(89,30,'Các chính sách bảo mật doanh nghiệp','pdf',NULL,'Hướng dẫn xây dựng chính sách bảo mật.',NULL,2,0,'2025-03-25 08:19:14','2025-04-01 09:07:20'),(90,30,'Bài tập kiểm tra an toàn thông tin','quiz',NULL,'Câu hỏi thực hành đánh giá bảo mật.',NULL,3,0,'2025-03-25 08:19:14','2025-03-25 08:19:14'),(114,2,'Trắc nghiệm kiểm tra giữa kì','quiz','','đánh giá tình hình học tập và lấy điểm giữa kì',0,4,0,'2025-04-17 03:52:48','2025-04-17 03:52:48'),(115,3,'Kiểm tra cuối kì kết thúc môn học','quiz','','Lấy trọng số điểm cao nhất trong các bài kiểm tra',45,4,0,'2025-04-17 14:35:41','2025-04-17 14:35:41');
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
  `completed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_accessed` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_completion` (`user_id`,`lesson_id`),
  KEY `lesson_id` (`lesson_id`),
  CONSTRAINT `lesson_completion_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `lesson_completion_ibfk_2` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_progress`
--

LOCK TABLES `course_progress` WRITE;
/*!40000 ALTER TABLE `course_progress` DISABLE KEYS */;
INSERT INTO `course_progress` VALUES (1,1,1,'2023-09-10 08:30:00','2023-09-10 08:45:00'),(2,1,2,'2023-09-11 07:20:00','2023-09-11 07:50:00'),(3,1,3,'2023-09-12 09:00:00','2023-09-12 09:30:00'),(4,1,4,'2023-09-15 03:30:00','2023-09-15 04:00:00'),(5,1,5,'2023-09-16 07:45:00','2023-09-16 08:15:00'),(6,1,6,'2023-09-18 10:20:00','2023-09-18 10:45:00'),(7,1,7,'2023-09-20 02:30:00','2023-09-20 03:00:00'),(8,1,8,'2023-09-22 07:45:00','2023-09-22 08:15:00'),(9,1,9,'2023-09-25 05:30:00','2023-09-25 06:00:00'),(10,1,19,'2023-10-05 06:20:00','2023-10-05 06:50:00'),(11,1,20,'2023-10-06 08:10:00','2023-10-06 08:40:00'),(12,1,21,NULL,'2023-10-08 09:30:00'),(13,1,22,NULL,'2023-10-10 04:15:00'),(14,1,55,'2023-11-02 03:20:00','2023-11-02 04:00:00'),(15,1,56,'2023-11-03 03:20:00','2023-11-05 11:30:00');
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
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_sections`
--

LOCK TABLES `course_sections` WRITE;
/*!40000 ALTER TABLE `course_sections` DISABLE KEYS */;
INSERT INTO `course_sections` VALUES (1,1,'Giới thiệu về Python','Tổng quan về Python, cài đặt môi trường, cú pháp cơ bản.',1,'2025-03-25 08:07:33','2025-04-16 14:20:15'),(2,1,'Lập trình hướng đối tượng trong Python','Tìm hiểu về OOP, các lớp, đối tượng và kế thừa.',2,'2025-03-25 08:07:33','2025-04-16 14:20:15'),(3,1,'Ứng dụng thực tế với Python','Xây dựng dự án nhỏ với Python.',3,'2025-03-25 08:07:33','2025-04-16 14:20:15'),(4,2,'Tổng quan về ngành khách sạn','Giới thiệu về ngành, xu hướng và cơ hội nghề nghiệp.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(5,2,'Quản lý dịch vụ khách hàng','Kỹ năng giao tiếp, chăm sóc khách hàng trong khách sạn.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(6,2,'Quản lý nhân sự trong khách sạn','Tuyển dụng, đào tạo và duy trì nhân viên khách sạn.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(7,3,'Giới thiệu về bảo mật thông tin','Tổng quan về các mối đe dọa an ninh mạng.',1,'2025-03-25 08:07:33','2025-04-16 02:48:07'),(8,3,'Mã hóa và bảo vệ dữ liệu','Cách mã hóa dữ liệu và bảo vệ thông tin cá nhân.',2,'2025-03-25 08:07:33','2025-04-16 02:48:07'),(9,3,'Tấn công mạng và phòng chống','Các hình thức tấn công và biện pháp bảo vệ.',3,'2025-03-25 08:07:33','2025-04-19 02:36:15'),(10,4,'Nhập môn trí tuệ nhân tạo','Các khái niệm cơ bản về AI và học sâu.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(11,4,'Mô hình học sâu (Deep Learning)','Mô hình mạng nơ-ron, TensorFlow, PyTorch.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(12,4,'Ứng dụng AI trong thực tế','AI trong y tế, tài chính, công nghiệp.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(13,5,'Giới thiệu về SQL','Các câu lệnh cơ bản trong SQL.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(14,5,'Phân tích dữ liệu với SQL','Sử dụng SQL để phân tích dữ liệu doanh nghiệp.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(15,5,'Kết hợp Python và SQL','Tích hợp Python để xử lý và trực quan hóa dữ liệu.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(16,6,'Nguyên tắc quản trị kinh doanh','Các lý thuyết và nguyên tắc cơ bản.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(17,6,'Chiến lược kinh doanh','Lập kế hoạch chiến lược cho doanh nghiệp.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(18,6,'Quản lý tài chính và rủi ro','Kiểm soát tài chính và đánh giá rủi ro.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(19,7,'Tổng quan về Machine Learning','Các khái niệm cốt lõi của học máy.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(20,7,'Thuật toán Machine Learning','Học có giám sát, không giám sát, reinforcement learning.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(21,7,'Ứng dụng Machine Learning','Áp dụng vào nhận diện hình ảnh, dự đoán, xử lý ngôn ngữ.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(22,8,'Marketing kỹ thuật số là gì?','Tổng quan về Digital Marketing.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(23,8,'SEO và quảng cáo trực tuyến','Tối ưu hóa công cụ tìm kiếm và chạy quảng cáo.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(24,8,'Xây dựng thương hiệu cá nhân','Kỹ năng tạo dựng và duy trì thương hiệu.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(25,9,'Giới thiệu về tài chính doanh nghiệp','Tìm hiểu về tài chính, kế toán doanh nghiệp.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(26,9,'Đầu tư và quản lý danh mục','Chiến lược đầu tư và quản lý tài sản.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(27,9,'Quản lý rủi ro tài chính','Phân tích và kiểm soát rủi ro.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(28,10,'Mạng máy tính cơ bản','Các khái niệm về mạng, giao thức và mô hình OSI.',1,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(29,10,'Bảo mật mạng nâng cao','Firewall, IDS, IPS, VPN, bảo vệ dữ liệu.',2,'2025-03-25 08:07:33','2025-03-25 08:07:33'),(30,10,'An toàn thông tin trong doanh nghiệp','Các giải pháp bảo mật thông tin trong tổ chức.',3,'2025-03-25 08:07:33','2025-03-25 08:07:33');
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'Lập trình Python từ cơ bản đến nâng cao','Khóa học giúp bạn nắm vững Python từ cơ bản đến nâng cao.',2,1,499990.00,'beginner','published','http://res.cloudinary.com/dj8ae1gpq/image/upload/v1745051668/kpuvurlmbndnfcenzeas.png','Không yêu cầu kinh nghiệm lập trình.\nChỉ cần máy tính có kết nối internet.\nPhù hợp cho người mới bắt đầu.\nKiên nhẫn và ham học hỏi.','Nắm vững cú pháp Python.\nViết chương trình từ cơ bản đến nâng cao.\nXử lý tệp và dữ liệu.\nLập trình hướng đối tượng.\nXây dựng ứng dụng nhỏ.','2025-04-01','2025-06-30','2025-03-25 03:51:46','2025-04-19 08:34:29'),(2,'Quản lý khách sạn chuyên nghiệp','Học cách vận hành và quản lý khách sạn hiệu quả.',1,5,399990.00,'intermediate','published','/src/assets/logo.png','Không cần kinh nghiệm trước.\nPhù hợp cho người muốn làm việc trong ngành khách sạn.\nCó tinh thần trách nhiệm và chăm chỉ.\nYêu thích dịch vụ khách hàng.','Biết cách vận hành khách sạn.\nQuản lý nhân sự và chăm sóc khách hàng.\nKiểm soát chi phí và doanh thu.\nXây dựng chiến lược kinh doanh khách sạn.','2025-04-05','2025-07-10','2025-03-25 03:51:46','2025-04-12 07:53:11'),(3,'An toàn thông tin và bảo mật hệ thống','Học cách bảo vệ hệ thống trước các mối đe dọa an ninh.',7,1,599990.00,'advanced','published','/src/assets/logo.png','Có kiến thức cơ bản về hệ điều hành và mạng máy tính.\nHiểu cách hoạt động của internet.\nĐam mê về bảo mật thông tin.\nKhông cần kinh nghiệm lập trình.','Biết cách bảo vệ hệ thống.\nPhát hiện và xử lý lỗ hổng bảo mật.\nSử dụng các công cụ kiểm thử bảo mật.\nXây dựng kế hoạch bảo vệ dữ liệu.','2025-04-10','2025-08-15','2025-03-25 03:51:46','2025-04-12 07:53:11'),(4,'Trí tuệ nhân tạo và Deep Learning','Tìm hiểu về các mô hình AI hiện đại.',6,2,699990.00,'advanced','published','/src/assets/logo.png','Hiểu biết cơ bản về toán và lập trình.\nCó kiến thức về xác suất thống kê là lợi thế.\nĐam mê về trí tuệ nhân tạo.\nKhông cần kinh nghiệm chuyên sâu.','Ứng dụng Deep Learning vào bài toán thực tế.\nXây dựng mô hình AI từ đầu.\nSử dụng TensorFlow và PyTorch.\nTối ưu mô hình và triển khai.','2025-04-15','2025-09-01','2025-03-25 03:51:46','2025-03-26 01:28:07'),(5,'Phân tích dữ liệu với SQL và Python','Ứng dụng SQL và Python trong phân tích dữ liệu.',8,3,549990.00,'intermediate','published','/src/assets/logo.png','Biết lập trình Python hoặc SQL cơ bản là lợi thế.\nKhông cần kinh nghiệm phân tích dữ liệu.\nTư duy logic và khả năng đọc hiểu số liệu.\nCó máy tính để thực hành.','Thành thạo SQL trong phân tích dữ liệu.\nSử dụng Python để trực quan hóa dữ liệu.\nHiểu cách xử lý dữ liệu lớn.\nỨng dụng phân tích trong thực tế.','2025-04-20','2025-07-20','2025-03-25 03:51:46','2025-04-12 07:53:11'),(6,'Quản trị kinh doanh và chiến lược','Các chiến lược quản lý doanh nghiệp hiệu quả.',5,4,479990.00,'intermediate','published','/src/assets/logo.png','Phù hợp cho sinh viên, nhân viên, quản lý muốn hiểu về chiến lược kinh doanh.\nKhông cần kinh nghiệm trước.\nKhả năng tư duy chiến lược.\nĐam mê lĩnh vực kinh doanh.','Xây dựng chiến lược kinh doanh hiệu quả.\nPhân tích tài chính và thị trường.\nQuản lý nhân sự và điều hành doanh nghiệp.\nỨng dụng thực tế trong công ty.','2025-05-01','2025-08-01','2025-03-25 03:51:46','2025-04-12 07:53:11'),(7,'Học máy và ứng dụng thực tế','Cách triển khai mô hình học máy vào thực tế.',6,2,629990.00,'advanced','published','/src/assets/logo.png','Có kiến thức lập trình cơ bản.\nHiểu về toán xác suất và thống kê.\nĐam mê học máy và trí tuệ nhân tạo.\nSẵn sàng thực hành trên dữ liệu thực tế.','Xây dựng và triển khai mô hình Machine Learning.\nSử dụng Scikit-learn và TensorFlow.\nTối ưu và đánh giá mô hình.\nỨng dụng trong nhiều lĩnh vực thực tế.','2025-05-10','2025-09-10','2025-03-25 03:51:46','2025-03-26 01:28:07'),(8,'Marketing số và tối ưu hóa thương hiệu','Tối ưu chiến lược marketing số.',10,5,419990.00,'beginner','published','/src/assets/logo.png','Không cần kinh nghiệm trước.\nPhù hợp cho người mới tìm hiểu về marketing số.\nCó tư duy sáng tạo.\nSẵn sàng thử nghiệm các chiến lược marketing mới.','Biết cách tối ưu chiến lược marketing số.\nXây dựng thương hiệu trên nền tảng số.\nSử dụng quảng cáo Facebook, Google hiệu quả.\nPhân tích và đo lường chiến dịch.','2025-05-15','2025-07-31','2025-03-25 03:51:46','2025-04-12 07:53:11'),(9,'Tài chính doanh nghiệp và đầu tư','Học về tài chính và chiến lược đầu tư.',9,4,579990.00,'advanced','published','/src/assets/logo.png','Có kiến thức cơ bản về tài chính doanh nghiệp là lợi thế.\nKhông cần kinh nghiệm đầu tư trước đó.\nTư duy phân tích và quản lý rủi ro.\nQuan tâm đến kinh tế và tài chính.','Biết cách phân tích tài chính.\nQuản lý dòng tiền và lập kế hoạch đầu tư.\nTìm hiểu về chứng khoán, bất động sản.\nGiảm thiểu rủi ro trong đầu tư.','2025-06-01','2025-09-30','2025-03-25 03:51:46','2025-04-12 07:53:11'),(10,'Mạng máy tính và bảo mật nâng cao','Tìm hiểu về mạng máy tính và bảo mật chuyên sâu.',3,1,499990.00,'intermediate','published','/src/assets/logo.png','Nên có kiến thức về mạng máy tính cơ bản.\nKhông yêu cầu kinh nghiệm bảo mật trước.\nTư duy logic và giải quyết vấn đề.\nĐam mê về an ninh mạng.','Hiểu về bảo mật mạng nâng cao.\nTriển khai hệ thống an toàn.\nPhát hiện và xử lý sự cố an ninh.\nBảo vệ dữ liệu khỏi các cuộc tấn công mạng.','2025-06-10','2025-10-01','2025-03-25 03:51:46','2025-04-12 07:53:11');
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
  `course_section_id` bigint DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `file_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` enum('pdf','slide','code','link','txt','docx','xlsx') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `download_count` int DEFAULT '0',
  `status` enum('active','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `documents_ibfk_1_idx` (`course_section_id`),
  KEY `documents_ibfk_1` (`instructor_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `user_instructors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`course_section_id`) REFERENCES `course_sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,1,1,'Tài liệu Python cơ bản','Giới thiệu tổng quan về ngôn ngữ lập trình Python','https://drive.google.com/file/d/1NUDvLoqLkh91Lqjnl7KxGpO0YjfmmARN/view?usp=drive_link','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-19 02:40:01'),(2,1,2,'Hướng dẫn OOP Python','Tài liệu về lập trình hướng đối tượng trong Python','https://docs.google.com/document/d/1tdv_j4RJO8P7IQ_xMQH8d3I67OdadcKg/edit?usp=drive_link&ouid=112476471943415591446&rtpof=true&sd=true','docx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 06:52:29'),(3,1,3,'Ứng dụng Python thực tế','Các ví dụ và project thực tế với Python','https://drive.google.com/file/d/1432gv08BJGFIqjvDpTzZFhinWMRK8ci8/view?usp=drive_link','txt','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 06:52:29'),(4,2,4,'Tổng quan ngành khách sạn','Giới thiệu về ngành quản trị khách sạn','/documents/hotel/overview.pdf','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(5,2,5,'Quản lý dịch vụ khách hàng','Kỹ năng và quy trình phục vụ khách hàng','/documents/hotel/customer_service.pdf','docx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(6,2,6,'Quản lý nhân sự khách sạn','Chiến lược quản lý nhân sự trong khách sạn','/documents/hotel/hr_management.pdf','slide','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(7,3,7,'Nhập môn bảo mật thông tin','Các khái niệm cơ bản về bảo mật','/documents/security/basics.pdf','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(8,3,8,'Kỹ thuật mã hóa dữ liệu','Phương pháp mã hóa và bảo vệ dữ liệu','/documents/security/encryption.pdf','docx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(9,3,9,'Phòng chống tấn công mạng','Các biện pháp phòng chống tấn công','/documents/security/defense.pdf','slide','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(10,2,10,'Cơ bản về AI','Giới thiệu về trí tuệ nhân tạo','/documents/ai/intro.pdf','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(11,2,11,'Deep Learning cơ bản','Kiến thức về học sâu và neural networks','/documents/ai/deep_learning.pdf','docx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(12,2,12,'AI trong thực tế','Ứng dụng AI trong các lĩnh vực','/documents/ai/applications.pdf','slide','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(13,3,13,'Nhập môn SQL','Cơ bản về ngôn ngữ truy vấn SQL','/documents/sql/basics.pdf','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(14,3,14,'Phân tích dữ liệu SQL','Kỹ thuật phân tích dữ liệu với SQL','/documents/sql/analysis.pdf','docx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(15,3,15,'Python và SQL','Tích hợp Python với SQL','/documents/sql/python_sql.pdf','xlsx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(16,2,16,'Quản trị doanh nghiệp','Nguyên tắc cơ bản trong quản trị','/documents/business/management.pdf','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(17,2,17,'Chiến lược kinh doanh','Xây dựng và phát triển chiến lược','/documents/business/strategy.pdf','docx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(18,2,18,'Quản lý tài chính','Quản lý tài chính và rủi ro','/documents/business/finance.pdf','xlsx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(19,3,19,'Machine Learning Overview','Tổng quan về học máy','/documents/ml/overview.pdf','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(20,3,20,'ML Algorithms','Các thuật toán học máy','/documents/ml/algorithms.pdf','docx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(21,3,21,'ML Applications','Ứng dụng ML trong thực tế','/documents/ml/applications.pdf','xlsx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(22,2,22,'Digital Marketing Basics','Cơ bản về marketing số','/documents/marketing/basics.pdf','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(23,2,23,'SEO & Advertising','Chiến lược SEO và quảng cáo','/documents/marketing/seo.pdf','docx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(24,2,24,'Personal Branding','Xây dựng thương hiệu cá nhân','/documents/marketing/branding.pdf','slide','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(25,1,25,'Corporate Finance','Tài chính doanh nghiệp','/documents/finance/corporate.pdf','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(26,1,26,'Investment Management','Quản lý đầu tư','/documents/finance/investment.pdf','docx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(27,1,27,'Risk Management','Quản lý rủi ro tài chính','/documents/finance/risk.pdf','slide','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(28,3,28,'Network Basics','Cơ bản về mạng máy tính','/documents/network/basics.pdf','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07'),(29,3,29,'Advanced Security','Bảo mật mạng nâng cao','/documents/network/security.pdf','docx','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-04-02 03:56:30'),(30,3,30,'Enterprise Security','Bảo mật trong doanh nghiệp','/documents/network/enterprise.pdf','pdf','2025-03-26 09:10:07',0,'active','2025-03-26 09:10:07','2025-03-26 09:10:07');
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_enrollment` (`user_id`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,13,1,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(2,13,4,'2025-03-26 00:54:57','completed','2025-03-26 00:54:57','2025-03-26 00:54:57','2025-03-26 00:54:57'),(4,14,7,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(5,15,3,'2025-03-26 00:54:57','active','2025-03-26 00:54:57','2025-03-26 00:54:57','2025-04-05 01:36:13'),(6,15,5,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(10,17,10,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(11,1,1,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-31 01:18:29'),(12,1,3,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(13,2,2,'2025-03-26 00:54:57','completed','2025-03-26 00:54:57','2025-03-26 00:54:57','2025-03-26 00:54:57'),(14,2,5,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(15,4,4,'2025-03-26 00:54:57','dropped',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(16,4,6,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(17,1,7,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 02:05:01'),(18,2,9,'2025-03-26 00:54:57','completed','2025-03-26 00:54:57','2025-03-26 00:54:57','2025-03-26 02:05:01'),(19,12,8,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(20,12,10,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(21,14,1,'2025-03-26 00:54:57','active',NULL,'2025-03-26 00:54:57','2025-03-26 00:54:57'),(29,1,4,'2025-04-09 02:08:57','active',NULL,'2025-04-09 02:08:57','2025-04-09 02:08:57');
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
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_likes`
--

LOCK TABLES `forum_likes` WRITE;
/*!40000 ALTER TABLE `forum_likes` DISABLE KEYS */;
INSERT INTO `forum_likes` VALUES (2,2,1,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(3,3,1,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(4,4,2,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(5,5,2,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(6,6,2,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(7,7,4,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(8,8,4,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(9,9,4,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(10,10,5,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(11,1,5,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(12,2,5,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(13,3,6,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(14,4,6,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(15,5,6,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(16,6,7,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(17,7,7,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(18,8,7,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(19,9,8,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(20,10,8,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(21,1,8,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(22,2,9,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(23,3,9,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(24,4,9,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(25,5,10,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(26,6,10,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(27,7,10,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(28,8,11,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(29,9,11,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(30,10,11,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(31,1,12,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(32,2,12,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(33,3,12,'2025-03-28 03:46:11','2025-03-28 03:46:11'),(37,2,15,'2025-04-09 07:32:26','2025-04-09 07:32:26'),(39,5,15,'2025-04-09 07:32:35','2025-04-09 07:32:35'),(40,4,15,'2025-04-09 07:32:41','2025-04-09 07:32:41'),(41,6,15,'2025-04-09 07:32:51','2025-04-09 07:32:51'),(43,1,15,'2025-04-09 07:45:59','2025-04-09 07:45:59'),(44,3,15,'2025-04-09 07:46:45','2025-04-09 07:46:45');
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
  CONSTRAINT `forum_replies_ibfk_3` FOREIGN KEY (`reply_id`) REFERENCES `forum_replies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_replies`
--

LOCK TABLES `forum_replies` WRITE;
/*!40000 ALTER TABLE `forum_replies` DISABLE KEYS */;
INSERT INTO `forum_replies` VALUES (1,1,2,NULL,'Tôi gặp vấn đề với vòng lặp for trong Python, có ai giúp được không?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(2,1,2,NULL,'Bạn có thể chia sẻ code cụ thể không? Tôi sẽ giúp bạn debug.',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(3,1,4,NULL,'Đây là cách tôi thường xử lý vòng lặp for trong Python...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(4,2,5,NULL,'Làm thế nào để tối ưu hóa quy trình check-in?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(5,2,6,NULL,'Chúng tôi đang sử dụng phần mềm XYZ, nó khá hiệu quả...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(6,3,7,NULL,'Các bạn có kinh nghiệm với penetration testing không?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(7,3,8,NULL,'Tôi đề xuất sử dụng các công cụ sau để test bảo mật...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(8,4,9,NULL,'Có ai đã thử implement BERT model chưa?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(9,4,10,NULL,'Tôi có kinh nghiệm với BERT, đây là một số lưu ý quan trọng...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(10,5,2,NULL,'Cách tối ưu query trong PostgreSQL?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(11,5,6,NULL,'Bạn nên sử dụng index và partition table để cải thiện hiệu suất...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(12,6,4,NULL,'Chia sẻ kinh nghiệm về quản lý team remote?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(13,6,5,NULL,'Chúng tôi sử dụng kết hợp các công cụ sau để quản lý hiệu quả...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(14,7,6,NULL,'So sánh hiệu quả giữa Random Forest và XGBoost?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(15,7,7,NULL,'Dựa trên kinh nghiệm của tôi với cả hai model...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(16,8,8,NULL,'Chiến lược SEO hiệu quả trong năm 2024?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(17,8,9,NULL,'Một số xu hướng SEO mới mà bạn nên chú ý...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(18,9,10,NULL,'Phương pháp định giá startup hiệu quả?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(19,9,2,NULL,'Có nhiều phương pháp, nhưng tôi thường sử dụng...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(20,10,11,NULL,'Best practices cho việc thiết lập firewall?',0,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(21,10,4,NULL,'Đây là checklist tôi sử dụng khi cấu hình firewall...',1,'2025-03-28 03:31:49','2025-03-28 03:31:49'),(22,1,4,1,'Bạn gặp vấn đề gì cụ thể với vòng lặp for vậy?',0,'2025-03-27 20:32:49','2025-03-27 20:32:49'),(23,1,2,1,'Mình bị lỗi khi dùng nested loop, code cứ chạy vô hạn',0,'2025-03-27 20:33:49','2025-03-27 20:33:49'),(24,1,6,2,'Bạn cần thêm điều kiện dừng cho vòng lặp trong',1,'2025-03-27 20:34:49','2025-03-27 20:34:49'),(25,2,7,4,'Chúng tôi đang gặp vấn đề tương tự',0,'2025-03-27 20:35:49','2025-03-27 20:35:49'),(26,2,8,5,'Phần mềm XYZ có hỗ trợ tích hợp với PMS không?',0,'2025-03-27 20:36:49','2025-03-27 20:36:49'),(27,3,9,6,'Tôi có kinh nghiệm với Burp Suite',0,'2025-03-27 20:37:49','2025-03-27 20:37:49'),(28,3,10,7,'Burp Suite kết hợp với OWASP ZAP rất hiệu quả',1,'2025-03-27 20:38:49','2025-03-27 20:38:49'),(29,4,5,8,'BERT có thực sự cần thiết cho task của bạn không?',0,'2025-03-27 20:39:49','2025-03-27 20:39:49'),(30,4,11,9,'Có thể dùng DistilBERT để giảm độ phức tạp',1,'2025-03-27 20:40:49','2025-03-27 20:40:49'),(31,5,12,10,'Bạn đã thử phân tích EXPLAIN ANALYZE chưa?',0,'2025-03-27 20:41:49','2025-03-27 20:41:49'),(32,5,13,11,'Cảm ơn, mình sẽ thử các giải pháp bạn đề xuất',0,'2025-03-27 20:42:49','2025-03-27 20:42:49'),(33,6,14,12,'Chúng tôi dùng Slack và Trello rất hiệu quả',0,'2025-03-27 20:43:49','2025-03-27 20:43:49'),(34,6,15,13,'Làm sao để đảm bảo team engagement?',0,'2025-03-27 20:44:49','2025-03-27 20:44:49'),(35,7,16,14,'Với dataset của tôi, Random Forest cho accuracy cao hơn',0,'2025-03-27 20:45:49','2025-03-27 20:45:49'),(36,7,17,15,'Bạn có thể chia sẻ chi tiết về hyperparameter tuning không?',0,'2025-03-27 20:46:49','2025-03-27 20:46:49'),(37,8,2,16,'Video marketing đang là xu hướng mạnh',0,'2025-03-27 20:47:49','2025-03-27 20:47:49'),(38,8,4,17,'Làm sao để tối ưu chi phí cho video marketing?',0,'2025-03-27 20:48:49','2025-03-27 20:48:49'),(39,9,5,18,'DCF là phương pháp phổ biến nhất',0,'2025-03-27 20:49:49','2025-03-27 20:49:49'),(40,9,6,19,'Các yếu tố vĩ mô cũng rất quan trọng',0,'2025-03-27 20:50:49','2025-03-27 20:50:49'),(41,10,7,20,'Zero Trust là xu hướng mới trong bảo mật',0,'2025-03-27 20:51:49','2025-03-27 20:51:49'),(42,10,8,21,'Bạn có thể chia sẻ template checklist không?',0,'2025-03-27 20:52:49','2025-03-27 20:52:49'),(56,5,1,NULL,'bài viết rất bổ ích',0,'2025-04-09 06:51:02','2025-04-09 06:51:02'),(58,1,15,NULL,'Bài viết rất hay ạ',0,'2025-04-09 07:33:16','2025-04-09 07:33:16'),(59,1,1,58,'đúng vậy ạ',0,'2025-04-09 07:54:23','2025-04-09 07:54:23');
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
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,6,'Chào thầy, em cần hỗ trợ về bài tập tuần này.',1,'2025-04-20 00:05:46','2025-04-21 00:30:09'),(2,15,6,'Thầy ơi, em có thắc mắc về lịch thi cuối kỳ.',1,'2025-04-20 00:05:46','2025-04-21 00:30:09'),(3,6,11,'Admin ơi, mình cần cấp thêm quyền chỉnh sửa lịch học.',1,'2025-04-20 00:05:46','2025-04-21 00:30:09'),(4,6,11,'Ngoài ra, có thể thêm phòng lab mới vào hệ thống không?',0,'2025-04-20 00:05:46','2025-04-20 00:05:46');
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
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
INSERT INTO `quiz_attempts` VALUES (4,15,12,'2025-04-01 03:54:24','2025-04-01 04:14:24',80.00,'completed','2025-04-03 03:54:24','2025-04-09 09:50:37'),(31,15,13,'2025-04-10 07:25:04','2025-04-10 07:25:22',86.00,'completed','2025-04-10 07:25:04','2025-04-10 07:25:21'),(40,1,1,'2025-04-10 08:12:46','2025-04-10 08:12:54',50.00,'completed','2025-04-10 08:12:46','2025-04-10 08:12:54'),(46,1,1,'2025-04-10 09:45:07','2025-04-10 09:45:13',75.00,'completed','2025-04-10 09:45:07','2025-04-10 09:45:13'),(47,1,1,'2025-04-10 09:45:51','2025-04-10 09:45:57',100.00,'completed','2025-04-10 09:45:51','2025-04-10 09:45:57'),(84,1,24,'2025-04-17 10:14:44','2025-04-17 10:14:56',20.00,'completed','2025-04-17 10:14:43','2025-04-17 10:14:55'),(85,1,24,'2025-04-17 10:15:23','2025-04-17 10:16:07',80.00,'completed','2025-04-17 10:15:22','2025-04-17 10:16:07');
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
) ENGINE=InnoDB AUTO_INCREMENT=1694 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_options`
--

LOCK TABLES `quiz_options` WRITE;
/*!40000 ALTER TABLE `quiz_options` DISABLE KEYS */;
INSERT INTO `quiz_options` VALUES (1,1,'int',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(2,1,'list',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(3,1,'Array',1,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(4,1,'dict',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(5,2,'def',1,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(6,2,'function',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(7,2,'define',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(8,2,'class',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(9,3,'List có thể chứa nhiều kiểu dữ liệu, Tuple thì không',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(10,3,'List là mutable, Tuple là immutable',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(11,3,'List được đánh chỉ số từ 0, Tuple từ 1',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(12,3,'List chỉ lưu trữ chuỗi, Tuple lưu trữ được nhiều kiểu dữ liệu',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(13,4,'try-except',1,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(14,4,'if-else',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(15,4,'error-catch',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(16,4,'check-handle',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(17,5,'Thêm nhân lực vào dự án',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(18,5,'Làm thêm giờ để bắt kịp tiến độ',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(19,5,'Áp dụng quy trình quản lý thay đổi chính thức',1,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(20,5,'Đơn giản hóa các tính năng để kịp deadline',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(21,6,'Đúng',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(22,6,'Sai',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(23,7,'Áp đặt quyết định ngay lập tức',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(24,7,'Gặp gỡ, lắng nghe hai bên và tạo không gian trung lập để thảo luận',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(25,7,'Bỏ qua vấn đề, tập trung vào công việc',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(26,7,'Chuyển một trong hai thành viên sang team khác',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(27,8,'Cắt giảm tính năng ngay lập tức',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(28,8,'Yêu cầu tăng ngân sách dự án',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(29,8,'Phân tích nguyên nhân và đánh giá tác động',1,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(30,8,'Tìm kiếm nhà cung cấp rẻ hơn',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(31,9,'Chỉ dựa vào kiểm thử tự động',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(32,9,'Chỉ dựa vào code reviews',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(33,9,'Kết hợp kiểm thử tự động và code reviews',1,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(34,9,'Áp dụng chuẩn coding style',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(35,10,'Đúng',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(36,10,'Sai',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(37,11,'Đúng - Agile luôn phù hợp hơn Waterfall',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(38,11,'Sai - Tùy từng loại dự án và yêu cầu cụ thể',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(39,11,'Đúng cho dự án nhỏ, sai cho dự án lớn',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(40,11,'Sai vì Waterfall dễ áp dụng hơn',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(41,12,'Quản lý giao tiếp giữa các dịch vụ',1,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(42,12,'Tuyển dụng đủ nhân sự',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(43,12,'Chi phí phần cứng cao',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(44,12,'Sự phức tạp của việc lập trình',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(45,13,'Cơ sở dữ liệu chính',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(46,13,'Cache',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(47,13,'Phân tích dữ liệu',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(48,13,'Quản lý người dùng',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(63,18,'Linear Regression',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(64,18,'Decision Trees',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(65,18,'K-means',1,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(66,18,'Support Vector Machines',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(67,19,'Đúng',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(68,19,'Sai',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(69,20,'Đúng - CNN hiệu quả hơn cho dữ liệu tuần tự',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(70,20,'Sai - RNN thích hợp hơn cho dữ liệu tuần tự',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(71,20,'Chỉ đúng với văn bản, không đúng với âm thanh',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(72,20,'Cả hai đều không phù hợp cho dữ liệu tuần tự',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(73,21,'Linear/Polynomial Regression',1,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(74,21,'Naive Bayes',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(75,21,'K-means Clustering',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(76,21,'Support Vector Machines',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(77,22,'SELECT UNIQUE',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(78,22,'SELECT DISTINCT',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(79,22,'SELECT DIFFERENT',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(80,22,'SELECT SINGLE',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(81,23,'Đúng',1,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(82,23,'Sai',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(83,24,'JOIN, GROUP BY, SUM, ORDER BY DESC, LIMIT 10',1,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(84,24,'SELECT TOP 10, JOIN, ORDER BY',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(85,24,'MAX, GROUP BY, JOIN',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(86,24,'SELECT, WHERE, TOP 10',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(87,25,'Sử dụng Index',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(88,25,'Luôn sử dụng SELECT *',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(89,25,'Phân vùng bảng (Partitioning)',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(90,25,'Tối ưu hóa câu truy vấn',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(91,26,'Đúng - View không có giới hạn về hiệu suất',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(92,26,'Sai - View có giới hạn về hiệu suất, đặc biệt khi truy vấn phức tạp',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(93,26,'Chỉ đúng với materialized view',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(94,26,'Đúng khi cơ sở dữ liệu nhỏ',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(95,27,'Subscription (đăng ký định kỳ)',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(96,27,'Marketplace (sàn giao dịch)',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(97,27,'Freemium',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(98,27,'Pay-per-use (trả tiền theo lượt sử dụng)',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(99,28,'Đúng',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(100,28,'Sai',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(101,29,'Đúng - Cả hai đều sử dụng subscription',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(102,29,'Sai - Coursera tập trung vào partnership với đại học và subscription, Udemy là marketplace',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(103,29,'Đúng - Cả hai đều dùng pay-per-course',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(104,29,'Sai - Coursera miễn phí, Udemy tính phí',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(105,30,'Churn rate',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(106,30,'LTV/CAC ratio',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(107,30,'Monthly active users',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(108,30,'Gross margin',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(109,31,'Logistic Regression',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(110,31,'Neural Networks',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(111,31,'Naive Bayes',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(112,31,'Linear Discriminant Analysis',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(113,32,'Đúng',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(114,32,'Sai',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(115,33,'Naive Bayes',1,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(116,33,'Support Vector Machines',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(117,33,'Random Forest',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(118,33,'Gradient Boosting',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(119,34,'Precision',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(120,34,'Recall',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(121,34,'F1 Score',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(122,34,'Accuracy',1,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(137,39,'Brainstorming',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(138,39,'Delphi Technique',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(139,39,'SWOT Analysis',1,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(140,39,'Expert Interviews',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(141,40,'Đúng',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(142,40,'Sai',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(143,41,'Đúng - Bảo mật dữ liệu quan trọng hơn',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(144,41,'Sai - Cả hai đều quan trọng và liên quan chặt chẽ',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(145,41,'Đúng vì khách hàng quan tâm đến bảo mật hơn',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(146,41,'Sai vì vi phạm quy định dẫn đến hậu quả pháp lý nghiêm trọng hơn',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(147,42,'Rủi ro có khả năng xảy ra cao, tác động lớn',1,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(148,42,'Rủi ro có khả năng xảy ra thấp, tác động lớn',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(149,42,'Rủi ro có khả năng xảy ra cao, tác động nhỏ',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(150,42,'Rủi ro có khả năng xảy ra thấp, tác động nhỏ',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(151,43,'White box testing',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(152,43,'Black box testing',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(153,43,'Vulnerability scanning',1,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(154,43,'Social engineering testing',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(155,44,'Đúng',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(156,44,'Sai',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(157,45,'Đúng - Cả hai đều khai thác lỗ hổng đầu vào',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(158,45,'Sai - XSS tấn công client, SQL Injection tấn công server',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(159,45,'Đúng - Cả hai đều có thể phòng thủ bằng input validation',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(160,45,'Sai - XSS chỉ ảnh hưởng giao diện người dùng',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(161,46,'Network Security',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(162,46,'Host Security',0,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(163,46,'Application Security',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(164,46,'Data Security',1,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(165,47,'Áp dụng principle of least privilege',0,1,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(166,47,'Chỉ dựa vào giải pháp kỹ thuật mà không kết hợp với chính sách',1,2,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(167,47,'Monitoring và logging',0,3,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(168,47,'Background checks cho nhân viên mới',0,4,'2025-04-03 02:42:56','2025-04-03 02:42:56'),(169,48,'int x = 5;',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(170,48,'x = 5',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(171,48,'x:int = 5',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(172,48,'var x = 5',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(173,49,'Phép chia thực',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(174,49,'Phép chia lấy phần nguyên',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(175,49,'Phép chia lấy dư',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(176,49,'Phép tính phần trăm',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(177,50,'List',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(178,50,'Dictionary',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(179,50,'Set',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(180,50,'Tuple',1,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(181,51,'\"Python2\"',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(182,51,'\"PythonPython\"',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(183,51,'[\"Python\", \"Python\"]',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(184,51,'Lỗi cú pháp, không thể nhân chuỗi với số',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(185,52,'True',1,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(186,52,'False',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(187,53,'size()',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(188,53,'length()',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(189,53,'count()',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(190,53,'len()',1,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(191,54,'function myFunc():',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(192,54,'def myFunc():',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(193,54,'create myFunc():',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(194,54,'func myFunc():',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(195,55,'for loop',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(196,55,'while loop',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(197,55,'do-while loop',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(198,55,'Python không có vòng lặp nào thực hiện ít nhất một lần bất kể điều kiện',1,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(199,56,'5',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(200,56,'6',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(201,56,'8',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(202,56,'9',1,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(203,57,'file = open(\"file.txt\", \"r\")',1,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(204,57,'file = open(\"file.txt\", \"w\")',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(205,57,'file = read(\"file.txt\")',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(206,57,'file = File.open(\"file.txt\")',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(207,58,'Một cách để hiểu danh sách',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(208,58,'Một cách ngắn gọn để tạo danh sách mới dựa trên danh sách hiện có',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(209,58,'Một phương thức để sắp xếp danh sách',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(210,58,'Một kỹ thuật để nén danh sách',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(211,59,'True',1,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(212,59,'False',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(213,60,'Đơn giản, dễ hiểu, không quan tâm đến hiệu suất',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(214,60,'Phức tạp, khó hiểu, nhưng luôn chạy nhanh',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(215,60,'Rõ ràng, chính xác, hữu hạn và hiệu quả về thời gian và bộ nhớ',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(216,60,'Càng nhiều dòng code càng tốt',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(217,61,'Tìm kiếm nhị phân, Quick sort',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(218,61,'Bubble sort, Insertion sort, Selection sort',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(219,61,'Merge sort, Heap sort',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(220,61,'Tìm kiếm tuyến tính, Đếm sort',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(221,62,'Một kiểu dữ liệu đặc biệt trong lập trình',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(222,62,'Một phương pháp giải quyết vấn đề bằng cách chia thành các vấn đề nhỏ hơn',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(223,62,'Kỹ thuật trong đó một hàm gọi chính nó để giải quyết bài toán',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(224,62,'Một loại vòng lặp đặc biệt trong lập trình',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(225,63,'Tìm kiếm tuyến tính (Linear Search)',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(226,63,'Tìm kiếm nhị phân (Binary Search)',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(227,63,'Tìm kiếm nội suy (Interpolation Search)',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(228,63,'Tìm kiếm theo độ sâu (Depth-First Search)',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(229,64,'15',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(230,64,'120',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(231,64,'25',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(232,64,'5',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(233,65,'Phân luồng, đồng bộ hóa, quản lý bộ nhớ',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(234,65,'Tính minh bạch, tính bất biến, tính phức tạp',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(235,65,'Đóng gói, kế thừa, đa hình, trừu tượng',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(236,65,'Phân tách, tổng hợp, phân chia, kết hợp',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(237,66,'Cả hai đều lưu trữ các phần tử liên tiếp trong bộ nhớ',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(238,66,'Mảng lưu trữ các phần tử liên tiếp, danh sách liên kết lưu trữ phần tử rải rác với con trỏ liên kết',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(239,66,'Danh sách liên kết lưu trữ các phần tử liên tiếp, mảng lưu trữ phần tử rải rác',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(240,66,'Cả hai đều lưu trữ các phần tử rải rác trong bộ nhớ',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(241,67,'Lỗi cú pháp (Syntax Error)',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(242,67,'Tràn ngăn xếp (Stack Overflow)',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(243,67,'Lỗi chia cho 0',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(244,67,'Lỗi tràn số nguyên (Integer Overflow)',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(245,68,'True',1,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(246,68,'False',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(247,69,'True',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(248,69,'False',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(249,70,'O(1)',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(250,70,'O(log n)',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(251,70,'O(n)',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(252,70,'O(n²)',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(253,71,'So sánh chuỗi với bản đảo ngược của nó',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(254,71,'Sử dụng hai con trỏ từ hai đầu và di chuyển vào trong',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(255,71,'Sử dụng đệ quy',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(256,71,'Sử dụng cấu trúc stack',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(257,72,'O(1)',1,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(258,72,'O(log n)',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(259,72,'O(n)',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(260,72,'O(n²)',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(261,73,'True',1,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(262,73,'False',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(263,74,'True',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(264,74,'False',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(265,75,'Truy cập ngẫu nhiên nhanh hơn',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(266,75,'Sử dụng ít bộ nhớ hơn',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(267,75,'Chèn và xóa phần tử hiệu quả hơn',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(268,75,'Thời gian tìm kiếm nhanh hơn',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(269,76,'Danh sách liên kết đôi có thể chứa nhiều phần tử hơn',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(270,76,'Danh sách liên kết đôi có hai con trỏ trong mỗi nút, danh sách liên kết đơn chỉ có một',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(271,76,'Danh sách liên kết đôi chỉ có thể duyệt theo một hướng',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(272,76,'Danh sách liên kết đôi không thể chứa giá trị trùng lặp',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(273,77,'Thuật toán Bubble Sort',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(274,77,'Thuật toán Quick Sort',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(275,77,'Thuật toán Floyd\'s Cycle-Finding (Tortoise and Hare)',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(276,77,'Thuật toán Dijkstra',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(277,78,'O(1)',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(278,78,'O(log n)',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(279,78,'O(n)',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(280,78,'O(n²)',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(281,79,'True',1,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(282,79,'False',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(283,80,'Queue',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(284,80,'Stack',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(285,80,'Linked List',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(286,80,'Tree',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(287,81,'Stack',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(288,81,'Binary Search Tree',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(289,81,'Queue',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(290,81,'Hash Table',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(291,82,'Mọi nút con trái có giá trị lớn hơn nút cha',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(292,82,'Mọi nút con phải có giá trị nhỏ hơn nút cha',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(293,82,'Mọi nút con trái có giá trị nhỏ hơn nút cha, mọi nút con phải có giá trị lớn hơn nút cha',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(294,82,'Mọi nút con đều có giá trị bằng nút cha',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(295,83,'Chaining',1,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(296,83,'Balancing',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(297,83,'Searching',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(298,83,'Merging',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(299,84,'O(1)',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(300,84,'O(n)',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(301,84,'O(n log n)',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(302,84,'O(n²)',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(303,85,'Bubble Sort',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(304,85,'Insertion Sort',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(305,85,'Merge Sort',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(306,85,'Selection Sort',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(307,86,'True',1,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(308,86,'False',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(309,87,'True',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(310,87,'False',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(311,88,'Queue',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(312,88,'Stack',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(313,88,'Hash Table',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(314,88,'Tree',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(315,89,'Quick Sort',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(316,89,'Bubble Sort',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(317,89,'Merge Sort',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(318,89,'Insertion Sort',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(319,90,'Lưu trữ danh sách liên lạc',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(320,90,'Tổ chức dữ liệu trong hệ thống cơ sở dữ liệu',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(321,90,'Rendering đồ họa trong trò chơi',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(322,90,'Xử lý âm thanh trong thời gian thực',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(323,91,'Quá trình kiểm tra lỗi trong thuật toán',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(324,91,'Quá trình xác định số lượng tài nguyên cần thiết để thuật toán hoàn thành',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(325,91,'Quá trình tối ưu hóa thuật toán',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(326,91,'Quá trình chuyển đổi thuật toán sang mã máy',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(327,92,'First In First Out (FIFO)',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(328,92,'Last In First Out (LIFO)',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(329,92,'Least Recently Used (LRU)',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(330,92,'Most Recently Used (MRU)',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(331,93,'Khi cần sắp xếp dữ liệu nhanh chóng',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(332,93,'Khi cần tìm đường đi ngắn nhất trong đồ thị',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(333,93,'Khi cần lưu trữ và tìm kiếm từ điển, gợi ý từ khóa, và autocomplete',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(334,93,'Khi cần cân bằng tải trong hệ thống phân tán',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(335,94,'Dijkstra',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(336,94,'Bellman-Ford',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(337,94,'Floyd-Warshall',1,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(338,94,'Kruskal',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(339,95,'Đường đi ngắn nhất giữa hai đỉnh trong đồ thị',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(340,95,'Tập hợp con của các cạnh kết nối tất cả các đỉnh với tổng trọng số nhỏ nhất',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(341,95,'Cây nhị phân có chiều cao nhỏ nhất',0,3,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(342,95,'Cây có số nút lá ít nhất',0,4,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(343,96,'True',0,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(344,96,'False',1,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(345,97,'True',1,1,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(346,97,'False',0,2,'2025-04-05 03:22:00','2025-04-05 03:22:00'),(478,131,'dict = (1: \'one\', 2: \'two\')',0,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(479,131,'dict = {1: \'one\', 2: \'two\'}',1,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(480,131,'dict = [1, 2, 3]',0,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(481,131,'dict = (\'one\', \'two\')',0,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(482,132,'check element in list',0,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(483,132,'element.exists(list)',0,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(484,132,'element in list',1,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(485,132,'in list(element)',0,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(486,133,'int(value)',1,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(487,133,'cast(value, int)',0,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(488,133,'toInt(value)',0,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(489,133,'value.toInt()',0,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(490,134,'list1 + list2',1,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(491,134,'merge(list1, list2)',0,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(492,134,'list1.combine(list2)',0,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(493,134,'list1.append(list2)',0,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(494,135,'string.contains(word)',0,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(495,135,'word in string',1,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(496,135,'string.has(word)',0,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(497,135,'string.include(word)',0,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(498,136,'remove()',0,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(499,136,'pop()',1,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(500,136,'shift()',0,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(501,136,'delete()',0,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(502,137,'upper()',1,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(503,137,'toUpper()',0,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(504,137,'capitalize()',0,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(505,137,'uppercase()',0,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(506,138,'exit()',0,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(507,138,'break',1,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(508,138,'continue',0,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(509,138,'stop',0,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(510,139,'length()',0,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(511,139,'size()',0,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(512,139,'len()',1,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(513,139,'count()',0,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(514,140,'replace()',1,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(515,140,'substitute()',0,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(516,140,'change()',0,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(517,140,'swap()',0,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(1614,415,'squares = [x**2 for x in numbers]',1,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1615,415,'squares = numbers.map(lambda x: x**2)',0,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1616,415,'squares = [x * 2 for x in numbers]',0,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1617,415,'squares = numbers*2',0,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1618,416,'student_scores[1]',0,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1619,416,'student_scores[\'Bob\']',0,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1620,416,'student_scores.get(\'Bob\')',0,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1621,416,'Cả B và C đều đúng',1,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1622,417,'numbers.sort(reverse=True)',0,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1623,417,'numbers.sort()',0,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1624,417,'numbers = sorted(numbers)',0,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1625,417,'Cả B và C đều đúng',1,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1626,418,'\"Hello \" + \"World!\"',1,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1627,418,'\"Hello \".combine(\"World!\")',0,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1628,418,'\"Hello \".join(\"World!\")',0,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1629,418,'\"Hello \".merge(\"World!\")',0,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1630,419,'nums[1:]',0,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1631,419,'nums[:-1]',1,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1632,419,'nums[::1]',0,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1633,419,'nums[::2]',0,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1634,420,'multiply(5, 6)',0,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1635,420,'multiply(5)',0,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1636,420,'multiply(x=5, y=6)',0,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1637,420,'A và C đều đúng',1,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1638,421,'sum(data)',1,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1639,421,'total(data)',0,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1640,421,'data.sum()',0,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1641,421,'reduce(data)',0,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1642,422,'with open(\'data.txt\') as file: print(file)',0,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1643,422,'with open(\'data.txt\', \'r\') as file: print(file.read())',1,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1644,422,'read(\'data.txt\')',0,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1645,422,'file = open(\'data.txt\')',0,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1646,423,'\" Hello World \".strip()',1,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1647,423,'\" Hello World \".trim()',0,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1648,423,'\" Hello World \".remove_whitespace()',0,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1649,423,'\" Hello World \".clean()',0,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1650,424,'numbers[1]',0,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1651,424,'numbers[0]',1,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1652,424,'numbers.first()',0,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1653,424,'numbers.get(0)',0,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(1654,425,'Một phần mềm giúp bảo vệ hệ thống',0,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1655,425,'Một công cụ được dùng để tăng tốc mạng',0,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1656,425,'Một loại phần mềm độc hại gây ảnh hưởng tới hệ thống',1,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1657,425,'Một trình duyệt an toàn',0,4,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1658,426,'Tấn công vật lý',0,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1659,426,'Tấn công DDoS',1,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1660,426,'Tấn công địa lý',0,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1661,426,'Tấn công ánh sáng',0,4,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1662,427,'Tấn công mạng không dây',0,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1663,427,'Tấn công brute-force',0,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1664,427,'Giả mạo để lừa người dùng cung cấp thông tin cá nhân',1,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1665,427,'Tấn công bằng mã độc',0,4,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1666,428,'Gửi email an toàn',0,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1667,428,'Ngăn ngừa virus từ USB',0,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1668,428,'Lọc và kiểm soát lưu lượng mạng ra vào hệ thống',1,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1669,428,'Tăng tốc độ mạng Internet',0,4,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1670,429,'Spyware',0,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1671,429,'Adware',0,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1672,429,'Ransomware',1,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1673,429,'Worm',0,4,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1674,430,'Không dùng máy tính',0,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1675,430,'Cập nhật phần mềm và sử dụng phần mềm diệt virus',1,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1676,430,'Chỉ dùng mạng LAN',0,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1677,430,'Gỡ bỏ toàn bộ phần mềm',0,4,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1678,431,'Nhanh hơn',0,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1679,431,'Rẻ hơn',0,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1680,431,'Có mã hóa dữ liệu truyền tải',1,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1681,431,'Không cần đăng nhập',0,4,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1682,432,'Giúp bảo vệ mật khẩu người dùng',0,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1683,432,'Ghi lại các phím người dùng gõ',1,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1684,432,'Tăng tốc bàn phím',0,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1685,432,'Giảm tiếng ồn khi gõ phím',0,4,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1686,433,'Kỹ thuật lập trình mạng xã hội',0,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1687,433,'Hành vi thao túng tâm lý con người để lấy thông tin',1,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1688,433,'Kỹ thuật tăng tốc mạng xã hội',0,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1689,433,'Phần mềm bảo vệ Facebook',0,4,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1690,434,'Vì tốn dung lượng',0,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1691,434,'Vì có thể chứa mã độc',1,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1692,434,'Vì không có ích',0,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(1693,434,'Vì gây mất thời gian',0,4,'2025-04-19 02:42:46','2025-04-19 02:42:46');
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
  `question_type` enum('multiple_choice','true_false') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `correct_explanation` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `points` int NOT NULL DEFAULT '1',
  `order_number` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=435 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_questions`
--

LOCK TABLES `quiz_questions` WRITE;
/*!40000 ALTER TABLE `quiz_questions` DISABLE KEYS */;
INSERT INTO `quiz_questions` VALUES (1,1,'Đâu không phải là kiểu dữ liệu cơ bản trong Python?','multiple_choice','Array không phải là kiểu dữ liệu cơ bản trong Python. Python sử dụng List thay cho Array. Các kiểu dữ liệu cơ bản là int, float, str, bool, list, tuple, dict, set.',1,1,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(2,1,'Câu lệnh nào dùng để tạo một hàm trong Python?','multiple_choice','def là từ khóa dùng để định nghĩa hàm trong Python. Ví dụ: def my_function(): pass',1,2,'2025-04-03 02:37:54','2025-04-03 02:37:54'),(3,1,'List và Tuple trong Python khác nhau chủ yếu ở điểm nào?','multiple_choice','Tuple là immutable (không thể thay đổi sau khi tạo) trong khi List là mutable (có thể thay đổi). Đây là sự khác biệt cơ bản nhất giữa hai cấu trúc dữ liệu này.',1,3,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(4,1,'Trong Python, cách nào để bắt và xử lý ngoại lệ?','multiple_choice','Cấu trúc try-except được sử dụng để bắt và xử lý ngoại lệ trong Python. Ngoài ra còn có thể sử dụng finally để thực thi mã bất kể có ngoại lệ hay không.',1,4,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(5,2,'Khi dự án bị chậm tiến độ do phạm vi công việc thay đổi liên tục, phương pháp nào sau đây là hiệu quả nhất?','multiple_choice','Quy trình quản lý thay đổi chính thức giúp đánh giá, phê duyệt và triển khai những thay đổi một cách có kiểm soát, tránh scope creep và đảm bảo tiến độ dự án.',1,1,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(6,2,'Quy trình Scrum là phương pháp phát triển phần mềm tuần tự (Waterfall)','true_false','Sai. Scrum là phương pháp phát triển phần mềm Agile, hoạt động theo các sprint lặp lại, không phải tuần tự như Waterfall.',1,2,'2025-04-03 02:37:54','2025-04-03 02:37:54'),(7,2,'Khi xảy ra xung đột giữa thành viên dự án, Project Manager nên áp đặt quyết định ngay lập tức để tiết kiệm thời gian.','multiple_choice','Project Manager nên lắng nghe cả hai bên, tạo không gian trung lập để thảo luận, đánh giá các giải pháp dựa trên dữ liệu và mục tiêu dự án, đưa ra quyết định có cơ sở rõ ràng, và cần đảm bảo đội ngũ đoàn kết sau quyết định.',1,3,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(8,2,'Dự án của bạn có nguy cơ vượt ngân sách 20%. Hành động nào sau đây phù hợp nhất?','multiple_choice','Phân tích nguyên nhân và đánh giá tác động là bước đầu tiên quan trọng, giúp xác định vấn đề cốt lõi và lập kế hoạch khắc phục hiệu quả.',1,4,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(9,3,'Phương pháp nào hiệu quả nhất để đảm bảo chất lượng code trong dự án phần mềm?','multiple_choice','Sự kết hợp giữa kiểm thử tự động và code reviews giúp phát hiện lỗi sớm, đảm bảo tuân thủ tiêu chuẩn, và chia sẻ kiến thức trong nhóm.',1,1,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(10,3,'DevOps là một công cụ phần mềm cụ thể để triển khai ứng dụng.','true_false','Sai. DevOps là một triết lý và tập hợp các thực hành kết hợp giữa phát triển (Dev) và vận hành (Ops), không phải một công cụ cụ thể.',1,2,'2025-04-03 02:37:54','2025-04-03 02:37:54'),(11,3,'Agile phù hợp cho mọi loại dự án phần mềm hơn Waterfall.','multiple_choice','Agile phù hợp với dự án có yêu cầu thay đổi và cần phản hồi nhanh, trong khi Waterfall phù hợp với dự án có yêu cầu ổn định, phạm vi rõ ràng và các giai đoạn phát triển tuần tự.',1,3,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(12,3,'Khi triển khai microservices, thách thức lớn nhất là gì?','multiple_choice','Quản lý giao tiếp giữa các dịch vụ là thách thức lớn vì ảnh hưởng đến hiệu suất, độ tin cậy và khả năng mở rộng của hệ thống.',1,4,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(13,3,'Redis thường được sử dụng cho mục đích gì trong kiến trúc hệ thống?','multiple_choice','Redis là một hệ thống lưu trữ key-value trong bộ nhớ, thường được sử dụng làm cache để tăng tốc truy xuất dữ liệu.',1,5,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(18,5,'Thuật toán nào không thuộc nhóm học có giám sát (supervised learning)?','multiple_choice','K-means là thuật toán clustering, thuộc nhóm unsupervised learning vì nó không cần dữ liệu được gán nhãn trước.',1,1,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(19,5,'Transfer learning chỉ áp dụng được cho bài toán Computer Vision.','true_false','Sai. Transfer learning có thể áp dụng cho nhiều lĩnh vực như NLP, Speech Recognition, không chỉ riêng Computer Vision.',1,2,'2025-04-03 02:37:54','2025-04-03 02:37:54'),(20,5,'CNN thích hợp cho xử lý dữ liệu tuần tự như văn bản và âm thanh hơn so với RNN.','multiple_choice','CNN được thiết kế cho dữ liệu không gian (spatial data) như hình ảnh, trong khi RNN thích hợp hơn cho dữ liệu tuần tự (sequential data) như văn bản và âm thanh vì có khả năng xử lý và nhớ thông tin theo thứ tự thời gian.',1,3,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(21,5,'Chọn phương pháp phù hợp nhất để giải quyết bài toán dự đoán giá nhà dựa trên diện tích, vị trí, số phòng.','multiple_choice','Linear/Polynomial Regression phù hợp với bài toán dự đoán giá trị liên tục từ các biến đầu vào như trong bài toán dự đoán giá nhà.',1,4,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(22,6,'Câu lệnh nào dùng để lấy các bản ghi duy nhất từ một cột trong SQL?','multiple_choice','SELECT DISTINCT giúp lọc các giá trị trùng lặp, trả về các giá trị duy nhất từ cột được chọn.',1,1,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(23,6,'Lệnh HAVING trong SQL luôn phải đi cùng với GROUP BY.','true_false','Đúng. HAVING được sử dụng để lọc kết quả của GROUP BY, không thể sử dụng độc lập.',1,2,'2025-04-03 02:37:54','2025-04-03 02:37:54'),(24,6,'Để truy vấn top 10 sản phẩm có doanh số cao nhất trong SQL, cần sử dụng JOIN nhiều bảng và ORDER BY với LIMIT.','multiple_choice','Để lấy top 10 sản phẩm có doanh số cao nhất cần JOIN bảng products, categories, order_items; GROUP BY sản phẩm; tính SUM cho số lượng và doanh thu; sắp xếp với ORDER BY doanh thu DESC; và giới hạn kết quả với LIMIT 10.',1,3,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(25,6,'Trong SQL, phương thức nào không phù hợp để tối ưu hóa truy vấn trên bảng lớn?','multiple_choice','Luôn sử dụng SELECT * sẽ lấy tất cả các cột, tăng lượng dữ liệu cần xử lý và truyền tải, làm giảm hiệu suất truy vấn.',1,4,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(26,6,'View trong SQL có thể thay thế hoàn toàn bảng vật lý mà không có bất kỳ giới hạn nào về hiệu suất.','multiple_choice','View là bảng ảo được tạo từ truy vấn và có thể có giới hạn về hiệu suất, đặc biệt khi truy vấn phức tạp hoặc dữ liệu lớn. View thường được sử dụng để đơn giản hóa truy vấn và kiểm soát quyền truy cập, nhưng không thể thay thế hoàn toàn bảng vật lý về hiệu suất.',1,5,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(27,7,'Mô hình kinh doanh nào phù hợp nhất cho nền tảng kết nối người dạy và người học?','multiple_choice','Marketplace là mô hình phù hợp nhất cho nền tảng kết nối hai bên (người dạy và người học), tạo ra giá trị từ việc tạo điều kiện giao dịch.',1,1,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(28,7,'Mô hình doanh thu dựa trên quảng cáo luôn kém hiệu quả hơn mô hình subscription.','true_false','Sai. Hiệu quả của mô hình doanh thu phụ thuộc vào đặc thù sản phẩm, đối tượng khách hàng và thị trường. Mô hình quảng cáo có thể rất hiệu quả cho nền tảng có lượng người dùng lớn.',1,2,'2025-04-03 02:37:54','2025-04-03 02:37:54'),(29,7,'Các nền tảng e-learning thành công như Coursera và Udemy đều sử dụng cùng một mô hình kinh doanh.','multiple_choice','Các nền tảng e-learning thành công sử dụng mô hình kinh doanh khác nhau: Coursera tập trung vào đối tác với các tổ chức giáo dục uy tín và mô hình subscription với chứng chỉ, trong khi Udemy là marketplace mở cho người dạy với mô hình pay-per-course.',1,3,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(30,7,'Yếu tố nào quan trọng nhất trong phân tích unit economics của một ứng dụng SaaS?','multiple_choice','LTV/CAC là tỷ lệ quan trọng nhất vì nó đo lường hiệu quả của chi phí thu hút khách hàng so với giá trị mà khách hàng mang lại, quyết định tính bền vững của mô hình kinh doanh.',1,4,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(31,8,'Phương pháp phân loại nào phù hợp nhất khi dữ liệu có mối quan hệ phi tuyến phức tạp?','multiple_choice','Neural Networks có khả năng học các mối quan hệ phi tuyến phức tạp giữa các biến đầu vào và đầu ra.',1,1,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(32,8,'K-Nearest Neighbors (KNN) là thuật toán phân loại có tham số (parametric algorithm).','true_false','Sai. KNN là thuật toán không tham số (non-parametric) vì nó không giả định một mô hình cố định cho dữ liệu.',1,2,'2025-04-03 02:37:54','2025-04-03 02:37:54'),(33,8,'Naive Bayes là thuật toán phổ biến nhất cho hệ thống phân loại email spam vì tính đơn giản và hiệu quả với dữ liệu văn bản.','multiple_choice','Naive Bayes là thuật toán phổ biến và hiệu quả cho phân loại spam vì phù hợp với dữ liệu văn bản, xử lý tốt không gian đặc trưng lớn, đào tạo nhanh, và hoạt động tốt ngay cả với mẫu nhỏ, mặc dù có giả định đơn giản về tính độc lập của các đặc trưng.',1,3,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(34,8,'Khi đánh giá mô hình phân loại nhị phân không cân bằng, metric nào ít hữu ích nhất?','multiple_choice','Accuracy có thể gây hiểu lầm khi dữ liệu không cân bằng vì mô hình có thể đạt accuracy cao đơn giản bằng cách dự đoán toàn bộ là lớp đa số.',1,4,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(39,10,'Trong quản lý rủi ro dự án, kỹ thuật nào không phù hợp để xác định rủi ro?','multiple_choice','SWOT Analysis tập trung vào đánh giá chiến lược tổng thể, không phải công cụ chuyên biệt để xác định rủi ro dự án.',1,1,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(40,10,'Rủi ro tích cực (positive risk) không cần được quản lý trong dự án.','true_false','Sai. Rủi ro tích cực (cơ hội) cũng cần được quản lý để tối đa hóa lợi ích tiềm năng cho dự án.',1,2,'2025-04-03 02:37:54','2025-04-03 02:37:54'),(41,10,'Đối với hệ thống thanh toán trực tuyến, rủi ro bảo mật dữ liệu quan trọng hơn rủi ro về tuân thủ quy định.','multiple_choice','Cả hai loại rủi ro đều quan trọng và liên quan chặt chẽ: rủi ro bảo mật dữ liệu (như data breach) có thể dẫn đến vi phạm tuân thủ (như GDPR, PCI DSS), và ngược lại, không tuân thủ quy định có thể dẫn đến sơ hở bảo mật. Cần quản lý cả hai loại rủi ro song song.',1,3,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(42,10,'Trong ma trận đánh giá rủi ro, khu vực nào cần được ưu tiên xử lý cao nhất?','multiple_choice','Rủi ro có khả năng xảy ra cao và tác động lớn cần được ưu tiên xử lý nhất vì chúng đe dọa nghiêm trọng đến thành công của dự án.',1,4,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(43,11,'Kỹ thuật nào không thuộc nhóm kiểm tra thâm nhập (penetration testing)?','multiple_choice','Vulnerability scanning là quá trình tự động phát hiện lỗ hổng, khác với penetration testing là quá trình chủ động khai thác lỗ hổng để đánh giá bảo mật.',1,1,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(44,11,'HTTPS sử dụng mã hóa bất đối xứng (asymmetric encryption) trong suốt quá trình truyền dữ liệu.','true_false','Sai. HTTPS sử dụng mã hóa bất đối xứng chỉ trong quá trình thiết lập kết nối và trao đổi khóa, sau đó chuyển sang mã hóa đối xứng để truyền dữ liệu vì hiệu suất cao hơn.',1,2,'2025-04-03 02:37:54','2025-04-03 02:37:54'),(45,11,'XSS và SQL Injection là hai kiểu tấn công web có cùng vector tấn công và cơ chế phòng thủ.','multiple_choice','XSS và SQL Injection có vector tấn công và cơ chế phòng thủ khác nhau: XSS chèn mã JavaScript vào client và phòng thủ bằng sanitize input, CSP; còn SQL Injection chèn mã SQL vào server và phòng thủ bằng prepared statements, ORM. XSS tấn công người dùng, còn SQL Injection tấn công cơ sở dữ liệu.',1,3,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(46,11,'Trong mô hình bảo mật nhiều lớp (defense in depth), layer nào thường được xem là lớp bảo vệ cuối cùng?','multiple_choice','Data security là lớp cuối cùng vì nó bảo vệ tài sản quan trọng nhất - dữ liệu - ngay cả khi các lớp khác bị xâm phạm.',1,4,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(47,11,'Biện pháp nào không hiệu quả trong việc giảm thiểu rủi ro từ insider threats?','multiple_choice','Chỉ dựa vào giải pháp kỹ thuật mà không kết hợp với chính sách, đào tạo và nâng cao nhận thức sẽ không hiệu quả, vì insider threats thường liên quan đến yếu tố con người.',1,5,'2025-04-03 02:37:54','2025-04-09 09:41:39'),(48,12,'Trong Python, câu lệnh nào sau đây khai báo đúng một biến kiểu số nguyên?','multiple_choice','Trong Python, biến được gán giá trị mà không cần khai báo kiểu dữ liệu trước. Kiểu dữ liệu được xác định dựa trên giá trị được gán.',1,1,'2025-04-05 03:13:25','2025-04-05 03:13:25'),(49,12,'Phép toán % trong Python được sử dụng để làm gì?','multiple_choice','Phép toán % là phép toán chia lấy dư, trả về phần dư khi số bên trái chia cho số bên phải.',1,2,'2025-04-05 03:13:25','2025-04-05 03:13:25'),(50,12,'Trong Python, kiểu dữ liệu nào sau đây là kiểu dữ liệu không thay đổi được (immutable)?','multiple_choice','Tuple là kiểu dữ liệu immutable trong Python, không thể thay đổi sau khi tạo.',1,3,'2025-04-05 03:13:25','2025-04-09 09:41:39'),(51,12,'Kết quả của đoạn code sau là gì? a = \"Python\" * 2','multiple_choice','Khi một chuỗi được nhân với một số, chuỗi đó sẽ được lặp lại số lần tương ứng.',1,4,'2025-04-05 03:13:25','2025-04-05 03:13:25'),(52,12,'True/False: Trong Python, biến có thể thay đổi kiểu dữ liệu sau khi được khai báo.','true_false','Đúng. Python là ngôn ngữ có kiểu dữ liệu động, biến có thể thay đổi kiểu dữ liệu khi được gán giá trị mới.',1,5,'2025-04-05 03:13:25','2025-04-05 03:13:25'),(53,13,'Hàm nào trong Python được sử dụng để lấy độ dài của một chuỗi hoặc danh sách?','multiple_choice','Hàm len() trả về số lượng phần tử trong một đối tượng (như chuỗi, danh sách, từ điển).',1,1,'2025-04-05 03:14:59','2025-04-05 03:14:59'),(54,13,'Cách nào để tạo một hàm trong Python?','multiple_choice','Trong Python, hàm được định nghĩa bằng từ khóa def, theo sau là tên hàm và dấu ngoặc đơn chứa các tham số.',1,2,'2025-04-05 03:14:59','2025-04-05 03:14:59'),(55,13,'Vòng lặp nào sau đây sẽ thực hiện ít nhất một lần, bất kể điều kiện có đúng hay không?','multiple_choice','Python không có cấu trúc do-while như một số ngôn ngữ khác. Vòng lặp while trong Python chỉ thực hiện khi điều kiện đúng.',1,3,'2025-04-05 03:14:59','2025-04-09 09:41:39'),(56,13,'Kết quả của biểu thức 3 ** 2 trong Python là gì?','multiple_choice','Toán tử ** trong Python là toán tử lũy thừa. 3 ** 2 = 3² = 9.',1,4,'2025-04-05 03:14:59','2025-04-05 03:14:59'),(57,13,'Cách nào để mở một file để đọc trong Python?','multiple_choice','Hàm open() được sử dụng để mở file trong Python. Tham số \"r\" chỉ định rằng file được mở để đọc.',1,5,'2025-04-05 03:14:59','2025-04-09 09:41:39'),(58,13,'List comprehension là gì trong Python?','multiple_choice','List comprehension là cú pháp ngắn gọn để tạo một danh sách mới từ danh sách hiện có bằng cách áp dụng một biểu thức.',1,6,'2025-04-05 03:14:59','2025-04-09 09:41:39'),(59,13,'True/False: Trong Python, từ khóa \"pass\" không làm gì cả và được sử dụng như một placeholder.','true_false','Đúng. Từ khóa \"pass\" là một placeholder trong Python, không thực hiện hành động nào và thường được sử dụng khi cú pháp yêu cầu một câu lệnh nhưng bạn không muốn thực hiện hành động nào.',1,7,'2025-04-05 03:14:59','2025-04-05 03:14:59'),(60,14,'Một thuật toán hiệu quả cần phải có những đặc điểm nào?','multiple_choice','Một thuật toán hiệu quả cần rõ ràng, chính xác, hữu hạn (kết thúc sau một số hữu hạn bước), hiệu quả về thời gian và bộ nhớ.',1,1,'2025-04-05 03:15:33','2025-04-09 09:41:39'),(61,14,'Độ phức tạp thời gian O(n²) thường xuất hiện trong những thuật toán nào?','multiple_choice','Các thuật toán sắp xếp như Bubble Sort, Insertion Sort, Selection Sort có độ phức tạp O(n²) trong trường hợp trung bình.',1,2,'2025-04-05 03:15:33','2025-04-09 09:41:39'),(62,14,'Đệ quy là gì?','multiple_choice','Đệ quy là kỹ thuật trong đó một hàm gọi chính nó để giải quyết bài toán.',1,3,'2025-04-05 03:15:33','2025-04-09 09:41:39'),(63,14,'Đâu là cách tối ưu để tìm kiếm một phần tử trong một mảng đã được sắp xếp?','multiple_choice','Tìm kiếm nhị phân có độ phức tạp O(log n) và là phương pháp hiệu quả nhất để tìm kiếm trong mảng đã sắp xếp.',1,4,'2025-04-05 03:15:33','2025-04-09 09:41:39'),(64,14,'Giá trị trả về của hàm sau là gì? \ndef example(n):\n    if n <= 1:\n        return 1\n    else:\n        return n * example(n-1)\nexample(5)','multiple_choice','Đây là hàm tính giai thừa. example(5) = 5 * example(4) = 5 * 24 = 120.',1,5,'2025-04-05 03:15:33','2025-04-09 09:41:39'),(65,14,'Khái niệm OOP trong lập trình bao gồm những nguyên tắc cơ bản nào?','multiple_choice','OOP (Lập trình hướng đối tượng) dựa trên các nguyên tắc cơ bản: đóng gói, kế thừa, đa hình và trừu tượng.',1,6,'2025-04-05 03:15:33','2025-04-09 09:41:39'),(66,14,'Mảng và danh sách liên kết khác nhau như thế nào về mặt bộ nhớ?','multiple_choice','Mảng lưu trữ các phần tử liên tiếp trong bộ nhớ, trong khi danh sách liên kết lưu trữ các phần tử rải rác với con trỏ liên kết chúng.',1,7,'2025-04-05 03:15:33','2025-04-09 09:41:39'),(67,14,'Vấn đề gì có thể xảy ra khi sử dụng đệ quy không đúng cách?','multiple_choice','Nếu không có điều kiện dừng hoặc điều kiện dừng không bao giờ đạt được, đệ quy có thể dẫn đến tràn ngăn xếp (stack overflow).',1,8,'2025-04-05 03:15:33','2025-04-09 09:41:39'),(68,14,'True/False: Ngôn ngữ lập trình bậc thấp thường khó đọc hơn nhưng có hiệu suất tốt hơn so với ngôn ngữ bậc cao.','true_false','Đúng. Ngôn ngữ bậc thấp như Assembly gần với mã máy hơn, khó đọc nhưng thường cho phép tối ưu hiệu suất tốt hơn.',1,9,'2025-04-05 03:15:33','2025-04-09 09:41:39'),(69,14,'True/False: Trong lập trình, việc tối ưu hóa sớm luôn là một thực hành tốt.','true_false','Sai. \"Premature optimization is the root of all evil\" (Donald Knuth). Tối ưu hóa sớm có thể dẫn đến code phức tạp, khó bảo trì và thậm chí không cần thiết.',1,10,'2025-04-05 03:15:33','2025-04-09 09:41:39'),(70,15,'Độ phức tạp thời gian của thao tác tìm kiếm tuyến tính (linear search) trong mảng là gì?','multiple_choice','Tìm kiếm tuyến tính phải duyệt qua từng phần tử của mảng trong trường hợp xấu nhất, nên độ phức tạp là O(n).',1,1,'2025-04-05 03:15:58','2025-04-05 03:15:58'),(71,15,'Phương pháp nào hiệu quả để kiểm tra xem một chuỗi có phải là palindrome (đọc xuôi ngược như nhau)?','multiple_choice','Cách hiệu quả là sử dụng hai con trỏ, một từ đầu và một từ cuối chuỗi, di chuyển vào trong và so sánh các ký tự.',1,2,'2025-04-05 03:15:58','2025-04-09 09:41:39'),(72,15,'Độ phức tạp không gian của thuật toán sắp xếp nổi bọt (bubble sort) là gì?','multiple_choice','Bubble sort chỉ cần một số lượng cố định biến bổ sung để hoán đổi các phần tử, nên độ phức tạp không gian là O(1).',1,3,'2025-04-05 03:15:58','2025-04-09 09:41:39'),(73,15,'True/False: Mảng động (dynamic array) trong nhiều ngôn ngữ lập trình tự động tăng kích thước khi cần thiết.','true_false','Đúng. Mảng động như ArrayList trong Java hay vector trong C++ tự động mở rộng kích thước khi số phần tử vượt quá dung lượng hiện tại.',1,4,'2025-04-05 03:15:58','2025-04-05 03:15:58'),(74,15,'True/False: Thao tác xóa phần tử ở vị trí bất kỳ trong mảng có độ phức tạp thời gian là O(1).','true_false','Sai. Xóa phần tử ở vị trí bất kỳ (không phải cuối mảng) yêu cầu di chuyển tất cả các phần tử phía sau, nên độ phức tạp là O(n).',1,5,'2025-04-05 03:15:58','2025-04-09 09:41:39'),(75,16,'Ưu điểm chính của danh sách liên kết so với mảng là gì?','multiple_choice','Danh sách liên kết cho phép chèn và xóa phần tử ở bất kỳ vị trí nào với độ phức tạp O(1) nếu đã có con trỏ đến vị trí đó, không cần phân bổ lại bộ nhớ khi thay đổi kích thước.',1,1,'2025-04-05 03:15:58','2025-04-05 03:15:58'),(76,16,'Danh sách liên kết đôi (doubly linked list) khác với danh sách liên kết đơn (singly linked list) như thế nào?','multiple_choice','Trong danh sách liên kết đôi, mỗi nút có hai con trỏ: một trỏ đến nút tiếp theo và một trỏ đến nút trước đó, cho phép duyệt theo cả hai hướng.',1,2,'2025-04-05 03:15:58','2025-04-05 03:15:58'),(77,16,'Thuật toán nào sau đây thường được sử dụng để phát hiện vòng lặp (cycle) trong danh sách liên kết?','multiple_choice','Thuật toán Floyd\'s Cycle-Finding (hay còn gọi là Tortoise and Hare) sử dụng hai con trỏ di chuyển với tốc độ khác nhau để phát hiện vòng lặp.',1,3,'2025-04-05 03:15:58','2025-04-09 09:41:39'),(78,16,'Độ phức tạp thời gian của thao tác tìm kiếm trong danh sách liên kết là gì?','multiple_choice','Trong danh sách liên kết, tìm kiếm phải duyệt từng phần tử một cho đến khi tìm thấy, nên độ phức tạp thời gian là O(n).',1,4,'2025-04-05 03:15:58','2025-04-05 03:15:58'),(79,16,'True/False: Danh sách liên kết vòng (circular linked list) là danh sách mà nút cuối cùng trỏ đến nút đầu tiên.','true_false','Đúng. Trong danh sách liên kết vòng, con trỏ next của nút cuối cùng trỏ đến nút đầu tiên, tạo thành một vòng tròn.',1,5,'2025-04-05 03:15:58','2025-04-05 03:15:58'),(80,17,'Cấu trúc dữ liệu nào hoạt động theo nguyên tắc LIFO (Last In First Out)?','multiple_choice','Stack (ngăn xếp) hoạt động theo nguyên tắc LIFO - phần tử được thêm vào cuối cùng sẽ được lấy ra đầu tiên.',1,1,'2025-04-05 03:16:17','2025-04-05 03:16:17'),(81,17,'Cấu trúc dữ liệu nào hoạt động theo nguyên tắc FIFO (First In First Out)?','multiple_choice','Queue (hàng đợi) hoạt động theo nguyên tắc FIFO - phần tử được thêm vào đầu tiên sẽ được lấy ra đầu tiên.',1,2,'2025-04-05 03:16:17','2025-04-05 03:16:17'),(82,17,'Cây nhị phân tìm kiếm (Binary Search Tree) có đặc điểm gì?','multiple_choice','Trong cây nhị phân tìm kiếm, mọi nút con bên trái có giá trị nhỏ hơn nút cha, và mọi nút con bên phải có giá trị lớn hơn nút cha.',1,3,'2025-04-05 03:16:17','2025-04-09 09:41:39'),(83,17,'Bảng băm (Hash Table) sử dụng kỹ thuật nào để giải quyết va chạm (collision)?','multiple_choice','Chaining là một phương pháp giải quyết va chạm trong bảng băm, trong đó các phần tử có cùng hash được lưu trữ trong một danh sách liên kết tại vị trí đó.',1,4,'2025-04-05 03:16:17','2025-04-09 09:41:39'),(84,17,'Độ phức tạp thời gian trung bình của thuật toán Quick Sort là gì?','multiple_choice','Quick Sort có độ phức tạp thời gian trung bình là O(n log n), làm cho nó hiệu quả cho hầu hết các trường hợp.',1,5,'2025-04-05 03:16:17','2025-04-09 09:41:39'),(85,17,'Thuật toán nào sau đây sử dụng kỹ thuật chia để trị (divide and conquer)?','multiple_choice','Merge Sort sử dụng kỹ thuật chia để trị bằng cách chia mảng thành các nửa nhỏ hơn, sắp xếp chúng, sau đó kết hợp lại.',1,6,'2025-04-05 03:16:17','2025-04-09 09:41:39'),(86,17,'True/False: Heap là một cây nhị phân hoàn chỉnh (complete binary tree).','true_false','Đúng. Heap là một cây nhị phân hoàn chỉnh, có nghĩa là tất cả các cấp đều được lấp đầy trừ có thể là cấp cuối cùng, và các nút ở cấp cuối cùng được điền từ trái sang phải.',1,7,'2025-04-05 03:16:17','2025-04-09 09:41:39'),(87,17,'True/False: Thuật toán Dijkstra có thể hoạt động với các cạnh có trọng số âm.','true_false','Sai. Thuật toán Dijkstra không thể xử lý các cạnh có trọng số âm và có thể cho kết quả không chính xác trong trường hợp đó. Thuật toán Bellman-Ford được sử dụng cho các đồ thị có cạnh trọng số âm.',1,8,'2025-04-05 03:16:17','2025-04-09 09:41:39'),(88,18,'Cấu trúc dữ liệu nào thích hợp nhất để triển khai hệ thống kiểm tra tính cân bằng của dấu ngoặc trong biểu thức?','multiple_choice','Stack là cấu trúc dữ liệu thích hợp nhất để kiểm tra tính cân bằng của dấu ngoặc. Khi gặp dấu mở ngoặc, đẩy vào stack; khi gặp dấu đóng ngoặc, lấy ra từ stack và kiểm tra.',1,1,'2025-04-05 03:16:36','2025-04-09 09:41:39'),(89,18,'Thuật toán nào sau đây có độ phức tạp thời gian tốt nhất trong trường hợp xấu nhất?','multiple_choice','Merge Sort luôn có độ phức tạp thời gian là O(n log n) ngay cả trong trường hợp xấu nhất, trong khi Quick Sort có thể xuống đến O(n²) trong trường hợp xấu nhất.',1,2,'2025-04-05 03:16:36','2025-04-09 09:41:39'),(90,18,'Đâu là ứng dụng thực tế của cây tìm kiếm nhị phân cân bằng (AVL Tree)?','multiple_choice','Cây AVL được sử dụng trong hệ thống cơ sở dữ liệu để thực hiện các thao tác tìm kiếm, chèn và xóa hiệu quả với độ phức tạp O(log n).',1,3,'2025-04-05 03:16:36','2025-04-09 09:41:39'),(91,18,'Phân tích thời gian chạy của thuật toán là gì?','multiple_choice','Phân tích thời gian chạy là quá trình xác định số lượng tài nguyên, đặc biệt là thời gian, mà thuật toán cần để hoàn thành.',1,4,'2025-04-05 03:16:36','2025-04-05 03:16:36'),(92,18,'Bộ nhớ đệm (cache) sử dụng thuật toán thay thế nào để quyết định phần tử nào bị loại bỏ khi cache đầy?','multiple_choice','LRU (Least Recently Used) là thuật toán loại bỏ phần tử không được sử dụng trong thời gian dài nhất, thường được dùng trong bộ nhớ đệm.',1,5,'2025-04-05 03:16:36','2025-04-09 09:41:39'),(93,18,'Khi nào nên sử dụng cấu trúc dữ liệu Trie?','multiple_choice','Trie (Prefix Tree) hiệu quả cho việc lưu trữ và tìm kiếm từ điển, gợi ý từ khóa, và autocomplete vì nó tối ưu cho các thao tác liên quan đến tiền tố.',1,6,'2025-04-05 03:16:36','2025-04-09 09:41:39'),(94,18,'Thuật toán nào được sử dụng để tìm đường đi ngắn nhất giữa tất cả các cặp đỉnh trong đồ thị?','multiple_choice','Thuật toán Floyd-Warshall tìm đường đi ngắn nhất giữa tất cả các cặp đỉnh trong đồ thị với độ phức tạp O(n³).',1,7,'2025-04-05 03:16:36','2025-04-09 09:41:39'),(95,18,'Cây khung nhỏ nhất (Minimum Spanning Tree) là gì?','multiple_choice','Cây khung nhỏ nhất là một tập hợp con của các cạnh trong đồ thị có trọng số không hướng, kết nối tất cả các đỉnh với tổng trọng số nhỏ nhất và không tạo thành chu trình.',1,8,'2025-04-05 03:16:36','2025-04-09 09:41:39'),(96,18,'True/False: Thuật toán tham lam (Greedy Algorithm) luôn cho kết quả tối ưu toàn cục.','true_false','Sai. Thuật toán tham lam chọn lựa tối ưu cục bộ ở mỗi bước, nhưng không đảm bảo tìm ra giải pháp tối ưu toàn cục cho mọi vấn đề.',1,9,'2025-04-05 03:16:36','2025-04-09 09:41:39'),(97,18,'True/False: Cây đỏ-đen (Red-Black Tree) là một loại cây tìm kiếm nhị phân cân bằng.','true_false','Đúng. Cây đỏ-đen là một loại cây tìm kiếm nhị phân tự cân bằng với các quy tắc màu sắc và xoay để duy trì cân bằng.',1,10,'2025-04-05 03:16:36','2025-04-09 09:41:39'),(131,24,'Câu lệnh nào dùng để tạo một dictionary trong Python?','multiple_choice','Để tạo một dictionary trong Python, bạn sử dụng dấu ngoặc nhọn {} với cú pháp key: value, ví dụ: dict = {1: \'one\', 2: \'two\'}.',1,1,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(132,24,'Câu lệnh nào sau đây dùng để kiểm tra nếu một phần tử tồn tại trong một list trong Python?','multiple_choice','Để kiểm tra nếu một phần tử tồn tại trong một list, bạn sử dụng cú pháp element in list.',1,2,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(133,24,'Câu lệnh nào dùng để thực hiện việc ép kiểu (casting) một giá trị thành kiểu dữ liệu int trong Python?','multiple_choice','Để ép kiểu một giá trị thành kiểu int trong Python, bạn sử dụng cú pháp int(value).',1,3,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(134,24,'Để kết hợp hai list lại với nhau trong Python, bạn sử dụng cú pháp nào?','multiple_choice','Để kết hợp hai list trong Python, bạn có thể sử dụng toán tử cộng +, ví dụ: list1 + list2.',1,4,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(135,24,'Câu lệnh nào dùng để kiểm tra xem một chuỗi có chứa một từ cụ thể trong Python?','multiple_choice','Để kiểm tra xem một chuỗi có chứa một từ, bạn sử dụng cú pháp word in string.',1,5,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(136,24,'Phương thức nào sau đây dùng để loại bỏ phần tử đầu tiên trong một list Python?','multiple_choice','Để loại bỏ phần tử đầu tiên trong một list, bạn sử dụng phương thức pop(). Nếu không truyền chỉ số, pop() sẽ loại bỏ phần tử cuối cùng.',1,6,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(137,24,'Câu lệnh nào dùng để chuyển đổi một chuỗi thành chữ hoa trong Python?','multiple_choice','Để chuyển đổi một chuỗi thành chữ hoa, bạn sử dụng phương thức upper(), ví dụ: string.upper().',1,7,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(138,24,'Câu lệnh nào dùng để kết thúc một vòng lặp sớm trong Python?','multiple_choice','Để kết thúc một vòng lặp sớm trong Python, bạn sử dụng câu lệnh break.',1,8,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(139,24,'Để tính chiều dài của một chuỗi trong Python, bạn sử dụng hàm nào?','multiple_choice','Để tính chiều dài của một chuỗi trong Python, bạn sử dụng hàm len().',1,9,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(140,24,'Phương thức nào trong Python dùng để thay thế một phần của chuỗi?','multiple_choice','Để thay thế một phần của chuỗi trong Python, bạn sử dụng phương thức replace(), ví dụ: string.replace(old, new).',1,10,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(415,32,'Nếu bạn có một list numbers = [1, 2, 3, 4, 5] và bạn muốn tạo một list mới chứa bình phương của các số trong numbers, bạn sẽ viết lệnh nào?','multiple_choice','Để tạo một list mới chứa bình phương của các số trong list numbers, bạn có thể sử dụng list comprehension: [x**2 for x in numbers].',1,1,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(416,32,'Bạn có một dictionary student_scores = {\'Alice\': 85, \'Bob\': 90, \'Charlie\': 78}. Bạn muốn lấy điểm của Bob. Câu lệnh nào bạn sẽ sử dụng?','multiple_choice','Cả student_scores[\'Bob\'] và student_scores.get(\'Bob\') đều có thể trả về điểm của Bob trong dictionary.',1,2,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(417,32,'Bạn muốn sắp xếp một list numbers = [5, 3, 9, 1] theo thứ tự tăng dần. Câu lệnh nào bạn sẽ sử dụng?','multiple_choice','numbers.sort() sắp xếp list tại chỗ, còn sorted(numbers) trả về một list mới đã được sắp xếp.',1,3,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(418,32,'Trong Python, nếu bạn muốn kết hợp hai chuỗi \"Hello \" và \"World!\" lại thành \"Hello World!\", câu lệnh nào bạn sẽ sử dụng?','multiple_choice','Để kết hợp hai chuỗi trong Python, bạn sử dụng toán tử cộng (+), ví dụ: \"Hello \" + \"World!\".',1,4,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(419,32,'Bạn có một list nums = [1, 2, 3, 4, 5]. Câu lệnh nào sau đây sẽ lấy tất cả các phần tử của list trừ phần tử cuối cùng?','multiple_choice','Để lấy tất cả các phần tử của list trừ phần tử cuối cùng, bạn sử dụng nums[:-1], với chỉ số -1 đại diện cho phần tử cuối cùng.',1,5,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(420,32,'Nếu bạn có một hàm def multiply(x, y): return x * y và muốn tính tích của 5 và 6, bạn sẽ gọi hàm như thế nào?','multiple_choice','Bạn có thể gọi hàm theo cách multiply(5, 6) hoặc multiply(x=5, y=6), cả hai cách đều đúng.',1,6,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(421,32,'Bạn có một list data = [1, 2, 3, 4, 5]. Câu lệnh nào dưới đây sẽ in ra tổng các phần tử trong list?','multiple_choice','Để tính tổng các phần tử trong list, bạn sử dụng hàm sum(data).',1,7,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(422,32,'Bạn muốn đọc dữ liệu từ một file data.txt trong Python và in ra nội dung của nó. Câu lệnh nào dưới đây là chính xác?','multiple_choice','Để đọc dữ liệu từ file và in ra nội dung, bạn sử dụng cú pháp with open(\'data.txt\', \'r\') as file: print(file.read()).',1,8,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(423,32,'Trong Python, bạn muốn loại bỏ tất cả các khoảng trắng ở đầu và cuối chuỗi \" Hello World \"? Câu lệnh nào bạn sẽ sử dụng?','multiple_choice','Để loại bỏ khoảng trắng ở đầu và cuối chuỗi, bạn sử dụng phương thức strip().',1,9,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(424,32,'Bạn có một list numbers = [10, 20, 30, 40, 50]. Câu lệnh nào dưới đây sẽ trả về phần tử đầu tiên trong list?','multiple_choice','Để truy cập phần tử đầu tiên trong list, bạn sử dụng chỉ số 0, ví dụ: numbers[0].',1,10,'2025-04-18 07:23:32','2025-04-18 07:23:32'),(425,33,'Mã độc (malware) là gì trong lĩnh vực an ninh mạng?','multiple_choice','Mã độc là phần mềm độc hại được tạo ra để gây hại, xâm nhập hoặc đánh cắp thông tin từ hệ thống máy tính.',1,1,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(426,33,'Một trong các hình thức tấn công phổ biến trên mạng là gì?','multiple_choice','Tấn công DDoS (Distributed Denial of Service) là hình thức làm nghẽn dịch vụ bằng cách gửi lượng lớn truy cập giả mạo đến hệ thống.',1,2,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(427,33,'Phishing là phương thức tấn công như thế nào?','multiple_choice','Phishing là hành vi lừa đảo qua email hoặc tin nhắn để đánh cắp thông tin cá nhân như mật khẩu, tài khoản ngân hàng.',1,3,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(428,33,'Firewall có tác dụng gì trong bảo mật mạng?','multiple_choice','Firewall là tường lửa giúp kiểm soát, giám sát lưu lượng mạng và ngăn chặn các kết nối không an toàn.',1,4,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(429,33,'Tấn công bằng mã hóa dữ liệu để đòi tiền chuộc gọi là gì?','multiple_choice','Ransomware là phần mềm độc hại mã hóa dữ liệu người dùng và đòi tiền chuộc để khôi phục lại.',1,5,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(430,33,'Biện pháp nào sau đây giúp phòng chống tấn công mạng hiệu quả nhất?','multiple_choice','Cập nhật hệ thống thường xuyên và sử dụng phần mềm bảo mật uy tín là cách phòng ngừa tấn công mạng hiệu quả.',1,6,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(431,33,'HTTPS an toàn hơn HTTP vì lý do nào?','multiple_choice','HTTPS sử dụng giao thức SSL/TLS để mã hóa dữ liệu khi truyền tải, giúp ngăn chặn việc nghe lén hoặc thay đổi dữ liệu.',1,7,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(432,33,'Keylogger là phần mềm gì?','multiple_choice','Keylogger là phần mềm gián điệp ghi lại thao tác bàn phím để đánh cắp thông tin như tài khoản và mật khẩu.',1,8,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(433,33,'Social engineering trong an ninh mạng là gì?','multiple_choice','Social engineering là kỹ thuật lừa người dùng để họ tự tiết lộ thông tin quan trọng mà không cần tấn công kỹ thuật.',1,9,'2025-04-19 02:42:46','2025-04-19 02:42:46'),(434,33,'Tại sao không nên mở tập tin đính kèm từ email không rõ nguồn gốc?','multiple_choice','Tập tin đính kèm trong email lạ có thể chứa mã độc hoặc ransomware có thể gây hại cho hệ thống của bạn.',1,10,'2025-04-19 02:42:46','2025-04-19 02:42:46');
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
  `score` decimal(5,2) DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `attempt_id` (`attempt_id`),
  KEY `question_id` (`question_id`),
  KEY `selected_option_id` (`selected_option_id`),
  CONSTRAINT `quiz_responses_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`),
  CONSTRAINT `quiz_responses_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`),
  CONSTRAINT `quiz_responses_ibfk_3` FOREIGN KEY (`selected_option_id`) REFERENCES `quiz_options` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=366 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_responses`
--

LOCK TABLES `quiz_responses` WRITE;
/*!40000 ALTER TABLE `quiz_responses` DISABLE KEYS */;
INSERT INTO `quiz_responses` VALUES (7,4,48,170,1.00,'2025-04-06 01:37:18','2025-04-06 02:52:54'),(8,4,49,175,1.00,'2025-04-06 01:37:18','2025-04-06 02:52:43'),(9,4,50,180,1.00,'2025-04-06 01:37:18','2025-04-09 09:48:29'),(10,4,51,181,0.00,'2025-04-06 01:37:18','2025-04-06 02:52:43'),(11,4,52,185,1.00,'2025-04-06 01:37:18','2025-04-06 02:52:43'),(153,31,53,190,1.00,'2025-04-10 07:25:21','2025-04-10 07:25:21'),(154,31,54,192,1.00,'2025-04-10 07:25:21','2025-04-10 07:25:21'),(155,31,55,198,1.00,'2025-04-10 07:25:21','2025-04-10 07:25:21'),(156,31,56,202,1.00,'2025-04-10 07:25:21','2025-04-10 07:25:21'),(157,31,57,203,1.00,'2025-04-10 07:25:21','2025-04-10 07:25:21'),(158,31,58,207,0.00,'2025-04-10 07:25:21','2025-04-10 07:25:21'),(159,31,59,211,1.00,'2025-04-10 07:25:21','2025-04-10 07:25:21'),(208,40,1,4,0.00,'2025-04-10 08:12:54','2025-04-10 08:12:54'),(209,40,2,5,1.00,'2025-04-10 08:12:54','2025-04-10 08:12:54'),(210,40,3,9,0.00,'2025-04-10 08:12:54','2025-04-10 08:12:54'),(211,40,4,13,1.00,'2025-04-10 08:12:54','2025-04-10 08:12:54'),(216,46,1,4,0.00,'2025-04-10 09:45:13','2025-04-10 09:45:13'),(217,46,2,5,1.00,'2025-04-10 09:45:13','2025-04-10 09:45:13'),(218,46,3,10,1.00,'2025-04-10 09:45:13','2025-04-10 09:45:13'),(219,46,4,13,1.00,'2025-04-10 09:45:13','2025-04-10 09:45:13'),(220,47,1,3,1.00,'2025-04-10 09:45:57','2025-04-10 09:45:57'),(221,47,2,5,1.00,'2025-04-10 09:45:57','2025-04-10 09:45:57'),(222,47,3,10,1.00,'2025-04-10 09:45:57','2025-04-10 09:45:57'),(223,47,4,13,1.00,'2025-04-10 09:45:57','2025-04-10 09:45:57'),(301,84,131,480,0.00,'2025-04-17 10:14:55','2025-04-17 10:14:55'),(302,84,132,483,0.00,'2025-04-17 10:14:55','2025-04-17 10:14:55'),(303,84,133,487,0.00,'2025-04-17 10:14:55','2025-04-17 10:14:55'),(304,84,134,491,0.00,'2025-04-17 10:14:55','2025-04-17 10:14:55'),(305,84,135,495,1.00,'2025-04-17 10:14:55','2025-04-17 10:14:55'),(306,84,136,500,0.00,'2025-04-17 10:14:55','2025-04-17 10:14:55'),(307,84,137,505,0.00,'2025-04-17 10:14:55','2025-04-17 10:14:55'),(308,84,138,509,0.00,'2025-04-17 10:14:55','2025-04-17 10:14:55'),(309,84,139,512,1.00,'2025-04-17 10:14:55','2025-04-17 10:14:55'),(310,84,140,515,0.00,'2025-04-17 10:14:55','2025-04-17 10:14:55'),(311,85,131,479,1.00,'2025-04-17 10:16:07','2025-04-17 10:16:07'),(312,85,132,484,1.00,'2025-04-17 10:16:07','2025-04-17 10:16:07'),(313,85,133,486,1.00,'2025-04-17 10:16:07','2025-04-17 10:16:07'),(314,85,134,490,1.00,'2025-04-17 10:16:07','2025-04-17 10:16:07'),(315,85,135,495,1.00,'2025-04-17 10:16:07','2025-04-17 10:16:07'),(316,85,136,498,0.00,'2025-04-17 10:16:07','2025-04-17 10:16:07'),(317,85,137,502,1.00,'2025-04-17 10:16:07','2025-04-17 10:16:07'),(318,85,138,507,1.00,'2025-04-17 10:16:07','2025-04-17 10:16:07'),(319,85,139,510,0.00,'2025-04-17 10:16:07','2025-04-17 10:16:07'),(320,85,140,514,1.00,'2025-04-17 10:16:07','2025-04-17 10:16:07');
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
  `lesson_id` bigint DEFAULT NULL,
  `academic_class_id` bigint DEFAULT NULL COMMENT 'Lớp học nếu là bài kiểm tra học thuật',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `time_limit` int DEFAULT NULL COMMENT 'Time limit in minutes',
  `passing_score` int DEFAULT NULL,
  `attempts_allowed` int DEFAULT '1',
  `quiz_type` enum('practice','homework','midterm','final') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'practice',
  `show_explanation` tinyint(1) DEFAULT '1',
  `start_time` datetime DEFAULT NULL COMMENT 'Thời gian bắt đầu làm bài',
  `end_time` datetime DEFAULT NULL COMMENT 'Thời gian kết thúc',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `quizzes_academic_class_fk` (`academic_class_id`),
  CONSTRAINT `quizzes_academic_class_fk` FOREIGN KEY (`academic_class_id`) REFERENCES `academic_classes` (`id`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (1,3,NULL,'Bài kiểm tra lập trình Python cơ bản','Bài kiểm tra trắc nghiệm về các khái niệm lập trình cơ bản trong Python',30,70,3,'practice',1,'2025-04-02 20:43:58','2025-04-09 20:43:58','2025-04-02 13:43:58','2025-04-04 01:14:35'),(2,12,NULL,'Phân tích tình huống quản lý dự án','Giải quyết các tình huống thực tế trong quản lý dự án phần mềm',30,70,2,'practice',1,'2025-03-24 08:53:36','2025-04-23 08:53:36','2025-04-03 01:53:36','2025-04-03 01:53:36'),(3,18,NULL,'Đánh giá kiến thức tổng hợp','Bài kiểm tra cuối khóa đánh giá toàn bộ kiến thức của học viên',90,75,1,'final',1,'2025-03-29 08:53:36','2025-04-13 08:53:36','2025-04-03 01:53:36','2025-04-03 01:53:36'),(5,30,NULL,'Trắc nghiệm về AI và Machine Learning','Kiểm tra kiến thức về trí tuệ nhân tạo và học máy',40,65,3,'practice',1,'2025-03-14 08:53:36','2025-05-03 08:53:36','2025-04-03 01:53:36','2025-04-03 01:53:36'),(6,39,NULL,'Thực hành SQL','Bài tập thực hành viết các câu lệnh SQL căn bản và nâng cao',60,70,2,'homework',1,'2025-03-26 08:53:36','2025-04-25 08:53:36','2025-04-03 01:53:36','2025-04-03 01:53:36'),(7,51,NULL,'Phân tích mô hình kinh doanh số','Đánh giá và phân tích các mô hình kinh doanh trong kỷ nguyên số',75,80,1,'midterm',1,'2025-03-22 08:53:36','2025-04-21 08:53:36','2025-04-03 01:53:36','2025-04-03 01:53:36'),(8,60,NULL,'Kỹ thuật phân loại dữ liệu','Áp dụng các kỹ thuật phân loại dữ liệu trong thực tế',50,65,2,'practice',1,'2025-03-09 08:53:36','2025-05-08 08:53:36','2025-04-03 01:53:36','2025-04-03 01:53:36'),(10,81,NULL,'Đánh giá và quản lý rủi ro','Nhận diện, phân tích và đề xuất biện pháp quản lý rủi ro trong dự án',60,70,2,'practice',1,'2025-03-29 08:53:36','2025-04-28 08:53:36','2025-04-03 01:53:36','2025-04-03 01:53:36'),(11,90,NULL,'Kiểm tra an toàn thông tin','Thực hành đánh giá và kiểm tra các vấn đề an toàn thông tin',120,85,1,'final',1,'2025-04-01 08:53:36','2025-05-01 08:53:36','2025-04-03 01:53:36','2025-04-03 01:53:36'),(12,NULL,1,'Bài tập Biến và Kiểu dữ liệu','Bài tập về biến và kiểu dữ liệu trong lập trình',30,70,2,'homework',0,'2025-05-15 09:00:00','2025-05-15 10:00:00','2025-04-05 03:03:57','2025-04-10 09:49:29'),(13,NULL,1,'Kiểm tra giữa kỳ Python','Kiểm tra giữa kỳ về Python cơ bản',60,60,1,'midterm',1,'2025-05-15 09:00:00','2025-05-15 10:00:00','2025-04-05 03:03:57','2025-04-10 09:49:29'),(14,NULL,1,'Thi cuối kỳ Lập trình cơ bản','Bài thi cuối kỳ về các kiến thức lập trình cơ bản',120,70,2,'final',1,'2025-06-20 13:00:00','2025-06-20 15:00:00','2025-04-05 03:03:57','2025-04-16 03:40:28'),(15,NULL,2,'Bài tập Array và String','Bài tập về mảng và chuỗi',45,60,2,'practice',1,NULL,NULL,'2025-04-05 03:03:57','2025-04-05 03:03:57'),(16,NULL,2,'Bài tập Linked List','Bài tập về danh sách liên kết',45,70,2,'homework',1,NULL,NULL,'2025-04-05 03:03:57','2025-04-05 03:03:57'),(17,NULL,2,'Kiểm tra giữa kỳ CTDL','Kiểm tra giữa kỳ về cấu trúc dữ liệu',90,60,1,'midterm',1,'2025-05-18 09:00:00','2025-05-18 10:30:00','2025-04-05 03:03:57','2025-04-05 08:01:24'),(18,NULL,2,'Thi cuối kỳ CTDL và GT','Bài thi cuối kỳ về CTDL và giải thuật',120,70,1,'final',1,'2025-06-22 08:00:00','2025-06-22 10:00:00','2025-04-05 03:03:57','2025-04-05 08:01:24'),(24,114,NULL,'Kiểm tra giữa kì','Kiểm tra giữa kì python lấy điểm ',30,50,3,'midterm',1,NULL,NULL,'2025-04-17 10:14:09','2025-04-17 10:14:09'),(32,115,NULL,'Bài Kiểm tra cuối kì','Lấy điểm cuối kì',90,50,1,'final',0,NULL,NULL,'2025-04-18 03:28:11','2025-04-18 07:23:32'),(33,27,NULL,'Bài kiểm tra kiến thức an ninh mạng','lấy điểm bài tập',30,50,3,'practice',1,NULL,NULL,'2025-04-19 02:42:46','2025-04-19 02:42:46');
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_review` (`user_student_id`,`review_type`,`course_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `reviews_course_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `reviews_user_fk` FOREIGN KEY (`user_student_id`) REFERENCES `user_students` (`id`),
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (2,2,5,'course',4,'Nội dung phân tích dữ liệu khá chi tiết, nhưng cần thêm ví dụ thực tế.','2025-03-25 10:15:44','2025-03-26 02:23:53'),(3,3,3,'course',5,'Khoá học cung cấp nhiều kiến thức bổ ích về an toàn thông tin.','2025-03-25 10:15:44','2025-03-25 10:15:44'),(5,5,2,'course',3,'Quản lý khách sạn là lĩnh vực mới với tôi, nhưng bài giảng còn khá lý thuyết.','2025-03-25 10:15:44','2025-03-25 10:15:44'),(6,1,7,'course',5,'Khóa học tuyệt vời, rất phù hợp với những ai muốn tìm hiểu về AI.','2025-03-25 10:15:44','2025-03-25 10:15:44'),(7,2,8,'course',4,'Nội dung marketing số có nhiều thông tin hay, nhưng chưa có case study thực tế.','2025-03-25 10:15:44','2025-03-25 10:15:44'),(8,3,10,'course',5,'Khoá học giúp tôi hiểu sâu về bảo mật mạng.','2025-03-25 10:15:44','2025-03-25 10:15:44'),(10,5,6,'course',3,'Chiến lược kinh doanh khá hữu ích, nhưng nội dung chưa thực sự chuyên sâu.','2025-03-25 10:15:44','2025-03-25 10:15:44'),(130,1,1,'course',5,'khóa học này rất hay và ý nghĩa !','2025-04-09 02:50:04','2025-04-14 00:00:45');
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
  `assignment_submission_id` bigint DEFAULT NULL,
  `quiz_attempt_id` bigint DEFAULT NULL,
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
  KEY `idx_user_course` (`user_id`,`course_id`),
  KEY `idx_grade_type` (`grade_type`),
  KEY `user_grades_ibfk_6_idx` (`graded_by`),
  KEY `user_grades_ibfk_4_idx` (`assignment_submission_id`),
  KEY `user_grades_ibfk_5_idx` (`quiz_attempt_id`),
  CONSTRAINT `user_grades_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_grades_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `user_grades_ibfk_3` FOREIGN KEY (`lesson_id`) REFERENCES `course_lessons` (`id`),
  CONSTRAINT `user_grades_ibfk_4` FOREIGN KEY (`assignment_submission_id`) REFERENCES `assignment_submissions` (`id`),
  CONSTRAINT `user_grades_ibfk_5` FOREIGN KEY (`quiz_attempt_id`) REFERENCES `quiz_attempts` (`id`),
  CONSTRAINT `user_grades_ibfk_6` FOREIGN KEY (`graded_by`) REFERENCES `user_instructors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_grades`
--

LOCK TABLES `user_grades` WRITE;
/*!40000 ALTER TABLE `user_grades` DISABLE KEYS */;
INSERT INTO `user_grades` VALUES (1,1,1,1,6,2,NULL,'assignment',85.00,100.00,0.15,'Bài làm tốt, cần cải thiện phần trình bày','2025-04-02 13:50:58','2025-04-02 13:50:58','2025-04-07 08:30:04'),(3,1,1,1,NULL,NULL,NULL,'midterm',75.00,100.00,0.30,'Bài thi giữa kỳ khá tốt, cần cải thiện phần thực hành','2025-04-02 13:51:26','2025-04-02 13:51:26','2025-04-10 07:37:20'),(4,1,1,1,NULL,NULL,NULL,'final',85.00,100.00,0.40,'Thể hiện tốt kiến thức tổng hợp, đạt yêu cầu môn học','2025-04-02 13:51:26','2025-04-02 13:51:26','2025-04-02 14:39:45'),(5,1,1,1,NULL,NULL,NULL,'participation',9.00,10.00,0.05,'Tích cực tham gia thảo luận và đóng góp ý kiến','2025-04-02 13:51:26','2025-04-02 13:51:26','2025-04-02 14:39:45'),(6,1,3,3,21,NULL,NULL,'assignment',9.20,10.00,0.15,'Làm bài rất tốt nha','2025-04-02 13:51:26','2025-04-02 13:51:26','2025-04-03 00:13:04');
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_instructors`
--

LOCK TABLES `user_instructors` WRITE;
/*!40000 ALTER TABLE `user_instructors` DISABLE KEYS */;
INSERT INTO `user_instructors` VALUES (1,6,'Quang Hiếu','Giảng viên cao cấp','Kỹ thuật phần mềm','Tiến sĩ Kỹ thuật phần mềm','10 năm kinh nghiệm giảng dạy','Chuyên gia trong kiến trúc phần mềm','Thiết kế phần mềm, Microservices, DevOps','Chứng chỉ AWS Architect',NULL,NULL,NULL,'verified',NULL,'2025-03-25 03:43:22','2025-03-25 06:22:25'),(2,8,'Trần Phong','Phó giáo sư','Trí tuệ nhân tạo','Tiến sĩ AI','8 năm nghiên cứu và giảng dạy','Tập trung vào AI và Machine Learning','Deep Learning, Xử lý ngôn ngữ tự nhiên, Khoa học dữ liệu','Chứng chỉ TensorFlow Developer',NULL,NULL,NULL,'verified',NULL,'2025-03-25 03:43:22','2025-03-25 06:22:45'),(3,9,'Lê Trang','Giảng viên','Khoa học dữ liệu','Thạc sĩ Khoa học dữ liệu','6 năm giảng dạy và nghiên cứu','Đam mê dữ liệu lớn và phân tích','Big Data, SQL, Python','Chứng chỉ Data Analyst',NULL,NULL,NULL,'verified',NULL,'2025-03-25 03:43:22','2025-03-25 06:22:41'),(4,5,'Minh Phúc','Giảng viên thỉnh giảng','Quản trị doanh nghiệp và Tài chính','Thạc sĩ Quản trị Kinh doanh, Cử nhân Công nghệ Thông tin','8 năm kinh nghiệm quản lý dự án và tư vấn tài chính doanh nghiệp','Chuyên gia phát triển ứng dụng di động với nhiều sản phẩm thành công trên App Store và Google Play.','Mobile Development, iOS, Android, React Native, Flutter',NULL,NULL,NULL,NULL,'verified',NULL,'2025-04-12 07:47:09','2025-04-12 07:53:11'),(5,7,'Nguyễn Thủy','Giảng viên','Marketing số và Quản lý dịch vụ','Thạc sĩ Marketing, Cử nhân Thiết kế Đồ họa','6 năm kinh nghiệm marketing số và quản lý dịch vụ khách hàng','Nhà thiết kế UX/UI với đam mê tạo ra những trải nghiệm người dùng đẹp mắt và hiệu quả.','UI Design, UX Research, Wireframing, Prototyping, Visual Design',NULL,NULL,NULL,NULL,'verified',NULL,'2025-04-12 07:47:09','2025-04-12 07:53:11');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_students`
--

LOCK TABLES `user_students` WRITE;
/*!40000 ALTER TABLE `user_students` DISABLE KEYS */;
INSERT INTO `user_students` VALUES (1,1,'Thanh Toàn','2000-05-15','male','Cử nhân','Lập trình viên','Đam mê công nghệ và lập trình','Đọc sách, Lập trình, Du lịch','123 Đường ABC','TP. Hồ Chí Minh','Việt Nam','Trở thành kỹ sư phần mềm','Tiếng Anh',NULL,2,1,100,'2025-03-25 10:12:05','2025-03-25 10:12:05'),(2,2,'Linh Chi','2002-07-20','female','Trung học phổ thông','Nhân viên phân tích dữ liệu','Yêu thích khoa học dữ liệu','Toán học, AI, Leo núi','456 Đường DEF','Hà Nội','Việt Nam','Thành thạo AI và Machine Learning','Tiếng Anh',NULL,3,2,150,'2025-03-25 10:12:05','2025-03-25 10:12:05'),(3,4,'Hoàng Nam','1999-12-10','male','Cử nhân','Chuyên viên an ninh mạng','Quan tâm đến bảo mật thông tin','Hack, Cờ vua, Âm nhạc','789 Đường GHI','Đà Nẵng','Việt Nam','Làm việc trong lĩnh vực an ninh mạng','Tiếng Việt',NULL,1,0,50,'2025-03-25 10:12:05','2025-03-25 10:12:05'),(5,12,'Nguyễn Toàn','2003-08-05','male','Trung học phổ thông','Hướng dẫn viên du lịch','Thích khám phá ngôn ngữ mới','Đọc sách, Du lịch, Ngôn ngữ','654 Đường MNO','Cần Thơ','Việt Nam','Thành thạo nhiều ngôn ngữ','Tiếng Pháp',NULL,2,1,120,'2025-03-25 10:12:05','2025-03-25 10:12:05');
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
  `status` enum('studying','graduated','suspended','dropped') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'studying',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_code` (`student_code`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `academic_class_id` (`academic_class_id`),
  CONSTRAINT `user_students_academic_class_fk` FOREIGN KEY (`academic_class_id`) REFERENCES `academic_classes` (`id`),
  CONSTRAINT `user_students_academic_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_students_academic`
--

LOCK TABLES `user_students_academic` WRITE;
/*!40000 ALTER TABLE `user_students_academic` DISABLE KEYS */;
INSERT INTO `user_students_academic` VALUES (1,13,1,'SV202501','Nguyễn Minh','K69','studying','2025-04-05 00:11:16','2025-04-05 00:11:16'),(2,14,2,'SV202502','Phạm Thanh','K69','studying','2025-04-05 00:11:16','2025-04-05 00:11:16'),(3,15,1,'SV202503','Hoàng Anh','K70','studying','2025-04-05 00:11:16','2025-04-05 04:01:11'),(4,16,4,'SV202504','Lê Thanh','K70','studying','2025-04-05 00:11:16','2025-04-05 00:11:16'),(5,17,5,'SV202505','Trần Hải','K71','studying','2025-04-05 00:11:16','2025-04-05 00:11:16'),(48,65,1,'SV202511','Ngô Lan Hương','K74','studying','2025-04-18 03:45:58','2025-04-18 03:45:58'),(49,66,1,'SV202512','Đỗ Văn Khang','K71','studying','2025-04-18 03:45:58','2025-04-18 03:45:58'),(50,67,1,'SV202513','Bùi Thị Minh Thư','K73','studying','2025-04-18 03:45:58','2025-04-18 03:45:58'),(51,68,1,'SV202514','Vũ Quang Huy','K72','studying','2025-04-18 03:45:58','2025-04-18 03:45:58'),(52,69,1,'SV202515','Đặng Hồng Phúc','K74','studying','2025-04-18 03:45:58','2025-04-18 03:45:58');
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
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'thanhtoan','toan@gmail.com','0775844074','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student','active','img',0,'12425',NULL,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0b2FuQGdtYWlsLmNvbSIsImlhdCI6MTc0NTIwODA2MSwiZXhwIjoxNzQ1ODEyODYxfQ.k_1H1HMlZDLsZY6ekMaJ4aqyEwORJR9uwnwir_hzC_0','2025-03-08 02:48:23','2025-04-21 04:01:01'),(2,'linhchi','linhchi@edu.vn','0123456789','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student','active','avatar1.png',0,NULL,NULL,NULL,'2025-03-08 03:00:00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZW1haWwiOiJsZXRoYW5odG9hbkBlZHUudm4iLCJpYXQiOjE3NDM4MTEyNjMsImV4cCI6MTc0NDQxNjA2M30.5Dkr4jVXuKsattyyJgbxeqhlD7PYWpbrj0OtSI9vTkU','2025-03-08 07:53:05','2025-04-05 00:01:56'),(4,'hoangnam','hoangnam@edu.vn','0123456788','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student','active','avatar2.png',0,NULL,NULL,NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-04-11 07:56:27'),(5,'minhphuc','minhphuc@edu.vn','0123456787','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','instructor','inactive','avatar3.png',0,NULL,NULL,NULL,'2025-03-08 03:00:00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1IiwiZW1haWwiOiJtaW5ocGh1Y0BlZHUudm4iLCJpYXQiOjE3NDQ3NjA1MjMsImV4cCI6MTc0NTM2NTMyM30.tYeK798ktN-trejPpxphUPHMreYN71wBxYKIK3faK2A','2025-03-08 07:53:05','2025-04-15 23:42:03'),(6,'quanghieu','quanghieu@edu.vn','0123456786','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','instructor','active','avatar4.png',1,'secretKey',NULL,NULL,'2025-03-08 03:00:00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2IiwiZW1haWwiOiJxdWFuZ2hpZXVAZWR1LnZuIiwiaWF0IjoxNzQ1MjA4MTA5LCJleHAiOjE3NDU4MTI5MDl9.SUGNN4hxBsX3Lrww5GlMa3K7YW-F5tHv81OUT141ikQ','2025-03-08 07:53:05','2025-04-21 04:01:49'),(7,'nguyenthuy','nguyenthuy@edu.vn','0123456785','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','instructor','active','avatar5.png',0,NULL,NULL,NULL,'2025-03-08 03:00:00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZW1haWwiOiJldmVAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDI4MDAxODYsImV4cCI6MTc0MzQwNDk4Nn0.xadiaJvzNhqN0Cr90CZCywkDhXcTGTirslaUWOB7Epg','2025-03-08 07:53:05','2025-03-25 03:29:30'),(8,'tranphong','tranphong@edu.vn','0123456784','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','instructor','active','avatar6.png',0,NULL,'google',NULL,'2025-03-08 03:00:00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4IiwiZW1haWwiOiJ0cmFucGhvbmdAZWR1LnZuIiwiaWF0IjoxNzQ0NzYwNTU1LCJleHAiOjE3NDUzNjUzNTV9.KKROi6UZ_geX7AFGHb96Vf13VmCG-8ZY93ZM3WTd_1I','2025-03-08 07:53:05','2025-04-15 23:42:35'),(9,'letrang','letrang@edu.vn','0123456783','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','instructor','active','avatar7.png',0,NULL,'facebook',NULL,'2025-03-08 03:00:00','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5IiwiZW1haWwiOiJsZXRyYW5nQGVkdS52biIsImlhdCI6MTc0NTE5OTY3NiwiZXhwIjoxNzQ1ODA0NDc2fQ.W6Q5lyocF5DepsGMWj6at4GAqs1h7Lec-qUxRUaiTOc','2025-03-08 07:53:05','2025-04-21 01:41:16'),(10,'thuha','thuha@edu.vn','0123456782','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','admin','active','avatar8.png',0,NULL,NULL,NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-03-25 03:29:30'),(11,'hoanganh','hoanganh@edu.vn','0123456781','$2b$10$nQjaU2vt7dxN1OG7.a/UTONJV3sZaJkUctjhazkEkgDGfKd5o2X1a','admin','inactive','avatar9.png',1,'2FAsecret',NULL,NULL,'2025-03-08 03:00:00',NULL,'2025-03-08 07:53:05','2025-03-25 03:29:30'),(12,'nguyentoan','nguyentoan@edu.vn','0775844074','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student','active','img',0,'12425',NULL,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMiIsImVtYWlsIjoibmd1eWVudG9hbkBlZHUudm4iLCJpYXQiOjE3NDMzODQxODksImV4cCI6MTc0Mzk4ODk4OX0.1ezoloQDwPnDBkPfiIcuKGbUGmL2J9QMtsOEDD1M_VE','2025-03-09 02:39:34','2025-03-31 01:23:09'),(13,'nguyenminh','nguyenminh@example.com','0987123456','$2b$10$QzArfS4lyi51Ic5.tm7okuWYirnkmXAiavgOdi0ge1eBNJeRXT2Li','student_academic','active','https://example.com/avatar1.png',0,NULL,NULL,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMyIsImVtYWlsIjoibmd1eWVubWluaEBleGFtcGxlLmNvbSIsImlhdCI6MTc0NTE5OTY3MywiZXhwIjoxNzQ1ODA0NDczfQ.e5z2R1ZegC6SVNZ2b3Nb0FxXHACtcha4dApGaeIz298','2025-03-26 00:50:55','2025-04-21 01:41:13'),(14,'phamthanh','phamthanh@example.com','0912345678','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student_academic','active','https://example.com/avatar2.png',1,'secret_2','google','social_id_2',NULL,NULL,'2025-03-26 00:50:55','2025-04-05 00:12:50'),(15,'hoanganh','hoanganh@example.com','0978123456','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student_academic','active','https://example.com/avatar3.png',0,NULL,'facebook','social_id_3',NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNSIsImVtYWlsIjoiaG9hbmdhbmhAZXhhbXBsZS5jb20iLCJpYXQiOjE3NDUyMDgwODEsImV4cCI6MTc0NTgxMjg4MX0.24qjMeVPJ5uh-sZ1blAxE67nHpMislmYV2VmWiMCE2U','2025-03-26 00:50:55','2025-04-21 04:01:21'),(16,'lethanh','lethanh@example.com','0967891234','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student_academic','inactive','https://example.com/avatar4.png',1,'secret_4',NULL,NULL,NULL,NULL,'2025-03-26 00:50:55','2025-04-05 00:12:50'),(17,'tranhai','tranhai@example.com','0956789123','$2b$10$7bGssbXA7PRYiFBvDo432OnX3PbG64iScSxQbUS37MKr2ftkzrkb2','student_academic','active','https://example.com/avatar5.png',0,NULL,NULL,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNyIsImVtYWlsIjoidHJhbmhhaUBleGFtcGxlLmNvbSIsImlhdCI6MTc0NDk0ODM0NCwiZXhwIjoxNzQ1NTUzMTQ0fQ.1WUIHrMlsRGsjpggaGyb6lnJbV5BPAqayo87xkP0hUM','2025-03-26 00:50:55','2025-04-18 03:52:24'),(65,'huongngolan','huong.ngolan@gmail.com','945678901','$2b$10$eGFFzmyzeOxVFwoe.k3vveqtwBgiXVhhHF6V5S33OiPL1enIJSOt6','student_academic','active',NULL,0,NULL,NULL,NULL,NULL,NULL,'2025-04-18 03:45:58','2025-04-18 03:45:58'),(66,'khangdovan','khang.dovan@gmail.com','971234567','$2b$10$Jw/fXKNAjhhmpx4u72trKet2kTAAOJuH.su0YyfHAcUOlw5ZycZ16','student_academic','active',NULL,0,NULL,NULL,NULL,NULL,NULL,'2025-04-18 03:45:58','2025-04-18 03:45:58'),(67,'thubuiminh','thu.buiminh@gmail.com','908765432','$2b$10$6EkUnhVMdK/nCpGWCbGNuuVmDGtZvg/h3CyCI/4nT2wtf8Zk.qkdu','student_academic','active',NULL,0,NULL,NULL,NULL,NULL,NULL,'2025-04-18 03:45:58','2025-04-18 03:45:58'),(68,'huyvuquang','huy.vuquang@gmail.com','356789123','$2b$10$hRKDkDocWxvJv54i7MQ6IeHR/1ioU7xlUXqNolCbIbNmXil1h.SIa','student_academic','active',NULL,0,NULL,NULL,NULL,NULL,NULL,'2025-04-18 03:45:58','2025-04-18 03:45:58'),(69,'phucdanghong','phuc.danghong@gmail.com','965432109','$2b$10$BqLyUGIshdoiG96yVo4jiOLt./xbkGi8y5g3sX/0Tt.HXW0h8bsmG','student_academic','active',NULL,0,NULL,NULL,NULL,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OSIsImVtYWlsIjoicGh1Yy5kYW5naG9uZ0BnbWFpbC5jb20iLCJpYXQiOjE3NDQ5NDgxODcsImV4cCI6MTc0NTU1Mjk4N30.7Az_W3ENwSx7wHfMQ4xvUOvWG8f4bUPltnM5WWTwsKw','2025-04-18 03:45:58','2025-04-18 03:49:47');
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

-- Dump completed on 2025-04-21 11:13:06
