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
}

export interface CozyingSearchParams {
  location?: string;
  university?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  limit?: number;
  offset?: number;
}

const API_BASE_URL = 'https://dev.cozying.ai/cozying-api/v1';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const apiKey = import.meta.env.VITE_COZYING_API_KEY;
  
  if (!apiKey) {
    console.warn('COZYING_API_KEY is not configured');
    throw new Error('API key not configured');
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Cozying API error: ${response.status}`, text);
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export async function searchListings(params: CozyingSearchParams = {}): Promise<CozyingListing[]> {
  const queryParams = new URLSearchParams();
  
  if (params.location) queryParams.append('location', params.location);
  if (params.university) queryParams.append('university', params.university);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params.bedrooms) queryParams.append('bedrooms', params.bedrooms.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  const endpoint = `/search/listings?${queryParams.toString()}`;
  
  try {
    const data = await fetchWithAuth(endpoint);
    console.log('API Response:', data);
    return data.items || data.data || data || [];
  } catch (error) {
    console.error('Error fetching Cozying listings:', error);
    throw error; // Throw error so we can handle it in the component
  }
}

export async function getHomeList(): Promise<CozyingListing[]> {
  try {
    const data = await fetchWithAuth('/home/list');
    return data.items || data.data || data || [];
  } catch (error) {
    console.error('Error fetching home list:', error);
    return [];
  }
}

export async function autocompleteSearch(query: string): Promise<string[]> {
  try {
    const data = await fetchWithAuth(`/search/autocomplete?q=${encodeURIComponent(query)}`);
    return data.suggestions || data || [];
  } catch (error) {
    console.error('Error with autocomplete:', error);
    return [];
  }
}
