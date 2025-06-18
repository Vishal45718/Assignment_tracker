import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AssignmentItem from './AssignmentItem';

const AssignmentList = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get('http://localhost:8080/assignments');
        console.log("Fetched assignments:", res.data); // Log the fetched assignments
        setAssignments(res.data);
      } catch (err) {
        console.error('Error fetching assignments:', err);
      }
    };

    fetchAssignments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/assignments/${id}`);
      setAssignments(assignments.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Error deleting assignment:', err);
    }
  };

  return (
    <div>
      <h2>My Assignments</h2>
      <ul>
        {assignments.map((item) => (
          <AssignmentItem
            key={item.id}
            assignment={item}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </ul>
    </div>
  );
};

export default AssignmentList;
