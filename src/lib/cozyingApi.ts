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

const API_BASE_URL = 'https://cozying.ai/cozying-api/v1';

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
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
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

// US States mapping - standard reference data for validation
const US_STATES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
};

// Create reverse lookup: state name -> code
const STATE_NAME_TO_CODE: Record<string, string> = Object.entries(US_STATES).reduce(
  (acc, [code, name]) => {
    acc[name.toLowerCase()] = code;
    return acc;
  },
  {} as Record<string, string>
);

// Smart location parser - handles various formats without hardcoded city lists
export function parseLocation(location: string): { city: string; state: string } | null {
  if (!location || !location.trim()) {
    return null;
  }

  const input = location.trim();
  
  // Try comma-separated format first: "City, State" or "City, ST"
  if (input.includes(',')) {
    const parts = input.split(',').map(p => p.trim());
    
    if (parts.length >= 2) {
      const city = parts[0];
      const statePart = parts[parts.length - 1];
      
      // Check if it's a 2-letter state code
      const stateUpper = statePart.toUpperCase();
      if (stateUpper.length === 2 && US_STATES[stateUpper]) {
        return { city, state: stateUpper };
      }
      
      // Check if it's a full state name
      const stateCode = STATE_NAME_TO_CODE[statePart.toLowerCase()];
      if (stateCode) {
        return { city, state: stateCode };
      }
      
      // If we can't recognize the state, return what we have
      return { city, state: statePart };
    }
  }
  
  // Try to extract state from the end of the string
  const words = input.split(/\s+/);
  
  // Check if last word is a state code (e.g., "New York NY")
  if (words.length >= 2) {
    const lastWord = words[words.length - 1].toUpperCase();
    if (lastWord.length === 2 && US_STATES[lastWord]) {
      const city = words.slice(0, -1).join(' ');
      return { city, state: lastWord };
    }
  }
  
  // Check if last 2 words are a state name (e.g., "Boston Massachusetts")
  if (words.length >= 2) {
    const lastTwoWords = words.slice(-2).join(' ').toLowerCase();
    const stateCode = STATE_NAME_TO_CODE[lastTwoWords];
    if (stateCode) {
      const city = words.slice(0, -2).join(' ');
      return { city, state: stateCode };
    }
    
    const lastWord = words[words.length - 1].toLowerCase();
    const lastWordStateCode = STATE_NAME_TO_CODE[lastWord];
    if (lastWordStateCode) {
      const city = words.slice(0, -1).join(' ');
      return { city, state: lastWordStateCode };
    }
  }
  
  // No state found - return null to indicate ambiguous location
  // Don't default to any state, let the calling code handle it
  return null;
}
