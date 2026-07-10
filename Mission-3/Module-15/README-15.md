# MODULE-15: POSTGRESQL ESSENTIALS — DATA, KEYS, AND JOINS
### 1. Handling NULL with COALESCE
```sql
-- It is not correct. It doesn't work.
select * from students email <> null;

-- It is correct.
SELECT * FROM students WHERE email IS NOT NULL;
```
```sql
-- for coalesce
select coalesce(email, "Not Provided") as email from students;
```
### 2. LIMIT, OFFSET, pagination
```sql
-- Get only first 5 data
SELECT * FROM students LIMIT 5;

-- Get 5 data after skipping 5 data
SELECT * FROM students LIMIT 5 OFFSET 5;
```
### 3. Updating and deleting data
```sql
-- Update data
UPDATE students SET first_name = 'Rana', last_name = 'Khan', email = [EMAIL_ADDRESS]' WHERE student_id = 1;

-- Delete data
DELETE FROM students WHERE student_id = 1;
```
### 4. GROUP BY and GROUP BY with HAVING
```sql
-- for group by 
SELECT country, avg(age) FROM students GROUP BY country;
```
```sql
-- for group by with having
SELECT country, avg(age) FROM students GROUP BY country HAVING avg(age) > 20;
```
### 5. Foreign key explained
```sql
-- for foreign key sql code when table creating
CREATE TABLE orders(
  order_id INT PRIMARY KEY,
  student_id INT,
  course_id INT,
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);
```
### 6. Understanding INNER JOIN
#### For understanding inner join following tables are given:
user table in readme table form:

| user_id | username | email |
| --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] |
| 2 | jane | [EMAIL_ADDRESS] |
| 3 | bob | [EMAIL_ADDRESS] |
| 4 | smith | [EMAIL_ADDRESS] |

post table in readme table form:

| post_id | user_id | title | body |
| --- | --- | --- | --- |
| 1 | 1 | john | john post |
| 2 | 2 | jane | jane post |
| 3 | 5 | guest | guest post |


output of inner join: 

| user_id | username | email | post_id | user_id | title | body |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] | 1 | 1 | john | john post |
| 2 | jane | [EMAIL_ADDRESS] | 2 | 2 | jane | jane post |
```sql
-- Show all post and author name if author is exists
select title, username from "post" as p join "user" as u on p.user_id = u.id;

-- Show all data of post and author name if author is exists
select * from "post" as p join "user" as u on p.user_id = u.id;

-- Select post id and author name
select p.id, username from "post" as p join "user" as u on p.user_id = u.id;
```
### 7. LEFT JOIN, RIGHT and FULL JOIN
#### For understanding left join following tables are given:
user table in readme table form:

| user_id | username | email |
| --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] |
| 2 | jane | [EMAIL_ADDRESS] |
| 3 | bob | [EMAIL_ADDRESS] |
| 4 | smith | [EMAIL_ADDRESS] |

post table in readme table form:

| post_id | user_id | title | body |
| --- | --- | --- | --- |
| 1 | 1 | john | john post |
| 2 | 2 | jane | jane post |
| 3 | 5 | guest | guest post |


output of left join: 

| user_id | username | email | post_id | user_id | title | body |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] | 1 | 1 | john | john post |
| 2 | jane | [EMAIL_ADDRESS] | 2 | 2 | jane | jane post |
| 3 | bob | [EMAIL_ADDRESS] | NULL | NULL | NULL | NULL |
| 4 | smith | [EMAIL_ADDRESS] | NULL | NULL | NULL | NULL |
```sql
-- for left join
select * from "user" as u left join "post" as p on u.id = p.user_id;
```
#### For understanding right join following tables are given:
user table in readme table form:

| user_id | username | email |
| --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] |
| 2 | jane | [EMAIL_ADDRESS] |
| 3 | bob | [EMAIL_ADDRESS] |
| 4 | smith | [EMAIL_ADDRESS] |

post table in readme table form:

| post_id | user_id | title | body |
| --- | --- | --- | --- |
| 1 | 1 | john | john post |
| 2 | 2 | jane | jane post |
| 3 | 5 | guest | guest post |


output of right join: 

| user_id | username | email | post_id | user_id | title | body |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] | 1 | 1 | john | john post |
| 2 | jane | [EMAIL_ADDRESS] | 2 | 2 | jane | jane post |
| NULL | NULL | NULL | 3 | 5 | guest | guest post |
```sql
-- for right join
select * from "user" as u right join "post" as p on u.id = p.user_id;
```
#### For understanding full join following tables are given:

user table in readme table form:

| user_id | username | email |
| --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] |
| 2 | jane | [EMAIL_ADDRESS] |
| 3 | bob | [EMAIL_ADDRESS] |
| 4 | smith | [EMAIL_ADDRESS] |

post table in readme table form:

| post_id | user_id | title | body |
| --- | --- | --- | --- |
| 1 | 1 | john | john post |
| 2 | 2 | jane | jane post |
| 3 | 5 | guest | guest post |


output of full join: 

| user_id | username | email | post_id | user_id | title | body |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] | 1 | 1 | john | john post |
| 2 | jane | [EMAIL_ADDRESS] | 2 | 2 | jane | jane post |
| 3 | bob | [EMAIL_ADDRESS] | NULL | NULL | NULL | NULL |
| 4 | smith | [EMAIL_ADDRESS] | NULL | NULL | NULL | NULL |
| NULL | NULL | NULL | 3 | 5 | guest | guest post |
```sql
-- for full join
select * from "user" as u full join "post" as p on u.id = p.user_id;
```
### 8. All joins overview (including CROSS and NATURAL join)
#### For understanding cross join following tables are given:

user table in readme table form:

| user_id | username | email |
| --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] |
| 2 | jane | [EMAIL_ADDRESS] |
| 3 | bob | [EMAIL_ADDRESS] |
| 4 | smith | [EMAIL_ADDRESS] |

post table in readme table form:

| post_id | user_id | title | body |
| --- | --- | --- | --- |
| 1 | 1 | john | john post |
| 2 | 2 | jane | jane post |
| 3 | 5 | guest | guest post |


output of cross join: 

| user_id | username | email | post_id | user_id | title | body |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] | 1 | 1 | john | john post |
| 1 | john | [EMAIL_ADDRESS] | 2 | 2 | jane | jane post |
| 1 | john | [EMAIL_ADDRESS] | 3 | 5 | guest | guest post |
| 2 | jane | [EMAIL_ADDRESS] | 1 | 1 | john | john post |
| 2 | jane | [EMAIL_ADDRESS] | 2 | 2 | jane | jane post |
| 2 | jane | [EMAIL_ADDRESS] | 3 | 5 | guest | guest post |
| 3 | bob | [EMAIL_ADDRESS] | 1 | 1 | john | john post |
| 3 | bob | [EMAIL_ADDRESS] | 2 | 2 | jane | jane post |
| 3 | bob | [EMAIL_ADDRESS] | 3 | 5 | guest | guest post |
| 4 | smith | [EMAIL_ADDRESS] | 1 | 1 | john | john post |
| 4 | smith | [EMAIL_ADDRESS] | 2 | 2 | jane | jane post |
| 4 | smith | [EMAIL_ADDRESS] | 3 | 5 | guest | guest post |
```sql
-- for cross join
select * from "user" cross join "post";
```
#### For understanding natural join following tables are given:

user table in readme table form:

| user_id | username | email |
| --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] |
| 2 | jane | [EMAIL_ADDRESS] |
| 3 | bob | [EMAIL_ADDRESS] |
| 4 | smith | [EMAIL_ADDRESS] |

post table in readme table form:

| post_id | user_id | title | body |
| --- | --- | --- | --- |
| 1 | 1 | john | john post |
| 2 | 2 | jane | jane post |
| 3 | 5 | guest | guest post |


output of natural join:

| user_id | username | email | post_id | title | body |
| --- | --- | --- | --- | --- | --- |
| 1 | john | [EMAIL_ADDRESS] | 1 | john | john post |
| 2 | jane | [EMAIL_ADDRESS] | 2 | jane | jane post |

#### For understanding natural join when there are no common columns, following tables are given:

category table:

| category_id | category_name |
| --- | --- |
| 1 | tech |
| 2 | life |

post table (without category_id):

| post_id | title |
| --- | --- |
| 1 | first post |
| 2 | second post |


output of natural join (acts like a CROSS JOIN): 

| category_id | category_name | post_id | title |
| --- | --- | --- | --- |
| 1 | tech | 1 | first post |
| 1 | tech | 2 | second post |
| 2 | life | 1 | first post |
| 2 | life | 2 | second post |
```sql
-- for natural join without common columns
select * from "category" natural join "post";
```