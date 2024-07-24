import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import { generalApi } from "../helper/api";

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState({});
  const [error, setError] = useState(null);

  const fetchNotificationStatus = async () => {
    try {
      const response = await axios.post(`${generalApi}/get/notification`, {
        Tolat: selectedHospital?.Tolat,
        Tolng: selectedHospital?.Tolng,
      });
      if (response.data.status) {
        alert("Hospital is available, reach ASAP!!");
      } else {
        alert(
          "Sorry for the inconvenience, the hospital is currently unavailable"
        );
      }
    } catch (err) {
      setError("Failed to fetch notification status");
    }
  };

  useEffect(() => {
    const notifyHospital = async () => {
      try {
        const response = await axios.post(`${generalApi}/create/notification`, {
          selectedHospital,
        });

        if (response.data.success) {
          alert("Hospital notified successfully!");
        }
      } catch (error) {
        console.error(error);
        setError("An error occurred while adding the hospital.");
      }
    };

    if (Object.keys(selectedHospital).length !== 0) {
      notifyHospital();
    }

    if (selectedHospital) {
      const intervalId = setInterval(() => {
        fetchNotificationStatus();
      }, 150000);

      return () => clearInterval(intervalId);
    }
  }, [selectedHospital]);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoic2h1YmhhbTMwNDMiLCJhIjoiY2x4NTNhd2cxMWgzcTJpczl3NTdzcDZraCJ9.iwgxWFFJ1emZVMaXjrN7ZA";
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition([longitude, latitude]);
    });
  }, []);

  useEffect(() => {
    if (currentPosition) {
      const fetchHospitals = async () => {
        try {
          const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/hospital.json?proximity=${currentPosition[0]},${currentPosition[1]}&limit=10&access_token=${mapboxgl.accessToken}`
          );
          setHospitals(response.data.features);
        } catch (error) {
          console.error("Error fetching hospitals:", error);
        }
      };

      fetchHospitals();
    }
  }, [currentPosition]);

  useEffect(() => {
    if (hospitals.length > 0) {
      const initializeMap = ({ setMap, mapContainer }) => {
        const map = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v11",
          center: currentPosition,
          zoom: 14,
        });

        map.on("load", () => {
          setMap(map);
          map.resize();

          // Add marker for current position
          new mapboxgl.Marker().setLngLat(currentPosition).addTo(map);

          // Add markers for hospitals
          hospitals.forEach((hospital) => {
            const marker = new mapboxgl.Marker()
              .setLngLat(hospital.geometry.coordinates)
              .addTo(map);

            marker.getElement().addEventListener("click", () => {
              showRoute(
                map,
                currentPosition,
                hospital.geometry.coordinates,
                hospital
              );
            });
          });

          map.on("click", (event) => {
            setSelectedHospital({
              Tolat: event?.lngLat?.lat,
              Tolng: event?.lngLat?.lng,
              Bylat: currentPosition[1], // Fixed the index for latitude and longitude
              Bylng: currentPosition[0],
            });
            const clickedCoords = [event.lngLat.lng, event.lngLat.lat];
            showRoute(map, clickedCoords, currentPosition);
          });
        });
      };

      if (!map) initializeMap({ setMap, mapContainer: mapContainerRef });

      return () => map?.remove();
    }
  }, [currentPosition, hospitals]);

  const showRoute = (map, start, end) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const route = data.routes[0].geometry.coordinates;

        if (map.getLayer("route")) {
          map.getSource("route").setData({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route,
            },
          });
        } else {
          map.addLayer({
            id: "route",
            type: "line",
            source: {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: route,
                },
              },
            },
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#3887be",
              "line-width": 5,
              "line-opacity": 0.75,
            },
          });
        }

        const bounds = route.reduce(
          (bounds, coord) => bounds.extend(coord),
          new mapboxgl.LngLatBounds(route[0], route[0])
        );
        map.fitBounds(bounds, { padding: 100 });
      })
      .catch((error) => console.error("Error fetching directions:", error));
  };

  return (
    <div>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />
      {selectedHospital && (
        <div>{`Selected Hospital: ${JSON.stringify(selectedHospital)}`}</div>
      )}
      {error && <div>{error}</div>}
    </div>
  );
};

export default MapComponent;
