// Seed data: competency framework for India's Official Statistical System (MoSPI)

export const DOMAINS = [
  {
    id: 'statistical',
    name: 'Statistical Competencies',
    icon: 'chart',
    color: '#22d3ee',
    blurb: 'Core statistical methodologies for producing and compiling official statistics.',
    competencies: [
      { id: 'survey-design', name: 'Survey Design', desc: 'Questionnaire & survey instrument design' },
      { id: 'sampling', name: 'Sampling & Estimation', desc: 'Sample selection and estimation theory' },
      { id: 'national-accounts', name: 'National Accounts', desc: 'SNA-based compilation of national accounts' },
      { id: 'price-statistics', name: 'Price Statistics', desc: 'CPI, WPI and price indices' },
      { id: 'labour-statistics', name: 'Labour Statistics', desc: 'PLFS, employment & unemployment' },
      { id: 'agricultural-statistics', name: 'Agricultural Statistics', desc: 'Crop estimation & agri surveys' },
      { id: 'industrial-statistics', name: 'Industrial Statistics', desc: 'ASI & industrial production' },
      { id: 'sdg-indicators', name: 'SDG Indicators', desc: 'Sustainable development monitoring' },
      { id: 'metadata', name: 'Metadata Standards', desc: 'SDMX, DDI & statistical metadata' },
      { id: 'data-quality', name: 'Data Quality Frameworks', desc: 'DQAF and quality assurance' },
    ],
  },
  {
    id: 'technical',
    name: 'Technical Competencies',
    icon: 'code',
    color: '#a78bfa',
    blurb: 'Modern tools, programming and analytics for the data-driven statistical office.',
    competencies: [
      { id: 'python', name: 'Python', desc: 'Data analysis & automation with Python' },
      { id: 'r', name: 'R', desc: 'Statistical computing with R' },
      { id: 'sql', name: 'SQL & Databases', desc: 'Querying and managing data stores' },
      { id: 'stata', name: 'Stata', desc: 'Econometric analysis with Stata' },
      { id: 'spss', name: 'SPSS', desc: 'Statistical analysis with SPSS' },
      { id: 'sas', name: 'SAS', desc: 'Enterprise analytics with SAS' },
      { id: 'gis', name: 'GIS & Spatial Analysis', desc: 'Geospatial data and mapping' },
      { id: 'data-viz', name: 'Data Visualization', desc: 'Dashboards, charts & storytelling' },
      { id: 'ai-ml', name: 'AI & Machine Learning', desc: 'ML models & intelligent systems' },
      { id: 'cloud', name: 'Cloud Computing', desc: 'Cloud platforms & services' },
      { id: 'apis', name: 'APIs & Interoperability', desc: 'REST APIs and data exchange' },
      { id: 'open-data', name: 'Open Data', desc: 'Open data publishing & standards' },
    ],
  },
  {
    id: 'governance',
    name: 'Digital Governance',
    icon: 'shield',
    color: '#34d399',
    blurb: 'Security, privacy and the digital public ecosystem.',
    competencies: [
      { id: 'cybersecurity', name: 'Cybersecurity', desc: 'Securing systems & data' },
      { id: 'data-privacy', name: 'Data Privacy', desc: 'DPDP Act & privacy compliance' },
      { id: 'digital-signatures', name: 'Digital Signatures', desc: 'eSign & IT Act compliance' },
      { id: 'gov-cloud', name: 'Government Cloud', desc: 'MeghRaj & government cloud' },
      { id: 'dpi', name: 'Digital Public Infrastructure', desc: 'UPI, Aadhaar & DPI building blocks' },
    ],
  },
  {
    id: 'behavioural',
    name: 'Behavioural & Managerial',
    icon: 'users',
    color: '#fbbf24',
    blurb: 'Leadership, communication and management capabilities.',
    competencies: [
      { id: 'leadership', name: 'Leadership', desc: 'Leading teams & initiatives' },
      { id: 'communication', name: 'Communication', desc: 'Reporting & stakeholder communication' },
      { id: 'project-mgmt', name: 'Project Management', desc: 'Planning & delivery' },
      { id: 'ethics', name: 'Ethics & Integrity', desc: 'UN Fundamental Principles' },
      { id: 'decision-making', name: 'Decision Making', desc: 'Evidence-based decisions' },
      { id: 'change-mgmt', name: 'Change Management', desc: 'Driving organisational change' },
    ],
  },
]

// Flatten competencies with domain attribution
export const COMPETENCIES = DOMAINS.flatMap((d) =>
  d.competencies.map((c) => ({ ...c, domain: d.id, domainName: d.name }))
)

// Job roles and target proficiency profiles (1-5 scale)
export const ROLES = [
  { id: 'statistical-officer', name: 'Statistical Officer', tier: 'Executive', blurb: 'Compilation & analysis of official statistics' },
  { id: 'data-analyst', name: 'Data Analyst', tier: 'Technical', blurb: 'Data processing, analytics & visualization' },
  { id: 'field-investigator', name: 'Field Investigator', tier: 'Field', blurb: 'Primary data collection & field surveys' },
  { id: 'it-officer', name: 'IT & Digital Officer', tier: 'Technical', blurb: 'Systems, digital infrastructure & security' },
  { id: 'ddg', name: 'Deputy Director General', tier: 'Managerial', blurb: 'Leadership, policy & oversight' },
]

// Base target levels; role-specific overrides below
const BASE_TARGETS = {
  'survey-design': 3, sampling: 3, 'national-accounts': 3, 'price-statistics': 3,
  'labour-statistics': 3, 'agricultural-statistics': 3, 'industrial-statistics': 3,
  'sdg-indicators': 3, metadata: 3, 'data-quality': 3,
  python: 2, r: 2, sql: 2, stata: 2, spss: 2, sas: 2, gis: 2, 'data-viz': 2,
  'ai-ml': 2, cloud: 2, apis: 2, 'open-data': 2,
  cybersecurity: 3, 'data-privacy': 3, 'digital-signatures': 3, 'gov-cloud': 3, dpi: 3,
  leadership: 3, communication: 3, 'project-mgmt': 3, ethics: 4, 'decision-making': 3, 'change-mgmt': 3,
}

const ROLE_OVERRIDES = {
  'statistical-officer': {
    'survey-design': 4, sampling: 4, 'national-accounts': 4, 'price-statistics': 4,
    'labour-statistics': 4, 'agricultural-statistics': 4, 'industrial-statistics': 4,
    'sdg-indicators': 4, metadata: 4, 'data-quality': 4, python: 3, r: 3, sql: 3, 'data-viz': 3,
  },
  'data-analyst': {
    python: 4, r: 4, sql: 4, 'data-viz': 4, 'ai-ml': 3, cloud: 3, apis: 3, 'open-data': 3,
    'survey-design': 3, sampling: 4, 'data-quality': 4, stata: 3, gis: 3,
  },
  'field-investigator': {
    'survey-design': 4, sampling: 3, 'data-quality': 3, communication: 3, 'data-privacy': 4,
    python: 1, r: 1, sql: 1, 'ai-ml': 1, cloud: 1,
  },
  'it-officer': {
    python: 4, sql: 4, cloud: 5, apis: 4, cybersecurity: 5, 'data-privacy': 5,
    'gov-cloud': 5, dpi: 4, 'digital-signatures': 4, 'ai-ml': 4, 'open-data': 3, 'data-viz': 3,
    'survey-design': 1, 'national-accounts': 1, 'price-statistics': 1, 'labour-statistics': 1,
  },
  ddg: {
    leadership: 5, communication: 5, 'project-mgmt': 5, 'decision-making': 5, 'change-mgmt': 5,
    ethics: 5, 'data-quality': 4, 'sdg-indicators': 4, cybersecurity: 4, 'data-privacy': 4,
    'ai-ml': 3, cloud: 3,
  },
}

export function targetProfile(roleId) {
  const overrides = ROLE_OVERRIDES[roleId] || {}
  return Object.fromEntries(
    COMPETENCIES.map((c) => [c.id, overrides[c.id] ?? BASE_TARGETS[c.id] ?? 3])
  )
}

// Course catalogue (iGOT Karmayogi + NSSTA TPAC style)
export const COURSES = [
  // Statistical
  { title: 'Fundamentals of Survey Design & Instrumentation', domain: 'statistical', provider: 'NSSTA · TPAC', competencies: ['survey-design', 'data-quality'], level: 2, hours: 12, rating: 4.7, learners: 1840, language: 'English', format: 'Instructor-led', cert: true },
  { title: 'Sampling Theory & Estimation Techniques', domain: 'statistical', provider: 'NSSTA · TPAC', competencies: ['sampling'], level: 3, hours: 18, rating: 4.8, learners: 2310, language: 'English', format: 'Instructor-led', cert: true },
  { title: 'National Accounts Statistics: Concepts & Compilation', domain: 'statistical', provider: 'NSSTA · TPAC', competencies: ['national-accounts'], level: 4, hours: 24, rating: 4.6, learners: 1205, language: 'English', format: 'Instructor-led', cert: true },
  { title: 'Price Statistics & Inflation Measurement', domain: 'statistical', provider: 'NSSTA · TPAC', competencies: ['price-statistics'], level: 3, hours: 10, rating: 4.5, learners: 940, language: 'English', format: 'Self-paced', cert: true },
  { title: 'Labour Force Statistics & PLFS Analysis', domain: 'statistical', provider: 'NSSTA · TPAC', competencies: ['labour-statistics', 'sampling'], level: 3, hours: 14, rating: 4.7, learners: 1120, language: 'English', format: 'Instructor-led', cert: true },
  { title: 'Agricultural Statistics & Crop Estimation Surveys', domain: 'statistical', provider: 'NSSTA · TPAC', competencies: ['agricultural-statistics', 'sampling'], level: 3, hours: 12, rating: 4.4, learners: 780, language: 'English', format: 'Instructor-led', cert: true },
  { title: 'Industrial Statistics & Annual Survey of Industries', domain: 'statistical', provider: 'NSSTA · TPAC', competencies: ['industrial-statistics'], level: 3, hours: 10, rating: 4.3, learners: 655, language: 'English', format: 'Instructor-led', cert: true },
  { title: 'SDG Indicators: Monitoring & Reporting Framework', domain: 'statistical', provider: 'iGOT Karmayogi', competencies: ['sdg-indicators', 'data-quality'], level: 3, hours: 8, rating: 4.6, learners: 3020, language: 'English · Hindi', format: 'Self-paced', cert: true },
  { title: 'Statistical Metadata Standards & Data Quality (SDMX, DDI)', domain: 'statistical', provider: 'iGOT Karmayogi', competencies: ['metadata', 'data-quality'], level: 3, hours: 7, rating: 4.4, learners: 1380, language: 'English', format: 'Self-paced', cert: true },
  // Technical
  { title: 'Python for Official Statistics', domain: 'technical', provider: 'iGOT Karmayogi', competencies: ['python'], level: 2, hours: 20, rating: 4.8, learners: 5210, language: 'English', format: 'Self-paced', cert: true },
  { title: 'R for Statistical Computing & Visualization', domain: 'technical', provider: 'iGOT Karmayogi', competencies: ['r', 'data-viz'], level: 2, hours: 18, rating: 4.7, learners: 4140, language: 'English', format: 'Self-paced', cert: true },
  { title: 'SQL & Database Management for Data Analysts', domain: 'technical', provider: 'iGOT Karmayogi', competencies: ['sql'], level: 2, hours: 12, rating: 4.6, learners: 3890, language: 'English', format: 'Self-paced', cert: true },
  { title: 'Data Visualization with Dashboards & Storytelling', domain: 'technical', provider: 'iGOT Karmayogi', competencies: ['data-viz'], level: 2, hours: 10, rating: 4.7, learners: 2760, language: 'English · Hindi', format: 'Self-paced', cert: true },
  { title: 'Machine Learning & AI Fundamentals for Government', domain: 'technical', provider: 'iGOT Karmayogi', competencies: ['ai-ml', 'python'], level: 3, hours: 16, rating: 4.8, learners: 6840, language: 'English', format: 'Self-paced', cert: true },
  { title: 'Cloud Computing & Government Cloud (MeghRaj)', domain: 'technical', provider: 'iGOT Karmayogi', competencies: ['cloud', 'gov-cloud'], level: 3, hours: 9, rating: 4.5, learners: 2210, language: 'English', format: 'Self-paced', cert: true },
  { title: 'GIS & Spatial Data Analysis for Official Statistics', domain: 'technical', provider: 'NSSTA · TPAC', competencies: ['gis'], level: 3, hours: 14, rating: 4.5, learners: 890, language: 'English', format: 'Instructor-led', cert: true },
  { title: 'Open Data, APIs & Statistical Dissemination', domain: 'technical', provider: 'iGOT Karmayogi', competencies: ['open-data', 'apis'], level: 2, hours: 8, rating: 4.4, learners: 1730, language: 'English', format: 'Self-paced', cert: true },
  { title: 'Big Data Analytics for Official Statistics', domain: 'technical', provider: 'iGOT Karmayogi', competencies: ['ai-ml', 'cloud', 'python'], level: 4, hours: 20, rating: 4.6, learners: 1980, language: 'English', format: 'Self-paced', cert: true },
  // Governance
  { title: 'Cybersecurity Essentials for Government Officials', domain: 'governance', provider: 'iGOT Karmayogi', competencies: ['cybersecurity'], level: 2, hours: 6, rating: 4.7, learners: 8120, language: 'English · Hindi', format: 'Self-paced', cert: true },
  { title: 'Data Privacy & DPDP Act Compliance', domain: 'governance', provider: 'iGOT Karmayogi', competencies: ['data-privacy'], level: 2, hours: 7, rating: 4.6, learners: 5430, language: 'English', format: 'Self-paced', cert: true },
  { title: 'Digital Signatures & IT Act for e-Governance', domain: 'governance', provider: 'iGOT Karmayogi', competencies: ['digital-signatures'], level: 2, hours: 4, rating: 4.3, learners: 2260, language: 'English', format: 'Self-paced', cert: false },
  { title: 'Digital Public Infrastructure & e-Governance', domain: 'governance', provider: 'iGOT Karmayogi', competencies: ['dpi', 'gov-cloud'], level: 2, hours: 8, rating: 4.7, learners: 4570, language: 'English · Hindi', format: 'Self-paced', cert: true },
  // Behavioural
  { title: 'Leadership & Change Management in Public Service', domain: 'behavioural', provider: 'iGOT Karmayogi', competencies: ['leadership', 'change-mgmt'], level: 3, hours: 10, rating: 4.6, learners: 3120, language: 'English', format: 'Instructor-led', cert: true },
  { title: 'Effective Communication & Statistical Report Writing', domain: 'behavioural', provider: 'iGOT Karmayogi', competencies: ['communication'], level: 2, hours: 8, rating: 4.5, learners: 2640, language: 'English', format: 'Self-paced', cert: true },
  { title: 'Project Management & Ethics in Official Statistics', domain: 'behavioural', provider: 'NSSTA · TPAC', competencies: ['project-mgmt', 'ethics'], level: 3, hours: 12, rating: 4.4, learners: 980, language: 'English', format: 'Instructor-led', cert: true },
]

// Competency assessment bank (one or more per competency)
export const QUESTIONS = [
  { competency: 'sampling', difficulty: 2, q: 'A sample in which every unit of the population has an equal, non-zero probability of selection is called a ____ sample.', options: ['Simple random', 'Stratified', 'Cluster', 'Convenience'], answer: 0, exp: 'Simple random sampling gives every unit an equal probability of selection, making it unbiased and easy to analyze.' },
  { competency: 'sampling', difficulty: 3, q: 'Which sampling method divides the population into homogeneous subgroups before drawing the sample?', options: ['Systematic sampling', 'Stratified sampling', 'Snowball sampling', 'Quota sampling'], answer: 1, exp: 'Stratified sampling partitions the population into homogeneous strata and samples within each, improving precision.' },
  { competency: 'survey-design', difficulty: 2, q: 'A survey that collects data from the same respondents at multiple points in time is called a ____ study.', options: ['Cross-sectional', 'Longitudinal', 'Snapshot', 'Pilot'], answer: 1, exp: 'Longitudinal studies track the same units over time, enabling measurement of change.' },
  { competency: 'survey-design', difficulty: 3, q: 'Systematic distortion of responses caused by question wording or interviewer behaviour is known as:', options: ['Sampling error', 'Response bias', 'Frame error', 'Non-coverage'], answer: 1, exp: 'Response bias arises from how questions are phrased or administered, not from sampling variability.' },
  { competency: 'national-accounts', difficulty: 3, q: 'India compiles its National Accounts following which international framework?', options: ['System of National Accounts (SNA) 2008', 'IFRS', 'Basel III', 'GAAP'], answer: 0, exp: 'The SNA 2008 is the UN-endorsed framework used worldwide, including India, for national accounts.' },
  { competency: 'national-accounts', difficulty: 4, q: 'Gross Domestic Product at market prices equals GDP at factor cost plus ____.', options: ['indirect taxes minus subsidies', 'exports minus imports', 'capital formation', 'government spending'], answer: 0, exp: 'GDP at market prices = GDP at factor cost + indirect taxes − subsidies.' },
  { competency: 'price-statistics', difficulty: 2, q: 'Which index primarily measures retail inflation at the consumer level in India?', options: ['Consumer Price Index (CPI)', 'Wholesale Price Index (WPI)', 'IIP', 'GDP deflator'], answer: 0, exp: 'CPI measures changes in retail prices paid by consumers and is the key inflation indicator.' },
  { competency: 'price-statistics', difficulty: 3, q: 'The current base year of the all-India CPI (Combined) series is:', options: ['2004-05', '2012', '2015', '2019'], answer: 1, exp: 'The current CPI (Combined) series uses 2012 as its base year (2012 = 100).' },
  { competency: 'labour-statistics', difficulty: 3, q: 'The primary source of employment–unemployment data in India today is the:', options: ['Periodic Labour Force Survey (PLFS)', 'Census of India', 'Annual Survey of Industries', 'Economic Census'], answer: 0, exp: 'PLFS provides annual labour force indicators and quarterly urban employment estimates.' },
  { competency: 'labour-statistics', difficulty: 4, q: 'Labour Force Participation Rate is defined as:', options: ['(Labour force ÷ working-age population) × 100', '(Employed ÷ labour force) × 100', '(Unemployed ÷ population) × 100', '(Population ÷ labour force) × 100'], answer: 0, exp: 'LFPR expresses the labour force as a percentage of the working-age population.' },
  { competency: 'agricultural-statistics', difficulty: 2, q: 'The method of cutting and weighing crops in sample plots to estimate yield is known as:', options: ['Crop cutting experiments', 'Aerial survey', 'Remote sensing', 'Complete enumeration'], answer: 0, exp: 'Crop cutting experiments objectively estimate yield from representative sample plots.' },
  { competency: 'industrial-statistics', difficulty: 3, q: 'The Annual Survey of Industries (ASI) is conducted under which Act?', options: ['Collection of Statistics Act', 'Companies Act', 'Factories Act', 'Census Act'], answer: 0, exp: 'ASI is carried out under the Collection of Statistics Act to gather industrial data.' },
  { competency: 'sdg-indicators', difficulty: 2, q: 'How many Sustainable Development Goals (SDGs) were adopted by the UN in 2015?', options: ['8', '17', '21', '30'], answer: 1, exp: 'The 2030 Agenda adopted 17 SDGs with 169 targets and 231 unique indicators.' },
  { competency: 'metadata', difficulty: 2, q: 'The international standard for exchanging statistical data and metadata is:', options: ['SDMX', 'HTML', 'PDF', 'CSV'], answer: 0, exp: 'SDMX (Statistical Data and Metadata eXchange) is the ISO standard for statistical data exchange.' },
  { competency: 'data-quality', difficulty: 3, q: 'Which dimension of data quality refers to data being available when required?', options: ['Accuracy', 'Timeliness', 'Relevance', 'Coherence'], answer: 1, exp: 'Timeliness measures the lag between the reference period and data availability.' },
  { competency: 'python', difficulty: 2, q: 'Which Python library is the standard for numerical computing and N-dimensional arrays?', options: ['NumPy', 'Flask', 'Requests', 'BeautifulSoup'], answer: 0, exp: 'NumPy provides fast array operations underpinning most Python data analysis.' },
  { competency: 'r', difficulty: 2, q: 'Which R package, part of the tidyverse, is used for data transformation?', options: ['dplyr', 'ggplot2', 'shiny', 'caret'], answer: 0, exp: 'dplyr provides verbs like filter, mutate, summarise and group_by for data wrangling.' },
  { competency: 'sql', difficulty: 2, q: 'Which SQL clause filters rows after grouping and aggregation?', options: ['WHERE', 'HAVING', 'LIMIT', 'ORDER BY'], answer: 1, exp: 'HAVING filters aggregated groups, whereas WHERE filters rows before grouping.' },
  { competency: 'gis', difficulty: 3, q: 'Which GIS data model represents features as points, lines and polygons?', options: ['Vector', 'Raster', 'Grid', 'TIN'], answer: 0, exp: 'Vector models store discrete features as geometric primitives with attributes.' },
  { competency: 'data-viz', difficulty: 2, q: 'Which chart type best shows the distribution of a continuous variable?', options: ['Histogram', 'Pie chart', 'Bar chart', 'Line chart'], answer: 0, exp: 'Histograms bin a continuous variable to reveal its underlying distribution.' },
  { competency: 'ai-ml', difficulty: 2, q: 'In supervised learning, the training data consists of:', options: ['Labeled examples (features + target)', 'Only unlabeled data', 'Only target values', 'Random noise'], answer: 0, exp: 'Supervised learning uses labeled examples to learn a mapping from features to targets.' },
  { competency: 'cloud', difficulty: 2, q: 'Which cloud delivery model provides ready-to-use software over the internet?', options: ['SaaS', 'IaaS', 'PaaS', 'FaaS'], answer: 0, exp: 'Software-as-a-Service delivers applications over the internet without local installation.' },
  { competency: 'apis', difficulty: 2, q: 'What does REST stand for in web services?', options: ['Representational State Transfer', 'Remote Execution Standard', 'Rapid Endpoint Service', 'Relational State Transfer'], answer: 0, exp: 'REST is an architectural style using stateless HTTP operations on resources.' },
  { competency: 'open-data', difficulty: 2, q: 'Open data may be freely used and redistributed subject only to, at most, a ____ requirement.', options: ['Attribution / share-alike', 'Payment', 'Commercial license', 'Government approval'], answer: 0, exp: 'Open data permits reuse conditioned at most on attribution or share-alike terms.' },
  { competency: 'cybersecurity', difficulty: 2, q: 'An attack that overwhelms a server with excessive traffic to disrupt service is called:', options: ['DDoS', 'Phishing', 'SQL injection', 'Spoofing'], answer: 0, exp: 'A Distributed Denial of Service attack floods a target from many sources to make it unavailable.' },
  { competency: 'data-privacy', difficulty: 2, q: "India's Digital Personal Data Protection Act was enacted in:", options: ['2019', '2021', '2023', '2016'], answer: 2, exp: 'The DPDP Act was passed in 2023, establishing a comprehensive personal data regime.' },
  { competency: 'digital-signatures', difficulty: 3, q: 'Digital signatures in India are legally recognised under which Act?', options: ['Information Technology Act, 2000', 'Companies Act, 2013', 'Contract Act, 1872', 'Evidence Act, 1872'], answer: 0, exp: 'The IT Act, 2000 gives legal recognition to electronic records and digital signatures.' },
  { competency: 'dpi', difficulty: 2, q: 'UPI, Aadhaar and DigiLocker are examples of India\u2019s:', options: ['Digital Public Infrastructure', 'Private fintech apps', 'Social media platforms', 'Cloud storage'], answer: 0, exp: 'These are interoperable public platforms that form India\u2019s digital public infrastructure.' },
  { competency: 'leadership', difficulty: 2, q: 'A leadership style that inspires through a shared, future-oriented vision is called:', options: ['Transformational', 'Transactional', 'Laissez-faire', 'Autocratic'], answer: 0, exp: 'Transformational leaders motivate teams through vision, inspiration and intellectual stimulation.' },
  { competency: 'communication', difficulty: 2, q: 'The most important element of statistical report writing is:', options: ['Clarity and accuracy of data presentation', 'Length of the document', 'Number of charts', 'Use of jargon'], answer: 0, exp: 'Statistical reporting must present data clearly and accurately to support decision-making.' },
  { competency: 'project-mgmt', difficulty: 2, q: 'The "critical path" in project management is the:', options: ['Longest dependent task sequence determining duration', 'Shortest task', 'Least risky task', 'Most expensive task'], answer: 0, exp: 'The critical path is the longest chain of dependent tasks; delaying it delays the project.' },
  { competency: 'ethics', difficulty: 2, q: 'The principle that official statistics must be compiled with professional independence is emphasised in the:', options: ['UN Fundamental Principles of Official Statistics', 'Basel Accords', 'WTO rules', 'ISO 9001'], answer: 0, exp: 'The UN Fundamental Principles safeguard independence, impartiality and accountability of official statistics.' },
  { competency: 'decision-making', difficulty: 2, q: 'Data-driven decision making primarily relies on:', options: ['Evidence from data analysis', 'Intuition alone', 'Organisational hierarchy', 'Past practices'], answer: 0, exp: 'Data-driven decisions are grounded in evidence, reducing bias and improving outcomes.' },
  { competency: 'change-mgmt', difficulty: 2, q: "Kotter's first step for leading successful change is:", options: ['Creating a sense of urgency', 'Declaring victory early', 'Removing the change team', 'Ignoring resistance'], answer: 0, exp: 'Establishing urgency builds the momentum needed to overcome complacency.' },
]

export function seedStore(store) {
  const d = store.data
  if (d.framework.domains.length === 0) {
    d.framework = {
      domains: DOMAINS,
      competencies: COMPETENCIES,
      roles: ROLES,
      targets: Object.fromEntries(ROLES.map((r) => [r.id, targetProfile(r.id)])),
    }
  }
  if (d.courses.length === 0) {
    d.courses = COURSES.map((c, i) => ({
      id: i + 1,
      ...c,
      blurb: courseBlurb(c.title, c.domain),
      status: 'live',
    }))
  }
  if (d.questions.length === 0) {
    d.questions = QUESTIONS.map((q, i) => ({ id: i + 1, ...q }))
  }
  store.persist()
}

function courseBlurb(title, domain) {
  const map = {
    statistical: 'Build authoritative skills for compiling and analysing official statistics.',
    technical: 'Master modern tools, programming and analytics for the data-driven statistical office.',
    governance: 'Understand security, privacy and India\u2019s digital public ecosystem.',
    behavioural: 'Strengthen leadership, communication and managerial capabilities.',
  }
  return map[domain] || 'Curated learning for a future-ready statistical workforce.'
}
