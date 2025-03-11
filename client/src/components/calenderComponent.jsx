import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the localizer using date-fns
const locales = {
  'en-US': require('date-fns/locale/en-US'),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Example events
const events = [
  {
    title: 'Team Meeting',
    start: new Date(),
    end: new Date(new Date().setHours(new Date().getHours() + 2)), // 2 hours duration
  },
  {
    title: 'Doctor Appointment',
    start: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
  },
];

const CalendarComponent = () => {
  return (
    <div style={{ height: '500px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
};

export default calendarComponent;
