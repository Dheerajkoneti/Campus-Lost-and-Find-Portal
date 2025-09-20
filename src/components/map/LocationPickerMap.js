import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css'; // Import the search bar styles
import { Button, Box } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// Fix for default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Search Bar Component
const LeafletSearch = ({ onLocationSelect }) => {
  const map = useMap();
  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });

    map.addControl(searchControl);
    
    // Listen for the search result event
    map.on('geosearch/showlocation', (result) => {
        const { x, y } = result.location; // x is lng, y is lat
        onLocationSelect({ lat: y, lng: x });
    });

    return () => map.removeControl(searchControl);
  }, [map, onLocationSelect]);

  return null;
};

// Component to handle clicks and programmatic position changes
const LocationHandler = ({ position, setPosition, onLocationSelect }) => {
    const map = useMap();

    // Fly to the new position when it changes
    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], 15);
        }
    }, [position, map]);

    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng);
      },
    });
  
    return position === null ? null : <Marker position={position}></Marker>;
};


const LocationPickerMap = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);

  const handleLocationSelect = (latlng) => {
    setPosition(latlng);
    onLocationSelect(latlng);
  };

  const handleGetCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };
        handleLocationSelect(newPos);
      },
      (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        alert('Could not get your location. Please enable location services in your browser.');
      }
    );
  };

  const defaultPosition = [9.5743, 77.6761]; // Kalasalingam University

  return (
    <Box sx={{ position: 'relative' }}>
        <MapContainer center={defaultPosition} zoom={15} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
            <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationHandler position={position} setPosition={setPosition} onLocationSelect={handleLocationSelect} />
            <LeafletSearch onLocationSelect={handleLocationSelect} />
        </MapContainer>
        <Button
            variant="contained"
            startIcon={<MyLocationIcon />}
            onClick={handleGetCurrentLocation}
            sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1000, // Ensure it's above the map
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'black',
                '&:hover': {
                    backgroundColor: 'white',
                }
            }}
        >
            Use My Location
        </Button>
    </Box>
  );
};

export default LocationPickerMap;