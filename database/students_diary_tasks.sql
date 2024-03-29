CREATE DATABASE  IF NOT EXISTS `students_diary` /*!40100 DEFAULT CHARACTER SET utf8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `students_diary`;
-- MySQL dump 10.13  Distrib 8.0.22, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: students_diary
-- ------------------------------------------------------
-- Server version	8.0.22

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
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Ключ задачи',
  `idOwner` int NOT NULL COMMENT 'Ключ владельца задачи',
  `idProject` int DEFAULT NULL COMMENT 'Ключ проекта которому принадлежит задача',
  `title` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT 'Название задачи',
  `description` text CHARACTER SET utf8 COLLATE utf8_general_ci COMMENT 'Описание задачи',
  `date` date DEFAULT NULL COMMENT 'Дата выполнения задачи',
  `time` time DEFAULT NULL COMMENT 'Время выполнения задачи',
  `period` int DEFAULT NULL COMMENT 'Значение отвечающее за то будет ли задача повторяться и указывающая на частоту',
  PRIMARY KEY (`id`),
  KEY `tasks_OwnerId_idx` (`idOwner`),
  KEY `tasks_Period_idx` (`period`),
  CONSTRAINT `tasksOwnerId` FOREIGN KEY (`idOwner`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tasksPeriod` FOREIGN KEY (`period`) REFERENCES `repetition` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8 COMMENT='Таблица задач';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (2,1,NULL,'Демонстрация программы','','2021-05-03','20:00:00',NULL),(5,1,NULL,'Купить молоко',NULL,NULL,NULL,NULL),(6,1,NULL,'Сходить в музей','','2020-05-04',NULL,NULL),(9,1,NULL,'Отправить поздравительное письмо',NULL,'2021-05-06','10:30:00',NULL),(14,1,NULL,'12312334',NULL,'2021-05-13',NULL,1),(24,1,NULL,'23',NULL,'2021-05-14',NULL,NULL),(40,1,NULL,'11',NULL,'2021-05-11','13:48:00',1),(47,2,NULL,'1',NULL,'2021-05-14',NULL,1),(51,2,NULL,'3',NULL,'2021-05-13',NULL,1),(52,2,NULL,'5',NULL,'2021-05-20',NULL,NULL),(53,2,NULL,'10',NULL,'2021-05-12',NULL,1);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-05-10 20:00:15
