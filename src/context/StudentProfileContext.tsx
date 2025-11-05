import React, { createContext, useContext, useState, ReactNode } from 'react';
import universitiesData from '../data/universities.json';

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
}

interface StudentProfileContextType {
  profile: StudentProfile | null;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  calculateProfileScore: (profile: Partial<StudentProfile>) => number;
  getRecommendations: () => SchoolRecommendation[];
  searchSchools: (query: string, currentLanguage?: string) => SchoolSearchResult[];
}

export interface SchoolSearchResult {
  id: string;
  name: string;
  category?: 'safety' | 'target' | 'reach' | 'prestige';
  ranking: number;
  acceptanceRate: number;
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
  const [profile, setProfile] = useState<StudentProfile | null>(null);

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

  const updateProfile = (newProfileData: Partial<StudentProfile>) => {
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
    
    console.log('SEARCH - Total recommendations in profile:', recommendations.length);
    console.log('SEARCH - All IDs:', recommendations.map(r => `${r.universityId} (${r.category})`));
    
    // Search through ALL schools in database
    const filteredSchools = schoolsDatabase.filter(school => {
      const koreanMatch = school.name.toLowerCase().includes(lowerQuery);
      const englishMatch = school.englishName.toLowerCase().includes(lowerQuery);
      return koreanMatch || englishMatch;
    });
    
    // Map results and add API probability if available
    return filteredSchools.slice(0, 50).map(school => {
      // Try to find API recommendation for this school
      const apiRec = recommendations.find(rec => rec.universityId === school.id);
      
      console.log(`School: ${school.id} (${school.englishName}) - Match: ${apiRec ? 'YES' : 'NO'}`);
      
      // Use language-appropriate name
      const displayName = currentLanguage === 'en' ? school.englishName : school.name;
      
      return {
        id: school.id,
        name: displayName,
        category: apiRec?.category, // Undefined if no API data
        ranking: school.ranking,
        acceptanceRate: school.acceptanceRate,
        admissionProbability: apiRec ? Math.round(apiRec.admissionChance * 10) / 10 : 0,
      };
    });
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
  };

  return (
    <StudentProfileContext.Provider value={value}>
      {children}
    </StudentProfileContext.Provider>
  );
};