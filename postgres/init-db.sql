-- PostgreSQL Initialization Script for Docker
-- This script runs automatically when PostgreSQL container starts

-- ====================================================================
-- IMPORTANT: This script ONLY creates the MROI database locally
-- 
-- Existing databases (know_db, metlink_app_db) are EXTERNAL
-- They will be accessed from Docker containers via connection strings
-- ====================================================================

-- Create MROI database (NEW, local to Docker PostgreSQL)
CREATE DATABASE mroi_db;

-- Connect to mroi_db and setup schema
\c mroi_db;

-- Create tables for MROI application
-- Note: Sequelize migrations will handle detailed table creation
-- This script just ensures the database exists

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create basic schema placeholder (Sequelize will create actual tables)
CREATE SCHEMA IF NOT EXISTS public;

-- ====================================================================
-- IMPORTANT NOTES:
-- 
-- 1. External databases NOT created here:
--    - know_db (on 192.168.100.125) - used by Report-Robot backend
--    - metlink_app_db (on 35.186.159.153) - used by MIOC backend
--
-- 2. NEW database created:
--    - mroi_db (local) - used by MROI backend (Express.js)
--
-- 3. Database users:
--    - robotuser:robotpass - will be created as default user
--      (defined in docker-compose.yml environment variables)
--
-- 4. Migrations:
--    - Report-Robot: TypeORM migrations
--    - MROI: Sequelize migrations
--    Both run automatically when services start
-- ====================================================================
