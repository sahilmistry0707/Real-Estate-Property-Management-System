import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Navigation, ExternalLink } from 'lucide-react';

// Fix for default Leaflet icon issues in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom pin icons for different property purposes
const buyIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const rentIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to dynamically adjust map view bounds
const MapBoundsAdjuster = ({ properties, center }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 14);
    } else if (properties && properties.length > 0) {
      const validPoints = properties
        .filter((p) => p.latitude && p.longitude)
        .map((p) => [p.latitude, p.longitude]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [properties, center, map]);

  return null;
};

const MapView = ({
  properties = [],
  center = [40.7128, -74.006], // Default center: NYC
  zoom = 11,
  height = '480px',
  singleProperty = null,
}) => {
  // If a single property is passed, wrap it in an array
  const displayProperties = singleProperty
    ? [singleProperty]
    : properties.filter((p) => p.latitude && p.longitude);

  const mapCenter =
    singleProperty && singleProperty.latitude && singleProperty.longitude
      ? [singleProperty.latitude, singleProperty.longitude]
      : displayProperties.length > 0 && displayProperties[0].latitude
      ? [displayProperties[0].latitude, displayProperties[0].longitude]
      : center;

  const defaultImage =
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80';

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsAdjuster
          properties={displayProperties}
          center={singleProperty ? mapCenter : null}
        />

        {displayProperties.map((prop) => {
          if (!prop.latitude || !prop.longitude) return null;

          const propImg =
            prop.images && prop.images.length > 0
              ? prop.images[0].startsWith('http')
                ? prop.images[0]
                : `http://localhost:5000/${prop.images[0]}`
              : defaultImage;

          // OpenStreetMap / Google Maps directions link
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${prop.latitude},${prop.longitude}`;

          return (
            <Marker
              key={prop._id || prop.id}
              position={[prop.latitude, prop.longitude]}
              icon={prop.purpose === 'Rent' ? rentIcon : buyIcon}
            >
              <Popup className="property-map-popup">
                <div className="map-popup-card">
                  <img
                    src={propImg}
                    alt={prop.title}
                    className="map-popup-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultImage;
                    }}
                  />
                  <span
                    className={`badge ${prop.purpose === 'Rent' ? 'badge-rent' : 'badge-buy'}`}
                    style={{ marginBottom: '4px' }}
                  >
                    {prop.purpose} • {prop.type}
                  </span>
                  <div className="map-popup-title" title={prop.title}>
                    {prop.title}
                  </div>
                  <div className="map-popup-price">
                    ${prop.price?.toLocaleString()}
                    {prop.purpose === 'Rent' && ' /mo'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 8px' }}>
                    {prop.city}, {prop.state}
                  </div>

                  <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                    <Link
                      to={`/properties/${prop._id}`}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', width: '100%' }}
                    >
                      View Property
                    </Link>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Navigation size={12} />
                      Get Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
