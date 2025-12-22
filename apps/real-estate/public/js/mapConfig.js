/**
 * Google Maps Dark Theme Configuration
 */

export const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8b8b8b" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#b0b0b0" }]
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b6b6b" }]
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#1f3a1f" }]
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#5a7a5a" }]
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#2a2a2a" }]
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f1f1f" }]
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#3a3a3a" }]
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#2f2f2f" }]
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2a2a2a" }]
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#0f1f2f" }]
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#4a6a7a" }]
    }
];

export const mapConfig = {
    defaultCenter: { lat: -23.5505, lng: -46.6333 },
    defaultZoom: 12,
    detailZoom: 15,
    mapType: 'roadmap'
};
