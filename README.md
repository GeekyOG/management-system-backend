---

# Inventory Management System

This is a Node.js-based inventory management system with role-based access control (RBAC), allowing different roles (admin, cashier, and manager) to manage inventory, orders, serial codes, and user permissions. The system also supports JWT-based authentication, order creation, and invoice management.

## Features

- **Authentication:** JWT-based authentication (access and refresh tokens).
- **User Roles:** Admin, cashier, and manager roles, each with different access levels.
- **Inventory Management:** CRUD operations for inventory, including handling serial codes.
- **Order Management:** Create, update, and delete orders with serial number allocation and invoice generation.
- **Permission System:** Role-based access to different features with dynamic permission assignment.
- **Swagger API Documentation:** Self-documenting API with Swagger.
- **Database Integration:** MySQL using Sequelize ORM.
- **Email Notification:** Sending emails to property owners for booking confirmations.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)
- **Documentation:** Swagger
- **Package Manager:** Pipenv (for Python dependencies) and npm (for Node.js dependencies)

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) (v14+)
- [MySQL](https://dev.mysql.com/downloads/installer/)
- [npm](https://www.npmjs.com/get-npm)

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/jite-jahswill/management-system-backend.git
   cd management-system-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up the database:**

   - Create a MySQL database and update the `.env` file with your database credentials.

   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=inventory_db
   JWT_SECRET=
   PORT=
   REFRESH_TOKEN_SECRET=
   EMAIL_USER=
   EMAIL_PASS=
   ```

4. **Run database migrations:**

   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Start the server:**

   ```bash
   npm start
   ```

   The app will run on `http://localhost:3000`.

## API Documentation

API documentation is available via Swagger. Once the server is running, visit:

```
http://localhost:3000/api-docs
```

## Project Structure

```
.
├── config             # Configuration files (database, environment)
├── controllers        # Controllers for handling API logic
├── middlewares        # JWT authentication and role verification
├── models             # Sequelize models (Users, Roles, Permissions, Inventory, Orders)
├── routes             # API routes (users, roles, inventory, orders)
├── services           # Business logic for different features
├── swagger            # Swagger documentation
├── utils              # Utility functions (e.g., email service)
├── .env.example       # Environment variable example
└── README.md          # Documentation
```

## Environment Variables

You need to set up environment variables in a `.env` file at the root of your project.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=inventory_db

JWT_SECRET=yourjwtsecret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=yourrefreshtokensecret
REFRESH_TOKEN_EXPIRES_IN=7d

EMAIL_SERVICE=smtp.example.com
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
```

## Running Tests

You can run the following command to run unit tests:

```bash
npm test
```

## Deployment

For deployment, configure your environment variables and set up your MySQL database in the production environment. Use `pm2` for process management.

## Contributing

Feel free to fork the project and submit pull requests for improvements or bug fixes.

## License

This project is licensed under the Jite-Jahswill & GeekyOgee License.

---
