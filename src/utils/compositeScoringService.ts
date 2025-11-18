/**
 * Composite Admissions Competitiveness Calculator
 * 
 * Estimates SAT/ACT percentile using quartile data from IPEDS
 * Estimates GPA percentile using SAT→GPA regression
 * Combines GPA + (SAT OR ACT) into composite percentile
 */

interface QuartileStats {
  q25: number;
  q50: number;
  q75: number;
}

interface CompositeResult {
  composite: number;
  gpaPercentile: number;
  testPercentile: number;
  testLabel: 'SAT' | 'ACT';
}

interface CompetitivenessDescription {
  percentile: number;
  percentilePct: number;
  bandPhrase: string;
  strongerThan: number;
  weakerThan: number;
  nApplicants: number;
}

const normalCDF = (z: number): number => {
  const SQRT2 = Math.sqrt(2);
  const scaled = z / SQRT2;
  
  const sign = scaled >= 0 ? 1 : -1;
  const x = Math.abs(scaled);
  
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  
  const t = 1.0 / (1.0 + p * x);
  const erfApprox = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return 0.5 * (1.0 + sign * erfApprox);
};

const estimatePercentileFromQuartiles = (
  q25: number,
  q50: number,
  q75: number,
  value: number
): number => {
  const iqr = q75 - q25;
  const stdev = iqr !== 0 ? iqr / 1.349 : 1e-6;
  
  const z = (value - q50) / stdev;
  return normalCDF(z);
};

const estimateAverageSchoolGPA = (satAverage: number): number => {
  const satScaled = satAverage / 10;
  
  const m = 0.002;
  const b = 2.5;
  
  const result = m * satScaled + b;
  return result <= 4.0 ? result : 4.0;
};

export const estimateSATPercentile = (satScoreTotal: number): number => {
  const SAT_STATS: QuartileStats = {
    q25: 1083,
    q50: 1185,
    q75: 1285
  };
  
  return estimatePercentileFromQuartiles(
    SAT_STATS.q25,
    SAT_STATS.q50,
    SAT_STATS.q75,
    satScoreTotal
  );
};

export const estimateACTPercentile = (actScoreTotal: number): number => {
  const ACT_STATS: QuartileStats = {
    q25: 22.2,
    q50: 24.95,
    q75: 27.7
  };
  
  return estimatePercentileFromQuartiles(
    ACT_STATS.q25,
    ACT_STATS.q50,
    ACT_STATS.q75,
    actScoreTotal
  );
};

export const estimateGPAPercentile = (studentGPA: number): number => {
  const SAT_TOTAL_OVERALL_STATS: QuartileStats = {
    q25: 1083,
    q50: 1185,
    q75: 1285
  };
  
  const gpa25 = estimateAverageSchoolGPA(SAT_TOTAL_OVERALL_STATS.q25);
  const gpa50 = estimateAverageSchoolGPA(SAT_TOTAL_OVERALL_STATS.q50);
  const gpa75 = estimateAverageSchoolGPA(SAT_TOTAL_OVERALL_STATS.q75);
  
  const iqrGPA = gpa75 - gpa25;
  const stdevGPA = iqrGPA !== 0 ? iqrGPA / 1.349 : 1e-6;
  
  const z = (studentGPA - gpa50) / stdevGPA;
  return normalCDF(z);
};

export const estimateCompositePercentile = (
  gpa: number,
  satScore?: number,
  actScore?: number,
  weightTest: number = 0.5,
  weightGPA: number = 0.5
): CompositeResult => {
  const usingSAT = satScore !== undefined && satScore !== null;
  const usingACT = actScore !== undefined && actScore !== null;
  
  if (usingSAT && usingACT) {
    throw new Error('Provide only one of satScore or actScore, not both.');
  }
  if (!usingSAT && !usingACT) {
    throw new Error('You must provide either satScore or actScore.');
  }
  
  let testPercentile: number;
  let testLabel: 'SAT' | 'ACT';
  
  if (usingSAT) {
    testPercentile = estimateSATPercentile(satScore!);
    testLabel = 'SAT';
  } else {
    testPercentile = estimateACTPercentile(actScore!);
    testLabel = 'ACT';
  }
  
  const gpaPercentile = estimateGPAPercentile(gpa);
  
  const totalWeight = weightTest + weightGPA;
  const weightTestNorm = weightTest / totalWeight;
  const weightGPANorm = weightGPA / totalWeight;
  
  const composite = (
    weightTestNorm * testPercentile +
    weightGPANorm * gpaPercentile
  );
  
  return {
    composite,
    gpaPercentile,
    testPercentile,
    testLabel
  };
};

export const describeCompetitiveness = (
  percentile: number,
  nApplicants: number = 10000
): CompetitivenessDescription => {
  const percentilePct = percentile * 100;
  const strongerThan = percentile * nApplicants;
  
  const percRounded = Math.round(percentilePct);
  const strongerRounded = Math.round(strongerThan / 10) * 10;
  const weakerRounded = nApplicants - strongerRounded;
  
  let bandPhrase: string;
  if (percentilePct >= 50) {
    const topPct = Math.round(100 - percentilePct);
    bandPhrase = `Top ${topPct}%`;
  } else {
    const bottomPct = Math.round(100 - percentilePct);
    bandPhrase = `Bottom ${bottomPct}%`;
  }
  
  return {
    percentile,
    percentilePct: percRounded,
    bandPhrase,
    strongerThan: strongerRounded,
    weakerThan: weakerRounded,
    nApplicants
  };
};

export const describeCompetitivenessKorean = (
  percentile: number,
  nApplicants: number = 10000
): CompetitivenessDescription => {
  const percentilePct = percentile * 100;
  const strongerThan = percentile * nApplicants;
  
  const percRounded = Math.round(percentilePct);
  const strongerRounded = Math.round(strongerThan / 10) * 10;
  const weakerRounded = nApplicants - strongerRounded;
  
  let bandPhrase: string;
  if (percentilePct >= 50) {
    const topPct = Math.round(100 - percentilePct);
    bandPhrase = `상위 ${topPct}%`;
  } else {
    const bottomPct = Math.round(100 - percentilePct);
    bandPhrase = `하위 ${bottomPct}%`;
  }
  
  return {
    percentile,
    percentilePct: percRounded,
    bandPhrase,
    strongerThan: strongerRounded,
    weakerThan: weakerRounded,
    nApplicants
  };
};
