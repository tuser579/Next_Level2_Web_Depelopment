# PostgreSQL Database Datatypes List

This list categorizes PostgreSQL data types by their similarities and highlights the ones that are most widely used in modern web development.

## 🌟 Most Widely Used Data Types

These are the most common data types you will encounter and use on a daily basis:

| Category | Data Type | Storage Size | Best Use Case |
| :--- | :--- | :--- | :--- |
| **Numeric** | `INTEGER` | 4 bytes | Standard integers (e.g., user counts, quantities) |
| | `BIGINT` | 8 bytes | Large integers (e.g., global IDs, views) |
| | `SERIAL` | 4 bytes | Auto-incrementing integers (Best for Primary Keys) |
| | `DECIMAL` / `NUMERIC` | Varies | Exact precision decimal numbers (e.g., currency, prices) |
| **Character** | `VARCHAR(n)` | Varies | Variable-length strings with a length limit (e.g., names, emails) |
| | `TEXT` | Up to 2 GB | Unlimited length strings (e.g., descriptions, blog posts, comments) |
| **Date/Time** | `TIMESTAMP` | 8 bytes | Date and time (with or without timezone - ideal for `created_at`, `updated_at`) |
| | `DATE` | 4 bytes | Dates without time of day (e.g., birth dates) |
| **Boolean** | `BOOLEAN` | 1 byte | True/False values (e.g., `is_active`, `is_published`) |
| **JSON** | `JSONB` | Varies | Binary JSON data (Supports indexing, much faster to query than `JSON`) |
| **UUID** | `UUID` | 16 bytes | Universally Unique Identifiers (Excellent alternative to `SERIAL` for Primary Keys) |
| **Other** | `ARRAY` | Varies | Arrays of any other data type (e.g., `TEXT[]` for an array of tags) |
| | `ENUM` | 4 bytes | Static, ordered set of values (e.g., user roles: `admin`, `user`, `moderator`) |

---

## 📚 Specialized Data Types (Grouped by Category)

The following types are used for more specific, specialized use cases.

### 1. Additional Date/Time Types
| Data Type | Storage Size | Best Use Case |
| :--- | :--- | :--- |
| `TIME` | 8 bytes | Time of day without date |
| `INTERVAL` | 16 bytes | Time spans (e.g., "3 days 4 hours"). Includes variations like `INTERVAL DAY TO SECOND`, `INTERVAL HOUR TO MINUTE`, etc. |

### 2. Additional Numeric & Monetary Types
| Data Type | Storage Size | Best Use Case |
| :--- | :--- | :--- |
| `MONEY` | 8 bytes | Currency amounts (Note: `NUMERIC` is often preferred for currency calculations) |

### 3. Network Address Types
| Data Type | Storage Size | Best Use Case |
| :--- | :--- | :--- |
| `INET` | 7 or 19 bytes | IPv4 and IPv6 hosts and networks |
| `CIDR` | 7 or 19 bytes | IPv4 and IPv6 networks |
| `MACADDR` | 6 bytes | MAC addresses |
| `MACADDR8` | 8 bytes | MAC addresses (EUI-64 format) |

### 4. Full Text Search Types
| Data Type | Storage Size | Best Use Case |
| :--- | :--- | :--- |
| `TSVECTOR` | Varies | Document optimized for text search (stores preprocessed documents) |
| `TSQUERY` | Varies | Text search queries (represents a search query) |

### 5. Geometric Types
| Data Type | Storage Size | Best Use Case |
| :--- | :--- | :--- |
| `POINT` | 16 bytes | Point on a plane (x, y coordinates) |
| `LINE` | 32 bytes | Infinite line |
| `LSEG` | 32 bytes | Line segment |
| `BOX` | 32 bytes | Rectangular box |
| `PATH` | 16+16n bytes | Geometric path (open or closed) |
| `POLYGON` | 40+16n bytes | Closed geometric path |
| `CIRCLE` | 24 bytes | Circle (center point and radius) |

### 6. Bit String Types
| Data Type | Storage Size | Best Use Case |
| :--- | :--- | :--- |
| `BIT` / `BIT(n)` | n bits | Fixed-length bit string |
| `BIT VARYING(n)` | Varies | Variable-length bit string |

### 7. JSON and XML Types
| Data Type | Storage Size | Best Use Case |
| :--- | :--- | :--- |
| `JSON` | Varies | Exact copy of input text (prefer `JSONB` for general use) |
| `XML` / `XMLTYPE` | Varies | Storing XML data safely |

