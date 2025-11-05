import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import universitiesData from '../data/universities.json';
import { getUniversityCoordinates } from '../data/universityCoordinates';
import 'leaflet/dist/leaflet.css';
import './university-map.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface UniversityWithCoords {
  id: string;
  name: string;
  englishName: string;
  tuition: number;
  acceptanceRate: number;
  lat: number;
  lng: number;
  abbreviation: string;
}

// Map Reset Button Component
function MapResetButton({ label }: { label: string }) {
  const map = useMap();
  
  const handleReset = () => {
    map.setView([39.8283, -98.5795], 4); // Center of USA
  };
  
  return (
    <button onClick={handleReset} className="map-reset-button">
      {label}
    </button>
  );
}

const UniversityMapPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);

  // Filter universities that have coordinate data
  const universitiesWithCoords = useMemo(() => {
    const result: UniversityWithCoords[] = [];
    
    universitiesData.forEach((uni: any) => {
      const coords = getUniversityCoordinates(uni.englishName);
      if (coords) {
        result.push({
          id: uni.id,
          name: uni.name,
          englishName: uni.englishName,
          tuition: uni.tuition,
          acceptanceRate: uni.acceptanceRate,
          lat: coords.lat,
          lng: coords.lng,
          abbreviation: coords.abbreviation,
        });
      }
    });
    
    return result;
  }, []);

  // Create custom marker icon function
  const createCustomIcon = (abbreviation: string, tuition: number, isSelected: boolean) => {
    const color = isSelected ? '#FACC15' : '#082F49';
    const tuitionK = Math.round(tuition / 1000);
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-container ${isSelected ? 'selected' : ''}">
          <div class="marker-badge" style="background-color: ${color};">
            ${abbreviation}
          </div>
          <div class="marker-label">
            $${tuitionK}K
          </div>
        </div>
      `,
      iconSize: [60, 60],
      iconAnchor: [30, 50],
    });
  };

  const formatTuition = (tuition: number) => {
    return language === 'ko' 
      ? `$${tuition.toLocaleString()}`
      : `$${tuition.toLocaleString()}`;
  };

  return (
    <div className="university-map-page">
      {/* Header */}
      <div className="map-page-header">
        <div className="map-header-content">
          <h1 className="map-page-title">
            {t('map.title')}
          </h1>
          <p className="map-page-subtitle">
            {t('map.subtitle')}
          </p>
          <div className="map-stats">
            <span className="map-stat-item">
              {universitiesWithCoords.length} {t('map.universities.count')}
            </span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container-wrapper">
        <MapContainer
          center={[39.8283, -98.5795]} // Center of USA
          zoom={4}
          className="university-map"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapResetButton label={t('map.reset.view')} />
          
          {universitiesWithCoords.map((university) => (
            <Marker
              key={university.id}
              position={[university.lat, university.lng]}
              icon={createCustomIcon(
                university.abbreviation,
                university.tuition,
                selectedUniversity === university.id
              )}
              eventHandlers={{
                click: () => setSelectedUniversity(university.id),
              }}
            >
              <Popup>
                <div className="map-popup">
                  <h3 className="popup-title">
                    {language === 'ko' ? university.name : university.englishName}
                  </h3>
                  <div className="popup-details">
                    <div className="popup-row">
                      <span className="popup-label">
                        {language === 'ko' ? '학비:' : 'Tuition:'}
                      </span>
                      <span className="popup-value">{formatTuition(university.tuition)}</span>
                    </div>
                    <div className="popup-row">
                      <span className="popup-label">
                        {language === 'ko' ? '합격률:' : 'Acceptance Rate:'}
                      </span>
                      <span className="popup-value">{university.acceptanceRate}%</span>
                    </div>
                  </div>
                  <Link 
                    to={`/university/${university.id}`} 
                    className="popup-link"
                  >
                    {language === 'ko' ? '상세 정보 보기' : 'View Details'} →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* University List Sidebar */}
      <div className="map-sidebar">
        <h2 className="sidebar-title">
          {language === 'ko' ? '대학 목록' : 'Universities on Map'}
        </h2>
        <div className="sidebar-list">
          {universitiesWithCoords.map((university) => (
            <div
              key={university.id}
              className={`sidebar-item ${selectedUniversity === university.id ? 'active' : ''}`}
              onClick={() => setSelectedUniversity(university.id)}
            >
              <div className="sidebar-item-header">
                <span className="sidebar-abbrev">{university.abbreviation}</span>
                <span className="sidebar-name">
                  {language === 'ko' ? university.name : university.englishName}
                </span>
              </div>
              <div className="sidebar-item-info">
                <span className="sidebar-tuition">{formatTuition(university.tuition)}</span>
                <Link 
                  to={`/university/${university.id}`}
                  className="sidebar-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  {language === 'ko' ? '보기' : 'View'} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UniversityMapPage;
