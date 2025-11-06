import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Search } from 'lucide-react';
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

// Zoom Event Handler Component
function ZoomHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    },
  });
  return null;
}

// Map Fly To Component - moves map to specific location
function MapFlyTo({ 
  center, 
  zoom, 
  onComplete 
}: { 
  center: [number, number] | null; 
  zoom: number;
  onComplete?: () => void;
}) {
  const map = useMap();
  
  if (center) {
    map.flyTo(center, zoom, {
      duration: 1.5,
      easeLinearity: 0.5
    });
    
    // Reset center after animation to prevent re-renders
    if (onComplete) {
      setTimeout(onComplete, 1500);
    }
  }
  
  return null;
}

const UniversityMapPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(4);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UniversityWithCoords[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

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

  // Filter universities based on zoom level to reduce clutter
  const visibleUniversities = useMemo(() => {
    let filtered: UniversityWithCoords[] = [];
    
    if (currentZoom <= 5) {
      // Zoomed out: show only 10 major universities
      filtered = universitiesWithCoords.slice(0, 10);
    } else if (currentZoom <= 7) {
      // Medium zoom: show 20 universities
      filtered = universitiesWithCoords.slice(0, 20);
    } else {
      // Zoomed in: show all universities
      filtered = universitiesWithCoords;
    }
    
    // Always include the selected university in visible markers
    if (selectedUniversity) {
      const selectedUni = universitiesWithCoords.find(u => u.id === selectedUniversity);
      if (selectedUni && !filtered.find(u => u.id === selectedUniversity)) {
        filtered = [...filtered, selectedUni];
      }
    }
    
    return filtered;
  }, [universitiesWithCoords, currentZoom, selectedUniversity]);

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

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      const results = universitiesWithCoords.filter((uni) => {
        const searchTerm = query.toLowerCase();
        return (
          uni.name.toLowerCase().includes(searchTerm) ||
          uni.englishName.toLowerCase().includes(searchTerm) ||
          uni.abbreviation.toLowerCase().includes(searchTerm)
        );
      }).slice(0, 10); // Limit to 10 results
      
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle university selection from search
  const handleUniversitySelect = (university: UniversityWithCoords) => {
    setSelectedUniversity(university.id);
    setMapCenter([university.lat, university.lng]);
    setCurrentZoom(12);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchResults.length > 0) {
      handleUniversitySelect(searchResults[0]);
    }
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
              {visibleUniversities.length} / {universitiesWithCoords.length} {t('map.universities.count')}
            </span>
            {currentZoom <= 7 && (
              <span className="map-stat-hint">
                {language === 'ko' ? '확대하면 더 많은 대학을 볼 수 있습니다' : 'Zoom in to see more universities'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="map-search-container">
        <div className="map-search-wrapper">
          <div className="map-search-input-wrapper">
            <Search className="map-search-icon" size={20} />
            <input
              type="text"
              className="map-search-input"
              placeholder={language === 'ko' ? '대학 이름으로 검색' : 'Search by university name'}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            className="map-search-button"
            onClick={handleSearch}
            disabled={searchResults.length === 0}
          >
            {language === 'ko' ? '검색' : 'Search'}
          </button>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="map-search-results">
              {searchResults.map((university) => (
                <div
                  key={university.id}
                  className="map-search-result-item"
                  onClick={() => handleUniversitySelect(university)}
                >
                  <div className="search-result-name">
                    {language === 'ko' ? university.name : university.englishName}
                  </div>
                  <div className="search-result-details">
                    <span className="search-result-abbrev">{university.abbreviation}</span>
                    <span className="search-result-tuition">{formatTuition(university.tuition)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container-wrapper">
        <MapContainer
          center={[39.8283, -98.5795]} // Center of USA
          zoom={4}
          className="university-map"
          scrollWheelZoom={true}
          touchZoom={true}
          doubleClickZoom={true}
          boxZoom={true}
          keyboard={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
            minZoom={3}
          />
          
          <MapResetButton label={t('map.reset.view')} />
          <ZoomHandler onZoomChange={setCurrentZoom} />
          <MapFlyTo 
            center={mapCenter} 
            zoom={currentZoom} 
            onComplete={() => setMapCenter(null)}
          />
          
          {visibleUniversities.map((university) => (
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
