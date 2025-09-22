# DashStack

A front-end assessment project built with **Angular** as part of an interview task.  
This is **not a production-ready project**, but rather a demonstration of skills and core concepts.

---

## ✨ Features Implemented
- **Data Layer**
  - Fetching data via `HttpClient` service
  - Small mock backend to serve data (for simulation)

- **Tables**
  - Interactive data tables with **sorting**, **filtering**, and **date-range selection (calendar filter)**
  - Built using **PrimeNG** components for enhanced UI/UX

- **Charts**
  - Multiple chart types (bar, line, pie)
  - **Tooltips** for drill-down functionality
  - Smooth **animations** for better visualization

- **Interactivity**
  - Filters (dropdowns, search, calendar)
  - Sorting and responsive updates

- **Responsiveness**
  - Mobile, tablet, and desktop views
  - Layout built with **Flexbox/Grid + SCSS**

- **Testing**
  - Unit tests for core components and services

- **Best Practices**
  - Standalone components
  - Dependency Injection
  - Clean file structure and maintainable code

---

## ⚠️ Notes
- This project is for **assessment purposes only**.  
- It demonstrates the requested functionalities plus extra features (**animations, PrimeNG integration, mock backend**).  
- It is **not a complete or production-ready application**.

---

## 🚀 Getting Started
### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/Galaxy1421/DashStack.git
cd DashStack
npm install
```
### 2. Run the backend
   ```bash
node server.js
```
The backend will start on port 4000.
To verify it’s running, open your browser and navigate to:
http://localhost:4000/api/team
This endpoint will return the team data in JSON format

### 3. Run the Angular app
 ```bash
ng serve
```
Once the server is running, open your browser and navigate to http://localhost:4200/ 


---

## 🔮 Future Improvements

- Dark Mode support
- More advanced drill-down with modal details
- Additional chart types and visualizations
- Extended test coverage
- Multi-language (i18n) support
