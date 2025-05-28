// Interface definitions for TypeScript
export interface ProfileData {
  assessee_name: string;
  assessee_age: string;
  assessee_gender: string;
  work_location: string;
}

export interface NormData {
  id: string;
  criteria_name: string;
  minimum_score: number;
  maximum_score: number;
}

export interface CategoryData {
  category_id: string | number;
  category_name: string;
  category_code: string;
  point?: number;
  category_point?: number;
  description: string;
}

export interface TestResult {
  test_point?: number;
  criteria?: string;
  description?: string;
  norm?: NormData[];
  type?: string;
}

export interface SubtestResult {
  subtest_point?: number;
  subtest_criteria?: string;
  criteria_color?: string;
  categories?: CategoryData[];
  category?: any[];
  type?: string; // Added the missing 'type' property
}

export interface SubtestData {
  subtest_id: string;
  subtest_name: string;
  subtest_code?: string;
  description?: string;
  result: SubtestResult;
}

export interface TestData {
  id?: string;
  name: string;
  description?: string;
  result: TestResult;
}

export interface CategoryDetailData {
  category_id: string | number;
  category_name: string;
  category_code: string;
  summary_type: string;
  summary_view: string;
  summary_formula: string;
  tests?: TestData[];
  subtests?: SubtestData[];
}

export interface DetailData {
  category_id: number | string;
  category_name: string;
  category_code: string;
  test_id: string;
  test_name: string;
  test_code: string;
  taken_at: string;
  summary_type: string;
  summary_view: string;
  summary_formula: string;
  result: TestResult;
  norm: NormData[];
  subtests: SubtestData[];
}

export interface AssessmentData {
  profile: ProfileData;
  guide: { content: string };
  batch: { name: string; code: string };
  intro: CategoryDetailData[];
  detail: DetailData[];
}

export interface AssessmentReportPDFProps {
  data: any;
  charts: any;
}
