import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import universitiesData from '../data/universities.json';
import { getBackendURL } from '../lib/backendUrl';
import { useAuth } from './AuthContext';

export interface StudentProfile {
  // Academic Inputs
  gpa: number;
  satEBRW: number;
  satMath: number;
  actScore: number;
  
  // Non-Academic Inputs
  personalStatement: string;
  extracurriculars: ExtracurricularActivity[];
  recommendationLetters: RecommendationLetter[];
  legacyStatus: boolean;
  citizenship: 'domestic' | 'international';
  
  // Additional fields for compatibility
  toeflScore: number;
  apCourses: number;
  ibScore: number;
  leadership: string[];
  volunteering: string[];
  awards: string[];
  intendedMajor: string;
  
  // Boolean Application Components Checker
  applicationComponents: ApplicationComponents;
  
  // Calculated fields
  profileScore: number;
  profileRigorScore: number;
  recommendations: SchoolRecommendation[];
  aiAnalysis?: AIAnalysisResult; // AI-generated profile analysis (strengths/weaknesses)
}

export interface ApplicationComponents {
  secondarySchoolGPA: boolean;
  secondarySchoolRank: boolean;
  secondarySchoolRecord: boolean;
  collegePrepProgram: boolean;
  recommendations: boolean;
  extracurricularActivities: boolean;
  essay: boolean;
  testScores: boolean;
}

export interface ExtracurricularActivity {
  id: string;
  type: 'Sports' | 'Arts' | 'Community Service' | 'Research' | 'Academic Clubs' | 'Leadership' | 'Work Experience' | 'Other';
  name: string;
  description: string;
  grades?: string[];
  recognitionLevel: 'Local' | 'Regional' | 'National' | 'International';
  hoursPerWeek: number;
}

export interface RecommendationLetter {
  id: string;
  source: 'Teacher' | 'Counselor' | 'Principal' | 'Coach' | 'Employer' | 'Other';
  depth?: string;
  relevance?: string;
}

export interface SchoolRecommendation {
  universityId: string;
  universityName?: string; // Bilingual name from API (e.g., "Harvard University (하버드 대학교)")
  universityState?: string; // State from API
  category: 'safety' | 'target' | 'reach' | 'prestige';
  admissionChance: number;
  strengthenAreas: string[];
  qualityScore?: number; // Quality score from API for sorting
}

export interface AIAnalysisResult {
  strengths: string[];
  weaknesses: string[];
}

interface StudentProfileContextType {
  profile: StudentProfile | null;
  updateProfile: (profile: Partial<StudentProfile>) => Promise<void>;
  calculateProfileScore: (profile: Partial<StudentProfile>) => number;
  getRecommendations: () => SchoolRecommendation[];
  searchSchools: (query: string, currentLanguage?: string) => SchoolSearchResult[];
  loading: boolean;
  error: string | null;
}

export interface SchoolSearchResult {
  id: string;
  name: string;
  state: string;
  category?: 'safety' | 'target' | 'reach' | 'prestige';
  admissionProbability: number;
}

const StudentProfileContext = createContext<StudentProfileContextType | undefined>(undefined);

export const useStudentProfile = () => {
  const context = useContext(StudentProfileContext);
  if (context === undefined) {
    throw new Error('useStudentProfile must be used within a StudentProfileProvider');
  }
  return context;
};

interface StudentProfileProviderProps {
  children: ReactNode;
}

// Convert universities data to searchable format
const schoolsDatabase = universitiesData.map((university: any) => {
  return {
    id: university.id,
    name: university.name,
    englishName: university.englishName,
    ranking: university.ranking || 999,
    acceptanceRate: parseFloat(university.acceptanceRate) || 0,
  };
});

export const StudentProfileProvider: React.FC<StudentProfileProviderProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('[StudentProfileContext] useEffect triggered - authLoading:', authLoading, 'user:', user?.id, 'loadedUserIdRef:', loadedUserIdRef.current);
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('[StudentProfileContext] Auth still loading, skipping...');
      return;
    }

    const currentUserId = user?.id || null;

    // If no user, clear profile and stop loading
    if (!user) {
      console.log('[StudentProfileContext] No user logged in, clearing profile');
      if (loadedUserIdRef.current !== null) {
        setProfile(null);
        loadedUserIdRef.current = null;
      }
      setLoading(false);
      return;
    }

    // Skip if already loaded for this user
    if (loadedUserIdRef.current === currentUserId) {
      console.log('[StudentProfileContext] Profile already loaded for this user, skipping');
      setLoading(false);
      return;
    }

    // Load profile for new user
    console.log('[StudentProfileContext] Starting profile load for user:', currentUserId);
    const loadProfile = async () => {
      loadedUserIdRef.current = currentUserId;
      setError(null); // Clear previous errors
      
      try {
        console.log('[StudentProfileContext] Fetching profile from API for user:', user.id);
        const response = await fetch(`${getBackendURL()}/api/profile`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('[StudentProfileContext] Profile loaded from API:', data);
          if (data.profile) {
            setProfile(data.profile);
            setError(null);
          } else {
            // API returned 200 but no profile exists on server - this is OK, user hasn't created profile yet
            console.log('[StudentProfileContext] No profile found on server');
            setProfile(null);
            setError(null);
          }
        } else if (response.status === 401) {
          // Unauthorized - user not logged in, clear profile
          console.error('[StudentProfileContext] Unauthorized - user not logged in');
          setProfile(null);
          setError('Please log in to view your profile');
        } else {
          // API error - preserve current profile, surface error
          const errorMsg = `Failed to load profile from server (Error ${response.status})`;
          console.error('[StudentProfileContext] API error:', response.status);
          setError(errorMsg);
          // Don't clear profile - preserve in-memory state
        }
      } catch (error) {
        console.error('[StudentProfileContext] Error loading profile:', error);
        // Network error - preserve current profile, surface error
        setError('Network error: Unable to connect to server');
        // Don't clear profile - preserve in-memory state
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, authLoading]);

  const calculateProfileScore = (profileData: Partial<StudentProfile>): number => {
    let score = 0;
    
    // NOTE: This scoring function IGNORES checklist items (applicationComponents)
    // and ONLY uses actual form inputs for objective, deterministic scoring.
    
    // ACADEMIC COMPONENTS (65 points total)
    
    // 1. GPA (30 points) - Most important academic metric
    // Scaled to reflect competitiveness across ALL school types
    if (profileData.gpa) {
      const gpa = profileData.gpa;
      if (gpa >= 3.9) score += 30;        // Top tier schools (Ivy League, Top 20)
      else if (gpa >= 3.7) score += 28;   // Highly competitive (Top 50)
      else if (gpa >= 3.5) score += 25;   // Competitive (Top 100)
      else if (gpa >= 3.3) score += 22;   // Good schools (Top 200)
      else if (gpa >= 3.0) score += 19;   // Solid state universities
      else if (gpa >= 2.7) score += 15;   // Many colleges accept
      else if (gpa >= 2.5) score += 12;   // Community colleges, less selective
      else if (gpa >= 2.0) score += 8;    // Open admission schools
      else score += (gpa / 4.0) * 8;      // Proportional for below 2.0
    }
    
    // 2. Standardized Test Scores (25 points)
    // Reflects competitiveness across school spectrum
    if (profileData.satEBRW && profileData.satMath) {
      const totalSAT = profileData.satEBRW + profileData.satMath;
      if (totalSAT >= 1500) score += 25;      // Top tier (Ivy League, MIT, Stanford)
      else if (totalSAT >= 1400) score += 23; // Highly selective (Top 30)
      else if (totalSAT >= 1300) score += 20; // Competitive (Top 100)
      else if (totalSAT >= 1200) score += 17; // Good schools (Top 200)
      else if (totalSAT >= 1100) score += 14; // Many state universities
      else if (totalSAT >= 1000) score += 11; // Less selective colleges
      else if (totalSAT >= 900) score += 8;   // Open admission schools
      else score += (totalSAT / 1600) * 8;    // Proportional below 900
    } else if (profileData.actScore) {
      const act = profileData.actScore;
      if (act >= 34) score += 25;       // Top tier
      else if (act >= 31) score += 23;  // Highly selective
      else if (act >= 28) score += 20;  // Competitive
      else if (act >= 25) score += 17;  // Good schools
      else if (act >= 22) score += 14;  // Many state universities
      else if (act >= 19) score += 11;  // Less selective
      else if (act >= 16) score += 8;   // Open admission
      else score += (act / 36) * 8;     // Proportional below 16
    }
    
    // 3. Course Rigor - AP/IB (10 points)
    // This is a placeholder as we don't collect this data yet
    // For now, we'll award baseline points if student has good GPA
    if (profileData.apCourses && profileData.apCourses > 0) {
      score += Math.min(profileData.apCourses * 1.5, 10);
    } else if (profileData.ibScore && profileData.ibScore > 0) {
      score += (profileData.ibScore / 45) * 10;
    } else if (profileData.gpa && profileData.gpa >= 3.5) {
      score += 5; // Assume some rigor if GPA is strong
    }
    
    // NON-ACADEMIC COMPONENTS (35 points total)
    
    // 4. Extracurricular Activities (15 points)
    if (profileData.extracurriculars && profileData.extracurriculars.length > 0) {
      let ecScore = 0;
      
      profileData.extracurriculars.forEach(activity => {
        let points = 0;
        
        // Recognition level (0-3 points per activity)
        switch (activity.recognitionLevel) {
          case 'International': points += 3; break;
          case 'National': points += 2.5; break;
          case 'Regional': points += 1.5; break;
          case 'Local': points += 0.5; break;
        }
        
        // Time commitment (0-1.5 points per activity)
        if (activity.hoursPerWeek >= 15) points += 1.5;
        else if (activity.hoursPerWeek >= 10) points += 1;
        else if (activity.hoursPerWeek >= 5) points += 0.5;
        
        ecScore += points;
      });
      
      // Cap at 15 points (roughly 3-4 strong activities max out the score)
      score += Math.min(ecScore, 15);
    }
    
    // 5. Personal Statement (10 points) - Simple check if they have it
    if (profileData.personalStatement && profileData.personalStatement.trim().length > 0) {
      score += 10;
    }
    
    // 6. Recommendation Letters (5 points)
    if (profileData.recommendationLetters && profileData.recommendationLetters.length > 0) {
      const letters = profileData.recommendationLetters;
      let letterScore = 0;
      
      // Base points for having letters
      if (letters.length >= 3) letterScore += 2;
      else if (letters.length >= 2) letterScore += 1.5;
      else letterScore += 0.5;
      
      // Quality bonus based on depth and relevance
      letters.forEach(letter => {
        if (letter.depth === 'knows very well') letterScore += 0.8;
        else if (letter.depth === 'knows well') letterScore += 0.5;
        else if (letter.depth === 'knows somewhat') letterScore += 0.2;
        
        if (letter.relevance === 'very relevant') letterScore += 0.5;
        else if (letter.relevance === 'somewhat relevant') letterScore += 0.2;
      });
      
      score += Math.min(letterScore, 5);
    }
    
    // 7. Legacy Status (2 points) - Small boost
    if (profileData.legacyStatus) {
      score += 2;
    }
    
    // 8. English Proficiency for International Students (3 points)
    if (profileData.citizenship === 'international' && profileData.toeflScore) {
      if (profileData.toeflScore >= 110) score += 3;
      else if (profileData.toeflScore >= 100) score += 2.5;
      else if (profileData.toeflScore >= 90) score += 2;
      else if (profileData.toeflScore >= 80) score += 1.5;
      else score += (profileData.toeflScore / 120) * 1.5;
    } else if (profileData.citizenship === 'domestic') {
      // Domestic students get full 3 points (no language barrier)
      score += 3;
    }
    
    return Math.round(Math.min(score, 100));
  };

  const updateProfile = async (newProfileData: Partial<StudentProfile>) => {
    const updatedProfile = profile ? { ...profile, ...newProfileData } : {
      gpa: 0,
      satEBRW: 0,
      satMath: 0,
      actScore: 0,
      personalStatement: '',
      extracurriculars: [],
      recommendationLetters: [],
      legacyStatus: false,
      citizenship: 'domestic' as const,
      toeflScore: 0,
      apCourses: 0,
      ibScore: 0,
      leadership: [],
      volunteering: [],
      awards: [],
      intendedMajor: '',
      applicationComponents: {
        secondarySchoolGPA: false,
        secondarySchoolRank: false,
        secondarySchoolRecord: false,
        collegePrepProgram: false,
        recommendations: false,
        extracurricularActivities: false,
        essay: false,
        testScores: false,
      },
      profileScore: 0,
      profileRigorScore: 0,
      recommendations: [],
      ...newProfileData,
    };
    
    // Auto-update application components based on profile data
    updatedProfile.applicationComponents = {
      ...updatedProfile.applicationComponents,
      secondarySchoolGPA: updatedProfile.gpa > 0,
      secondarySchoolRank: false, // User needs to manually check this
      secondarySchoolRecord: false, // User needs to manually check this
      collegePrepProgram: false, // User needs to manually check this
      recommendations: updatedProfile.recommendationLetters.length > 0,
      extracurricularActivities: updatedProfile.extracurriculars.length > 0,
      essay: updatedProfile.personalStatement.length > 0,
      testScores: (updatedProfile.satEBRW > 0 && updatedProfile.satMath > 0) || updatedProfile.actScore > 0 || updatedProfile.toeflScore > 0,
      ...newProfileData.applicationComponents,
    };
    
    // Calculate profile score
    const calculatedScore = calculateProfileScore(updatedProfile);
    updatedProfile.profileScore = calculatedScore;
    updatedProfile.profileRigorScore = calculatedScore;
    
    // Generate recommendations ONLY if not explicitly provided
    if (!newProfileData.recommendations) {
      updatedProfile.recommendations = generateRecommendations(updatedProfile);
    }
    
    setProfile(updatedProfile);
    
    // Save to backend API (loaning.ai server - source of truth)
    try {
      console.log('[StudentProfileContext] Saving profile to API:', updatedProfile);
      const response = await fetch(`${getBackendURL()}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedProfile),
      });
      
      if (!response.ok) {
        console.error('[StudentProfileContext] Failed to save profile to API:', response.status);
        const errorMsg = `Failed to save profile to server (Error ${response.status})`;
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('[StudentProfileContext] Profile saved successfully to API');
      setError(null); // Clear any previous errors on success
    } catch (error) {
      console.error('[StudentProfileContext] Error saving profile to backend:', error);
      const errorMsg = error instanceof Error ? error.message : 'Network error: Unable to save profile';
      setError(errorMsg);
      // Re-throw error so UI can handle it
      throw error;
    }
  };

  const generateRecommendations = (_profile: StudentProfile): SchoolRecommendation[] => {
    // This function is deprecated - recommendations now come from the PrepLounge AI API
    // Return empty array to avoid errors
    return [];
  };

  const searchSchools = (query: string, currentLanguage?: string): SchoolSearchResult[] => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase().trim();
    
    // Get API recommendations if available
    const recommendations = profile?.recommendations || [];
    
    // ONLY search through analyzed schools (those in recommendations)
    const searchableSchools = recommendations.map(rec => {
      const school = schoolsDatabase.find(s => s.id === rec.universityId);
      return school ? { ...school, apiRec: rec } : null;
    }).filter(Boolean) as Array<typeof schoolsDatabase[0] & { apiRec: SchoolRecommendation }>;
    
    // Filter and rank by search quality
    const filteredSchools = searchableSchools
      .map(school => {
        const koreanName = school.name.toLowerCase();
        const englishName = school.englishName.toLowerCase();
        
        // Check for matches
        const koreanMatch = koreanName.includes(lowerQuery);
        const englishMatch = englishName.includes(lowerQuery);
        
        if (!koreanMatch && !englishMatch) return null;
        
        // Calculate match quality (lower = better)
        let matchScore = 100;
        
        // Exact match = best
        if (koreanName === lowerQuery || englishName === lowerQuery) {
          matchScore = 0;
        }
        // Starts with query = very good
        else if (koreanName.startsWith(lowerQuery) || englishName.startsWith(lowerQuery)) {
          matchScore = 10;
        }
        // Contains query = okay
        else {
          matchScore = 50;
        }
        
        return { school, matchScore };
      })
      .filter(Boolean)
      .sort((a, b) => a!.matchScore - b!.matchScore)
      .slice(0, 50)
      .map(item => item!.school);
    
    // Map results with API data
    const results = filteredSchools.map(school => {
      // Use language-appropriate name
      const displayName = currentLanguage === 'en' ? school.englishName : school.name;
      
      return {
        id: school.id,
        name: displayName,
        state: school.apiRec.universityState || '',
        category: school.apiRec.category,
        admissionProbability: school.apiRec.admissionChance / 100, // Convert back to decimal for consistent display
      };
    });
    
    // Sort by category difficulty: Safety → Target → Reach → Prestige
    const categoryOrder = { safety: 1, target: 2, reach: 3, prestige: 4 };
    results.sort((a, b) => {
      const orderA = categoryOrder[a.category || 'safety'];
      const orderB = categoryOrder[b.category || 'safety'];
      return orderA - orderB;
    });
    
    return results;
  };

  const getRecommendations = (): SchoolRecommendation[] => {
    return profile?.recommendations || [];
  };

  const value = {
    profile,
    updateProfile,
    calculateProfileScore,
    getRecommendations,
    searchSchools,
    loading,
    error,
  };

  return (
    <StudentProfileContext.Provider value={value}>
      {children}
    </StudentProfileContext.Provider>
  );
};