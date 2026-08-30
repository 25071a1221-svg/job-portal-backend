# Job Portal Backend API

A secure, role-based REST API for a Job Portal application. Built using **Node.js, Express.js, and MongoDB (Mongoose)**, it manages job postings, applications, and user accounts. It utilizes **JWT** stored in secure **httpOnly Cookies** for stateful backend session authentication and implements role-based access control.

---

## 🛠️ Technology Stack

- **Runtime Environment:** Node.js
- **Backend Framework:** Express.js
- **Database:** MongoDB with Mongoose (ODM)
- **Authentication:** JSON Web Tokens (JWT) stored in secure HTTP-Only Cookies
- **Password Security:** Password hashing using bcryptjs
- **Configuration:** Environment Variables using `dotenv`

---

## 👥 Roles & Capabilities

### 1. Job Seeker
- Register and Log In.
- View and update personal profile details (skills, education, experience).
- View all available (open) jobs and specific job details.
- Apply to a job posting (duplicate applications are blocked).
- View their own submitted applications and tracking statuses.
- Log Out.

### 2. Employer
- Register and Log In.
- Create and manage (update/delete) their own job postings.
- View applications received for jobs they own.
- Update the status of job applications (`reviewed`, `shortlisted`, `rejected`, `accepted`).
- Log Out.

### 3. Administrator
- View statistics of the platform (user totals, job counts, application counts).
- View and manage (suspend/activate/delete) all registered users.
- View all job postings (open and closed).
- Remove inappropriate or invalid job postings.

---

## 📂 Database Schema Architecture

- **User Model (`User.js`):** Encapsulates account details, hashed passwords, roles (`seeker`, `employer`, `admin`), status (`active`, `suspended`), and embedded profile details (skills list, education history, work experience) for seekers.
  - *Design justification:* Embedding profile info inside the User model keeps related seeker details contained within the user context, reducing the need for costly database joins on reading profiles.
- **Job Model (`Job.js`):** Contains postings details and references the Employer (`User` model) who posted the job.
- **Application Model (`Application.js`):** Connects a Job Seeker and a Job. Utilizes a compound unique index `{ job: 1, jobSeeker: 1 }` to prevent multiple applications for the same job.

---

## 🚀 Getting Started

### 📋 Prerequisites
- **Node.js** (v16+ recommended)
- **MongoDB** running locally or a MongoDB Atlas URI

### ⚙️ Installation
1. Clone the project and navigate to the project directory:
   ```bash
   cd JobPortal
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env` file in the root folder using `.env.example` as a template:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/job-portal
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

### 🏃 Running the Application
- **Development Mode** (with Nodemon file-watching):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## 📌 API Endpoint Reference

### 🔐 Authentication & Profile (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register a new user (Seeker, Employer, or Admin) |
| `POST` | `/login` | Public | Log in user and set JWT in HTTP-only cookie |
| `POST` | `/logout` | Private | Log out user and clear authentication cookie |
| `GET` | `/profile` | Private | Get authenticated user's profile |
| `PUT` | `/profile` | Private | Update authenticated user's profile details |

### 💼 Job Management (`/api/jobs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Private (Employer) | Create a new job posting |
| `GET` | `/` | Public | View all available open jobs |
| `GET` | `/my-jobs` | Private (Employer) | View jobs posted by the logged-in Employer |
| `GET` | `/:id` | Public | View details of a specific job by ID |
| `PUT` | `/:id` | Private (Employer) | Update details of a job posting (owner-only) |
| `DELETE` | `/:id` | Private (Employer) | Delete a job posting (owner-only) |

### 📄 Job Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Private (Seeker) | Apply for a specific job |
| `GET` | `/my-applications` | Private (Seeker) | View applications submitted by Seeker |
| `GET` | `/job/:jobId` | Private (Employer) | View applications received for a job (owner-only) |
| `PUT` | `/:id/status` | Private (Employer) | Update application status (owner-only) |

### 👑 Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Private (Admin) | Retrieve platform-wide metrics & stats |
| `GET` | `/users` | Private (Admin) | List all registered users |
| `GET` | `/users/:id` | Private (Admin) | View details of a specific user |
| `PUT` | `/users/:id/status` | Private (Admin) | Suspend or activate a user account |
| `DELETE` | `/users/:id` | Private (Admin) | Delete a user (and related jobs/applications) |
| `GET` | `/jobs` | Private (Admin) | View all jobs (open and closed) |
| `DELETE` | `/jobs/:id` | Private (Admin) | Remove/delete inappropriate job postings |

---

## 📮 API Testing with Postman

A pre-configured Postman Collection is included at [`JobPortal.postman_collection.json`](file:///c:/Users/HP/Documents/JobPortal/JobPortal.postman_collection.json).

### Running Tests in Postman:
1. Open Postman, click **Import**, and select [`JobPortal.postman_collection.json`](file:///c:/Users/HP/Documents/JobPortal/JobPortal.postman_collection.json).
2. Set the collection-level variables (e.g., `job_id`, `application_id`, `user_id`) to test specific records.
3. Test cookie-based authentication: because the API returns an `httpOnly` cookie named `token`, Postman automatically stores and includes the cookie in subsequent requests.
