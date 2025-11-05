// Major US university coordinates for map display
export interface UniversityLocation {
  name: string;
  abbreviation: string;
  lat: number;
  lng: number;
}

export const universityCoordinates: Record<string, UniversityLocation> = {
  // Ivy League & Elite East Coast
  "Harvard University": { name: "Harvard University", abbreviation: "H", lat: 42.3744, lng: -71.1169 },
  "Yale University": { name: "Yale University", abbreviation: "Y", lat: 41.3163, lng: -72.9223 },
  "Princeton University": { name: "Princeton University", abbreviation: "P", lat: 40.3431, lng: -74.6551 },
  "Columbia University": { name: "Columbia University", abbreviation: "CU", lat: 40.8075, lng: -73.9626 },
  "University of Pennsylvania": { name: "University of Pennsylvania", abbreviation: "Penn", lat: 39.9522, lng: -75.1932 },
  "Brown University": { name: "Brown University", abbreviation: "B", lat: 41.8268, lng: -71.4025 },
  "Dartmouth College": { name: "Dartmouth College", abbreviation: "D", lat: 43.7044, lng: -72.2887 },
  "Cornell University": { name: "Cornell University", abbreviation: "C", lat: 42.4534, lng: -76.4735 },
  
  // Top California Schools
  "Stanford University": { name: "Stanford University", abbreviation: "S", lat: 37.4275, lng: -122.1697 },
  "University of California-Berkeley": { name: "University of California-Berkeley", abbreviation: "Cal", lat: 37.8719, lng: -122.2585 },
  "University of California-Los Angeles": { name: "University of California-Los Angeles", abbreviation: "UCLA", lat: 34.0689, lng: -118.4452 },
  "University of Southern California": { name: "University of Southern California", abbreviation: "USC", lat: 34.0224, lng: -118.2851 },
  "California Institute of Technology": { name: "California Institute of Technology", abbreviation: "Caltech", lat: 34.1378, lng: -118.1253 },
  "University of California-San Diego": { name: "University of California-San Diego", abbreviation: "UCSD", lat: 32.8801, lng: -117.2340 },
  "University of California-Irvine": { name: "University of California-Irvine", abbreviation: "UCI", lat: 33.6405, lng: -117.8443 },
  "University of California-Davis": { name: "University of California-Davis", abbreviation: "UCD", lat: 38.5382, lng: -121.7617 },
  "University of California-Santa Barbara": { name: "University of California-Santa Barbara", abbreviation: "UCSB", lat: 34.4140, lng: -119.8489 },
  
  // Midwest & Central
  "University of Chicago": { name: "University of Chicago", abbreviation: "UChicago", lat: 41.7886, lng: -87.5987 },
  "Northwestern University": { name: "Northwestern University", abbreviation: "NU", lat: 42.0565, lng: -87.6753 },
  "University of Michigan-Ann Arbor": { name: "University of Michigan-Ann Arbor", abbreviation: "UMich", lat: 42.2776, lng: -83.7382 },
  "University of Illinois Urbana-Champaign": { name: "University of Illinois Urbana-Champaign", abbreviation: "UIUC", lat: 40.1020, lng: -88.2272 },
  "University of Wisconsin-Madison": { name: "University of Wisconsin-Madison", abbreviation: "UW", lat: 43.0747, lng: -89.3842 },
  "University of Notre Dame": { name: "University of Notre Dame", abbreviation: "ND", lat: 41.7033, lng: -86.2390 },
  "Washington University in St Louis": { name: "Washington University in St Louis", abbreviation: "WashU", lat: 38.6488, lng: -90.3050 },
  
  // South
  "Duke University": { name: "Duke University", abbreviation: "Duke", lat: 36.0014, lng: -78.9382 },
  "Rice University": { name: "Rice University", abbreviation: "Rice", lat: 29.7174, lng: -95.4018 },
  "Vanderbilt University": { name: "Vanderbilt University", abbreviation: "Vandy", lat: 36.1447, lng: -86.8027 },
  "Emory University": { name: "Emory University", abbreviation: "Emory", lat: 33.7925, lng: -84.3240 },
  "University of North Carolina at Chapel Hill": { name: "University of North Carolina at Chapel Hill", abbreviation: "UNC", lat: 35.9049, lng: -79.0469 },
  "University of Virginia-Main Campus": { name: "University of Virginia-Main Campus", abbreviation: "UVA", lat: 38.0336, lng: -78.5080 },
  "University of Texas at Austin": { name: "University of Texas at Austin", abbreviation: "UT", lat: 30.2849, lng: -97.7341 },
  "University of Florida": { name: "University of Florida", abbreviation: "UF", lat: 29.6436, lng: -82.3549 },
  
  // Northwest & Other
  "University of Washington-Seattle Campus": { name: "University of Washington-Seattle Campus", abbreviation: "UW", lat: 47.6553, lng: -122.3035 },
  "Massachusetts Institute of Technology": { name: "Massachusetts Institute of Technology", abbreviation: "MIT", lat: 42.3601, lng: -71.0942 },
  "Carnegie Mellon University": { name: "Carnegie Mellon University", abbreviation: "CMU", lat: 40.4433, lng: -79.9436 },
  "Johns Hopkins University": { name: "Johns Hopkins University", abbreviation: "JHU", lat: 39.3299, lng: -76.6205 },
  "Georgetown University": { name: "Georgetown University", abbreviation: "GU", lat: 38.9076, lng: -77.0723 },
  "New York University": { name: "New York University", abbreviation: "NYU", lat: 40.7295, lng: -73.9965 },
  "Boston University": { name: "Boston University", abbreviation: "BU", lat: 42.3505, lng: -71.1054 },
  "Boston College": { name: "Boston College", abbreviation: "BC", lat: 42.3356, lng: -71.1685 },
};

// Helper function to get coordinates for a university by English name
export const getUniversityCoordinates = (englishName: string): UniversityLocation | null => {
  return universityCoordinates[englishName] || null;
};

// Get abbreviation for a university
export const getUniversityAbbreviation = (englishName: string): string => {
  const coords = universityCoordinates[englishName];
  if (coords) return coords.abbreviation;
  
  // Generate abbreviation from initials if not found
  const words = englishName.split(' ').filter(w => !['of', 'at', 'in', 'the', '-'].includes(w.toLowerCase()));
  if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
  return words.map(w => w[0]).join('').toUpperCase().substring(0, 4);
};
