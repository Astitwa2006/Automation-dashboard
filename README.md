# AI Workflow Automation Dashboard 🚀

A production-grade, full-stack application that monitors, triggers, and visualises automated business workflows in real-time. This project showcases backend API design, NoSQL database modelling, real-time bi-directional WebSockets, and third-party webhook integrations (like n8n).

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs)
![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socketdotio)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 📖 Complete Technical Documentation

A beautifully formatted, detailed technical documentation with architecture diagrams, database schemas, and event flows is included in this repository.

👉 **[View the Full Technical Documentation Here](https://htmlpreview.github.io/?https://github.com/Astitwa2006/Automation-dashboard/blob/main/docs/index.html)** 👈

*(Alternatively, if you have cloned the repo, just open `docs/index.html` in your browser!)*

---

## ✨ Features

- **Real-Time Dashboard:** View live KPIs (Total Workflows, Active Runs, Success Rate, Leads Scored) that update instantly without refreshing.
- **Workflow Engine Simulation:** A custom backend engine that simulates multi-step workflows (Email Parsing, Lead Scoring, Data Syncing) with realistic delays and a 5% error probability to demonstrate error handling.
- **Bi-Directional WebSockets:** Watch workflows execute step-by-step in real-time with progress bars and live terminal logs streaming directly from the backend.
- **External Integrations:** Built-in webhook endpoints (`/api/webhooks/n8n`, `/email`, `/crm`) ready to be triggered by external tools like **n8n**, Postman, or CRMs.
- **Modern UI/UX:** Built with Next.js App Router, Tailwind CSS v4, Lucide Icons, and Recharts, featuring a dark-mode glassmorphism aesthetic.

---

## 🏗️ Architecture Overview

The system is decoupled into two main parts:

1. **Frontend (`/frontend`)**: A Next.js React application. It uses Axios for REST API calls (CRUD operations, triggering workflows) and Socket.IO-client to listen for real-time pushed events.
2. **Backend (`/backend`)**: A Node.js/Express application. It handles routing, Mongoose/MongoDB connections, the workflow execution engine, and the Socket.IO server.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- A MongoDB Atlas connection string

### 1. Backend Setup
```bash
cd backend
npm install

# Create a .env file and add your MongoDB connection string
echo "MONGODB_URI=your_mongodb_connection_string_here" > .env
echo "PORT=5001" >> .env

# Seed the database with sample workflows
npm run seed

# Start the server
npm run dev
```
The backend will run on `http://localhost:5001`.

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create a .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > .env.local

# Start the Next.js dev server
npm run dev
```
The frontend will run on `http://localhost:3000`.

---

## 🔗 n8n Webhook Integration

You can trigger the backend workflow engine directly from an **n8n** HTTP Request node!

1. In n8n, add an **HTTP Request** node.
2. Set the method to **POST**.
3. Set the URL to: `http://localhost:5001/api/webhooks/n8n` *(or your deployed Render URL)*.
4. Pass JSON body data. The backend will automatically intercept it, create an execution record, start the workflow engine, and push live updates to the dashboard.

---

## ☁️ Deployment

- **Backend:** Ready for 1-click deployment on **Render**. A `render.yaml` configuration file is included in the `backend/` directory. Just connect your GitHub repo to Render.
- **Frontend:** Ready for 1-click deployment on **Vercel**. Connect your repo, set the root directory to `frontend`, and add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed backend.

---
*Built as a Full-Stack Engineering Capstone Project.*
