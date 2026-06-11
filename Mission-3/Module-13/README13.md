# Summary of this module:

## Learning concepts of SQL and database management.

### Key concepts:
1. Integer and Boolean data types
Integer datatype list:
- SERIAL  size: 4 bytes  range: 1 to 2,147,483,647   use for auto increment id
- BIGSERIAL size: 8 bytes  range: 1 to 9,223,372,036,854,775,807 use for auto increment id
- INTEGER  size: 4 bytes  range: -2,147,483,648 to 2,147,483,647   use for id
- BIGINT   size: 8 bytes  range: -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807  use for large id
- SMALLINT size: 2 bytes  range: -32,768 to 32,767  use for small id
- TINYINT  size: 1 byte   range: -128 to 127  use for very small id
- INT      size: 4 bytes  range: -2,147,483,648 to 2,147,483,647  use for id

Boolean datatype list:
- BOOLEAN
- BOOL

2. Character, Date, and UUID data types
Character datatype list:
- VARCHAR  size: 1 to 65,535 bytes  use for variable length strings
- TEXT     size: 1 to 2,147,483,647 bytes  use for variable length strings
- CHAR     size: 1 to 255 bytes  use for fixed length strings
- CHARACTER size: 1 to 255 bytes  use for fixed length strings
- CHARACTER VARYING size: 1 to 65,535 bytes  use for variable length strings

Date datatype list:
- DATE     size: 4 bytes  use for date
- TIME     size: 8 bytes  use for time
- TIMESTAMP size: 8 bytes  use for date and time
- INTERVAL size: 16 bytes  use for time interval

UUID datatype list:
- UUID     size: 16 bytes  use for unique identifier

3. Create and drop database / table
```sql
create database database_name;
drop database database_name;
```
```sql
create table table_name (
    column_name data_type,
    column_name data_type,
    column_name data_type
);
drop table table_name;
```
4. Column constraints
```sql
create table table_name (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    age INTEGER DEFAULT 18,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reference_id INTEGER REFERENCES other_table(id)
);
```
5. Multiple constraints and INSERT
```sql
-- multiple constraints
create table students (
  id serial auto_increment,
  username varchar(20) not null,
  email varchar(100),
  age smallint check (age >= 18),
  isActive boolean default true,
  primary key (id),
  unique(username, email)
);
```

```sql
-- single entity insert
insert into students (username, email, age, isActive)
values ('john_doe', [EMAIL_ADDRESS]', 20, true);
```

```sql
-- multiple entity insert
insert into students (username, email, age, isActive)
values ('john_doe', [EMAIL_ADDRESS]', 20, true),
('jane_doe', [EMAIL_ADDRESS]', 21, false),
('bob_smith', [EMAIL_ADDRESS]', 22, true);
```

```sql
-- insert without column names
insert into students
values ('john_doe', [EMAIL_ADDRESS]', 20, true);
```
6. Insert data methods   
7. Insert without column names

