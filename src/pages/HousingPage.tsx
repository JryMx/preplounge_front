import { useState, useEffect } from 'react';
import { Search, MapPin, Users, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { searchListings, CozyingListing, parseLocation, getUniversityLocation } from '../lib/cozyingApi';
import '../hero-section-style.css';
import './housing-page.css';

const HousingPage = () => {
  const { t } = useLanguage();
  const [listings, setListings] = useState<CozyingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Fresno, CA');

  useEffect(() => {
    // Start with Fresno, CA which has listings
    loadListings('Fresno', 'CA');
  }, []);

  const loadListings = async (city: string, state: string) => {
    setLoading(true);
    try {
      const results = await searchListings({
        city,
        state,
        sorted: 'newest',
        currentPage: 1,
        homesPerGroup: 12,
      });
      
      setListings(results);
      setCurrentLocation(`${city}, ${state}`);
    } catch (error) {
      console.error('Failed to load listings:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // First, try to match a university name
    const universityLocation = getUniversityLocation(searchQuery);
    if (universityLocation) {
      loadListings(universityLocation.city, universityLocation.state);
      return;
    }

    // Otherwise, parse as city, state
    const parsed = parseLocation(searchQuery);
    if (parsed.city) {
      loadListings(parsed.city, parsed.state || 'CA');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="housing-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-titles">
            <p className="hero-subtitle" data-testid="text-hero-subtitle">
              {t('housing.hero.subtitle')}
            </p>
            <h1 className="hero-title" data-testid="text-hero-title">
              {t('housing.hero.title')}
            </h1>
          </div>
          <p className="hero-description" data-testid="text-hero-description">
            {t('housing.hero.description').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        </div>
        <div className="hero-buttons">
          <a 
            href="https://cozying.ai/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-primary"
            data-testid="button-find-properties"
          >
            {t('housing.hero.button')}
          </a>
        </div>
      </section>

      <div
        className="housing-hero-image"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600')`,
        }}
      ></div>

      <section className="housing-search-section">
        <div className="housing-search-container">
          <h2 className="housing-search-title" data-testid="text-search-title">
            {t('housing.search.title')}
          </h2>
          <p className="housing-search-description" data-testid="text-search-description">
            {t('housing.search.description')}
          </p>
          <div className="housing-search-input-wrapper">
            <Search className="housing-search-icon h-5 w-5" />
            <input
              type="text"
              placeholder={t('housing.search.placeholder')}
              className="housing-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              data-testid="input-search-location"
            />
            <button 
              onClick={handleSearch}
              className="housing-search-button"
              data-testid="button-search"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="housing-listings-section">
        <div className="housing-listings-container">
          <h3 className="housing-section-title" data-testid="text-listings-title">
            New Listings Near {currentLocation}
          </h3>

          {loading ? (
            <div className="housing-loading" data-testid="loading-listings">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p>Loading listings...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="housing-empty" data-testid="empty-listings">
              <p>No listings found for {currentLocation}. Try searching for a different location.</p>
            </div>
          ) : (
            <div className="housing-grid">
              {listings.slice(0, 6).map((listing) => (
                <div key={listing.id} className="housing-card" data-testid={`card-listing-${listing.id}`}>
                  <img
                    src={listing.imageUrl || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={listing.title}
                    className="housing-card-image"
                    data-testid={`img-listing-${listing.id}`}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600';
                    }}
                  />
                  <div className="housing-card-content">
                    <div className="housing-card-header">
                      <h4 className="housing-card-title" data-testid={`text-title-${listing.id}`}>
                        {listing.title}
                      </h4>
                      <span className="housing-badge available" data-testid={`badge-status-${listing.id}`}>
                        {t('housing.badge.available')}
                      </span>
                    </div>
                    <div className="housing-card-location" data-testid={`text-location-${listing.id}`}>
                      <MapPin className="h-4 w-4" />
                      <span>{listing.city}, {listing.state}</span>
                      {listing.bedrooms && (
                        <>
                          <span className="housing-card-location-separator">•</span>
                          <span>{listing.bedrooms} bed</span>
                        </>
                      )}
                      {listing.bathrooms && (
                        <>
                          <span className="housing-card-location-separator">•</span>
                          <span>{listing.bathrooms} bath</span>
                        </>
                      )}
                    </div>
                    <div className="housing-card-price-container">
                      <span className="housing-card-price" data-testid={`text-price-${listing.id}`}>
                        ${listing.price.toLocaleString()}
                      </span>
                      <span className="housing-card-price-period">{t('housing.price.period')}</span>
                    </div>
                    {listing.amenities && listing.amenities.length > 0 && (
                      <div className="housing-card-amenities">
                        {listing.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="housing-amenity-tag" data-testid={`tag-amenity-${listing.id}-${idx}`}>
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                    <a 
                      href={listing.url ? `https://cozying.ai/${listing.url}` : 'https://cozying.ai/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="housing-card-button"
                      data-testid={`button-details-${listing.id}`}
                    >
                      {t('housing.button.details')}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="housing-features-section">
        <div className="housing-features-container">
          <h2 className="housing-features-title" data-testid="text-features-title">
            {t('housing.features.title')}
          </h2>

          <div className="housing-features-grid">
            <div className="housing-feature-item" data-testid="feature-location">
              <div className="housing-feature-icon-wrapper location">
                <MapPin className="h-10 w-10" style={{color: '#F59E0B'}} />
              </div>
              <h3 className="housing-feature-title">
                {t('housing.features.location.title')}
              </h3>
              <p className="housing-feature-description">
                {t('housing.features.location.description').split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
            </div>

            <div className="housing-feature-item" data-testid="feature-search">
              <div className="housing-feature-icon-wrapper search">
                <Search className="h-10 w-10" style={{color: '#10B981'}} />
              </div>
              <h3 className="housing-feature-title">
                {t('housing.features.search.title')}
              </h3>
              <p className="housing-feature-description">
                {t('housing.features.search.description').split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
            </div>

            <div className="housing-feature-item" data-testid="feature-expert">
              <div className="housing-feature-icon-wrapper expert">
                <Users className="h-10 w-10" style={{color: '#F59E0B'}} />
              </div>
              <h3 className="housing-feature-title">
                {t('housing.features.expert.title')}
              </h3>
              <p className="housing-feature-description">
                {t('housing.features.expert.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="homepage-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-links">
              <a href="#" className="footer-link">Terms of Service</a>
              <span className="footer-link-separator">•</span>
              <a href="#" className="footer-link">Privacy Policy</a>
              <span className="footer-link-separator">•</span>
              <a href="#" className="footer-link">Contact</a>
            </div>
            <p className="footer-copyright">
              © 2025 PrepLounge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HousingPage;
