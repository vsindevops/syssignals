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
}

export const PLANNED_SERIES = [
  {
    name: '30 Days of MLOps',
    status: 'Coming soon',
    blurb: 'Model training pipelines, experiment tracking, model serving, monitoring and drift — the same project-based format.',
  },
  {
    name: 'AI Engineering Projects',
    status: 'Coming soon',
    blurb: 'Production LLM apps: RAG systems, agents, evals and deployment patterns that survive real traffic.',
  },
]
