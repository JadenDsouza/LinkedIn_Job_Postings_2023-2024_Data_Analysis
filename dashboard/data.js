// Real aggregate outputs from New_linkedin.ipynb, run against the
// arshkon/linkedin-job-postings Kaggle dataset (123,849 postings).
// Numbers flagged `corrupted` come from a salary-normalization bug in the
// original notebook (fixed in the notebook, documented in dashboard README).
window.DASHBOARD_DATA = {
  meta: {
    totalPostings: 123849,
    dateRange: "2023 – 2024",
    source: "arshkon/linkedin-job-postings (Kaggle)",
  },

  stateCounts: [
    ["CA", 11484], ["TX", 10271], ["NY", 6044], ["FL", 5907], ["NC", 4927],
    ["IL", 4480], ["PA", 4133], ["VA", 3660], ["MA", 3489], ["OH", 3421],
    ["GA", 3420], ["NJ", 3286], ["MI", 2857], ["WA", 2708], ["AZ", 2507],
    ["CO", 2318], ["MD", 1974], ["MO", 1922], ["TN", 1885], ["MN", 1849],
    ["WI", 1849], ["IN", 1808], ["SC", 1539], ["CT", 1191], ["KY", 1179],
    ["OR", 1177], ["LA", 1106], ["AL", 1004], ["IA", 995], ["DC", 992],
    ["UT", 968], ["KS", 931], ["NV", 907], ["OK", 794], ["AR", 665],
    ["NE", 591], ["NH", 559], ["NM", 499], ["HI", 425], ["WV", 416],
    ["ID", 413], ["MS", 387], ["ME", 377], ["DE", 320], ["RI", 306],
    ["MT", 236], ["ND", 235], ["AK", 206], ["VT", 181], ["SD", 165],
    ["WY", 125],
  ],
  nonUsStateRowsFlagged: [["ON", 1], ["QC", 1]],

  salary: {
    n: 36073,
    min: 0,
    p25: 54537.6,
    median: 90000,
    p75: 140000,
    // mean/max below are from the ORIGINAL buggy run and are corrupted by
    // pay-period mis-conversion (kept only for the data-quality callout)
    corruptedMean: 227568.81,
    corruptedMax: 572000000,
  },

  remote: { remoteCount: 15246, total: 123849 },

  engagement: {
    avgViews: 14.6,
    salaryViewsCorrelation: -0.00, // computed on the corrupted salary column; effectively no linear signal
  },

  descriptionWordCount: { mean: 523.0, min: 0, p25: 298, median: 477, p75: 696, max: 3400 },
  skillsWordCount: { mean: 0.5, max: 529 },

  keywords: {
    description: [
      ["experience", 374182], ["work", 349453], ["will", 278659], ["all", 274650],
      ["team", 250455], ["your", 204374], ["other", 197064], ["skills", 195123],
      ["job", 181537], ["including", 181292],
    ],
    skills: [
      ["skills", 879], ["experience", 629], ["position", 527], ["following", 478],
      ["requires", 473], ["ability", 436], ["work", 380], ["must", 358],
      ["management", 285], ["required", 276],
    ],
  },

  segmentation: {
    clusters: [
      { id: 0, avgSalary: 140089.3, avgViews: 58.06, remoteShare: 1.0, corrupted: false, label: "Mainstream remote-friendly roles" },
      { id: 1, avgSalary: 312000000, avgViews: 22.0, remoteShare: 1.0, corrupted: true, label: "Data-entry outliers (not a real segment)" },
    ],
  },

  model: {
    features: ["views", "post_age_days", "is_remote"],
    mse: 7656380123681.46,
    r2: -0.00,
    importance: [
      ["is_remote", 74075.21],
      ["views", -110.53],
      ["post_age_days", -1192.38],
    ],
  },

  dataQualityFlags: [
    {
      title: "Salary normalization bug",
      severity: "critical",
      detail: "The original normalize_salary() only annualized HOURLY pay (×40×52) and passed WEEKLY/BIWEEKLY/MONTHLY max_salary values straight through as if already annual, instead of preferring the dataset's own pre-computed normalized_salary column. Result: entries like a $572,000,000 “annual salary” and a mean ($227,569) 2.5× the median ($90,000). Fixed in the notebook (prefers normalized_salary, full pay-period multiplier map, 1st–99th percentile capping for aggregates).",
    },
    {
      title: "Non-US rows in state extraction",
      severity: "minor",
      detail: "The regex for extracting state from location matched any 2 letters, pulling in Canadian “ON” / “QC” location suffixes as if they were US states (2 rows). Fixed by restricting to the real 51 US state/territory codes.",
    },
    {
      title: "Keyword extraction stopword list too small",
      severity: "moderate",
      detail: "Generic words (“will”, “all”, “your”, “other”, “including”) dominated the “top keywords” output because the stopword list was minimal. Fixed with a broader stopword set in the notebook.",
    },
    {
      title: "“Top jobs” / “undervalued jobs” driven by bad data",
      severity: "critical",
      detail: "market_score and value_gap were computed on the corrupted salary column, so the original “top 3 jobs” were the same $572M/$408M/$312M data-entry errors, and the “undervalued jobs” were postings with $0–$63 salary fields (also malformed, not real listings). Both rankings are recomputed on the outlier-capped salary in the fixed notebook.",
    },
    {
      title: "Pandas chained-assignment warning",
      severity: "minor",
      detail: "df_clean['company_name'].fillna(..., inplace=True) triggers a FutureWarning and silently no-ops under pandas 3.0. Fixed by reassigning the column directly.",
    },
  ],

  insights: [
    "Median annual salary across all postings: $90,000 (mean is unreliable until the salary bug fix above is re-run on live data).",
    "Most postings are Full-time.",
    `Remote-friendly postings: 15,246 of 123,849 (${((15246/123849)*100).toFixed(1)}%).`,
    "Average view count per posting: 14.6 — views alone are a weak salary predictor (R² ≈ 0), so engagement and pay move fairly independently.",
    "Most postings originate from California, followed by Texas and New York.",
  ],

  recommendations: [
    "Re-run the fixed notebook against the live dataset to get corrected mean/state-level salary figures — this dashboard uses the median/quartiles, which are already robust to the bug.",
    "Job seekers: use median salary by role/state rather than mean, and treat single-posting salary outliers as data-entry noise, not real offers.",
    "Employers: encourage complete skills_desc fields — skills_word_count averages 0.5 words, meaning the field is empty for nearly all postings.",
    "For predictive salary modeling, add title/seniority/state features — views, posting age, and remote status alone explain almost none of the salary variance.",
  ],
};
