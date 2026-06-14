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
    ],
    upcoming: [
      { day: 27, title: 'To be announced' },
      { day: 28, title: 'To be announced' },
      { day: 29, title: 'To be announced' },
      { day: 30, title: 'To be announced' },
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
