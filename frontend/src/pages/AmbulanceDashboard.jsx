// import React, { useEffect, useRef, useState } from "react";
// import mapboxgl from "mapbox-gl";
// import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
// import mapboxSdk from "@mapbox/mapbox-sdk/services/geocoding";
// import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox GL CSS
// import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css"; // Import Mapbox Directions CSS

// mapboxgl.accessToken =
//   "pk.eyJ1Ijoic2h1YmhhbTMwNDMiLCJhIjoiY2x4NTNhd2cxMWgzcTJpczl3NTdzcDZraCJ9.iwgxWFFJ1emZVMaXjrN7ZA"; // Replace with your Mapbox access token

// const AmbulanceDashboard = () => {
//   const mapContainerRef = useRef(null);
//   const mapRef = useRef(null);
//   const directionsRef = useRef(null);
//   const [currentPosition, setCurrentPosition] = useState(null);
//   const [selectedDestination, setSelectedDestination] = useState(null);

//   useEffect(() => {
//     const getUserLocation = () => {
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             const userLng = position.coords.longitude;
//             const userLat = position.coords.latitude;
//             setCurrentPosition([userLng, userLat]);

//             const map = new mapboxgl.Map({
//               container: mapContainerRef.current,
//               style: "mapbox://styles/mapbox/streets-v11",
//               center: [userLng, userLat], // Center the map at user's location
//               zoom: 13.5,
//             });

//             const directions = new MapboxDirections({
//               accessToken: mapboxgl.accessToken,
//               unit: "metric",
//               profile: "mapbox/driving",
//               controls: {
//                 inputs: true, // Enable inputs to select destination
//               },
//             });

//             map.addControl(directions, "top-left");

//             map.on("load", () => {
//               map.resize();
//               mapRef.current = map;
//               directionsRef.current = directions;

//               // Fetch nearby hospitals
//               fetchNearbyHospitals(userLng, userLat);

//               // Add marker for user's current location
//               const userMarker = new mapboxgl.Marker({ color: "blue" })
//                 .setLngLat([userLng, userLat])
//                 .addTo(mapRef.current);
//             });

//             map.on("click", (e) => {
//               // Store selected destination
//               setSelectedDestination(e.lngLat.toArray());
//             });
//           },
//           (error) => {
//             console.error("Error getting user location:", error);
//           }
//         );
//       } else {
//         console.error("Geolocation is not supported by this browser.");
//       }
//     };

//     getUserLocation();

//     return () => {
//       if (mapRef.current) {
//         mapRef.current.remove();
//         mapRef.current = null;
//       }
//     };
//   }, []);

//   useEffect(() => {
//     // Update directions when selected destination changes
//     if (directionsRef.current && selectedDestination) {
//       directionsRef.current.setDestination(selectedDestination);
//     }
//   }, [selectedDestination]);

//   const fetchNearbyHospitals = (userLng, userLat) => {
//     const geocodingClient = mapboxSdk({
//       accessToken: mapboxgl.accessToken,
//     });

//     geocodingClient
//       .forwardGeocode({
//         query: "hospital",
//         proximity: [userLng, userLat],
//         types: ["poi"],
//         limit: 10,
//       })
//       .send()
//       .then((response) => {
//         const hospitals = response.body.features.filter((hospital) => {
//           const distance = getDistanceFromLatLonInKm(
//             userLat,
//             userLng,
//             hospital.geometry.coordinates[1],
//             hospital.geometry.coordinates[0]
//           );
//           return distance <= 20; // Filter hospitals within 10 km range
//         });

//         hospitals.forEach((hospital) => {
//           // Create a custom "H" marker
//           const el = document.createElement("div");
//           el.className = "hospital-marker";
//           el.innerHTML = "H";
//           el.style.color = "white";
//           el.style.backgroundColor = "green";
//           el.style.padding = "8px";
//           el.style.borderRadius = "90%";
//           el.style.textAlign = "center";

//           const marker = new mapboxgl.Marker(el)
//             .setLngLat(hospital.geometry.coordinates)
//             .setPopup(
//               new mapboxgl.Popup({ offset: 25 }).setText(hospital.place_name)
//             )
//             .addTo(mapRef.current);

//           marker.getElement().addEventListener("click", () => {
//             setSelectedDestination(hospital.geometry.coordinates);
//           });
//         });
//       })
//       .catch((error) => {
//         console.error("Error fetching nearby hospitals:", error);
//       });
//   };

//   function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
//     const R = 6371; // Radius of the earth in km
//     const dLat = deg2rad(lat2 - lat1); // deg2rad below
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//       Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//       Math.cos(deg2rad(lat1)) *
//         Math.cos(deg2rad(lat2)) *
//         Math.sin(dLon / 2) *
//         Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c; // Distance in km
//     return distance;
//   }

//   function deg2rad(deg) {
//     return deg * (Math.PI / 180);
//   }

//   return (
//     <div
//       style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
//     >
//       <div
//         ref={mapContainerRef}
//         style={{ width: "80%", height: "500px", margin: "20px" }}
//       />
//     </div>
//   );
// };

// export default AmbulanceDashboard;



import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";



const areas = [
  { value: "ADUGODI", label: "ADUGODI" },
  { value: "AIRPORT", label: "AIRPORT" },
  // Add other areas here...
];

const AmbulanceDashboard = () => {
  const [area, setArea] = useState(null);
  const [message, setMessage] = useState("");
  const [confirmationMessages, setConfirmationMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleNotification = async () => {
    if (!area) {
      alert("Please select an area.");
      return;
    }

    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/send-traffic-notification", {
        area: area.value,
        message: message.trim(),
      });
      alert("Traffic notification sent successfully.");
      fetchConfirmations(); // Fetch confirmations after sending the notification
    } catch (error) {
      console.error("Error sending traffic notification:", error);
      alert("Failed to send traffic notification.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConfirmations = async () => {
    if (!area) return;

    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/traffic-confirmations",
        {
          params: { area: area.value },
        }
      );
      setConfirmationMessages(response.data);
    } catch (error) {
      console.error("Error fetching confirmations:", error);
      alert("Failed to fetch confirmations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (area) {
      fetchConfirmations();
    }
  }, [area]);

  return (
    <div className="mb-4 p-4 bg-white shadow-md rounded-md">
      <label className="block text-gray-700 mb-1">Area</label>
      <Select
        options={areas}
        onChange={(selectedOption) => setArea(selectedOption)}
        placeholder="Select an area"
        value={area}
        isSearchable
        className="mb-4"
      />
      <input
        type="text"
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />
      <button
        onClick={handleNotification}
        className="p-2 bg-blue-500 text-white rounded"
        disabled={loading} // Disable button while loading
      >
        {loading ? "Sending..." : "Notify"}
      </button>
      <div className="mt-4">
        {confirmationMessages.length > 0 ? (
          <div className="p-4 bg-gray-100 rounded-md">
            {confirmationMessages.map((confirmation, index) => (
              <p key={index}>
                {confirmation.trafficProfile?.user?.name || "Unknown"} in{" "}
                {confirmation.area} (
                {confirmation.trafficProfile?.location || "Unknown"}):{" "}
                {confirmation.message}
              </p>
            ))}
          </div>
        ) : (
          <p>No confirmations found. Notifications are pending.</p>
        )}
      </div>
    </div>
  );
};


// export default AmbulanceDashboard;

// import React from "react";
// import MapComponent from "../components/MapComponent";
// import Map from "../components/Map";
// import { GMapify } from "g-mapify";
// import "g-mapify/dist/index.css";

// const Ambulance = () => {
//   return (
//     <div>
//       <MapComponent />
//     </div>
//   );
// };

export default AmbulanceDashboard;