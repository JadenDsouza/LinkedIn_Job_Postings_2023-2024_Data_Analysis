# LinkedIn Job Postings Dashboard

A dependency-free, static dashboard (plain HTML/CSS/JS, no build step) summarizing
the analysis in [`../New_linkedin.ipynb`](../New_linkedin.ipynb): 123,849 LinkedIn
job postings from 2023–24, covering salary, geography, engagement, keyword, and
market-segmentation findings. Dark theme by default, with a light-mode toggle,
hover tooltips on every chart, and slicers (state search, top-N, keyword source).

## Why the numbers here, and not a live re-run

The original notebook pulls the dataset live from Kaggle
(`arshkon/linkedin-job-postings`) via the Kaggle API, which needs credentials and
network access this environment didn't have. The dashboard is built from the
**real aggregate outputs already computed and printed in the notebook's own run**
(state counts, percentiles, keyword frequencies, cluster centers, model metrics) —
nothing here is fabricated or simulated.

## Bugs found and fixed

While reviewing the analysis, several bugs were found in the original notebook
and fixed in place (see the notebook diff and the "Data quality findings" panel
in the dashboard itself for full detail):

1. **Salary normalization bug (critical)** — `normalize_salary()` only converted
   `HOURLY` pay to annual; `WEEKLY`/`BIWEEKLY`/`MONTHLY` values were passed through
   unconverted, and the dataset's own correct `normalized_salary` column was
   ignored unless `max_salary` was missing. This produced entries like a
   **$572,000,000 "annual salary"** and inflated the mean to $227,569 (2.5× the
   median of $90,000), which then corrupted every downstream metric: state
   averages, the "top jobs" ranking, k-means clustering, and the regression
   target. Fixed to prefer `normalized_salary`, use a full pay-period multiplier
   map as fallback, and winsorize (1st–99th percentile) before aggregating.
2. **Non-US rows in state extraction (minor)** — the location regex matched any
   2 letters, pulling in Canadian `ON`/`QC` suffixes as if they were US states.
   Fixed by restricting to the 51 real US state/territory codes.
3. **"Top jobs" / "undervalued jobs" driven by bad data (critical)** — both
   rankings used the corrupted salary column, surfacing the same data-entry
   errors as "top jobs" and near-$0 salary rows as "undervalued." Recomputed on
   the capped salary in the fixed notebook.
4. **Keyword extraction stopword list too small (moderate)** — generic words
   ("will", "all", "your", "other", "including") dominated the "top keywords"
   output. Fixed with a broader stopword list.
5. **Pandas chained-assignment warning (minor)** —
   `df_clean['company_name'].fillna(..., inplace=True)` throws a `FutureWarning`
   and silently no-ops under pandas 3.0. Fixed by reassigning the column.

The dashboard itself sidesteps the corrupted numbers by using **median/quartile**
salary figures (robust to a handful of outlier rows) rather than the mean, and by
explicitly flagging the segmentation cluster and KPIs that were outlier-driven.

## Running locally

No build step — it's a static site.

```bash
cd dashboard
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploying to Vercel

From the `dashboard/` folder:

```bash
npx vercel --cwd dashboard
```

Or via the Vercel dashboard: import this repo, and set **Root Directory** to
`dashboard` in the project settings (Framework Preset: "Other" / static). No
environment variables, build command, or install step are required.

## Re-running with live data

To regenerate `data.js` with fully corrected numbers (accurate state-level
medians recomputed row-by-row, a re-scored regression model, etc.), re-run the
fixed `New_linkedin.ipynb` against the live Kaggle dataset and export the new
aggregate values into `dashboard/data.js`.
