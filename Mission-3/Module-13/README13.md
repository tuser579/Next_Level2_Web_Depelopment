# SQL and Database Management Summary

This document provides a structured summary of the key database management concepts and SQL operations covered in this module.

---

## 📑 Core Learning Concepts
* Understanding database management systems (DBMS)
* Working with SQL data types (Integers, Booleans, Characters, Dates, and UUIDs)
* Creating and dropping databases and tables
* Implementing column constraints to enforce data integrity
* Executing basic data manipulation language (DML) commands (`INSERT`)

---

## 🗄️ 1. SQL Data Types

### Integer Data Types
Integer data types are used to store mathematical whole numbers. Choosing the correct integer type helps optimize database storage and performance.

| Data Type | Storage Size | Range | Primary Use Case |
| :--- | :---: | :--- | :--- |
| **`SERIAL`** | 4 bytes | `1` to `2,147,483,647` | Auto-incrementing identifier (ID) |
| **`BIGSERIAL`** | 8 bytes | `1` to `9,223,372,036,854,775,807` | Auto-incrementing identifier (large ID) |
| **`INTEGER`** | 4 bytes | `-2,147,483,648` to `2,147,483,647` | Standard identifier (ID) |
| **`BIGINT`** | 8 bytes | `-9,223,372,036,854,775,808` to `9,223,372,036,854,775,807` | Large identifier (large ID) |
| **`SMALLINT`** | 2 bytes | `-32,768` to `32,767` | Small identifier (small ID) |
| **`TINYINT`** | 1 byte | `-128` to `127` | Very small identifier (very small ID) |
| **`INT`** | 4 bytes | `-2,147,483,648` to `2,147,483,647` | Standard identifier (ID) |

### Boolean Data Types
Boolean types represent binary logical values (`true` / `false` / `null`).
* **`BOOLEAN`**
* **`BOOL`**

---

### Character Data Types
Character types are used to store textual strings. They can be of fixed or variable lengths.

| Data Type | Storage Size / Limit | Primary Use Case |
| :--- | :--- | :--- |
| **`VARCHAR`** | 1 to 65,535 bytes | Variable-length strings |
| **`TEXT`** | 1 to 2,147,483,647 bytes | Variable-length strings |
| **`CHAR`** | 1 to 255 bytes | Fixed-length strings |
| **`CHARACTER`** | 1 to 255 bytes | Fixed-length strings |
| **`CHARACTER VARYING`** | 1 to 65,535 bytes | Variable-length strings |

---

### Date & Time Data Types
Date and time types handle temporal data.

| Data Type | Storage Size | Primary Use Case |
| :--- | :---: | :--- |
| **`DATE`** | 4 bytes | Date only |
| **`TIME`** | 8 bytes | Time only |
| **`TIMESTAMP`** | 8 bytes | Date and time |
| **`INTERVAL`** | 16 bytes | Time interval |

---

### UUID Data Type
A Universally Unique Identifier (UUID) provides global uniqueness.

| Data Type | Storage Size | Primary Use Case |
| :--- | :---: | :--- |
| **`UUID`** | 16 bytes | Unique identifier |

---

## 🏗️ 2. Database and Table Schema Operations

### Database Operations
Commands to create and drop database instances:

```sql
-- Create a new database
CREATE DATABASE database_name;

-- Delete a database (permanent operation)
DROP DATABASE database_name;
```

### Table Operations
Commands to create and drop tables:

```sql
-- Create a new table
CREATE TABLE table_name (
    column_name data_type,
    column_name data_type,
    column_name data_type
);

-- Delete a table
DROP TABLE table_name;
```

---

## 🔒 3. Column Constraints
Constraints define rules for columns to ensure the reliability and accuracy of database records.

```sql
CREATE TABLE table_name (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    age INTEGER DEFAULT 18,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_id INTEGER REFERENCES other_table(id)
);
```

---

## ⚙️ 4. Multiple Constraints and INSERT Operations

### Table Definition with Multiple Constraints
Defining table schemas using composite constraints and multiple field constraints.

```sql
-- Table creation with multiple constraints
CREATE TABLE students (
    id SERIAL AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    age SMALLINT CHECK (age >= 18),
    isActive BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id),
    UNIQUE (username, email)
);
```

### Single Entity Insertion
Inserting a single record by specifying target columns:

```sql
-- Single entity insert
INSERT INTO students (username, email, age, isActive)
VALUES ('john_doe', '[EMAIL_ADDRESS]', 20, true);
```

### Multiple Entity Insertion
Inserting multiple records in a single query execution:

```sql
-- Multiple entity insert
INSERT INTO students (username, email, age, isActive)
VALUES 
    ('john_doe', '[EMAIL_ADDRESS]', 20, true),
    ('jane_doe', '[EMAIL_ADDRESS]', 21, false),
    ('bob_smith', '[EMAIL_ADDRESS]', 22, true);
```

### Insertion Without Column Names
Inserting a record by mapping values directly to column order:

```sql
-- Insert without specifying column names
INSERT INTO students
VALUES ('john_doe', '[EMAIL_ADDRESS]', 20, true);
```

---

## 📥 5. Additional Data Insertion Topics
The following concepts cover further insertion methodologies:

```sql
-- 6. Insert data methods
SERIAL
BIGSERIAL
INCREMENT BY 1
AUTO_INCREMENT
```

```sql
-- 7. Insert without column names
INSERT INTO students
VALUES ('john_doe', '[EMAIL_ADDRESS]', 20, true);
```
