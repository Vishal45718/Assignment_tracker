import React from 'react';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, CalendarIcon } from '@heroicons/react/24/outline';

const Dashboard = ({ assignments }) => {
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.completed).length;
  const pendingAssignments = assignments.filter(a => !a.completed).length;
  const overdueAssignments = assignments.filter(a => !a.completed && new Date(a.dueDate) < new Date()).length;
  const todayAssignments = assignments.filter(a =>
    new Date(a.dueDate).toDateString() === new Date().toDateString() && !a.completed
  ).length;

  const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  const stats = [
    {
      name: 'Total Assignments',
      value: totalAssignments,
      icon: CalendarIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Completed',
      value: completedAssignments,
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Pending',
      value: pendingAssignments,
      icon: ClockIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Overdue',
      value: overdueAssignments,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Completion Rate</h3>
          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <span className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">{completionRate}%</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Today's Focus</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{todayAssignments}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Due Today</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
        <div className="space-y-3">
          {assignments.slice(0, 5).map(assignment => (
            <div key={assignment.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${assignment.completed ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <div>
                  <p className={`font-medium ${assignment.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {assignment.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{assignment.subject}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            </div>
          ))}
          {assignments.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No assignments yet. Add your first assignment!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;