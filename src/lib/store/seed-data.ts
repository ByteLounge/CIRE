import { 
  Profile, 
  Skill, 
  Experience, 
  Project, 
  Education, 
  Certificate, 
  Achievement, 
  CareerEvidence,
  GitHubRepository,
  Job,
  JobRequirement
} from '@/lib/types/database';

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export const INITIAL_DEMO_PROFILE: Profile = {
  id: 'prof-001',
  user_id: DEMO_USER_ID,
  full_name: 'Alex Morgan',
  headline: 'Full-Stack & Systems Software Engineer | Python, TypeScript, Distributed Systems',
  email: 'alex.morgan.dev@example.com',
  phone: '+1 (555) 019-2834',
  location: 'San Francisco, CA',
  linkedin_url: 'https://linkedin.com/in/alex-morgan-sample',
  github_url: 'https://github.com/alexmorgan-dev',
  portfolio_url: 'https://alexmorgan.dev',
  summary: 'Detail-oriented Software Engineer with strong background in distributed backend systems, REST APIs, and full-stack React/Next.js architectures. Demonstrated experience building scalable microservices with Python, PostgreSQL, and Docker.',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
};

export const INITIAL_DEMO_SKILLS: Skill[] = [
  { id: 'sk-1', user_id: DEMO_USER_ID, name: 'Python', category: 'language', proficiency: 'advanced', years_of_experience: 3, verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-2', user_id: DEMO_USER_ID, name: 'TypeScript', category: 'language', proficiency: 'advanced', years_of_experience: 2.5, verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-3', user_id: DEMO_USER_ID, name: 'React', category: 'framework', proficiency: 'advanced', years_of_experience: 2.5, verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-4', user_id: DEMO_USER_ID, name: 'PostgreSQL', category: 'database', proficiency: 'advanced', years_of_experience: 2, verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-5', user_id: DEMO_USER_ID, name: 'Docker', category: 'tool', proficiency: 'intermediate', years_of_experience: 2, verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-6', user_id: DEMO_USER_ID, name: 'REST APIs', category: 'framework', proficiency: 'advanced', years_of_experience: 3, verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-7', user_id: DEMO_USER_ID, name: 'Next.js', category: 'framework', proficiency: 'intermediate', years_of_experience: 1.5, verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-8', user_id: DEMO_USER_ID, name: 'FastAPI', category: 'framework', proficiency: 'advanced', years_of_experience: 2, verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-9', user_id: DEMO_USER_ID, name: 'Redis', category: 'database', proficiency: 'intermediate', years_of_experience: 1, verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sk-10', user_id: DEMO_USER_ID, name: 'CI/CD (GitHub Actions)', category: 'tool', proficiency: 'intermediate', years_of_experience: 1.5, verified: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const INITIAL_DEMO_EXPERIENCE: Experience[] = [
  {
    id: 'exp-1',
    user_id: DEMO_USER_ID,
    company: 'Apex Cloud Solutions',
    role: 'Software Engineering Intern',
    employment_type: 'internship',
    location: 'San Francisco, CA',
    start_date: '2025-06-01',
    end_date: '2025-09-01',
    is_current: false,
    responsibilities: [
      'Engineered scalable microservices handling inventory telemetry data using Python and FastAPI',
      'Designed and executed relational schema migrations on PostgreSQL with connection pooling',
      'Containerized development environments with Docker and orchestrated automated CI pipeline testing',
      'Collaborated in bi-weekly sprints, agile planning, and conducted comprehensive peer code reviews',
    ],
    achievements: [
      'Engineered caching layer with Redis that lowered repeat query response latency',
      'Authored automated test suites with 88% branch coverage across backend services',
    ],
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis', 'GitHub Actions'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    user_id: DEMO_USER_ID,
    company: 'University Computer Science Lab',
    role: 'Undergraduate Research Assistant',
    employment_type: 'part_time',
    location: 'Berkeley, CA',
    start_date: '2024-09-01',
    end_date: '2025-05-15',
    is_current: false,
    responsibilities: [
      'Developed data ingestion pipelines for computational linguistics analysis using Python',
      'Created interactive TypeScript/React dashboards for visualizing statistical experiment runs',
      'Maintained data documentation and reproducibility guidelines across research team repositories',
    ],
    achievements: [
      'Co-authored research artifact presented at student engineering research symposium',
    ],
    technologies: ['Python', 'TypeScript', 'React', 'Git', 'Pandas'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    user_id: DEMO_USER_ID,
    title: 'TaskFlow',
    description: 'Real-time collaborative task tracking platform with optimistic UI updates and role-based permissions.',
    role: 'Lead Full-Stack Developer',
    technologies: ['TypeScript', 'Next.js', 'React', 'PostgreSQL', 'Tailwind CSS'],
    github_url: 'https://github.com/alexmorgan-dev/taskflow',
    deployment_url: 'https://taskflow-demo.vercel.app',
    architecture_overview: 'Event-driven React front-end communicating with Next.js server actions and transactional Postgres data store.',
    highlights: [
      'Implemented optimistic mutations reducing perceived UI latency on kanban state changes',
      'Structured JWT session management and RBAC for multi-tenant team boards',
    ],
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-2',
    user_id: DEMO_USER_ID,
    title: 'Inventory API',
    description: 'High-throughput inventory tracking and auditing REST microservice built with Python, PostgreSQL, and Docker.',
    role: 'Backend Architect',
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'JWT', 'Alembic'],
    github_url: 'https://github.com/alexmorgan-dev/inventory-api',
    deployment_url: 'https://api.alexmorgan.dev/health',
    architecture_overview: 'Clean architecture separating domain entities, repository pattern, and REST controller endpoints.',
    highlights: [
      'Authored parameterized SQL queries and database indexes preventing n+1 query regressions',
      'Packaged multi-stage Dockerfile optimizing production image size under 120MB',
    ],
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'proj-3',
    user_id: DEMO_USER_ID,
    title: 'RAG Assistant',
    description: 'Document intelligence application extracting and answering queries across technical PDFs using vector similarity.',
    role: 'AI Engineer',
    technologies: ['Python', 'FastAPI', 'TypeScript', 'React', 'Vector Embeddings'],
    github_url: 'https://github.com/alexmorgan-dev/rag-assistant',
    deployment_url: 'https://rag-assistant-demo.web.app',
    architecture_overview: 'Chunking pipeline with semantic embeddings and retrieved context augmentation for answer synthesis.',
    highlights: [
      'Built deterministic chunking pipeline handling technical whitepapers and markdown documentation',
      'Implemented grounded answer validation flagging unverified claims before response rendering',
    ],
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_EDUCATION: Education[] = [
  {
    id: 'edu-1',
    user_id: DEMO_USER_ID,
    institution: 'University of California, Berkeley',
    degree: 'Bachelor of Science',
    field_of_study: 'Computer Science',
    start_date: '2022-08-15',
    end_date: '2026-05-20',
    is_current: true,
    gpa: '3.82',
    coursework: [
      'Data Structures & Algorithms',
      'Operating Systems',
      'Database Management Systems',
      'Distributed Systems',
      'Computer Security',
      'Software Engineering Principles'
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    user_id: DEMO_USER_ID,
    name: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    issue_date: '2024-11-10',
    expiration_date: '2027-11-10',
    credential_id: 'AWS-CCP-9821381',
    credential_url: 'https://aws.amazon.com/verification',
    skills_covered: ['Cloud Architecture', 'AWS S3', 'EC2 Basics', 'IAM Security'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    user_id: DEMO_USER_ID,
    title: '1st Place Winner - CalHacks Hackathon',
    organization: 'CalHacks',
    date: '2024-10-20',
    ranking: '1st Place (out of 280 teams)',
    description: 'Built an open-source accessibility browser extension enabling voice-guided keyboard navigation for code repositories.',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ach-2',
    user_id: DEMO_USER_ID,
    title: 'Dean’s Honors List',
    organization: 'UC Berkeley College of Engineering',
    date: '2025-05-15',
    ranking: 'Top 10%',
    description: 'Awarded academic distinction for maintaining GPA above 3.8 across technical coursework.',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_DEMO_EVIDENCE: CareerEvidence[] = [
  {
    id: 'ev-1',
    user_id: DEMO_USER_ID,
    type: 'project',
    title: 'Inventory API Backend',
    claim: 'Engineered high-throughput REST APIs and database schema using Python, FastAPI, and PostgreSQL.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'REST APIs'],
    source_type: 'github',
    source_id: 'proj-2',
    source_reference: 'github.com/alexmorgan-dev/inventory-api (Dockerfile, main.py)',
    confidence: 1.0,
    verification_status: 'VERIFIED',
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ev-2',
    user_id: DEMO_USER_ID,
    type: 'github_code',
    title: 'Inventory API Dockerization',
    claim: 'Constructed multi-stage Docker containerization and docker-compose deployment configuration.',
    skills: ['Docker'],
    source_type: 'github',
    source_id: 'proj-2',
    source_reference: 'Dockerfile: EXPOSE 8000, multi-stage build manifest',
    confidence: 1.0,
    verification_status: 'VERIFIED',
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ev-3',
    user_id: DEMO_USER_ID,
    type: 'project',
    title: 'TaskFlow Full-Stack App',
    claim: 'Built interactive collaborative kanban platform using TypeScript, React, and Next.js.',
    skills: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS'],
    source_type: 'github',
    source_id: 'proj-1',
    source_reference: 'package.json: dependencies on react, next, tailwindcss',
    confidence: 1.0,
    verification_status: 'VERIFIED',
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ev-4',
    user_id: DEMO_USER_ID,
    type: 'professional_experience',
    title: 'Apex Cloud Solutions Internship',
    claim: 'Maintained production microservices and authored automated test suites with 88% branch coverage.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Redis'],
    source_type: 'profile',
    source_id: 'exp-1',
    source_reference: 'Software Engineering Intern employment verification at Apex Cloud Solutions',
    confidence: 1.0,
    verification_status: 'VERIFIED',
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ev-5',
    user_id: DEMO_USER_ID,
    type: 'linkedin_post',
    title: 'Vector Search Integration',
    claim: 'Experimented with vector embeddings and RAG architectures for technical document retrieval.',
    skills: ['Python', 'Vector Embeddings'],
    source_type: 'linkedin',
    source_id: 'post-101',
    source_reference: 'LinkedIn Post: "Integrated vector similarity search into my RAG assistant..."',
    confidence: 0.9,
    verification_status: 'VERIFIED',
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ev-6',
    user_id: DEMO_USER_ID,
    type: 'certificate',
    title: 'AWS Certified Cloud Practitioner',
    claim: 'Certified foundational cloud concepts, IAM security, and core AWS compute/storage architecture.',
    skills: ['AWS S3', 'Cloud Architecture'],
    source_type: 'document',
    source_id: 'cert-1',
    source_reference: 'Credential AWS-CCP-9821381',
    confidence: 1.0,
    verification_status: 'VERIFIED',
    verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const INITIAL_DEMO_REPOS: GitHubRepository[] = [
  {
    id: 'repo-1',
    user_id: DEMO_USER_ID,
    repo_name: 'inventory-api',
    repo_full_name: 'alexmorgan-dev/inventory-api',
    html_url: 'https://github.com/alexmorgan-dev/inventory-api',
    description: 'High-performance inventory auditing REST microservice',
    primary_language: 'Python',
    detected_skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'JWT', 'REST APIs'],
    demonstrated_features: ['REST API endpoints', 'Relational database models', 'Dockerfile container configuration'],
    selected_for_analysis: true,
    last_analyzed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'repo-2',
    user_id: DEMO_USER_ID,
    repo_name: 'taskflow',
    repo_full_name: 'alexmorgan-dev/taskflow',
    html_url: 'https://github.com/alexmorgan-dev/taskflow',
    description: 'Real-time collaborative task management system',
    primary_language: 'TypeScript',
    detected_skills: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'PostgreSQL'],
    demonstrated_features: ['Full-stack App Router', 'Optimistic UI', 'Component architecture'],
    selected_for_analysis: true,
    last_analyzed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'repo-3',
    user_id: DEMO_USER_ID,
    repo_name: 'rag-assistant',
    repo_full_name: 'alexmorgan-dev/rag-assistant',
    html_url: 'https://github.com/alexmorgan-dev/rag-assistant',
    description: 'Document intelligence assistant with grounded citations',
    primary_language: 'Python',
    detected_skills: ['Python', 'FastAPI', 'Vector Embeddings', 'React'],
    demonstrated_features: ['Chunking pipeline', 'Semantic retrieval', 'Citations verification'],
    selected_for_analysis: true,
    last_analyzed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const INITIAL_DEMO_JOBS: Job[] = [
  {
    id: 'job-1',
    user_id: DEMO_USER_ID,
    company: 'Stripe',
    role: 'Software Engineer Intern — Core Infrastructure',
    job_url: 'https://stripe.com/jobs/swe-intern',
    job_description: `About the Role:
We are looking for a Software Engineer Intern to join our Core Infrastructure team. In this role, you will build and scale reliable backend services and APIs handling millions of daily requests.

Requirements:
- Strong proficiency in Python, TypeScript, Go, or Java
- Solid understanding of REST APIs, relational databases (PostgreSQL or MySQL)
- Familiarity with containerization technologies like Docker
- Hands-on experience building full-stack web applications or microservices
- Dedication to clean architecture, automated testing, and code quality

Nice to have:
- Experience with Redis caching or distributed systems
- Cloud platforms (AWS, GCP)
- Familiarity with Next.js or React for developer tooling portals`,
    description_hash: 'hash-stripe-swe-intern-001',
    status: 'Analyzed',
    deadline: '2026-10-31',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const INITIAL_DEMO_JOB_REQUIREMENTS: JobRequirement[] = [
  { id: 'req-1', job_id: 'job-1', user_id: DEMO_USER_ID, requirement: 'Proficiency in Python or TypeScript', category: 'REQUIRED', keywords: ['Python', 'TypeScript'], weight: 1.0, created_at: new Date().toISOString() },
  { id: 'req-2', job_id: 'job-1', user_id: DEMO_USER_ID, requirement: 'REST API design and development', category: 'REQUIRED', keywords: ['REST APIs', 'FastAPI'], weight: 1.0, created_at: new Date().toISOString() },
  { id: 'req-3', job_id: 'job-1', user_id: DEMO_USER_ID, requirement: 'Relational databases (PostgreSQL)', category: 'REQUIRED', keywords: ['PostgreSQL', 'SQL'], weight: 1.0, created_at: new Date().toISOString() },
  { id: 'req-4', job_id: 'job-1', user_id: DEMO_USER_ID, requirement: 'Containerization using Docker', category: 'REQUIRED', keywords: ['Docker', 'Containers'], weight: 0.9, created_at: new Date().toISOString() },
  { id: 'req-5', job_id: 'job-1', user_id: DEMO_USER_ID, requirement: 'Automated testing and code quality', category: 'RESPONSIBILITY', keywords: ['Testing', 'Code Review'], weight: 0.8, created_at: new Date().toISOString() },
  { id: 'req-6', job_id: 'job-1', user_id: DEMO_USER_ID, requirement: 'Redis caching experience', category: 'PREFERRED', keywords: ['Redis', 'Caching'], weight: 0.7, created_at: new Date().toISOString() },
  { id: 'req-7', job_id: 'job-1', user_id: DEMO_USER_ID, requirement: 'Kubernetes production orchestration', category: 'PREFERRED', keywords: ['Kubernetes', 'K8s'], weight: 0.6, created_at: new Date().toISOString() },
];
