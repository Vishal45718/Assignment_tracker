# Assignment Tracker

> A modern, responsive assignment management application for students, featuring multiple implementations: a React-based web app with optional backend support, and a standalone HTML/JavaScript version.

## Project Overview

Assignment Tracker helps students organize and track their coursework assignments effectively. The application provides a clean, intuitive interface for managing deadlines, prioritizing tasks, and monitoring progress. It includes both a full-featured React application with optional Go backend integration, and a lightweight standalone HTML/JavaScript version for simpler deployments.

## Core Features

- **Dashboard Analytics**: Visual statistics showing total, completed, pending, and overdue assignments
- **Assignment Management**: Add, edit, delete, and mark assignments as complete
- **Calendar View**: Monthly calendar with assignment indicators and date-based navigation
- **Smart Filtering**: Filter by status (all, pending, today, upcoming, completed)
- **Search Functionality**: Instant search by assignment title or subject
- **Dark Mode**: Toggle between light and dark themes with preference persistence
- **Data Persistence**: Local storage fallback with optional backend database storage
- **Data Export**: Export assignments to JSON for backup or transfer
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Priority System**: Assign priority levels (low, medium, high) to assignments
- **Subject Organization**: Categorize assignments by subject with color coding

## Technology Stack

### React Version (Primary)
- **Frontend**: React 19, Vite, Tailwind CSS
- **Icons**: Lucide React, Heroicons
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom CSS variables

### Backend (Optional)
- **Framework**: Go with Gin web framework
- **Database**: MySQL with GORM ORM
- **CORS**: Gin CORS middleware

### Standalone HTML Version
- **HTML5**: Semantic markup with modern features
- **CSS3**: Custom properties, flexbox, grid, and animations
- **Vanilla JavaScript**: ES6+ features with DOM manipulation
- **Fonts**: Google Fonts (Syne, DM Sans)

## Project Structure

```
assignment-tracker/
├── src/                          # React application source
│   ├── components/
│   │   ├── Dashboard.jsx         # Dashboard with statistics
│   │   └── Calendar.jsx          # Calendar component
│   ├── App.jsx                   # Main React application
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles and Tailwind imports
├── assignment-tracker.html       # Standalone HTML/JavaScript version
├── main.go                       # Go backend server
├── index.html                    # React app HTML template
├── package.json                  # Node.js dependencies and scripts
├── go.mod                        # Go module dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── eslint.config.js              # ESLint configuration
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- **For React Version**: Node.js >= 16, npm
- **For Backend**: Go >= 1.23, MySQL (optional)
- **For Standalone Version**: Modern web browser with JavaScript enabled

### React Version Setup

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd assignment-tracker
   npm install
   ```

2. **Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

3. **Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

### Optional Go Backend Setup

1. **Database Setup**:
   Create a MySQL database named `assignment_tracker`

2. **Backend Server**:
   ```bash
   go mod tidy
   go run main.go
   ```
   Server runs on [http://localhost:8080](http://localhost:8080)

3. **Integration**:
   The React app automatically detects and uses the backend when available. If the backend is unavailable, it falls back to local storage.

### Standalone HTML Version

Simply open `assignment-tracker.html` in a web browser. No server required - all functionality works locally with browser storage.

## Usage Guide

### Adding Assignments

1. Click the **"Add Assignment"** button
2. Fill in:
   - Title (required)
   - Description (optional)
   - Subject (required)
   - Due Date (required)
   - Priority (low/medium/high)
3. Click **Save**

### Managing Assignments

- **Complete**: Click the checkbox next to an assignment
- **Edit**: Click the edit icon on an assignment card
- **Delete**: Click the delete icon (with confirmation)
- **Filter**: Use the filter buttons to view specific assignment types
- **Search**: Type in the search box to filter by title or subject

### Navigation

- **Dashboard**: Overview with statistics and recent activity
- **Assignments**: Detailed list view of all assignments
- **Calendar**: Monthly view with assignment indicators

### Data Management

- **Export**: Click "Export" to download assignments as JSON
- **Import**: Data persists automatically in local storage or database
- **Dark Mode**: Toggle using the moon/sun icon in the top bar

## API Endpoints (Backend)

When the Go backend is running, the following REST API endpoints are available:

- `GET /api/assignments` - Retrieve all assignments
- `POST /api/assignments` - Create a new assignment
- `PUT /api/assignments/:id` - Update an existing assignment
- `DELETE /api/assignments/:id` - Delete an assignment
- `PUT /api/assignments/:id/complete` - Toggle completion status

## Configuration

### Backend Database

Update the DSN in `main.go`:
```go
dsn := "user:password@tcp(localhost:3306)/assignment_tracker?charset=utf8mb4&parseTime=True&loc=Local"
```

### CORS Settings

Modify CORS configuration in `main.go` for different frontend URLs.

## Future Enhancements

- User authentication and multi-user support
- Persistent backend with JWT sessions
- Push notifications for due dates
- Recurring assignment templates
- File attachments and rich text notes
- Calendar integrations (Google Calendar, Outlook)
- Mobile app versions
- Advanced analytics and reporting
- Collaboration features for group projects

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

