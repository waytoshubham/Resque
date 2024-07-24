import React, { useState, useEffect } from "react";
import axios from "axios";

const TrafficDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(3); // Replace with actual user ID

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/traffic-notifications"
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching traffic notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const handleResponse = async (id, status) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/traffic-notifications/${id}/respond`,
        {
          status,
          userId,
        }
      );
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
      alert(`Response sent: ${response.data.message}`);
    } catch (error) {
      console.error("Error responding to traffic notification:", error);
      alert(
        `Failed to respond to notification: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  return (
    <div className="traffic-dashboard">
      <h2>Traffic Notifications</h2>
      <ul>
        {Array.isArray(notifications) && notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <li key={index}>
              <p>Area: {notification.area}</p>
              <p>Message: {notification.message}</p>
              <button
                onClick={() => handleResponse(notification.id, "ACCEPTED")}
                className="p-2 bg-green-500 text-white rounded mr-2"
              >
                Accept
              </button>
              <button
                onClick={() => handleResponse(notification.id, "DENIED")}
                className="p-2 bg-red-500 text-white rounded"
              >
                Deny
              </button>
            </li>
          ))
        ) : (
          <p>No notifications found.</p>
        )}
      </ul>
    </div>
  );
};

export default TrafficDashboard;
  