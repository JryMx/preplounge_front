export interface CozyingListing {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  imageUrl?: string;
  distance?: string;
  amenities?: string[];
  available: boolean;
  sqft?: number;
  propertyType?: string;
  images?: string[];
  url?: string;
}

export interface CozyingSearchParams {
  city?: string;
  state?: string;
  sorted?: 'newest' | 'oldest' | 'price_low' | 'price_high';
  currentPage?: number;
  homesPerGroup?: number;
}

const API_BASE_URL = 'https://dev.cozying.ai/cozying-api/v1';

// Helper functions to extract city/state from address
function extractCity(address: string): string {
  if (!address) return '';
  // Format: "123 Main St, City, STATE 12345"
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[parts.length - 2].trim();
  }
  return '';
}

function extractState(address: string): string {
  if (!address) return '';
  // Format: "123 Main St, City, STATE 12345"
  const parts = address.split(',');
  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1].trim();
    const stateMatch = lastPart.match(/^([A-Z]{2})/);
    return stateMatch ? stateMatch[1] : '';
  }
  return '';
}

export async function searchListings(params: CozyingSearchParams = {}): Promise<CozyingListing[]> {
  const queryParams = new URLSearchParams();
  
  if (params.city) queryParams.append('city', params.city);
  if (params.state) queryParams.append('state', params.state);
  queryParams.append('sorted', params.sorted || 'newest');
  queryParams.append('currentPage', (params.currentPage || 1).toString());
  queryParams.append('homesPerGroup', (params.homesPerGroup || 200).toString());

  const endpoint = `/home/list?${queryParams.toString()}`;
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // Transform the API response to our format
    const homes = data.homes || data.data || data || [];
    
    return homes.map((home: any) => ({
      id: home.homeId || home.id || home._id || `home-${Math.random()}`,
      title: home.fullAddress || home.address || 'Property',
      address: home.fullAddress || home.address || '',
      city: extractCity(home.fullAddress) || home.city || '',
      state: extractState(home.fullAddress) || home.state || '',
      price: home.price || 0,
      bedrooms: home.beds || home.bedrooms,
      bathrooms: home.baths || home.bathrooms,
      // Use real images from the API
      imageUrl: home.images?.[0] || home.image || home.photos?.[0] || '',
      images: home.images || home.photos || [],
      sqft: home.size || home.sqft,
      propertyType: home.cozyingPropertyType || home.propertyType || home.homeType,
      amenities: home.amenities || [],
      available: home.homeStatus === 'Active' || true,
      url: home.url || '',
    }));
  } catch (error) {
    console.error('Error fetching Cozying listings:', error);
    throw error;
  }
}

export async function autocompleteSearch(query: string): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/search/autocomplete?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.suggestions || data || [];
  } catch (error) {
    console.error('Error with autocomplete:', error);
    return [];
  }
}

// Helper to parse location into city and state
export function parseLocation(location: string): { city?: string; state?: string } {
  const parts = location.split(',').map(p => p.trim());
  
  if (parts.length === 2) {
    return { city: parts[0], state: parts[1] };
  } else if (parts.length === 1) {
    // Assume it's a city name, we'll try common university cities
    return { city: parts[0] };
  }
  
  return {};
}

// Map university names to cities
export function getUniversityLocation(university: string): { city: string; state: string } | null {
  const universityMap: Record<string, { city: string; state: string }> = {
    'harvard': { city: 'Cambridge', state: 'MA' },
    'mit': { city: 'Cambridge', state: 'MA' },
    'stanford': { city: 'Stanford', state: 'CA' },
    'berkeley': { city: 'Berkeley', state: 'CA' },
    'ucla': { city: 'Los Angeles', state: 'CA' },
    'usc': { city: 'Los Angeles', state: 'CA' },
    'columbia': { city: 'New York', state: 'NY' },
    'nyu': { city: 'New York', state: 'NY' },
    'yale': { city: 'New Haven', state: 'CT' },
    'princeton': { city: 'Princeton', state: 'NJ' },
    'penn': { city: 'Philadelphia', state: 'PA' },
    'upenn': { city: 'Philadelphia', state: 'PA' },
    'cornell': { city: 'Ithaca', state: 'NY' },
    'brown': { city: 'Providence', state: 'RI' },
    'dartmouth': { city: 'Hanover', state: 'NH' },
    'duke': { city: 'Durham', state: 'NC' },
    'northwestern': { city: 'Evanston', state: 'IL' },
    'uchicago': { city: 'Chicago', state: 'IL' },
    'chicago': { city: 'Chicago', state: 'IL' },
    'umich': { city: 'Ann Arbor', state: 'MI' },
    'michigan': { city: 'Ann Arbor', state: 'MI' },
    'uva': { city: 'Charlottesville', state: 'VA' },
    'virginia': { city: 'Charlottesville', state: 'VA' },
  };
  
  const normalized = university.toLowerCase().trim();
  return universityMap[normalized] || null;
}
