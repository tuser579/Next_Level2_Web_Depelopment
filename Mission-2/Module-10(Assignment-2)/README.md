# 🛠️ DevPulse – Assignment Requirements Specification

**DevPulse** is a robust, industrial-grade Issue Tracking System built with modern backend technologies. It provides a comprehensive solution for managing technical issues, featuring secure authentication, role-based access control (RBAC), and efficient data management.

---

## 🚀 Live Demo
Check out the live API here: [Live URL](https://express-postgresql-server.vercel.app/)

---

## ✨ Key Features
- **Secure Authentication**: JWT-based login and registration system with password encryption via bcrypt.
- **Role-Based Access Control**: Different permissions for Reporters and Admins.
- **Comprehensive Issue Management**: Full CRUD operations for tracking bugs, features, and tasks.
- **Advanced Data Operations**: Support for filtering, sorting (newest/oldest), and pagination.
- **Cloud Database Integration**: Powered by PostgreSQL on Neon Serverless Cloud for high availability.

---

## 🛠️ Technology Stack
| Category | Technology |
| :--- | :--- |
| **Backend Framework** | Express.js (Node.js) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Neon Cloud) |
| **Security** | JSON Web Token (JWT), bcrypt |
| **Deployment** | Vercel |

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT token |

### Issues Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/issues` | Create a new issue (Reporters/Admins) |
| `GET` | `/api/issues` | Retrieve all issues with sorting and filtering |
| `GET` | `/api/issues/:id` | Get detailed information for a specific issue |
| `PUT` | `/api/issues/:id` | Update issue details (Status, Priority, etc.) |
| `DELETE` | `/api/issues/:id` | Permanently remove an issue |

---

## 🗃️ Database Architecture
The system utilizes a relational schema optimized for performance and data integrity:

- **Users Table**: Stores user profiles, credentials, and roles (`id`, `name`, `email`, `password`, `role`).
- **Issues Table**: Tracks issue status and details (`id`, `title`, `description`, `type`, `status`, `reporter_id`).

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL (Neon Cloud account recommended)

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/tuser579/Module-10-Assignment-2--DevPulse.git
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Environment Configuration**
   Create a `.env` file in the root directory and add your database credentials and JWT secret.
4. **Initialize Database**
   ```bash
   npm run setup-db
   ```
5. **Launch Application**
   ```bash
   npm run dev
   ```

---

## 📦 Deployment

Deploy the application seamlessly to Vercel:

1. **Build the project**
   ```bash
   npm run build
   ```
2. **Login to Vercel**
   ```bash
   vercel login
   ```
3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 📄 License
This project is for academic/assignment purposes under the Programming Hero Level-2 curriculum.
