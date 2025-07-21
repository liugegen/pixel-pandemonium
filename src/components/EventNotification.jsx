// src/components/EventNotification.jsx
import React, { useState, useEffect } from 'react';
import { useMultisynq } from './MultisynqProvider';

const EventNotification = () => {
  const [notification, setNotification] = useState(null);
  const session = useMultisynq();

  useEffect(() => {
    if (!session) return;

    const handleEventStart = (eventData) => {
      setNotification({
        message: `🎉 ${eventData.name} dimulai!`,
        type: 'start'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    };

    const handleEventEnd = () => {
      setNotification({
        message: "Event selesai! 📝",
        type: 'end'
      });
      
      setTimeout(() => setNotification(null), 2000);
    };

    session.view.subscribe("eventScope", "eventStart", handleEventStart);
    session.view.subscribe("eventScope", "eventEnd", handleEventEnd);

    return () => {
      session.view.unsubscribe("eventScope", "eventStart", handleEventStart);
      session.view.unsubscribe("eventScope", "eventEnd", handleEventEnd);
    };
  }, [session]);

  if (!notification) return null;

  return (
    <div className="event-notification">
      {notification.message}
    </div>
  );
};

export default EventNotification;
