// BUSINESS UNIT
export type BUValues = {
  bu_name: string;
  bu_code: string;
  is_active: boolean;
  created_by: string;
};

// TERMS PP
export type TermsPPValues = {
  terms: string;
  pp: string;
  updated_by: string;
};

// SHORT BRIEF
export type BriefValues = {
  short_brief_name: string;
  updated_by: string;
};

// CRITERIA
export type CriteriaValues = {
  criteria_name: string;
  minimum_score: number;
  maximum_score: number;
  is_active: boolean;
};

export type CriteriaType = CriteriaValues & {
  id: string;
  category_fk: string;
  created_by: string;
  created_date: Date;
};

export type CategoryValues = {
  value_code: string;
  value_name: string;
  created_by: string;
  criteria: CriteriaValues[];
};

// SERIES
export type SeriesValues = {
  series_name: string;
  series_code: string;
  category?: string;
  category_id?: any;
  detail: {
    question_id: string;
  }[];
  // is_active?: boolean;
};

export type SeriesType = SeriesValues & {
  id: string;
};

// FUNCTION MENU
export type FMValues = {
  fm_code?: string;
  fm_name: string;
  is_active: boolean;
};

export type AnswerProps = {
  text?: string;
  image_url?: string;
  point?: number;
};

export type QuestionProps = {
  question: {
    seq: number;
    layout_type: string;
    input_text: string;
    input_image_url: string;
  };
  answers: Array<{ text?: string; image_url?: string; point: number }>;
  admin?: boolean;
};

export type Menu = {
  name: string;
  path: string;
  icon: string;
};


// Category
export type CategoryValue = {
  category_name: string;
  category_code: string;
  is_active: boolean;
};

// Sub Test
export type SubTestValue = {
  subtest_name: string;
  subtest_code: string;
  category_id: string;
  criteria_id: string;
  is_active: boolean;
  series: {
    series_id: string;
  } [];
};


// Group Test
export type GroupTestDetail = {
  message: string;
  data: {
    grouptest_name: string;
    grouptest_code: string;
    is_active: boolean;
    tests: {
      test_id: string;
    } []
  };
}

// Test
export type TestDetail = {
  message: string;
  data: {
    test_name: string;
    test_code: string;
    is_active: boolean;
    subtests: {
      subtest_id: string;
    } []
  };
}

// Sub Test
export type SubTestDetail = {
  message: string;
  data: {
    subtest_name: string;
    subtest_code: string;
    is_active: boolean;
    series: {
      series_id: string;
    } []
  };
}

// EmailTemplate
export type EmailTemplateValues = {
  subject: string;
  title: string,
  header: string,
  footer: string
}

