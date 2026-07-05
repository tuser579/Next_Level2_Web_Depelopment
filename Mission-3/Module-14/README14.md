# Summary of this module: POSTGRESQL ADVANCED DATA MANIPULATION TECHNIQUES

## Learning Concepts:
### 1. ALTER table and constraints
```sql
-- for adding new column
ALTER TABLE table_name 
ADD column_name data_type constraints;
```
```sql
-- for dropping column
ALTER TABLE table_name 
DROP COLUMN column_name;
```
```sql
-- for modifying column
ALTER TABLE table_name 
ALTER COLUMN column_name data_type;
```
```sql
-- for renaming column
ALTER TABLE table_name 
RENAME COLUMN old_column_name TO new_column_name;
```
```sql
-- for renaming table
ALTER TABLE old_table_name RENAME TO new_table_name;
```
### 2. ALTER default values and column constraints
```sql
-- for adding default value
ALTER TABLE table_name 
ALTER COLUMN column_name SET DEFAULT value;
```
```sql
-- for dropping default value
ALTER TABLE table_name 
ALTER COLUMN column_name DROP DEFAULT;
```
```sql
-- for adding constraint
ALTER TABLE table_name 
ADD CONSTRAINT constraint_name constraint_type;
```
```sql
-- for dropping contraints
ALTER TABLE table_name 
DROP CONSTRAINT constraint_name;
```
### 3. SELECT basics: sorting and aliases 
```sql
-- for sorting
SELECT * FROM table_name 
ORDER BY column_name [ASC|DESC];
```
```sql
-- for aliases
SELECT column_name AS alias_name FROM table_name;
```
### 4. DISTINCT and WHERE filtering 
```sql
-- for distinct
SELECT DISTINCT column_name FROM table_name;
```
```sql
-- for where
SELECT * FROM table_name 
WHERE column_name operator value;
```
### 5. Filtering with AND and OR
```sql
-- for AND
SELECT * FROM table_name 
WHERE column_name operator value1 AND column_name operator value2;
```
```sql
-- for OR
SELECT * FROM table_name 
WHERE column_name operator value1 OR column_name operator value2;
```
```sql
-- for <> and NOT
SELECT * FROM table_name 
WHERE column_name <> value;
```
```sql
-- for NOT
SELECT * FROM table_name 
WHERE NOT column_name operator value;
```
```sql
-- for !=
SELECT * FROM table_name 
WHERE column_name != value;
```
### 6. Comparison, BETWEEN, and IN 
```sql
-- for BETWEEN
SELECT * FROM table_name 
WHERE column_name BETWEEN value1 AND value2;
```
```sql
-- for IN
SELECT * FROM table_name 
WHERE column_name IN (value1, value2, value3);
```
### 7. LIKE vs ILIKE 
```sql
-- for LIKE (Case-Sensitive)
SELECT * FROM table_name 
WHERE column_name LIKE pattern;
```
```sql
-- for ILIKE (Case-Insensitive)
SELECT * FROM table_name 
WHERE column_name ILIKE pattern;
```
```sql
-- Example for starting with any letter
select * from students where first_name like 'A%';
```
```sql
-- Example for starting with any letter (Case-Insensitive)
select * from students where first_name ilike 'A%';
```
```sql
-- Example for not starting with any letter (Case-Sensitive)
select * from students where first_name not like 'A%';
```
```sql
-- Example for not starting with any letter (Case-Insensitive)
select * from students where first_name not ilike 'A%';
```
```sql
-- Example for ending with any letter
select * from students where first_name not like '%A';
```
```sql
-- Example for not containing any letter
select * from students where first_name not like '%A%';
```
```sql
-- Example for not containing any letter at any position
select * from students where first_name not like '%A%e';
```
```sql
-- Example for not starting with any letter (at least 3 letters)
select * from students where first_name not like 'A___%';
```
```sql
-- Example for not starting with any letter (at least 3 letters) (Case-Insensitive)
select * from students where first_name not ilike 'A___%';
```
### 8. NOT and scalar functions 
```sql
-- for not
SELECT *
FROM employees
WHERE NOT (department = 'Sales' OR department = 'Marketing');
```
```sql
-- for scalar functions ("LOWER")
SELECT 
    LOWER('Samia') AS lowercase_name;
```
```sql
-- for scalar functions ("UPPER")
SELECT 
    UPPER('Samia') AS uppercase_name;
```
```sql
-- for scalar functions ("TRIM")
SELECT 
    TRIM('   Samia   ') AS trimmed_name;
```
```sql
-- for scalar functions ("LENGTH")
SELECT 
    LENGTH('Samia') AS name_length;
```
```sql
-- for scalar functions ("SUBSTRING")
SELECT 
    SUBSTRING('Samia', 1, 3) AS substring;
```
```sql
-- for scalar functions ("CONCAT")
SELECT 
    CONCAT('Samia', ' ', 'Ahmed') AS full_name;
```
```sql
-- for scalar functions ("REPLACE")
SELECT 
    REPLACE('Samia', 'a', 'x') AS replaced_name;
```
```sql
-- for scalar functions ("ROUND")
SELECT 
    ROUND(3.14159, 2) AS rounded_number;
```
```sql
-- for scalar functions ("CEILING")
SELECT 
    CEILING(3.14159) AS ceiling_number;
```
```sql
-- for scalar functions ("FLOOR")
SELECT 
    FLOOR(3.14159) AS floor_number;
```
```sql
-- for scalar functions ("ABS")
SELECT 
    ABS(-3.14159) AS absolute_number;
```
```sql
-- for scalar functions ("MOD")
SELECT 
    MOD(3.14159, 2) AS modulo_number;
```
### 9. Aggregate functions explained 
```sql
-- for aggregate functions ("AVG")
SELECT 
    AVG(salary) AS average_salary
FROM employees;
```
```sql
-- for aggregate functions ("COUNT")
SELECT 
    COUNT(*) AS number_of_employees
FROM employees;
```
```sql
-- for aggregate functions ("MAX")
SELECT 
    MAX(salary) AS max_salary
FROM employees;
```
```sql
-- for aggregate functions ("MIN")
SELECT 
    MIN(salary) AS min_salary
FROM employees;
```
```sql
-- for aggregate functions ("SUM")
SELECT 
    SUM(salary) AS total_salary
FROM employees;
```
```sql
-- for aggregate functions ("ROUND", "AVG")
SELECT 
    ROUND(AVG(salary), 2) AS rounded_average_salary
FROM employees;
```