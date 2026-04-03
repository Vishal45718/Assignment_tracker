import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Calendar = ({ assignments, onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getAssignmentsForDate = (date) => {
    return assignments.filter(assignment =>
      new Date(assignment.dueDate).toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Calendar View</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2"></div>;
          }

          const dayAssignments = getAssignmentsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          const hasAssignments = dayAssignments.length > 0;
          const hasOverdue = dayAssignments.some(a => !a.completed && date < new Date());

          return (
            <div
              key={index}
              onClick={() => onDateClick && onDateClick(date)}
              className={`p-2 min-h-[80px] border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                isToday ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
              }`}>
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayAssignments.slice(0, 2).map(assignment => (
                  <div
                    key={assignment.id}
                    className={`text-xs p-1 rounded truncate ${
                      assignment.completed
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : hasOverdue && date < new Date()
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}
                    title={assignment.title}
                  >
                    {assignment.title}
                  </div>
                ))}
                {dayAssignments.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    +{dayAssignments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;