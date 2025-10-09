# ⚡ QuickPost — Mini Postman for Chrome

**QuickPost** is a lightweight and fast Chrome extension built with **React + Vite**, designed to act as a **mini Postman** directly inside your browser.  
It allows developers to send API requests (GET, POST, PUT, PATCH, DELETE) without leaving their workflow.

---

## 🚀 Features

✅ **Fast Request Testing**
- Send GET, POST, PUT, PATCH, and DELETE requests instantly.  
- Enter custom URLs and headers easily.

✅ **Header Manager**
- Add, remove, and toggle headers dynamically.  
- Tooltips show full header key/value on hover.

✅ **Request Body Editor**
- Write and send JSON or raw text payloads.  
- Syntax-friendly monospace input for clarity.

✅ **Response Viewer**
- View responses in two modes:  
  - **Pretty (formatted JSON)**  
  - **Raw (plain text)**  
- Automatically highlights successful (`✓`) or failed (`✗`) responses.

✅ **Request History**
- Automatically saves the last **20 API requests** (method, URL, status, date/time).  
- Pagination for easy browsing (10 per page).  
- Click any history entry to re-populate the form with previous settings.

✅ **Polished Interface**
- Clean modern UI with **orange & charcoal theme**.  
- Responsive dropdowns, tooltips, and subtle animations.

---

## 🛠️ Tech Stack

- **React 18**  
- **Vite**  
- **TypeScript**  
- **CSS Modules / Variables**  
- **Chrome Extension Manifest v3**

---

## 🧩 Installation (as Chrome Extension)

Follow these quick steps to install **QuickPost** locally:

1. Run a production build:
   ```bash
   npm install
   npm run build
