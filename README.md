# LinkedIn_Job_Postings_2023-2024_Data_Analysis

Overview
This project analyzes job posting data to extract insights about salary trends, job engagement metrics, geographic patterns, and market segmentation. The analysis helps both job seekers and employers understand the job market landscape through data-driven approaches.
Dataset
The dataset contains job posting information with 30 columns including:

Job identifiers (job_id, company_id)
Company and job information (company_name, title, description, skills_desc)
Compensation details (max_salary, min_salary, med_salary, pay_period, normalized_salary, currency, compensation_type)
Location information (location, zip_code, fips)
Engagement metrics (views, applies)
Job characteristics (formatted_work_type, work_type, remote_allowed)
Temporal features (listed_time, original_listed_time, expiry, closed_time)
Other attributes (posting_domain, sponsored, application_type, job_posting_url, application_url)

Analysis Steps
1. Data Loading and Exploration

Loads the job posting dataset
Examines basic statistics, data types, and missing values
Provides an initial understanding of the data structure

2. Data Cleaning

Handles missing values in company names
Normalizes salary data by converting hourly wages to annual salaries (assuming 40 hours/week, 52 weeks/year)
Creates a consistent salary metric for comparison

3. Feature Engineering

Extracts state information from location strings
Converts epoch timestamps to readable datetime objects
Creates binary flags for remote jobs
Calculates job posting age in days

4. Salary Distribution Analysis

Calculates basic statistics for normalized annual salaries
Visualizes the distribution of salaries across job postings
Identifies outliers and common salary ranges

5. Job Engagement Metrics

Calculates view-to-application ratios
Analyzes correlation between salary and views
Visualizes the relationship between compensation and engagement

6. Geographic Analysis

Counts job postings by state
Calculates average salaries by geographic location
Visualizes salary differences across regions

7. Salary Prediction Model

Builds a basic linear regression model to predict salary
Uses features like views, posting age, and remote status
Evaluates model performance and feature importance

8. Text Analysis of Job Descriptions

Performs word count analysis on job descriptions and skills
Extracts frequent keywords from job descriptions
Identifies common skills and requirements across postings

9. Job Market Segmentation

Uses K-means clustering to identify job market segments
Segments jobs based on salary, views, and remote status
Analyzes characteristics of different market segments

10. Insights and Recommendations

Calculates job market attractiveness scores
Identifies potentially undervalued job opportunities
Provides actionable insights for job seekers and employers

Requirements

Python 3.8+
Libraries:

pandas
numpy
matplotlib
seaborn
scikit-learn
scipy



Usage
python# Install required packages
pip install pandas numpy matplotlib seaborn scikit-learn scipy

# Run the analysis script
python job_posting_analysis.py
Output
The analysis generates:

Data summary statistics
Visualizations of salary distributions
Geographic analysis of job market
Job market segmentation insights
Predictive models for salary estimation
Text analysis of job requirements
Actionable recommendations for job seekers and employers

Key Insights

Salary distributions vary significantly across job types and locations
Remote-friendly jobs represent a notable portion of the marketplace
Job engagement metrics correlate with certain job characteristics
Text analysis reveals common skills and requirements across industries
The job market naturally segments into distinct clusters based on compensation and engagement
Certain states offer higher average compensation for similar roles

Future Work

Implement more advanced NLP techniques for job description analysis
Develop time-series analysis of job market trends
Build interactive dashboards for exploring the job market data
Incorporate additional external data sources for richer insights
Develop personalized job recommendation systems

Visualizations
![Image](https://github.com/user-attachments/assets/17516474-fe01-4881-96d3-e9242874dae0)
![Image](https://github.com/user-attachments/assets/4f109ca9-f2df-4054-8985-7ebbaf0d2524)
![Image](https://github.com/user-attachments/assets/394ba590-6226-4824-88bd-9ff88e591122)
![Image](https://github.com/user-attachments/assets/b589ff46-7b10-41aa-a938-9f1cc4b9a144)
