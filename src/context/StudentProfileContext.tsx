import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  category: 'safety' | 'target' | 'reach';
  admissionChance: number;
  strengthenAreas: string[];
  requiredScore: number;
  comparisonRatio: number;
}

interface StudentProfileContextType {
  profile: StudentProfile | null;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  calculateProfileScore: (profile: Partial<StudentProfile>) => number;
  getRecommendations: () => SchoolRecommendation[];
  searchSchools: (query: string) => SchoolSearchResult[];
}

export interface SchoolSearchResult {
  id: string;
  name: string;
  requiredScore: number;
  comparisonRatio: number;
  category: 'safety' | 'target' | 'reach';
  ranking: number;
  acceptanceRate: number;
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

// Mock school data with required scores
const schoolsDatabase = [
  { id: '1', name: 'Harvard University', requiredScore: 95, ranking: 2, acceptanceRate: 5.4 },
  { id: '2', name: 'Stanford University', requiredScore: 94, ranking: 3, acceptanceRate: 4.8 },
  { id: '3', name: 'MIT', requiredScore: 93, ranking: 4, acceptanceRate: 7.3 },
  { id: '4', name: 'Yale University', requiredScore: 92, ranking: 5, acceptanceRate: 6.9 },
  { id: '5', name: 'Princeton University', requiredScore: 91, ranking: 1, acceptanceRate: 5.8 },
  { id: '6', name: 'UC Berkeley', requiredScore: 78, ranking: 22, acceptanceRate: 17.5 },
  { id: '7', name: 'NYU', requiredScore: 72, ranking: 28, acceptanceRate: 21.1 },
  { id: '8', name: 'Penn State', requiredScore: 65, ranking: 63, acceptanceRate: 76.0 },
  { id: '9', name: 'University of Michigan', requiredScore: 80, ranking: 21, acceptanceRate: 26.0 },
  { id: '10', name: 'UCLA', requiredScore: 82, ranking: 20, acceptanceRate: 14.3 },
];

export const StudentProfileProvider: React.FC<StudentProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const calculateProfileScore = (profileData: Partial<StudentProfile>): number => {
    let score = 0;
    
    // ACADEMIC COMPONENTS (65 points total)
    
    // 1. GPA (30 points) - Most important academic metric
    if (profileData.gpa) {
      const gpa = profileData.gpa;
      if (gpa >= 3.9) score += 30;
      else if (gpa >= 3.7) score += 27;
      else if (gpa >= 3.5) score += 24;
      else if (gpa >= 3.3) score += 20;
      else if (gpa >= 3.0) score += 16;
      else if (gpa >= 2.7) score += 12;
      else if (gpa >= 2.5) score += 8;
      else score += (gpa / 4.0) * 8;
    }
    
    // 2. Standardized Test Scores (25 points)
    if (profileData.satEBRW && profileData.satMath) {
      const totalSAT = profileData.satEBRW + profileData.satMath;
      if (totalSAT >= 1500) score += 25;
      else if (totalSAT >= 1400) score += 22;
      else if (totalSAT >= 1300) score += 19;
      else if (totalSAT >= 1200) score += 15;
      else if (totalSAT >= 1100) score += 11;
      else if (totalSAT >= 1000) score += 7;
      else score += (totalSAT / 1600) * 7;
    } else if (profileData.actScore) {
      const act = profileData.actScore;
      if (act >= 34) score += 25;
      else if (act >= 31) score += 22;
      else if (act >= 28) score += 19;
      else if (act >= 25) score += 15;
      else if (act >= 22) score += 11;
      else if (act >= 19) score += 7;
      else score += (act / 36) * 7;
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
    
    // 5. Personal Statement (10 points) - Based on completion and length
    if (profileData.personalStatement) {
      const length = profileData.personalStatement.length;
      if (length >= 500) {
        // Full, substantial essay (typical Common App length is 250-650 words)
        score += 10;
      } else if (length >= 300) {
        // Decent length essay
        score += 7;
      } else if (length >= 150) {
        // Short but present
        score += 4;
      } else if (length > 0) {
        // Minimal effort
        score += 2;
      }
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
    
    // Calculate profile rigor score
    updatedProfile.profileRigorScore = calculateProfileScore(updatedProfile);
    
    // Generate recommendations
    updatedProfile.recommendations = generateRecommendations(updatedProfile);
    
    setProfile(updatedProfile);
  };

  const generateRecommendations = (profile: StudentProfile): SchoolRecommendation[] => {
    return schoolsDatabase.map(school => {
      const comparisonRatio = profile.profileRigorScore / school.requiredScore;
      
      // Check if user has required application components for this school
      const hasRequiredComponents = checkRequiredComponents(school.id, profile.applicationComponents);
      
      let category: 'safety' | 'target' | 'reach';
      let admissionChance: number;
      const strengthenAreas: string[] = [];

      if (!hasRequiredComponents) {
        category = 'reach';
        admissionChance = 5; // Very low chance if missing required components
        strengthenAreas.push('Complete Required Application Components');
      } else if (comparisonRatio >= 1.1) {
        category = 'safety';
        admissionChance = Math.min(85, 70 + (comparisonRatio - 1) * 50);
      } else if (comparisonRatio >= 0.9) {
        category = 'target';
        admissionChance = Math.min(65, 40 + (comparisonRatio - 0.9) * 125);
      } else {
        category = 'reach';
        admissionChance = Math.max(5, comparisonRatio * 30);
      }
      
      // Add general improvement suggestions if not already marked as unlikely
      if (hasRequiredComponents) {
        if (profile.gpa < 3.7) strengthenAreas.push('GPA');
        if ((profile.satEBRW + profile.satMath) < 1400 && profile.actScore < 30) {
          strengthenAreas.push('Standardized Test Scores');
        }
        if (profile.extracurriculars.length < 3) {
          strengthenAreas.push('Extracurricular Activities');
        }
        if (!profile.personalStatement || profile.personalStatement.length < 300) {
          strengthenAreas.push('Personal Statement');
        }
      }

      return {
        universityId: school.id,
        category,
        admissionChance: Math.round(admissionChance),
        strengthenAreas,
        requiredScore: school.requiredScore,
        comparisonRatio: Math.round(comparisonRatio * 100) / 100,
      };
    });
  };

  // Function to check if user has required application components for a specific school
  const checkRequiredComponents = (schoolId: string, components: ApplicationComponents): boolean => {
    // Define requirements for each school (this would typically come from a database)
    const schoolRequirements: { [key: string]: (keyof ApplicationComponents)[] } = {
      '1': ['secondarySchoolGPA', 'secondarySchoolRecord', 'recommendations', 'essay', 'testScores'], // Harvard
      '2': ['secondarySchoolGPA', 'secondarySchoolRecord', 'recommendations', 'essay', 'testScores'], // Stanford
      '3': ['secondarySchoolGPA', 'secondarySchoolRecord', 'recommendations', 'essay', 'testScores'], // MIT
      '4': ['secondarySchoolGPA', 'secondarySchoolRecord', 'testScores'], // UC Berkeley
      '5': ['secondarySchoolGPA', 'secondarySchoolRecord', 'recommendations', 'essay', 'testScores'], // NYU
      '6': ['secondarySchoolGPA', 'secondarySchoolRecord'], // Penn State
      '7': ['secondarySchoolGPA', 'secondarySchoolRecord', 'recommendations', 'testScores'], // University of Michigan
      '8': ['secondarySchoolGPA', 'secondarySchoolRecord', 'testScores'], // UCLA
      '9': ['secondarySchoolGPA', 'secondarySchoolRecord', 'recommendations', 'essay', 'testScores'], // Yale
      '10': ['secondarySchoolGPA', 'secondarySchoolRecord', 'recommendations', 'essay', 'testScores'], // Princeton
    };
    
    const requirements = schoolRequirements[schoolId] || [];
    return requirements.every(requirement => components[requirement]);
  };

  const searchSchools = (query: string): SchoolSearchResult[] => {
    if (!profile || !query.trim()) return [];
    
    const filteredSchools = schoolsDatabase.filter(school =>
      school.name.toLowerCase().includes(query.toLowerCase())
    );

    return filteredSchools.map(school => {
      const comparisonRatio = profile.profileRigorScore / school.requiredScore;
      let category: 'safety' | 'target' | 'reach';

      if (comparisonRatio >= 1.1) {
        category = 'safety';
      } else if (comparisonRatio >= 0.9) {
        category = 'target';
      } else {
        category = 'reach';
      }

      return {
        id: school.id,
        name: school.name,
        requiredScore: school.requiredScore,
        comparisonRatio: Math.round(comparisonRatio * 100) / 100,
        category,
        ranking: school.ranking,
        acceptanceRate: school.acceptanceRate,
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