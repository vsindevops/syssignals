/** Curriculum metadata for series — module grouping and upcoming lessons. */

export interface SeriesModule {
  title: string
  blurb: string
  days: number[]
}

export interface UpcomingDay {
  day: number
  title: string
  blurb?: string
}

export interface SeriesInfo {
  slug: string
  name: string
  tagline: string
  description: string
  total: number
  level: string
  topics: string[]
  modules: SeriesModule[]
  upcoming: UpcomingDay[]
}

export const SERIES: Record<string, SeriesInfo> = {
  '30-days-devops': {
    slug: '30-days-devops',
    name: '30 Days of DevOps',
    tagline: 'Zero to production-grade Kubernetes, one working project a day.',
    description:
      'A hands-on curriculum that builds a real platform from scratch: Git workflows, hardened Docker images, CI/CD, then a full Kubernetes stack — Helm, Ingress, observability, GitOps, security policies, autoscaling and scheduling. Every article ships a working project with verified commands and expected output.',
    total: 30,
    level: 'Beginner → Advanced',
    topics: ['Git', 'Docker', 'CI/CD', 'Kubernetes', 'GitOps', 'Observability', 'Security'],
    modules: [
      {
        title: 'Foundations',
        blurb: 'Branching strategies, lean container images, a full Compose stack, and a CI/CD pipeline that gates every image.',
        days: [1, 2, 3, 4],
      },
      {
        title: 'Kubernetes Core',
        blurb: 'A local cluster, your app packaged as a Helm chart, and HTTPS traffic through a real Ingress.',
        days: [5, 6, 7],
      },
      {
        title: 'Observability',
        blurb: 'Metrics with Prometheus and Grafana, centralised logs with Loki and LogQL.',
        days: [8, 9],
      },
      {
        title: 'GitOps & Secrets',
        blurb: 'Argo CD drives the cluster from Git; Sealed Secrets make secrets safe to commit.',
        days: [10, 11],
      },
      {
        title: 'Scaling & Guardrails',
        blurb: 'Autoscaling on real metrics, least-privilege RBAC, Pod Security Standards, quotas and limits.',
        days: [12, 13, 14, 15],
      },
      {
        title: 'Reliability & State',
        blurb: 'Surviving node drains, running PostgreSQL with StatefulSets, init containers and native sidecars.',
        days: [16, 17, 18],
      },
      {
        title: 'Workloads & Scheduling',
        blurb: 'Jobs and CronJobs, DaemonSets on every node, affinity and topology spread, priorities and preemption.',
        days: [19, 20, 21, 22],
      },
      {
        title: 'Debugging & Operations',
        blurb: 'Working on a hardened cluster: ephemeral containers, kubectl debug, node-level forensics.',
        days: [23],
      },
      {
        title: 'Configuration & Resources',
        blurb: 'ConfigMaps and the env-vs-file update trap; requests, limits, and the QoS class that decides who survives node pressure; right-sizing requests automatically with the Vertical Pod Autoscaler.',
        days: [24, 25, 26],
      },
      {
        title: 'Platform Engineering',
        blurb: 'How the platform machinery works and how to extend it: Helm hooks and helm test for sequenced, verified releases, then CRDs and the operator pattern that powers every add-on you installed.',
        days: [27, 28],
      },
      {
        title: 'Resilience & Production',
        blurb: 'Backup and disaster recovery with Velero — capturing resources and volume data, then proving a restore — capped by the production-readiness checklist that maps every prior day onto a go/no-go review.',
        days: [29, 30],
      },
    ],
    upcoming: [],
  },

  'python-for-ai-engineering': {
    slug: 'python-for-ai-engineering',
    name: 'Python for AI Engineering',
    tagline: 'From zero to AI-ready Python in 30 days — one project every day.',
    description:
      'A beginner-first, project-based path that takes you from installing Python to writing the kind of Python that AI engineering runs on. No computer-science background required: every day explains the idea in plain English, builds one small working project, and runs entirely on your own laptop (macOS, Linux or Windows). You finish able to handle data the Pythonic way, write typed and validated code, call APIs and LLMs asynchronously, and use NumPy and Pandas — the exact foundation needed before PyTorch, TensorFlow and Hugging Face.',
    total: 30,
    level: 'Absolute Beginner → AI-Ready',
    topics: ['Python', 'OOP', 'Type Hints', 'Pydantic', 'Async', 'APIs', 'LLMs', 'NumPy', 'Pandas'],
    modules: [
      {
        title: 'Setup & Python Basics',
        blurb: 'Install Python on any OS and write your first program, then master variables, collections, control flow, functions and modules.',
        days: [1, 2, 3, 4, 5, 6],
      },
      {
        title: 'Pythonic Data Handling',
        blurb: 'Comprehensions, nested JSON-style data, and sorting, filtering, mapping and reducing — the everyday data moves of real Python.',
        days: [7, 8, 9],
      },
      {
        title: 'Object-Oriented Python',
        blurb: 'Classes and objects, inheritance versus composition, dataclasses, and when OOP actually pays off in AI and backend code.',
        days: [10, 11, 12],
      },
      {
        title: 'Robust Code: Errors, Logging & Files',
        blurb: 'Handle failures with exceptions and clean messages, add logging and debug confidently, and read and write text, JSON and .env files.',
        days: [13, 14, 15],
      },
      {
        title: 'Environments & Project Structure',
        blurb: 'Virtual environments, pip and a clean project layout so every project is isolated and reproducible.',
        days: [16],
      },
      {
        title: 'Type Safety',
        blurb: 'Type hints and static checking, then Pydantic models for validating the data flowing in and out of your programs.',
        days: [17, 18],
      },
      {
        title: 'Async Python',
        blurb: 'async/await, coroutines and concurrency — and exactly where async matters in LLM, RAG and agent applications.',
        days: [19, 20],
      },
      {
        title: 'Python for APIs',
        blurb: 'HTTP from a Python view, calling APIs with requests and async httpx, handling keys securely, and parsing and validating responses.',
        days: [21, 22, 23],
      },
      {
        title: 'Python for AI Workflows',
        blurb: 'Call Claude, OpenAI and Gemini-style APIs, structure prompts and responses, parse structured outputs, and ship a real CLI AI tool.',
        days: [24, 25, 26, 27],
      },
      {
        title: 'Data & ML Foundations',
        blurb: 'NumPy and tensor intuition, Pandas and datasets, plotting and inspection — why these come before PyTorch, TensorFlow and Hugging Face.',
        days: [28, 29, 30],
      },
    ],
    upcoming: [
      { day: 1, title: 'Set Up Python & Write Your First Program' },
      { day: 2, title: 'Variables, Numbers, Strings & Booleans' },
      { day: 3, title: 'Lists, Tuples, Sets & Dictionaries' },
      { day: 4, title: 'Loops & Conditionals' },
      { day: 5, title: 'Functions & Return Values' },
      { day: 6, title: 'Scope, Imports & Modules' },
      { day: 7, title: 'List & Dictionary Comprehensions' },
      { day: 8, title: 'Nested Data & JSON-Style Structures' },
      { day: 9, title: 'Sorting, Filtering, Mapping & Reducing' },
      { day: 10, title: 'Classes, Objects & Methods' },
      { day: 11, title: 'Inheritance & Composition' },
      { day: 12, title: 'Dataclasses & When to Use OOP' },
      { day: 13, title: 'Error Handling & Custom Exceptions' },
      { day: 14, title: 'Logging & Debugging' },
      { day: 15, title: 'File Handling: Text, JSON & .env' },
      { day: 16, title: 'Virtual Environments, pip & Project Structure' },
      { day: 17, title: 'Type Hints & Static Checking' },
      { day: 18, title: 'Pydantic for Data Validation' },
      { day: 19, title: 'Async/Await & Concurrency' },
      { day: 20, title: 'Async in Practice: LLM, RAG & Agents' },
      { day: 21, title: 'HTTP & Calling APIs with requests' },
      { day: 22, title: 'Async APIs with httpx & Secure Keys' },
      { day: 23, title: 'Parsing & Validating API Responses' },
      { day: 24, title: 'Calling an LLM API (Claude, OpenAI, Gemini)' },
      { day: 25, title: 'Structuring Prompts & Responses' },
      { day: 26, title: 'Parsing Structured LLM Outputs' },
      { day: 27, title: 'Build a CLI AI Tool' },
      { day: 28, title: 'NumPy & Tensor Intuition' },
      { day: 29, title: 'Pandas & Working with Datasets' },
      { day: 30, title: 'Plotting, Inspection & Capstone' },
    ],
  },

  '100-days-mlops': {
    slug: '100-days-mlops',
    name: '100 Days of MLOps',
    tagline: 'From zero to a full local MLOps platform in 100 days — one project every day.',
    description:
      'A beginner-first, project-based path that takes you from "what is MLOps?" to running an end-to-end machine-learning platform on your own laptop. No computer-science background required and no cloud bills ever: every day explains the idea in plain English, builds one small working project, and runs 100% locally on macOS, Linux or Windows. You start with a clean environment and real ML, then layer on reproducibility and data/model versioning (Git + DVC), experiment tracking (MLflow), data validation and feature stores, model packaging and serving (FastAPI, Docker, BentoML), pipeline orchestration (Prefect), CI/CD for ML, Kubernetes deployment on a local cluster (kind), and finally monitoring, drift detection and automated retraining — capped by a capstone that ties all ten modules into one runnable platform.',
    total: 100,
    level: 'Absolute Beginner → MLOps Engineer',
    topics: ['Python', 'scikit-learn', 'Git', 'DVC', 'MLflow', 'Docker', 'FastAPI', 'Prefect', 'CI/CD', 'Kubernetes', 'Monitoring', 'Drift'],
    modules: [
      {
        title: 'Foundations & Your Local MLOps Lab',
        blurb: 'What MLOps really is, a bulletproof cross-OS setup, Python environments and Git for ML, your first end-to-end model, clean project structure, and reproducibility from day one.',
        days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      {
        title: 'Machine Learning You Can Operationalize',
        blurb: 'Just enough honest, practical ML to have real models worth shipping — data handling, leak-free splits, metrics, sklearn pipelines, cross-validation, tuning and packaging a training run.',
        days: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      },
      {
        title: 'Reproducibility & Versioning: Data + Code',
        blurb: 'Version everything with Git and DVC — datasets, pipelines, params and models — so any result can be reproduced from a clean clone.',
        days: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
      },
      {
        title: 'Experiment Tracking with MLflow',
        blurb: 'Never lose a result again: track params, metrics and artifacts, compare runs, autolog, tune with Optuna, and run a local tracking server.',
        days: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
      },
      {
        title: 'Data Quality, Validation & Feature Stores',
        blurb: 'Catch bad data before it breaks models with Pandera and Great Expectations, profile and document datasets, and serve consistent features with Feast.',
        days: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
      },
      {
        title: 'Packaging & Serving Models',
        blurb: 'Turn a model into a real service — FastAPI, Pydantic validation, Docker, tests, batch vs online, BentoML, load testing and ONNX.',
        days: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
      },
      {
        title: 'Orchestration & Automated Pipelines',
        blurb: 'Pipelines that run themselves with Prefect — retries, caching, scheduling, parameterization and an end-to-end training pipeline (plus Airflow awareness).',
        days: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
      },
      {
        title: 'CI/CD for Machine Learning',
        blurb: 'Ship model changes safely: test ML code and models, GitHub Actions, continuous training, CML reports, validation gates and registry promotion.',
        days: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
      },
      {
        title: 'Deploying Models on Kubernetes, Locally',
        blurb: 'Real serving infra on a local kind cluster — deploy, configure, scale, KServe/Seldon, canary and A/B, rollbacks and Argo CD GitOps.',
        days: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
      },
      {
        title: 'Monitoring, Drift & the Full MLOps Loop',
        blurb: 'Models rot — detect it and respond: Prometheus/Grafana, prediction logging, data and concept drift with Evidently, alerting, automated retraining, governance, and the final capstone.',
        days: [91, 92, 93, 94, 95, 96, 97, 98, 99, 100],
      },
    ],
    upcoming: [
      { day: 1, title: 'What is MLOps & Setting Up Your Machine' },
      { day: 2, title: 'The MLOps Lifecycle & Mental Model' },
      { day: 3, title: 'Python Environments for ML' },
      { day: 4, title: 'Git Basics for ML Projects' },
      { day: 5, title: 'Notebooks vs Scripts' },
      { day: 6, title: 'Your First ML Model, End to End' },
      { day: 7, title: 'Saving & Loading Models' },
      { day: 8, title: 'Project Structure That Scales' },
      { day: 9, title: 'Task Automation, Cross-OS' },
      { day: 10, title: 'Reproducibility 101' },
      { day: 11, title: 'Working with Data: pandas for ML' },
      { day: 12, title: 'Train/Validation/Test Splits' },
      { day: 13, title: 'Classification Models & Metrics' },
      { day: 14, title: 'Regression Models & Metrics' },
      { day: 15, title: 'Feature Engineering with sklearn Pipelines' },
      { day: 16, title: 'Cross-Validation & Honest Evaluation' },
      { day: 17, title: 'Hyperparameters & Tuning' },
      { day: 18, title: 'Handling Imbalanced & Messy Data' },
      { day: 19, title: 'Model Interpretability Basics' },
      { day: 20, title: 'Packaging a Training Run' },
      { day: 21, title: 'Why Data Versioning? The Problem' },
      { day: 22, title: 'Intro to DVC' },
      { day: 23, title: 'DVC Remotes (Local)' },
      { day: 24, title: 'DVC Pipelines' },
      { day: 25, title: 'Reproducing & Comparing Runs' },
      { day: 26, title: 'Config Management with YAML/Hydra' },
      { day: 27, title: 'Environment Reproducibility' },
      { day: 28, title: 'Versioned Data & Model Artifacts' },
      { day: 29, title: 'Project Templates' },
      { day: 30, title: 'Capstone: A Fully Reproducible Project' },
      { day: 31, title: 'Why Experiment Tracking?' },
      { day: 32, title: 'MLflow Tracking Basics' },
      { day: 33, title: 'Comparing Runs in the MLflow UI' },
      { day: 34, title: 'Autologging' },
      { day: 35, title: 'Logging Models & Artifacts' },
      { day: 36, title: 'Hyperparameter Tuning, Tracked (Optuna)' },
      { day: 37, title: 'MLflow Projects' },
      { day: 38, title: 'Organizing Experiments' },
      { day: 39, title: 'A Local Tracking Server' },
      { day: 40, title: 'Capstone: An Experimentation Workflow' },
      { day: 41, title: 'Why Data Validation Matters' },
      { day: 42, title: 'Schema Validation with Pandera' },
      { day: 43, title: 'Great Expectations' },
      { day: 44, title: 'Validation as a Pipeline Gate' },
      { day: 45, title: 'Data Profiling & Documentation' },
      { day: 46, title: 'Reusable Feature Pipelines' },
      { day: 47, title: 'Intro to Feature Stores (Feast)' },
      { day: 48, title: 'Online vs Offline Features' },
      { day: 49, title: 'Preventing Training/Serving Skew' },
      { day: 50, title: 'Capstone: A Validated Feature Pipeline' },
      { day: 51, title: 'From Model to Inference API' },
      { day: 52, title: 'Serving a Model with FastAPI' },
      { day: 53, title: 'Request/Response Validation with Pydantic' },
      { day: 54, title: 'Dockerizing Your Model Service' },
      { day: 55, title: 'Testing Your Model API' },
      { day: 56, title: 'Batch vs Online Inference' },
      { day: 57, title: 'Model Serving with BentoML' },
      { day: 58, title: 'Latency & Load Testing' },
      { day: 59, title: 'Optimizing Models with ONNX' },
      { day: 60, title: 'Capstone: A Production-Style Model Service' },
      { day: 61, title: "Why Orchestration? Cron Isn't Enough" },
      { day: 62, title: 'Intro to Prefect' },
      { day: 63, title: 'Retries, Caching & Logging' },
      { day: 64, title: 'Scheduling Pipelines' },
      { day: 65, title: 'Parameterized Pipelines' },
      { day: 66, title: 'An End-to-End Training Pipeline' },
      { day: 67, title: 'Data Pipelines & Dependencies (DAGs)' },
      { day: 68, title: 'Airflow Awareness' },
      { day: 69, title: 'Pipeline Observability' },
      { day: 70, title: 'Capstone: An Automated, Scheduled Pipeline' },
      { day: 71, title: 'Testing ML Code' },
      { day: 72, title: 'Testing Data & Models' },
      { day: 73, title: 'CI with GitHub Actions' },
      { day: 74, title: 'Continuous Training Concepts' },
      { day: 75, title: 'CML: Continuous ML Reports' },
      { day: 76, title: 'Model Validation Gates' },
      { day: 77, title: 'The Model Registry as a Promotion Tool' },
      { day: 78, title: 'Building & Publishing Artifacts in CI' },
      { day: 79, title: 'GitOps for ML' },
      { day: 80, title: 'Capstone: A CI/CD Pipeline for a Model' },
      { day: 81, title: 'Why Kubernetes for ML Serving? + kind' },
      { day: 82, title: 'Deploying Your Model API to kind' },
      { day: 83, title: 'Config & Secrets for Model Services' },
      { day: 84, title: 'Scaling Model Servers' },
      { day: 85, title: 'Model Serving with KServe/Seldon' },
      { day: 86, title: 'Canary & Shadow Deployments' },
      { day: 87, title: 'A/B Testing Models' },
      { day: 88, title: 'Rollouts & Rollbacks' },
      { day: 89, title: 'GitOps Model Deploys with Argo CD' },
      { day: 90, title: 'Capstone: A Model Serving Platform on kind' },
      { day: 91, title: 'Why Monitoring ML Is Different' },
      { day: 92, title: 'Service Monitoring with Prometheus & Grafana' },
      { day: 93, title: 'Logging Predictions & Ground Truth' },
      { day: 94, title: 'Data Drift Detection with Evidently' },
      { day: 95, title: 'Concept Drift & Performance Decay' },
      { day: 96, title: 'Alerting on Drift & Degradation' },
      { day: 97, title: 'Automated Retraining Triggers' },
      { day: 98, title: 'Governance, Lineage & Model Cards' },
      { day: 99, title: 'The Full MLOps Architecture' },
      { day: 100, title: 'Capstone: Your End-to-End Local MLOps Platform' },
    ],
  },
}

export const PLANNED_SERIES = [
  {
    name: 'AI Engineering Projects',
    status: 'Coming soon',
    blurb: 'Production LLM apps: RAG systems, agents, evals and deployment patterns that survive real traffic.',
  },
]
