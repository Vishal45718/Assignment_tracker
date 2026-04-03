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

      setFormData({ title: '', description: '', dueDate: '', subject: '', priority: 'medium' });
      setShowModal(false);
      setEditingAssignment(null);
    } catch (error) {
      alert('Failed to save assignment. Please try again.');
    }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const isOverdue = (dueDate) => {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const exportAssignments = () => {
    const dataStr = JSON.stringify(assignments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'assignments.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const navigation = [
    { name: 'Dashboard', key: 'dashboard', icon: HomeIcon },
    { name: 'Assignments', key: 'assignments', icon: CheckIcon },
    { name: 'Calendar', key: 'calendar', icon: CalendarIcon },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-slate-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignment Tracker</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {useBackend ? 'Connected to backend' : 'Local storage mode'}
              </div>
              <button
                onClick={exportAssignments}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Export
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Assignment</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-gray-200 dark:border-slate-700 shadow-lg p-6 sm:p-8 backdrop-blur">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <p className="text-sm font-semibold tracking-wide uppercase text-blue-600 dark:text-cyan-300">Student productivity built for you</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold leading-tight text-slate-900 dark:text-white">Smart Assignment Hub</h2>
              <p className="mt-3 max-w-xl text-gray-600 dark:text-gray-300">Manage due dates, keep track of progress, and stay on top of your schedule with analytics and calendar insights.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentView('dashboard')} className="rounded-lg px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition-shadow">View Dashboard</button>
              <button onClick={() => setCurrentView('assignments')} className="rounded-lg px-4 py-2 border border-blue-500 text-blue-700 dark:text-blue-200 dark:border-blue-300 bg-white dark:bg-slate-800 font-semibold hover:bg-blue-50 dark:hover:bg-slate-700">View Assignments</button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <nav className="space-y-2 mb-6">
                {navigation.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setCurrentView(item.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                      currentView === item.key
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>

              {currentView === 'assignments' && (
                <>
                  <h2 className="text-lg font-semibold mb-4">Filters</h2>
                  <div className="space-y-2">
                    {[
                      { key: 'all', label: 'All Assignments', count: assignments.length },
                      { key: 'pending', label: 'Pending', count: assignments.filter(a => !a.completed).length },
                      { key: 'today', label: 'Due Today', count: assignments.filter(a => new Date(a.dueDate).toDateString() === new Date().toDateString() && !a.completed).length },
                      { key: 'upcoming', label: 'Upcoming', count: assignments.filter(a => new Date(a.dueDate) > new Date() && !a.completed).length },
                      { key: 'completed', label: 'Completed', count: assignments.filter(a => a.completed).length }
                    ].map(({ key, label, count }) => (
                      <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          filter === key
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {label} ({count})
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {currentView === 'dashboard' && <Dashboard assignments={assignments} />}

            {currentView === 'assignments' && (
              <>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>

                {/* Assignments Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredAssignments.map(assignment => (
                    <div
                      key={assignment.id}
                      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 ${
                        assignment.completed
                          ? 'border-green-500 opacity-75'
                          : isOverdue(assignment.dueDate)
                          ? 'border-red-500'
                          : 'border-blue-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className={`font-semibold ${assignment.completed ? 'line-through text-gray-500' : ''}`}>
                          {assignment.title}
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editAssignment(assignment)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteAssignment(assignment.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {assignment.description}
                      </p>

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {assignment.subject}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${isOverdue(assignment.dueDate) && !assignment.completed ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => toggleComplete(assignment.id)}
                          className={`p-1 rounded-full ${
                            assignment.completed
                              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-500 dark:hover:bg-gray-600'
                          }`}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No assignments found.</p>
                  </div>
                )}
              </>
            )}

            {currentView === 'calendar' && (
              <Calendar assignments={assignments} />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingAssignment ? 'Edit Assignment' : 'Add New Assignment'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAssignment(null);
                      setFormData({ title: '', description: '', dueDate: '', subject: '', priority: 'medium' });
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {editingAssignment ? 'Update' : 'Add'} Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;