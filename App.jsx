// src/App.jsx
import React from 'react';
import AssignmentList from './AssignmentList';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1 style={{ color: "black" }}>Assignment Tracker</h1>
      <p style={{ color: "black" }}>This is a test paragraph to confirm rendering.</p>
      <AssignmentList />
    </div>
  );
}


export default App;
