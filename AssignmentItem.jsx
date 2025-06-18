import React from 'react';

const AssignmentItem = ({ assignment, onDelete }) => {
  return (
    <li style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
      <strong>{assignment.title}</strong><br />
      Due: {assignment.dueDate}<br />
      <button onClick={onDelete} style={{ marginTop: '5px' }}>Delete</button>
    </li>
  );
};

export default AssignmentItem;
