import React, { useState, useEffect } from 'react';
import { useMultisynq } from './MultisynqProvider';

const EventManager = () => {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const session = useMultisynq();

  const eventTypes = {
    CHAOS_HOUR: {
      name: "💥 Chaos Hour",
      description: "3x chaos! Each pixel randomizes 3 others!",
      duration: 60000,
      color: "#ff4757",
      multiplier: 3
    },
    RAINBOW_MODE: {
      name: "🌈 Rainbow Mode", 
      description: "All pixels turn rainbow colors randomly!",
      duration: 45000,
      color: "#ffa726",
      effect: "rainbow"
    },
    PIXEL_RAIN: {
      name: "🌧️ Pixel Rain",
      description: "Random pixels fall from the top like rain!",
      duration: 30000,
      color: "#26a69a",
      effect: "rain"
    },
    DOUBLE_POINTS: {
      name: "⚡ Double Points",
      description: "Pixel statistics count 2x!",
      duration: 90000,
      color: "#42a5f5",
      effect: "double"
    },
    FREEZE_CHAOS: {
      name: "❄️ Freeze Chaos",
      description: "No pixel chaos during this event!",
      duration: 60000,
      color: "#66bb6a",
      effect: "freeze"
    }
  };

  useEffect(() => {
    if (!session) return;

    const handleEventStart = (eventData) => {
      setCurrentEvent(eventData);
      setTimeLeft(eventData.duration);
    };

    const handleEventEnd = () => {
      setCurrentEvent(null);
      setTimeLeft(0);
    };

    const handleEventUpdate = (eventData) => {
      if (eventData.timeLeft !== undefined) {
        setTimeLeft(eventData.timeLeft);
      }
    };

    session.view.subscribe("eventScope", "eventStart", handleEventStart);
    session.view.subscribe("eventScope", "eventEnd", handleEventEnd);
    session.view.subscribe("eventScope", "eventUpdate", handleEventUpdate);

    // Get current event if any
    if (session.model.currentEvent) {
      setCurrentEvent(session.model.currentEvent);
      setTimeLeft(session.model.eventTimeLeft || 0);
    }

    return () => {
      session.view.unsubscribe("eventScope", "eventStart", handleEventStart);
      session.view.unsubscribe("eventScope", "eventEnd", handleEventEnd);
      session.view.unsubscribe("eventScope", "eventUpdate", handleEventUpdate);
    };
  }, [session]);

  // Format time display
  const formatTime = (milliseconds) => {
    const seconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Manual trigger for testing (admin only - in real app this would be automated)
  const triggerRandomEvent = () => {
    if (!session || currentEvent) return;
    
    const eventKeys = Object.keys(eventTypes);
    const randomEventKey = eventKeys[Math.floor(Math.random() * eventKeys.length)];
    const eventConfig = eventTypes[randomEventKey];
    
    session.view.publish("eventScope", "triggerEvent", {
      type: randomEventKey,
      config: eventConfig
    });
  };

  if (!session) return null;

  return (
    <div className="event-manager">
      {currentEvent ? (
        <div 
          className="event-active"
          style={{ '--event-color': currentEvent.color }}
        >
          <div className="event-header">
            <span className="event-name">{currentEvent.name}</span>
            <span className="event-timer">{formatTime(timeLeft)}</span>
          </div>
          <div className="event-description">
            {currentEvent.description}
          </div>
          <div className="event-progress">
            <div 
              className="event-progress-bar"
              style={{ 
                width: `${(timeLeft / currentEvent.duration) * 100}%`,
                backgroundColor: currentEvent.color
              }}
            />
          </div>
        </div>
      ) : (
        <div className="event-inactive">
          <div className="next-event-info">
            <span>🎯 Event berikutnya akan dimulai segera...</span>
            <button 
              onClick={triggerRandomEvent}
              className="trigger-event-btn"
              title="Admin: Trigger Random Event"
            >
              🎲 Trigger Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManager;
