import React, { useState, useEffect } from 'react';
import { PlusIcon, SearchIcon, MoonIcon, SunIcon, CheckIcon, XIcon, HomeIcon, CalendarIcon, ChartBarIcon } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';

const API_BASE_URL = 'http://localhost:8080/api';

function App() {
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [useBackend, setUseBackend] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    subject: '',
    priority: 'medium'
  });

  useEffect(() => {
    // Check if backend is available
    fetch(`${API_BASE_URL}/assignments`, { method: 'GET' })
      .then(() => {
        setUseBackend(true);
        loadAssignmentsFromAPI();
      })
      .catch(() => {
        setUseBackend(false);
        loadAssignmentsFromLocalStorage();
      });

    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (!useBackend) {
      localStorage.setItem('assignments', JSON.stringify(assignments));
    }
  }, [assignments, useBackend]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadAssignmentsFromLocalStorage = () => {
    const saved = localStorage.getItem('assignments');
    if (saved) {
      setAssignments(JSON.parse(saved));
    }
  };

  const loadAssignmentsFromAPI = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`);
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const saveAssignmentToAPI = async (assignment) => {
    try {
      const method = assignment.id ? 'PUT' : 'POST';
      const url = assignment.id
        ? `${API_BASE_URL}/assignments/${assignment.id}`
        : `${API_BASE_URL}/assignments`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to save assignment:', error);
      throw error;
    }
  };

  const deleteAssignmentFromAPI = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/assignments/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      throw error;
    }
  };

  const toggleCompleteInAPI = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/assignments/${id}/complete`, { method: 'PUT' });
      return await response.json();
    } catch (error) {
      console.error('Failed to toggle complete:', error);
      throw error;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = filter === 'all' ||
      (filter === 'completed' && assignment.completed) ||
      (filter === 'pending' && !assignment.completed) ||
      (filter === 'today' && new Date(assignment.dueDate).toDateString() === new Date().toDateString()) ||
      (filter === 'upcoming' && new Date(assignment.dueDate) > new Date() && !assignment.completed);

    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const assignmentData = editingAssignment
      ? { ...editingAssignment, ...formData }
      : { ...formData, completed: false, createdAt: new Date().toISOString() };

    try {
      if (useBackend) {
        const savedAssignment = await saveAssignmentToAPI(assignmentData);
        if (editingAssignment) {
          setAssignments(assignments.map(a => a.id === editingAssignment.id ? savedAssignment : a));
        } else {
          setAssignments([...assignments, savedAssignment]);
        }
      } else {
        if (editingAssignment) {
          setAssignments(assignments.map(a =>
            a.id === editingAssignment.id ? { ...a, ...formData } : a
          ));
        } else {
          const newAssignment = {
            id: Date.now(),
            ...formData,
            completed: false,
            createdAt: new Date().toISOString()
          };
          setAssignments([...assignments, newAssignment]);
        }
      }
    } catch (error) {
      alert('Failed to save assignment. Please try again.');
      return; // Don't reset form or close modal if there was an error
    }

    setFormData({ title: '', description: '', dueDate: '', subject: '', priority: 'medium' });
    setShowModal(false);
    setEditingAssignment(null);
  };

  const toggleComplete = async (id) => {
    try {
      if (useBackend) {
        const updatedAssignment = await toggleCompleteInAPI(id);
        setAssignments(assignments.map(a => a.id === id ? updatedAssignment : a));
      } else {
        setAssignments(assignments.map(a =>
          a.id === id ? { ...a, completed: !a.completed } : a
        ));
      }
    } catch (error) {
      alert('Failed to update assignment. Please try again.');
    }
  };

  const deleteAssignment = async (id) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      if (useBackend) {
        await deleteAssignmentFromAPI(id);
      }
      setAssignments(assignments.filter(a => a.id !== id));
    } catch (error) {
      alert('Failed to delete assignment. Please try again.');
    }
  };

  const editAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.due_date || assignment.dueDate.split('T')[0], // Handle different date formats
      subject: assignment.subject,
      priority: assignment.priority
    });
    setShowModal(true);
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Math': '#6c63ff',
      'Science': '#ff6eb4',
      'English': '#4ade80',
      'History': '#f59e0b',
      'Computer Science': '#06b6d4',
      'Art': '#ec4899',
      'default': '#6c63ff'
    };
    return colors[subject] || colors.default;
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon" style={{fontFamily: 'Syne, sans-serif'}}>AF</div>
          <div className="logo-text">
            Assign<span>Flow</span>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Navigation</div>
          <div className="nav-item active" onClick={() => setCurrentView('dashboard')}>
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <span>Dashboard</span>
          </div>
          <div className="nav-item" onClick={() => setCurrentView('assignments')}>
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
              </svg>
            </div>
            <span>Assignments</span>
            <div className="nav-badge">{assignments.length}</div>
          </div>
          <div className="nav-item" onClick={() => setCurrentView('calendar')}>
            <div className="nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <span>Calendar</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar" style={{background: 'linear-gradient(135deg, #6c63ff, #ff6eb4)'}}>
              U
            </div>
            <div className="user-info">
              <div className="name">Student</div>
              <div className="role">Premium</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title" style={{fontFamily: 'Syne, sans-serif'}}>
            {currentView === 'dashboard' && 'Dashboard'}
            {currentView === 'assignments' && 'Assignments'}
            {currentView === 'calendar' && 'Calendar'}
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div className="search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="icon-btn" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            <button className="btn btn-primary" onClick={() => {
              setShowModal(true);
              setEditingAssignment(null);
              setFormData({ title: '', description: '', dueDate: '', subject: '', priority: 'medium' });
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Assignment
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {currentView === 'dashboard' && (
            <>
              {/* Stats Row */}
              <div className="stats-row">
                <div className="stat-card s-purple" style={{animationDelay: '.05s'}}>
                  <div className="stat-top">
                    <div className="stat-icon purple">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                    </div>
                  </div>
                  <div className="stat-num">{assignments.length}</div>
                  <div className="stat-label">Total Assignments</div>
                </div>

                <div className="stat-card s-green" style={{animationDelay: '.1s'}}>
                  <div className="stat-top">
                    <div className="stat-icon green">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="stat-num">{assignments.filter(a => a.completed).length}</div>
                  <div className="stat-label">Completed</div>
                </div>

                <div className="stat-card s-amber" style={{animationDelay: '.15s'}}>
                  <div className="stat-top">
                    <div className="stat-icon amber">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                  </div>
                  <div className="stat-num">{assignments.filter(a => !a.completed).length}</div>
                  <div className="stat-label">Pending</div>
                </div>

                <div className="stat-card s-red" style={{animationDelay: '.2s'}}>
                  <div className="stat-top">
                    <div className="stat-icon red">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </div>
                  </div>
                  <div className="stat-num">{assignments.filter(a => !a.completed && new Date(a.dueDate) < new Date()).length}</div>
                  <div className="stat-label">Overdue</div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="two-col">
                <div className="panel">
                  <div className="section-hd">
                    <h2>Recent Assignments</h2>
                    <div className="view-all" onClick={() => setCurrentView('assignments')}>View All</div>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Assignment</th>
                          <th>Subject</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.slice(0, 5).map(assignment => (
                          <tr key={assignment.id}>
                            <td>
                              <div className="assignment-title-cell">
                                <div className="subject-dot" style={{backgroundColor: getSubjectColor(assignment.subject)}}></div>
                                <div className="assignment-name">{assignment.title}</div>
                              </div>
                            </td>
                            <td>{assignment.subject}</td>
                            <td>
                              <span className={`priority-badge ${assignment.priority}`}>
                                {assignment.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${assignment.completed ? 'done' : 'todo'}`}>
                                {assignment.completed ? 'Done' : 'To Do'}
                              </span>
                            </td>
                            <td>
                              <div className={`due-date ${isOverdue(assignment.dueDate) && !assignment.completed ? 'overdue' : ''}`}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                  <line x1="16" y1="2" x2="16" y2="6"></line>
                                  <line x1="8" y1="2" x2="8" y2="6"></line>
                                  <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="panel" style={{marginBottom: '20px'}}>
                    <h2 style={{fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700', marginBottom: '16px'}}>Upcoming Deadlines</h2>
                    <div>
                      {assignments
                        .filter(a => !a.completed && new Date(a.dueDate) >= new Date())
                        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                        .slice(0, 3)
                        .map(assignment => (
                          <div key={assignment.id} className="deadline-item">
                            <div className={`deadline-date-box ${isOverdue(assignment.dueDate) ? 'urgent' : ''}`}>
                              <div className="day">{new Date(assignment.dueDate).getDate()}</div>
                              <div className="month">{new Date(assignment.dueDate).toLocaleDateString('en', {month: 'short'}).toUpperCase()}</div>
                            </div>
                            <div className="deadline-info">
                              <div className="deadline-title">{assignment.title}</div>
                              <div className="deadline-meta">{assignment.subject} • {assignment.priority} priority</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="quick-add">
                    <h3>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Quick Add Assignment
                    </h3>
                    <form onSubmit={handleSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-input"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            placeholder="Assignment title"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Subject</label>
                          <input
                            type="text"
                            className="form-input"
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            placeholder="Subject"
                          />
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Due Date</label>
                          <input
                            type="date"
                            className="form-input"
                            required
                            value={formData.dueDate}
                            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Priority</label>
                          <select
                            className="form-select"
                            value={formData.priority}
                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group full">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-input"
                          rows="3"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="Description (optional)"
                          style={{resize: 'vertical', minHeight: '60px'}}
                        />
                      </div>
                      <button type="submit" className="form-submit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Assignment
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentView === 'assignments' && (
            <>
              <div className="section-hd" style={{marginBottom: '16px'}}>
                <h2 style={{fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700'}}>All Assignments</h2>
                <div className="filters">
                  {[
                    { key: 'all', label: 'All', count: assignments.length },
                    { key: 'pending', label: 'Pending', count: assignments.filter(a => !a.completed).length },
                    { key: 'today', label: 'Due Today', count: assignments.filter(a => new Date(a.dueDate).toDateString() === new Date().toDateString() && !a.completed).length },
                    { key: 'upcoming', label: 'Upcoming', count: assignments.filter(a => new Date(a.dueDate) > new Date() && !a.completed).length },
                    { key: 'completed', label: 'Completed', count: assignments.filter(a => a.completed).length }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`filter-chip ${filter === key ? 'active' : ''}`}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Subject</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map(assignment => (
                      <tr key={assignment.id}>
                        <td>
                          <div className="assignment-title-cell">
                            <div className="subject-dot" style={{backgroundColor: getSubjectColor(assignment.subject)}}></div>
                            <div className="assignment-name">{assignment.title}</div>
                          </div>
                        </td>
                        <td>{assignment.subject}</td>
                        <td>
                          <span className={`priority-badge ${assignment.priority}`}>
                            {assignment.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${assignment.completed ? 'done' : 'todo'}`}>
                            {assignment.completed ? 'Done' : 'To Do'}
                          </span>
                        </td>
                        <td>
                          <div className={`due-date ${isOverdue(assignment.dueDate) && !assignment.completed ? 'overdue' : ''}`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="row-action-btn" onClick={() => editAssignment(assignment)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button className="row-action-btn" onClick={() => deleteAssignment(assignment.id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {currentView === 'calendar' && <Calendar assignments={assignments} />}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}</h2>
              <button className="modal-close" onClick={() => {
                setShowModal(false);
                setEditingAssignment(null);
                setFormData({ title: '', description: '', dueDate: '', subject: '', priority: 'medium' });
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Assignment title"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Subject"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Description (optional)"
                    style={{resize: 'vertical', minHeight: '80px'}}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => {
                  setShowModal(false);
                  setEditingAssignment(null);
                  setFormData({ title: '', description: '', dueDate: '', subject: '', priority: 'medium' });
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;