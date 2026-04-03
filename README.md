# Assignment Tracker (Student Productivity Dashboard)

> A polished, modern assignment tracker built for students, combining a professional UI with practical features like dashboard analytics, calendar planning, and task lifecycle management.

## 🚀 Project Summary

Assignment Tracker is a full-featured front-end web app with optional Go backend support. It empowers users to manage coursework deadlines, prioritize tasks, and track completion progress via a sleek and responsive interface inspired by tools like Todoist and Notion.

## ⭐ Core Features

- **Professional UI** with modern gradients, soft shadows, and responsive layout
- **Dashboard view**: stats counters for total, completed, pending, overdue assignments
- **Assignments view**: add/edit/delete, completion toggles, priority badges
- **Calendar view**: monthly layout with per-day assignment indicators
- **Filtering**: by all/pending/today/upcoming/completed status
- **Search**: instant filtering by title or subject
- **Dark mode toggle** with persisted preference
- **Local storage persistence** (fallback when backend unavailable)
- **JSON export** of assignments for backup/transfer
- **Optional backend** via Go + Gin + GORM + MySQL

## 🛠 Tech Stack

- Frontend
  - React 19
  - Vite
  - Tailwind CSS
  - Lucide React icons
  - Heroicons

- Backend (optional)
  - Go (Gin)
  - GORM (MySQL)

## 📦 Getting Started

### Prerequisites

- Node.js >= 16
- npm
- (Optional backend) Go >= 1.23, MySQL

### Frontend Setup

```bash
git clone <repository-url>
cd Assignment_tracker-main
npm install
npm run dev
```

Open: `http://localhost:5173`

### Production Build

```bash
npm run build
```

### Optional Go Backend Setup

1. Create MySQL DB (e.g., `assignment_tracker`)
2. Update DSN in `main.go`
3. Run:

```bash
go mod tidy
go run main.go
```

4. Frontend auto-detects backend and uses API if available.

## 🧩 Usage Guide

### Add a new assignment

1. Click **Add Assignment**
2. Enter title, description, subject, due date, priority
3. Save

### Modify an assignment

- **Edit**: click Edit on card
- **Delete**: click X on card
- **Complete**: click checkbox button

### Switch views

- **Dashboard** for analytics and progress
- **Assignments** for task cards
- **Calendar** for date-based planning

### Export data

- Click **Export** to download `assignments.json`

## 🗂 Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx
│   └── Calendar.jsx
├── App.jsx
├── main.jsx
└── index.css

main.go (optional backend)
index.html
package.json
```

## ✅ Future Improvements

- authentication and multi-user spaces
- persistent backend data storage (API + DB + JWT sessions)
- reminders and notifications
- recurring assignment schedule
- mobile-oriented bottom nav
- calendar integrations (Google, Outlook)
- file attachments and notes

## 🤝 Contributing

1. Fork
2. Create branch: `feat/your-feature`
3. Commit and push
4. Open PR

## 📄 License

MIT License

