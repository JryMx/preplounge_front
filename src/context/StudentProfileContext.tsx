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
    
    // Academic Inputs (60% weight)
    // GPA (25% of total)
    if (profileData.gpa) {
      score += (profileData.gpa / 4.0) * 25;
    }
    
    // SAT Scores (20% of total)
    if (profileData.satEBRW && profileData.satMath) {
      const totalSAT = profileData.satEBRW + profileData.satMath;
      score += (totalSAT / 1600) * 20;
    } else if (profileData.actScore) {
      // Convert ACT to equivalent weight
      score += (profileData.actScore / 36) * 20;
    }
    
    // AP/IB Courses (15% of total)
    if (profileData.apCourses) {
      score += Math.min(profileData.apCourses / 8, 1) * 15;
    }
    if (profileData.ibScore) {
      score += (profileData.ibScore / 45) * 15;
    }
    
    // Non-Academic Inputs (40% weight)
    // Extracurricular Activities (20% of total)
    if (profileData.extracurriculars && profileData.extracurriculars.length > 0) {
      let extracurricularScore = 0;
      profileData.extracurriculars.forEach(activity => {
        let activityScore = 2; // Base score
        
        // Recognition level bonus
        switch (activity.recognitionLevel) {
          case 'International': activityScore += 4; break;
          case 'National': activityScore += 3; break;
          case 'Regional': activityScore += 2; break;
          case 'Local': activityScore += 1; break;
        }
        
        // Duration bonus (simplified)
        if (activity.hoursPerWeek >= 10) activityScore += 2;
        else if (activity.hoursPerWeek >= 5) activityScore += 1;
        
        extracurricularScore += activityScore;
      });
      
      score += Math.min(extracurricularScore / 30, 1) * 20;
    }
    
    // Personal Statement (10% of total)
    if (profileData.personalStatement && profileData.personalStatement.length > 200) {
      score += 10;
    } else if (profileData.personalStatement && profileData.personalStatement.length > 100) {
      score += 7;
    } else if (profileData.personalStatement) {
      score += 5;
    }
    
    // Recommendation Letters (5% of total)
    if (profileData.recommendationLetters && profileData.recommendationLetters.length >= 2) {
      score += 5;
    } else if (profileData.recommendationLetters && profileData.recommendationLetters.length >= 1) {
      score += 3;
    }
    
    // Legacy Status (3% of total)
    if (profileData.legacyStatus) {
      score += 3;
    }
    
    // TOEFL for international students (2% of total)
    if (profileData.citizenship === 'international' && profileData.toeflScore) {
      score += (profileData.toeflScore / 120) * 2;
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
        classRank: false,
        academicRecord: false,
        collegePrepProgram: false,
        recommendationLetters: false,
        formalDemonstrationCompetencies: false,
        workExperience: false,
        personalStatementEssay: false,
        legacyStatus: false,
        admissionTestScores: false,
        englishProficiencyTest: false,
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