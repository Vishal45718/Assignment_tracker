import axios from 'axios';

const API_BASE = 'http://localhost:8080';

export const getAssignments = () => axios.get(`${API_BASE}/assignments`);
export const addAssignment = (assignment) =>
  axios.post(`${API_BASE}/assignments`, assignment);
export const deleteAssignment = (id) =>
  axios.delete(`${API_BASE}/assignments/${id}`);

