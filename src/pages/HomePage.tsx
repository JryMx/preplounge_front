import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Target, Users, BookOpen, Trophy, Globe, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { useStudentProfile } from '../context/StudentProfileContext';
import universitiesData from '../data/universities.json';
import { searchListings, CozyingListing, geocodeAddress } from '../lib/cozyingApi';
import { getUniversityCoordinates } from '../data/universityCoordinates';
import { getUniversityLocation } from '../data/universityLocations';
import '../hero-section-style.css';
import './profile-calculator.css';
import './homepage-calculator.css';
import './homepage.css';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface School {
  name: string;
  state: string;
  probability: number;
  quality_score: number;
}

interface APIResponse {
  student_profile: {
    gpa: number;
    sat_score: number | null;
    act_score: number | null;
    test_type: 'SAT' | 'ACT';
  };
  summary: {
    total_schools: number;
    total_analyzed: number;
    safety_schools: number;
    target_schools: number;
    reach_schools: number;
    prestige_schools: number;
    probability_thresholds: {
      safety: number;
      target: number;
      reach: number;
    };
  };
  recommendations: {
    safety: School[];
    target: School[];
    reach: School[];
    prestige: School[];
  };
}

interface ListingWithCoords extends CozyingListing {
  lat?: number;
  lng?: number;
}

interface UniversityWithCoords {
  id: string;
  name: string;
  englishName: string;
  lat: number;
  lng: number;
  abbreviation: string;
}

// Map Fly To Component - moves map to specific location
function MapFlyTo({ 
  center, 
  zoom
}: { 
  center: [number, number]; 
  zoom: number;
}) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom, {
      duration: 1.5,
      easeLinearity: 0.5
    });
  }, [center, zoom, map]);
  
  return null;
}

// Zoom Event Handler Component - tracks zoom level changes
function ZoomHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();
  
  // Set initial zoom on mount
  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);
  
  useMapEvents({
    zoomend: (e) => {
      onZoomChange(e.target.getZoom());
    },
  });
  return null;
}

const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { profile } = useStudentProfile();
  
  // Initialize from profile context if available, otherwise use empty strings
  const [gpa, setGpa] = useState(profile?.gpa ? profile.gpa.toString() : '');
  const [testType, setTestType] = useState<'SAT' | 'ACT'>(
    profile?.satEBRW && profile?.satMath ? 'SAT' : profile?.actScore ? 'ACT' : 'SAT'
  );
  const [satEBRW, setSatEBRW] = useState(profile?.satEBRW ? profile.satEBRW.toString() : '');
  const [satMath, setSatMath] = useState(profile?.satMath ? profile.satMath.toString() : '');
  const [actScore, setActScore] = useState(profile?.actScore ? profile.actScore.toString() : '');
  const [results, setResults] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [listings, setListings] = useState<ListingWithCoords[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UniversityWithCoords[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // San Francisco
  const [mapZoom, setMapZoom] = useState<number>(10);
  const [currentZoom, setCurrentZoom] = useState<number>(10);
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  
  // Get universities with coordinates for search
  const universitiesWithCoords = useMemo(() => {
    const result: UniversityWithCoords[] = [];
    
    universitiesData.forEach((uni: any) => {
      const coords = getUniversityCoordinates(uni.englishName);
      if (coords) {
        result.push({
          id: uni.id,
          name: uni.name,
          englishName: uni.englishName,
          lat: coords.lat,
          lng: coords.lng,
          abbreviation: coords.abbreviation,
        });
      }
    });
    
    return result;
  }, []);

  const handleGpaChange = (value: string) => {
    // Allow empty or valid decimal input while typing
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      let finalValue = value;
      
      // Auto-cap at maximum value if exceeded
      if (value && value.trim() !== '') {
        const num = parseFloat(value);
        if (!isNaN(num) && num > 4.0) {
          finalValue = '4.0';
        } else if (!isNaN(num) && num < 0) {
          finalValue = '0';
        }
      }
      
      setGpa(finalValue);
      
      // Real-time validation
      const errors = { ...validationErrors };
      if (finalValue && finalValue.trim() !== '') {
        const num = parseFloat(finalValue);
        if (isNaN(num) || num < 0 || num > 4.0) {
          errors.gpa = language === 'ko' ? 'GPA는 0과 4.0 사이여야 합니다' : 'GPA must be between 0 and 4.0';
        } else {
          delete errors.gpa;
        }
      } else {
        delete errors.gpa;
      }
      setValidationErrors(errors);
    }
  };

  const handleSatMathChange = (value: string) => {
    // Allow empty or digits only while typing
    if (value === '' || /^\d+$/.test(value)) {
      let finalValue = value;
      
      // Auto-cap at maximum value if exceeded
      if (value && value.trim() !== '') {
        const num = parseInt(value);
        if (!isNaN(num) && num > 800) {
          finalValue = '800';
        }
      }
      
      setSatMath(finalValue);
      
      // Real-time validation (allow 0-800 while typing)
      const errors = { ...validationErrors };
      if (finalValue && finalValue.trim() !== '') {
        const num = parseInt(finalValue);
        if (isNaN(num) || num < 0 || num > 800) {
          errors.satMath = language === 'ko' ? 'SAT Math는 0-800 사이여야 합니다' : 'SAT Math must be between 0-800';
        } else {
          delete errors.satMath;
        }
      } else {
        delete errors.satMath;
      }
      setValidationErrors(errors);
    }
  };

  const handleSatMathBlur = () => {
    // Auto-correct to 200 if below 200 when user finishes typing
    if (satMath && satMath.trim() !== '') {
      const num = parseInt(satMath);
      if (!isNaN(num) && num > 0 && num < 200) {
        setSatMath('200');
      }
    }
  };

  const handleSatEBRWChange = (value: string) => {
    // Allow empty or digits only while typing
    if (value === '' || /^\d+$/.test(value)) {
      let finalValue = value;
      
      // Auto-cap at maximum value if exceeded
      if (value && value.trim() !== '') {
        const num = parseInt(value);
        if (!isNaN(num) && num > 800) {
          finalValue = '800';
        }
      }
      
      setSatEBRW(finalValue);
      
      // Real-time validation (allow 0-800 while typing)
      const errors = { ...validationErrors };
      if (finalValue && finalValue.trim() !== '') {
        const num = parseInt(finalValue);
        if (isNaN(num) || num < 0 || num > 800) {
          errors.satEBRW = language === 'ko' ? 'SAT EBRW는 0-800 사이여야 합니다' : 'SAT EBRW must be between 0-800';
        } else {
          delete errors.satEBRW;
        }
      } else {
        delete errors.satEBRW;
      }
      setValidationErrors(errors);
    }
  };

  const handleSatEBRWBlur = () => {
    // Auto-correct to 200 if below 200 when user finishes typing
    if (satEBRW && satEBRW.trim() !== '') {
      const num = parseInt(satEBRW);
      if (!isNaN(num) && num > 0 && num < 200) {
        setSatEBRW('200');
      }
    }
  };

  const handleActChange = (value: string) => {
    // Allow empty or digits only while typing
    if (value === '' || /^\d+$/.test(value)) {
      let finalValue = value;
      
      // Auto-cap at maximum value if exceeded
      if (value && value.trim() !== '') {
        const num = parseInt(value);
        if (!isNaN(num) && num > 36) {
          finalValue = '36';
        } else if (!isNaN(num) && num < 1) {
          finalValue = '1';
        }
      }
      
      setActScore(finalValue);
      
      // Real-time validation
      const errors = { ...validationErrors };
      if (finalValue && finalValue.trim() !== '') {
        const num = parseInt(finalValue);
        if (isNaN(num) || num < 1 || num > 36) {
          errors.actScore = language === 'ko' ? 'ACT는 1-36 사이여야 합니다' : 'ACT must be between 1-36';
        } else {
          delete errors.actScore;
        }
      } else {
        delete errors.actScore;
      }
      setValidationErrors(errors);
    }
  };

  const fetchAnalysis = async () => {
    if (!gpa) return;
    
    setLoading(true);
    setError('');
    
    // Validate input ranges before submitting
    const gpaNum = parseFloat(gpa);
    if (gpaNum < 0 || gpaNum > 4.0) {
      setError(language === 'ko' ? 'GPA는 0.0에서 4.0 사이여야 합니다.' : 'GPA must be between 0.0 and 4.0');
      setLoading(false);
      return;
    }
    
    if (testType === 'SAT') {
      const mathNum = parseInt(satMath);
      const ebrwNum = parseInt(satEBRW);
      if (mathNum < 200 || mathNum > 800 || ebrwNum < 200 || ebrwNum > 800) {
        setError(language === 'ko' ? 'SAT 점수는 200에서 800 사이여야 합니다.' : 'SAT scores must be between 200 and 800');
        setLoading(false);
        return;
      }
    } else if (testType === 'ACT') {
      const actNum = parseInt(actScore);
      if (actNum < 1 || actNum > 36) {
        setError(language === 'ko' ? 'ACT 점수는 1에서 36 사이여야 합니다.' : 'ACT score must be between 1 and 36');
        setLoading(false);
        return;
      }
    }
    
    try {
      let url = 'https://dev.preplounge.ai/?';
      url += `gpa=${gpa}`;
      
      if (testType === 'SAT' && satMath && satEBRW) {
        url += `&sat_math=${satMath}&sat_english=${satEBRW}`;
      } else if (testType === 'ACT' && actScore) {
        url += `&act=${actScore}`;
      } else {
        setError(language === 'ko' ? '모든 필수 항목을 입력해주세요.' : 'Please fill in all required fields.');
        setLoading(false);
        return;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data: APIResponse = await response.json();
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('API error:', errorMessage, err);
      setError(language === 'ko' ? '분석 중 오류가 발생했습니다. 다시 시도해주세요.' : 'An error occurred during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    fetchAnalysis();
  };

  // Load housing listings for a specific area
  const loadListingsForArea = async (centerLat: number, centerLng: number, cityName?: string) => {
    setListingsLoading(true);
    try {
      // Define major cities across available states
      const cityStateList = cityName 
        ? [{ city: cityName, state: 'CA' }]  // Try CA first if specific city provided
        : [
            // California cities
            { city: 'Los Angeles', state: 'CA' },
            { city: 'San Francisco', state: 'CA' },
            { city: 'San Diego', state: 'CA' },
            { city: 'Sacramento', state: 'CA' },
            { city: 'Fresno', state: 'CA' },
            { city: 'Oakland', state: 'CA' },
            { city: 'Berkeley', state: 'CA' },
            { city: 'San Jose', state: 'CA' },
            // Georgia cities
            { city: 'Atlanta', state: 'GA' },
            { city: 'Savannah', state: 'GA' },
            { city: 'Augusta', state: 'GA' },
            { city: 'Columbus', state: 'GA' },
          ];
      
      const allListings: ListingWithCoords[] = [];
      
      // Fetch listings from multiple cities
      for (const { city, state } of cityStateList) {
        try {
          const cityListings = await searchListings({
            city,
            state,
            sorted: 'newest',
            currentPage: 1,
            homesPerGroup: 100,
          });
          
          // Check if listings already have coordinates, otherwise geocode
          const listingsWithCoords: ListingWithCoords[] = [];
          
          for (let i = 0; i < Math.min(cityListings.length, 50); i++) {
            const listing = cityListings[i];
            
            // If coordinates already exist, use them
            if (listing.lat && listing.lng) {
              listingsWithCoords.push(listing as ListingWithCoords);
            } else if (listing.address) {
              // Otherwise geocode the address
              await new Promise(resolve => setTimeout(resolve, i * 100)); // Rate limiting
              const coords = await geocodeAddress(listing.address);
              if (coords) {
                listingsWithCoords.push({ ...listing, lat: coords.lat, lng: coords.lng });
              }
            }
          }
          
          allListings.push(...listingsWithCoords);
        } catch (error) {
          console.error(`Error fetching listings for ${city}:`, error);
        }
      }
      
      setListings(allListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setListingsLoading(false);
    }
  };

  // Load housing listings from all available cities on mount
  useEffect(() => {
    loadListingsForArea(37.7749, -122.4194); // San Francisco coordinates
  }, []);

  // Update calculator values when profile changes (e.g., after navigating back from profile page)
  useEffect(() => {
    if (profile) {
      if (profile.gpa) setGpa(profile.gpa.toString());
      if (profile.satEBRW && profile.satMath) {
        setTestType('SAT');
        setSatEBRW(profile.satEBRW.toString());
        setSatMath(profile.satMath.toString());
      } else if (profile.actScore) {
        setTestType('ACT');
        setActScore(profile.actScore.toString());
      }
    }
  }, [profile]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      const results = universitiesWithCoords.filter((uni) => {
        const searchTerm = query.toLowerCase();
        return (
          uni.name.toLowerCase().includes(searchTerm) ||
          uni.englishName.toLowerCase().includes(searchTerm)
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
    setMapCenter([university.lat, university.lng]);
    setMapZoom(12);
    setCurrentZoom(12);
    setSearchQuery('');
    setShowSearchResults(false);
    
    // Load listings near this university
    // Try to extract city name from university name or use nearby cities
    const cityName = extractCityFromUniversityName(university.englishName);
    loadListingsForArea(university.lat, university.lng, cityName);
  };

  // Helper function to calculate distance between two coordinates (in km)
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Cluster listings based on zoom level
  type ClusterItem = {
    lat: number;
    lng: number;
    count: number;
    listings: ListingWithCoords[];
    isCluster: boolean;
  };

  const clusteredListings = useMemo(() => {
    const listingsWithCoords = listings.filter(listing => listing.lat && listing.lng);
    
    // Determine clustering distance based on zoom level (less aggressive)
    let clusterDistance = 0; // km
    if (currentZoom <= 6) {
      clusterDistance = 30; // 30km radius - only when very zoomed out
    } else if (currentZoom <= 8) {
      clusterDistance = 10; // 10km radius
    } else if (currentZoom <= 10) {
      clusterDistance = 2; // 2km radius - small grouping
    }
    // Above zoom 10, no clustering (clusterDistance = 0)

    if (clusterDistance === 0) {
      // No clustering, return individual listings
      return listingsWithCoords.map(listing => ({
        lat: listing.lat!,
        lng: listing.lng!,
        count: 1,
        listings: [listing],
        isCluster: false
      }));
    }

    // Cluster listings
    const clusters: ClusterItem[] = [];
    const processed = new Set<string>();

    listingsWithCoords.forEach(listing => {
      if (processed.has(listing.id)) return;

      const cluster: ClusterItem = {
        lat: listing.lat!,
        lng: listing.lng!,
        count: 1,
        listings: [listing],
        isCluster: false
      };

      // Find nearby listings to cluster
      listingsWithCoords.forEach(other => {
        if (listing.id === other.id || processed.has(other.id)) return;
        
        const distance = getDistance(listing.lat!, listing.lng!, other.lat!, other.lng!);
        if (distance <= clusterDistance) {
          cluster.listings.push(other);
          cluster.count++;
          processed.add(other.id);
        }
      });

      processed.add(listing.id);
      
      // If multiple listings, mark as cluster and calculate center
      if (cluster.count > 1) {
        cluster.isCluster = true;
        cluster.lat = cluster.listings.reduce((sum, l) => sum + l.lat!, 0) / cluster.count;
        cluster.lng = cluster.listings.reduce((sum, l) => sum + l.lng!, 0) / cluster.count;
      }

      clusters.push(cluster);
    });

    return clusters;
  }, [listings, currentZoom]);

  // Extract city name from university name (e.g., "University of California-Los Angeles" -> "Los Angeles")
  const extractCityFromUniversityName = (name: string): string | undefined => {
    if (name.includes('Los Angeles')) return 'Los Angeles';
    if (name.includes('San Francisco')) return 'San Francisco';
    if (name.includes('Berkeley')) return 'Berkeley';
    if (name.includes('Oakland')) return 'Oakland';
    if (name.includes('San Jose')) return 'San Jose';
    if (name.includes('Palo Alto')) return 'Palo Alto';
    if (name.includes('Stanford')) return 'Palo Alto';
    if (name.includes('Boston')) return 'Boston';
    if (name.includes('New York')) return 'New York';
    if (name.includes('Chicago')) return 'Chicago';
    return undefined;
  };

  // Handle search button click
  const handleSearch = () => {
    if (searchResults.length > 0) {
      handleUniversitySelect(searchResults[0]);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.housing-search-field')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSearchResults]);


  const isFormValid = () => {
    if (!gpa) return false;
    if (testType === 'SAT') return satMath && satEBRW;
    if (testType === 'ACT') return actScore;
    return false;
  };

  const extractEnglishName = (fullName: string) => {
    const match = fullName.match(/^([^(]+)/);
    return match ? match[1].trim() : fullName;
  };

  const extractKoreanName = (fullName: string) => {
    const match = fullName.match(/\(([^)]+)\)/);
    return match ? match[1] : fullName;
  };

  const getDisplayName = (fullName: string) => {
    return language === 'ko' ? extractKoreanName(fullName) : extractEnglishName(fullName);
  };

  const getDisplayLocation = (schoolName: string) => {
    const englishName = extractEnglishName(schoolName);
    return getUniversityLocation(englishName, language);
  };

  const findUniversityId = (schoolName: string): string | null => {
    const englishName = extractEnglishName(schoolName);
    const koreanName = extractKoreanName(schoolName);
    
    const university = universitiesData.find((uni: any) => 
      uni.englishName === englishName || uni.name === koreanName
    );
    
    return university ? university.id : null;
  };

  const getTopQualitySchools = (schools: School[], count: number = 3): School[] => {
    return [...schools]
      .sort((a, b) => b.quality_score - a.quality_score)
      .slice(0, count);
  };

  const calculateProfileScore = (): number => {
    if (!results) return 0;
    
    let score = 0;
    const gpaNum = gpa ? parseFloat(gpa) : 0;
    
    // GPA Score (30 points max)
    if (gpaNum >= 3.9) score += 30;
    else if (gpaNum >= 3.7) score += 28;
    else if (gpaNum >= 3.5) score += 25;
    else if (gpaNum >= 3.3) score += 22;
    else if (gpaNum >= 3.0) score += 19;
    else if (gpaNum >= 2.7) score += 15;
    else if (gpaNum >= 2.5) score += 12;
    else if (gpaNum >= 2.0) score += 8;
    else score += (gpaNum / 4.0) * 8;
    
    // Test Score (25 points max)
    if (testType === 'SAT') {
      const mathNum = satMath ? parseInt(satMath) : 0;
      const ebrwNum = satEBRW ? parseInt(satEBRW) : 0;
      const totalSAT = mathNum + ebrwNum;
      
      if (totalSAT >= 1500) score += 25;
      else if (totalSAT >= 1400) score += 23;
      else if (totalSAT >= 1300) score += 20;
      else if (totalSAT >= 1200) score += 17;
      else if (totalSAT >= 1100) score += 14;
      else if (totalSAT >= 1000) score += 11;
      else if (totalSAT >= 900) score += 8;
      else score += (totalSAT / 1600) * 8;
    } else if (testType === 'ACT') {
      const actNum = actScore ? parseInt(actScore) : 0;
      
      if (actNum >= 34) score += 25;
      else if (actNum >= 31) score += 23;
      else if (actNum >= 28) score += 20;
      else if (actNum >= 25) score += 17;
      else if (actNum >= 22) score += 14;
      else if (actNum >= 19) score += 11;
      else if (actNum >= 16) score += 8;
      else score += (actNum / 36) * 8;
    }
    
    // Course Rigor placeholder (5 points)
    if (gpaNum >= 3.5) score += 5;
    
    // Results quality bonus (40 points based on school distribution)
    const totalSchools = results.summary.total_analyzed;
    const prestigeRatio = results.summary.prestige_schools / Math.max(totalSchools, 1);
    const reachRatio = results.summary.reach_schools / Math.max(totalSchools, 1);
    const targetRatio = results.summary.target_schools / Math.max(totalSchools, 1);
    
    score += prestigeRatio * 15 + reachRatio * 12 + targetRatio * 8 + 5;
    
    return Math.min(Math.round(score), 100);
  };

  // Animate score counter
  useEffect(() => {
    if (results) {
      const targetScore = calculateProfileScore();
      const duration = 1200; // 1.2 seconds - faster animation
      const steps = 60;
      const increment = targetScore / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
          setAnimatedScore(targetScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    } else {
      setAnimatedScore(0);
    }
  }, [results, gpa, satMath, satEBRW, actScore, testType]);

  return (
    <div className="min-h-screen" style={{ background: '#FCF8F0' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-titles">
            <p className="hero-subtitle">
              {t('home.hero.subtitle')}
            </p>
            <h1 className="hero-title">
              {t('home.hero.title')}
            </h1>
          </div>
          <p className="hero-description">
            {t('home.hero.description').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        </div>
        <div className="hero-buttons">
          <Link to="/student-profile" className="btn-primary" data-testid="link-predict">
            {t('home.hero.cta.predict')}
          </Link>
          <Link to="/universities" className="btn-secondary" data-testid="link-browse">
            {t('home.hero.cta.input')}
          </Link>
        </div>
      </section>

      {/* Campus Image Section */}
      <section className="relative w-full">
        <img 
          src="/campus-students.png" 
          alt="Students on campus lawn"
          className="w-full h-auto object-contain"
        />
      </section>

      {/* Quick Profile Calculator */}
      <section id="profile-calculator" className="profile-calculator-section">
        <div className="profile-calculator-container">
          <div className="profile-calculator-header">
            <div className="profile-calculator-title-group">
              <h2 className="profile-calculator-title">
                {t('home.calculator.title')}
              </h2>
            </div>
            <p className="profile-calculator-subtitle">
              {t('home.calculator.subtitle')}
            </p>
          </div>

          <div className="profile-calculator-content">
            {/* Left side - Input Form */}
            <div className="profile-calculator-form">
              <div className="profile-calculator-field">
                <label className="profile-calculator-label">
                  {t('home.calculator.gpa')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={gpa}
                  onChange={(e) => handleGpaChange(e.target.value)}
                  className="profile-calculator-input"
                  style={{
                    borderColor: validationErrors.gpa ? '#EF4444' : undefined,
                    boxShadow: validationErrors.gpa ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : undefined,
                  }}
                  placeholder="3.8"
                  data-testid="input-gpa-home"
                />
                {validationErrors.gpa ? (
                  <p style={{fontSize: '11px', color: '#EF4444', marginTop: '4px', fontWeight: '500'}}>
                    ⚠️ {validationErrors.gpa}
                  </p>
                ) : (
                  <p style={{fontSize: '11px', color: 'rgba(8, 47, 73, 0.6)', marginTop: '4px'}}>
                    {language === 'ko' ? '0.0 - 4.0 범위로 입력하세요' : 'Enter a value between 0.0 and 4.0'}
                  </p>
                )}
              </div>

              <div className="profile-calculator-field">
                <label className="profile-calculator-label">
                  {language === 'ko' ? '시험 유형' : 'Test Type'}
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setTestType('SAT')}
                    className={`profile-calculator-test-toggle ${testType === 'SAT' ? 'active' : ''}`}
                    data-testid="button-test-sat-home"
                  >
                    SAT
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestType('ACT')}
                    className={`profile-calculator-test-toggle ${testType === 'ACT' ? 'active' : ''}`}
                    data-testid="button-test-act-home"
                  >
                    ACT
                  </button>
                </div>
              </div>

              {testType === 'SAT' ? (
                <>
                  <div className="profile-calculator-field">
                    <label className="profile-calculator-label">
                      {t('home.calculator.sat.ebrw')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="800"
                      step="10"
                      value={satEBRW}
                      onChange={(e) => handleSatEBRWChange(e.target.value)}
                      onBlur={handleSatEBRWBlur}
                      className="profile-calculator-input"
                      style={{
                        borderColor: validationErrors.satEBRW ? '#EF4444' : undefined,
                        boxShadow: validationErrors.satEBRW ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : undefined,
                      }}
                      placeholder="730"
                      data-testid="input-sat-ebrw-home"
                    />
                    {validationErrors.satEBRW ? (
                      <p style={{fontSize: '11px', color: '#EF4444', marginTop: '4px', fontWeight: '500'}}>
                        ⚠️ {validationErrors.satEBRW}
                      </p>
                    ) : (
                      <p style={{fontSize: '11px', color: 'rgba(8, 47, 73, 0.6)', marginTop: '4px'}}>
                        {language === 'ko' ? '200 미만 입력시 자동으로 200으로 설정' : 'Values below 200 will auto-adjust to 200'}
                      </p>
                    )}
                  </div>

                  <div className="profile-calculator-field">
                    <label className="profile-calculator-label">
                      {t('home.calculator.sat.math')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="800"
                      step="10"
                      value={satMath}
                      onChange={(e) => handleSatMathChange(e.target.value)}
                      onBlur={handleSatMathBlur}
                      className="profile-calculator-input"
                      style={{
                        borderColor: validationErrors.satMath ? '#EF4444' : undefined,
                        boxShadow: validationErrors.satMath ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : undefined,
                      }}
                      placeholder="720"
                      data-testid="input-sat-math-home"
                    />
                    {validationErrors.satMath ? (
                      <p style={{fontSize: '11px', color: '#EF4444', marginTop: '4px', fontWeight: '500'}}>
                        ⚠️ {validationErrors.satMath}
                      </p>
                    ) : (
                      <p style={{fontSize: '11px', color: 'rgba(8, 47, 73, 0.6)', marginTop: '4px'}}>
                        {language === 'ko' ? '200 미만 입력시 자동으로 200으로 설정' : 'Values below 200 will auto-adjust to 200'}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="profile-calculator-field">
                  <label className="profile-calculator-label">
                    {language === 'ko' ? 'ACT 점수 (36점 만점)' : 'ACT Score (out of 36)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={actScore}
                    onChange={(e) => handleActChange(e.target.value)}
                    className="profile-calculator-input"
                    style={{
                      borderColor: validationErrors.actScore ? '#EF4444' : undefined,
                      boxShadow: validationErrors.actScore ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : undefined,
                    }}
                    placeholder="30"
                    data-testid="input-act-home"
                  />
                  {validationErrors.actScore ? (
                    <p style={{fontSize: '11px', color: '#EF4444', marginTop: '4px', fontWeight: '500'}}>
                      ⚠️ {validationErrors.actScore}
                    </p>
                  ) : (
                    <p style={{fontSize: '11px', color: 'rgba(8, 47, 73, 0.6)', marginTop: '4px'}}>
                      {language === 'ko' ? '1 - 36 범위로 입력하세요' : 'Enter a value between 1 and 36'}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="profile-calculator-error" data-testid="text-error-home">
                  {error}
                </div>
              )}
            </div>

            {/* Right side - Score Preview */}
            {!results && (
              <div className="score-preview-box">
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '16px',
                  flex: 1
                }}>
                  <div className="score-preview-label">
                    {language === 'ko' ? '프로필 점수' : 'Profile Score'}
                  </div>
                  <div className="score-preview-value" style={{ marginBottom: '8px' }}>
                    -- / <span className="score-max">100{language === 'ko' ? '점' : ''}</span>
                  </div>
                  <div className="score-preview-hint" style={{ 
                    textAlign: 'center',
                    lineHeight: '1.6',
                    maxWidth: '90%'
                  }}>
                    <div style={{ marginBottom: '12px' }}>
                      {language === 'ko' ? 'GPA와 시험 점수를 입력하고 분석을 시작하세요.' : 'Enter your GPA and test scores, then start the analysis.'}
                    </div>
                    <div>
                      {language === 'ko' ? '맞춤형 대학 추천과 합격 확률을 확인할 수 있습니다.' : 'Get personalized university recommendations and admission probabilities.'}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleAnalyze}
                  disabled={!isFormValid() || loading}
                  className="profile-calculator-button"
                  style={{ width: '100%' }}
                  data-testid="button-analyze-home"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>{language === 'ko' ? '분석 중...' : 'Analyzing...'}</span>
                    </>
                  ) : (
                    <span>{language === 'ko' ? '분석 시작하기' : 'Start Analysis'}</span>
                  )}
                </button>
              </div>
            )}

            {/* Right side - Results Display */}
            {results && (
              <div className="profile-calculator-results fade-in">
                <div className="score-preview-box" style={{ marginTop: 0, marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div className="score-preview-label">
                      {language === 'ko' ? '프로필 점수' : 'Profile Score'}
                    </div>
                    
                    {/* Speedometer Gauge */}
                    <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                      <svg width="160" height="160" viewBox="0 0 160 160">
                        {/* Background arc */}
                        <path
                          d="M 20 80 A 60 60 0 1 1 140 80"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.2)"
                          strokeWidth="12"
                          strokeLinecap="round"
                        />
                        {/* Animated progress arc */}
                        <path
                          d="M 20 80 A 60 60 0 1 1 140 80"
                          fill="none"
                          stroke="#FACC15"
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={`${(animatedScore / 100) * 188.5} 188.5`}
                          style={{ transition: 'stroke-dasharray 0.3s ease-out' }}
                        />
                        {/* Center circle */}
                        <circle cx="80" cy="80" r="50" fill="rgba(8, 47, 73, 0.8)" />
                      </svg>
                      
                      {/* Score text in center */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        marginTop: '5px'
                      }}>
                        <div style={{
                          fontSize: '48px',
                          fontWeight: 800,
                          color: '#FACC15',
                          lineHeight: 1
                        }}>
                          {animatedScore}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'rgba(255, 255, 255, 0.8)',
                          marginTop: '4px'
                        }}>
                          / 100{language === 'ko' ? '점' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="score-preview-hint">
                      {language === 'ko' ? 'AI 분석을 기반으로 한 종합 점수입니다.' : 'Comprehensive score based on AI analysis.'}
                    </div>
                  </div>
                </div>

                <div className="results-summary">
                  <h3 className="results-title" data-testid="text-results-title-home">
                    {language === 'ko' ? '분석 결과' : 'Analysis Results'}
                  </h3>
                  <div className="results-stats">
                    <div className="stat-card" data-testid="card-total-schools-home">
                      <div className="stat-value">{results.summary.total_analyzed}</div>
                      <div className="stat-label">{language === 'ko' ? '분석된 대학' : 'Schools Analyzed'}</div>
                    </div>
                    <div className="stat-card safety" data-testid="card-safety-home">
                      <div className="stat-value">{results.summary.safety_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '안전권' : 'Safety'}</div>
                    </div>
                    <div className="stat-card target" data-testid="card-target-home">
                      <div className="stat-value">{results.summary.target_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '적정권' : 'Target'}</div>
                    </div>
                    <div className="stat-card reach" data-testid="card-reach-home">
                      <div className="stat-value">{results.summary.reach_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '상향권' : 'Reach'}</div>
                    </div>
                    <div className="stat-card prestige" data-testid="card-prestige-home">
                      <div className="stat-value">{results.summary.prestige_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '명문' : 'Prestige'}</div>
                    </div>
                  </div>
                </div>

                {/* Safety Schools */}
                {results.recommendations.safety.length > 0 && (
                  <div className="school-category">
                    <h4 className="category-title safety" data-testid="title-safety-schools-home">
                      {language === 'ko' ? '안전권 대학 (상위 3개)' : 'Safety Schools (Top 3)'}
                      <span className="category-count">({results.recommendations.safety.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.safety, 3).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayLocation(school.name)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-safety-home-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-safety-home-${idx}`}>
                            {cardContent}
                          </div>
                        );
                      })}
                      {results.recommendations.safety.length > 3 && (
                        <Link to="/student-profile" className="see-more-button-grid">
                          {language === 'ko' ? '더 보기' : 'See more'}
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Target Schools */}
                {results.recommendations.target.length > 0 && (
                  <div className="school-category">
                    <h4 className="category-title target" data-testid="title-target-schools-home">
                      {language === 'ko' ? '적정권 대학 (상위 3개)' : 'Target Schools (Top 3)'}
                      <span className="category-count">({results.recommendations.target.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.target, 3).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayLocation(school.name)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-target-home-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-target-home-${idx}`}>
                            {cardContent}
                          </div>
                        );
                      })}
                      {results.recommendations.target.length > 3 && (
                        <Link to="/student-profile" className="see-more-button-grid">
                          {language === 'ko' ? '더 보기' : 'See more'}
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Reach Schools */}
                {results.recommendations.reach.length > 0 && (
                  <div className="school-category">
                    <h4 className="category-title reach" data-testid="title-reach-schools-home">
                      {language === 'ko' ? '상향권 대학 (상위 3개)' : 'Reach Schools (Top 3)'}
                      <span className="category-count">({results.recommendations.reach.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.reach, 3).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayLocation(school.name)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-reach-home-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-reach-home-${idx}`}>
                            {cardContent}
                          </div>
                        );
                      })}
                      {results.recommendations.reach.length > 3 && (
                        <Link to="/student-profile" className="see-more-button-grid">
                          {language === 'ko' ? '더 보기' : 'See more'}
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Prestige Schools */}
                {results.recommendations.prestige.length > 0 && (
                  <div className="school-category">
                    <h4 className="category-title prestige" data-testid="title-prestige-schools-home">
                      {language === 'ko' ? '명문 대학 (상위 3개)' : 'Prestige Schools (Top 3)'}
                      <span className="category-count">({results.recommendations.prestige.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.prestige, 3).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayLocation(school.name)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-prestige-home-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-prestige-home-${idx}`}>
                            {cardContent}
                          </div>
                        );
                      })}
                      {results.recommendations.prestige.length > 3 && (
                        <Link to="/student-profile" className="see-more-button-grid">
                          {language === 'ko' ? '더 보기' : 'See more'}
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <Link
                  to="/student-profile"
                  state={{
                    prefilledData: {
                      gpa,
                      testType,
                      satEBRW,
                      satMath,
                      actScore
                    }
                  }}
                  className="detailed-analysis-button"
                  data-testid="button-detailed-analysis-home"
                >
                  <span>{language === 'ko' ? '더 자세한 분석 보기' : 'More Detailed Analysis'}</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              {t('home.features.title')}
            </h2>
            <p className="features-subtitle">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-content">
                <div className="feature-title-row">
                  <h3 className="feature-card-title">
                    {t('home.features.schools.title').split('\n').map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </h3>
                  <div className="feature-icon-wrapper blue">
                    <Search className="feature-icon" />
                  </div>
                </div>
                <p className="feature-description">
                  {t('home.features.schools.description')}
                </p>
              </div>
              <Link to="/universities" className="feature-link blue" data-testid="link-schools-feature">
                {t('home.features.link')}
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-card-content">
                <div className="feature-title-row">
                  <h3 className="feature-card-title">
                    {t('home.features.profile.title').split('\n').map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </h3>
                  <div className="feature-icon-wrapper green">
                    <Target className="feature-icon" />
                  </div>
                </div>
                <p className="feature-description">
                  {t('home.features.profile.description')}
                </p>
              </div>
              <Link to="/student-profile" className="feature-link green" data-testid="link-profile-feature">
                {t('home.features.link')}
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-card-content">
                <div className="feature-title-row">
                  <h3 className="feature-card-title">
                    {t('home.features.consulting.title').split('\n').map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </h3>
                  <div className="feature-icon-wrapper orange">
                    <Users className="feature-icon" />
                  </div>
                </div>
                <p className="feature-description">
                  {t('home.features.consulting.description')}
                </p>
              </div>
              <Link to="/consulting" className="feature-link orange" data-testid="link-consulting-feature">
                {t('home.features.link')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Majors Section */}
      <section className="majors-section">
        <div className="majors-container">
          <div className="majors-header">
            <h2 className="majors-title">
              {t('home.majors.title')}
            </h2>
            <p className="majors-subtitle">
              {t('home.majors.subtitle').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>
          </div>

          <div className="majors-grid">
            <div className="major-card">
              <div className="major-icon-wrapper indigo">
                <BookOpen className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{t('home.majors.engineering')}</h3>
                <div className="major-details">
                  <p className="major-specializations">{t('home.majors.engineering.specializations')}</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.engineering.salary')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.engineering.employment')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.engineering.opt')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper teal">
                <Trophy className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{t('home.majors.business')}</h3>
                <div className="major-details">
                  <p className="major-specializations">{t('home.majors.business.specializations')}</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.business.salary')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.business.employment')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.business.networking')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper amber">
                <BookOpen className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{t('home.majors.liberal')}</h3>
                <div className="major-details">
                  <p className="major-specializations">{t('home.majors.liberal.specializations')}</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.liberal.salary')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.liberal.employment')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.liberal.thinking')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper blue">
                <Globe className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{t('home.majors.natural')}</h3>
                <div className="major-details">
                  <p className="major-specializations">{t('home.majors.natural.specializations')}</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.natural.salary')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.natural.employment')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.natural.graduate')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper lime">
                <Search className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{t('home.majors.social')}</h3>
                <div className="major-details">
                  <p className="major-specializations">{t('home.majors.social.specializations')}</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.social.salary')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.social.employment')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.social.problem')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper purple">
                <Users className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{language === 'ko' ? '예술 (Arts)' : 'Arts'}</h3>
                <div className="major-details">
                  <p className="major-specializations">
                    {language === 'ko' ? '순수예술, 음악, 연극, 영화학, 디자인' : 'Fine Arts, Music, Theater, Film, Design'}
                  </p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">
                      {language === 'ko' ? '평균 연봉 $58,000' : 'Avg Salary $58,000'}
                    </span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">
                      {language === 'ko' ? '취업률 75%' : 'Employment 75%'}
                    </span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">
                      {language === 'ko' ? '포트폴리오 중심 전형' : 'Portfolio-Based'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="majors-cta">
            <p className="majors-cta-text">
              {language === 'ko' ? '단 3분! 나에게 딱 맞는 전공을 찾아보세요' : 'Just 3 minutes! Find the perfect major for you'}
            </p>
            <button 
              className="majors-cta-button"
              onClick={() => window.open('https://smore.im/quiz/qJ6zmxtDvp', '_blank')}
            >
              <span className="majors-cta-button-text">
                {language === 'ko' ? '전공 찾고 대학 로드맵 준비하기' : 'Find Your Major & Plan Your College Roadmap'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Housing Section */}
      <section className="housing-section">
        <div className="housing-container">
          <div className="housing-header-column">
            <h2 className="housing-title">
              {language === 'ko' ? (
                <>미국 대학 주변<br />집 구경하기</>
              ) : (
                <>Explore Housing<br />Near US Universities</>
              )}
            </h2>
            <p className="housing-subtitle">
              {language === 'ko' 
                ? '학교 주변, 어떤 동네가 살기 좋을까?' 
                : 'Which neighborhoods are best to live in near campus?'}
            </p>
          </div>

          <div className="housing-content-column">
            <div className="housing-search-field" style={{ position: 'relative', width: '100%' }}>
              <div className="housing-search-input-wrapper">
                <Search className="housing-search-icon" />
                <input
                  type="text"
                  placeholder={language === 'ko' ? '대학 이름으로 검색' : 'Search by university name'}
                  className="housing-search-input"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                />
                <button 
                  className="housing-search-button"
                  onClick={handleSearch}
                  disabled={searchResults.length === 0}
                >
                  <span className="housing-search-button-text">
                    {language === 'ko' ? '검색' : 'Search'}
                  </span>
                </button>
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  background: 'white',
                  border: '1px solid #E7E5E4',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {searchResults.map((university) => (
                    <div
                      key={university.id}
                      onClick={() => handleUniversitySelect(university)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #F3F4F6',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#082F49' }}>
                        {language === 'ko' ? university.name : university.englishName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="housing-map-container">
              {listingsLoading ? (
                <div style={{
                  width: '100%',
                  height: '360px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #E0F2FE 0%, #D1FAE5 100%)',
                }}>
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{
                    width: '100%',
                    height: '360px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #E7E5E4',
                  }}
                  scrollWheelZoom={true}
                  zoomControl={true}
                >
                  <MapFlyTo center={mapCenter} zoom={mapZoom} />
                  <ZoomHandler onZoomChange={setCurrentZoom} />
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={19}
                    minZoom={3}
                  />
                  
                  {/* Display listings from cozying API - with clustering */}
                  {clusteredListings.map((cluster, index) => {
                    if (cluster.isCluster) {
                      // Cluster marker - show count
                      return (
                        <Marker
                          key={`cluster-${index}`}
                          position={[cluster.lat, cluster.lng]}
                          icon={L.divIcon({
                            className: 'custom-housing-marker',
                            html: `
                              <div style="
                                width: 32px;
                                height: 32px;
                                background: #3b82f6;
                                border: 3px solid white;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                                font-size: 14px;
                                font-weight: 700;
                                color: white;
                              ">
                                ${cluster.count}
                              </div>
                            `,
                            iconSize: [32, 32],
                            iconAnchor: [16, 16],
                          })}
                        >
                          <Popup>
                            <div style={{ minWidth: '200px', maxHeight: '300px', overflowY: 'auto' }}>
                              <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                                {cluster.count} Listings in this area
                              </div>
                              {cluster.listings.slice(0, 5).map((listing, idx) => (
                                <div key={listing.id} style={{ 
                                  padding: '8px 0', 
                                  borderBottom: idx < Math.min(4, cluster.listings.length - 1) ? '1px solid #eee' : 'none' 
                                }}>
                                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>
                                    ${listing.price?.toLocaleString()}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#666' }}>
                                    {listing.bedrooms && listing.bathrooms 
                                      ? `${listing.bedrooms} bed • ${listing.bathrooms} bath`
                                      : listing.address}
                                  </div>
                                </div>
                              ))}
                              {cluster.count > 5 && (
                                <div style={{ fontSize: '11px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>
                                  + {cluster.count - 5} more listings
                                </div>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    } else {
                      // Individual listing marker - blue circle with hole
                      const listing = cluster.listings[0];
                      return (
                        <Marker
                          key={listing.id}
                          position={[cluster.lat, cluster.lng]}
                          icon={L.divIcon({
                            className: 'custom-housing-marker',
                            html: `
                              <div style="
                                width: 16px;
                                height: 16px;
                                background: #3b82f6;
                                border: 3px solid white;
                                border-radius: 50%;
                                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
                              "></div>
                            `,
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                          })}
                        >
                          <Popup>
                            <div style={{ minWidth: '200px' }}>
                              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                                {listing.title}
                              </div>
                              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                                {listing.address}
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: '600', color: '#082F49' }}>
                                ${listing.price?.toLocaleString()}
                              </div>
                              {listing.bedrooms && listing.bathrooms && (
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                  {listing.bedrooms} bed • {listing.bathrooms} bath
                                </div>
                              )}
                              <a
                                href={listing.url ? `https://cozying.ai/${listing.url}` : 'https://cozying.ai/'}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'inline-block',
                                  marginTop: '8px',
                                  fontSize: '12px',
                                  color: '#3b82f6',
                                  textDecoration: 'underline'
                                }}
                              >
                                View Details
                              </a>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    }
                  })}
                </MapContainer>
              )}
            </div>

            <Link 
              to="/housing" 
              className="housing-cta-button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
            >
              <span className="housing-cta-button-text">
                {language === 'ko' ? '매물 자세히 알아보기' : 'Explore Listings in Detail'}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="homepage-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-info">
              <h3 className="footer-company-name">Habitfactory USA</h3>
              <p className="footer-address">
                Los Angeles : 3435 Wilshire Blvd Suite 1940, LA, CA 90010<br />
                Irvine : 2 Park Plaza Suite 350, Irvine, CA 92614<br />
                (213) 426-1118<br />
                info@loaning.ai
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-links">
              <a href="#" className="footer-link">NMLS #2357195</a>
              <a href="#" className="footer-link">Legal disclaimer</a>
              <a href="#" className="footer-link">Licenses</a>
            </div>
            <p className="footer-copyright">©Habitfactory USA, Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;