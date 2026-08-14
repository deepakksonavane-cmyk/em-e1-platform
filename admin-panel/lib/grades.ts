// Weightage scheme (percent of overall grade), per program assessment definitions:
export const WEIGHTAGE = {
  ASSIGNMENT: 20, // Weekly Assignments
  CASE_STUDY: 20, // Case Studies
  INTERNSHIP_REPORT: 20, // Internship
  CAPSTONE: 25, // Capstone Project
  PARTICIPATION: 10, // Class Participation
  FINAL_EVAL: 5, // Final Evaluation
} as const;

export interface CategoryScore {
  category: string;
  avgPercent: number | null; // null if nothing graded yet
  weight: number;
  count: number;
}

export function letterGradeFor(percent: number): string {
  if (percent >= 90) return "A";
  if (percent >= 80) return "B";
  if (percent >= 70) return "C";
  if (percent >= 60) return "D";
  return "F";
}

/**
 * Computes a weighted overall percentage from category averages.
 * Categories with no graded work are excluded and their weight is
 * redistributed proportionally among graded categories (so partial-term
 * grades are still meaningful), unless includeUngraded=false in which case
 * we simply treat missing as 0 (useful for a strict "current standing").
 */
export function computeOverallScore(categories: CategoryScore[]): {
  overallPercent: number | null;
  letterGrade: string | null;
  breakdown: CategoryScore[];
} {
  const graded = categories.filter((c) => c.avgPercent !== null && c.count > 0);
  if (graded.length === 0) {
    return { overallPercent: null, letterGrade: null, breakdown: categories };
  }
  const totalWeight = graded.reduce((sum, c) => sum + c.weight, 0);
  const weighted = graded.reduce(
    (sum, c) => sum + (c.avgPercent as number) * (c.weight / totalWeight),
    0
  );
  const overallPercent = Math.round(weighted * 100) / 100;
  return {
    overallPercent,
    letterGrade: letterGradeFor(overallPercent),
    breakdown: categories,
  };
}

export function categoryForAssessmentType(type: string): string {
  switch (type) {
    case "ASSIGNMENT":
      return "Weekly Assignments";
    case "CASE_STUDY":
      return "Case Studies";
    case "INTERNSHIP_REPORT":
      return "Internship";
    case "CAPSTONE":
      return "Capstone";
    default:
      return "Other";
  }
}

export function weightForCategory(category: string): number {
  switch (category) {
    case "Weekly Assignments":
      return WEIGHTAGE.ASSIGNMENT;
    case "Case Studies":
      return WEIGHTAGE.CASE_STUDY;
    case "Internship":
      return WEIGHTAGE.INTERNSHIP_REPORT;
    case "Capstone":
      return WEIGHTAGE.CAPSTONE;
    case "Participation":
      return WEIGHTAGE.PARTICIPATION;
    case "Final":
      return WEIGHTAGE.FINAL_EVAL;
    default:
      return 0;
  }
}
