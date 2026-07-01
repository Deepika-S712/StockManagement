# Smart Inventory Management System (SmartInventory)

A premium full-stack inventory audit, supplier recommendation, and reorder prediction system built with **Spring Boot (Java)**, **React (Vite)**, and **Chart.js**.

---

## 🚀 Live Demo on GitHub Pages
Click the link below to open the live-running application directly in your browser:
👉 **[Live Demo URL (https://deepika-s712.github.io/StockManagement/)](https://deepika-s712.github.io/StockManagement/)**

* **Login Credentials**: 
  * **Email**: `admin@test.com`
  * **Password**: `password`
* *Note: The live demo on GitHub Pages operates on a client-side mock database using `localStorage` to bypass Jekyll and serve backend operations natively in the browser.*

---

## ⚡ Premium Features Added

### 1. Dynamic UI Theme Selection
* Switch between **Emerald Oasis**, **Midnight Synth** (Dark Mode), **Oceanic Drift**, and **Sunset Amber** themes on the fly.
* Gradients, scrollbars, borders, and shadows transition smoothly. Preference is persisted in `localStorage`.

### 2. Live Activity Feed & Stock Timeline
* Audit logging of all stock transactions (`ADD` replenishments and `REDUCE` sales dispatches).
* Green/Amber color-coded status badges with relative date/time calculations.

### 3. Smart Purchase Order (PO) Simulator
* Click `⚡ Order PO` next to any reorder alert warning card on the dashboard.
* Instantly loads an invoice modal auto-pairing items with optimal suppliers, calculating total costs, showing lead-time shipping estimates, and executing a progress bar dispatch animation.

### 4. Interactive KPI progress Gauges
* Circular visual dashboard dials tracking **Stock Health**, **Monthly Sales Targets**, and **Supplier Ratings**.

### 5. Multi-Mode Analytics Charts
* Pill selector tab to toggle between **System Overview (Bar Chart)**, **Category Stock Distribution (Doughnut Chart)**, and **Sales velocity trends (Line Chart)**.

---

## 💻 Local Development Setup

To run this application locally on your computer (`localhost`):

### 1. Prerequisites
* **Java SDK 17** or higher
* **Node.js** (v20 recommended) & npm

### 2. Run the Backend Server (Spring Boot)
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Build and start the backend:
   ```bash
   ./mvnw spring-boot:run
   ```
3. The API will start on **`http://localhost:8080`**.
4. H2 In-Memory Database Console: **`http://localhost:8080/h2-console`**
   * *JDBC URL*: `jdbc:h2:mem:inventory_db`
   * *Username*: `sa`
   * *Password*: `password`

### 3. Run the Frontend Server (Vite / React)
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the link displayed in your console (usually **`http://localhost:5173`** or **`http://localhost:5174`**).

---

## 🛠️ Technologies Used
* **Frontend**: React 19, Axios, Chart.js, CSS variables (dynamic theming), HTML5.
* **Backend**: Spring Boot 3.2.3, Spring Data JPA, H2 database (local dev), Web (REST APIs), CORS filters.
* **CI/CD**: GitHub Actions workflow.

---

## 🧑‍💻 Author
**Deepika S**
* GitHub: [@Deepika-S712](https://github.com/Deepika-S712)
