import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import universitiesData from '../data/universities.json';
import { getBackendURL } from '../lib/backendUrl';
import { useAuth } from './AuthContext';
import { estimateCompositePercentile } from '../utils/compositeScoringService';

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

export interface CompetitiveScoreDescription {
  percentile_pct: number;        // e.g., 96
  top_percent: number;           // e.g., 4 (top 4%)
  stronger_than: number;         // e.g., 9590 (out of 10,000)
  phrasing: string;              // e.g., "top 4%" or "bottom 30%"
}

interface StudentProfileContextType {
  profile: StudentProfile | null;
  updateProfile: (profile: Partial<StudentProfile>) => Promise<void>;
  calculateProfileScore: (profile: Partial<StudentProfile>) => number;
  describeCompetitiveScore: (percentile: number) => CompetitiveScoreDescription;
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
        const response = await fetch(`${getBackendURL()}/api/v1/profile`, {
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
    // NEW COMPOSITE SCORING: GPA + (SAT OR ACT) using quartile data
    // Based on SAT/ACT/GPA score distribution from 1,234+ U.S. universities
    
    const gpa = profileData.gpa || 0;
    
    if (gpa === 0) return 0;
    
    try {
      let compositeResult;
      
      if (profileData.satEBRW && profileData.satMath) {
        const totalSAT = profileData.satEBRW + profileData.satMath;
        if (totalSAT === 0) return 0;
        
        compositeResult = estimateCompositePercentile(gpa, totalSAT, undefined);
      } else if (profileData.actScore) {
        if (profileData.actScore === 0) return 0;
        
        compositeResult = estimateCompositePercentile(gpa, undefined, profileData.actScore);
      } else {
        return 0;
      }
      
      // Convert percentile (0-1) to score (0-100)
      const score = Math.min(Math.max(compositeResult.composite * 100, 0), 100);
      return Math.round(score);
    } catch (error) {
      console.error('Error calculating composite score:', error);
      return 0;
    }
  };

  const describeCompetitiveScore = (percentile: number): CompetitiveScoreDescription => {
    // percentile: 0-100 (e.g., 95.94 means 95.94th percentile, top 4.06%)
    const percentile_pct = percentile;
    const top_pct = 100 - percentile_pct;
    const stronger_than = (percentile_pct / 100) * 10000;
    
    // Round values for readability
    const perc_rounded = Math.round(percentile_pct);
    const top_rounded = Math.round(top_pct);
    const stronger_rounded = Math.round(stronger_than / 10) * 10; // Round to nearest 10
    
    // Choose best phrasing based on actual position
    // If percentile > 50, student is in top half ("top X%")
    // If percentile < 50, student is in bottom half ("bottom Y%")
    let phrase: string;
    if (percentile_pct >= 50) {
      // Top half: use "top X%"
      phrase = `top ${top_rounded}%`;
    } else {
      // Bottom half: use "bottom Y%"
      const bottom_pct = Math.round(percentile_pct);
      phrase = `bottom ${bottom_pct}%`;
    }
    
    return {
      percentile_pct: perc_rounded,
      top_percent: top_rounded,
      stronger_than: stronger_rounded,
      phrasing: phrase
    };
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
      const response = await fetch(`${getBackendURL()}/api/v1/profile`, {
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
    describeCompetitiveScore,
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