🚴 BikeNest – Vehicle Rental Management System

BikeNest is a full-stack web application for renting bikes & scooters.
It includes a public booking system and a full admin dashboard for managing vehicles and bookings.

Built with:
	•	Node.js + Express (Backend)
	•	PostgreSQL (NeonDB Cloud)
	•	Bootstrap 5 (Frontend UI)
	•	Render.com (Deployment)

⸻

⭐ Features

🔹 User Features
	•	View all available bikes & scooters
	•	Open booking page for a specific vehicle
	•	Fill details and confirm booking
	•	Success and error messages shown properly

🔹 Admin Features
	•	Secure Admin Login
	•	Beautiful Dark Theme Dashboard
	•	Manage Vehicles
	•	Add new vehicle
	•	Toggle availability
	•	Soft-delete if vehicle has past bookings
	•	Manage Bookings
	•	View all bookings
	•	Mark bookings as returned
	•	Automatically makes vehicle available again
🏗 Tech Stack
Layer
Technology
Frontend
HTML, CSS, Bootstrap, JavaScript
Backend
Node.js, Express.js
Database
PostgreSQL (NeonDB)
Deployment
Render.com
Others
UUID, dotenv, CORS

📁 Project Structure
BikeNest/
│
├── backend/
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   ├── vehicles.js
│   │   ├── bookings.js
│   │   └── admin.js
│   └── .env
│
├── public/
│   ├── index.html
│   ├── booking.html
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── manage-vehicles.html
│   ├── manage-bookings.html
│   └── css/, js/, images/
│
└── README.md

⚙️ Environment Variables
Create .env in the backend folder:
PG_URI=your_neon_database_url
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

🚀 How to Run Locally
1️⃣ Install dependencies
bash:
cd backend
npm install

2️⃣ Start the server
Server will run at:
http://localhost:3000

3️⃣ Open the frontend

