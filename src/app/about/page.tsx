import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">About</h1>

      <div className="mt-8 space-y-6 text-sm text-text-secondary leading-relaxed">
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-2">Systems and Signals</h2>
          <p>
            Systems and Signals is a technical learning platform by <strong className="text-text-primary">Vishwas Sharma</strong>.
            Every series here is project-based — you build a real system from scratch, article by article.
            No isolated theory. No toy examples that fall apart outside a tutorial.
          </p>
          <p className="mt-3">
            The name reflects the philosophy: <em className="text-text-primary">systems</em> are what you build,
            <em className="text-text-primary"> signals</em> are what tell you they&apos;re working.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text-primary mb-2">About Vishwas</h2>
          <p>
            DevOps Engineer with hands-on experience across cloud infrastructure, container platforms,
            and CI/CD pipelines. I work with AWS, GCP, Docker, Kubernetes, Terraform, and Prometheus day to day.
          </p>
          <p className="mt-3">
            I started this platform because the content I wanted when I was learning didn&apos;t exist —
            practical, complete, and honest about the rough edges.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text-primary mb-2">What we cover</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {[
              { label: 'DevOps',    items: ['CI/CD', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Observability'] },
              { label: 'MLOps',     items: ['ML Pipelines', 'Model Serving', 'Experiment Tracking', 'Monitoring', 'Feature Stores'] },
              { label: 'Security',  items: ['Hardening', 'Secrets Mgmt', 'Threat Modelling', 'CVE Triage', 'Compliance'] },
            ].map(({ label, items }) => (
              <div key={label} className="rounded-lg border border-border bg-bg-secondary p-4">
                <p className="text-xs font-semibold text-text-primary mb-2">{label}</p>
                <ul className="space-y-1">
                  {items.map(i => (
                    <li key={i} className="text-xs text-text-muted">{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold text-text-primary mb-2">Get in touch</h2>
          <div className="flex gap-4">
            <a href="https://github.com/vsindevops" target="_blank" rel="noopener noreferrer"
               className="text-accent hover:underline">GitHub</a>
            <a href="https://x.com/syssignals" target="_blank" rel="noopener noreferrer"
               className="text-accent hover:underline">X / Twitter</a>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <Link href="/series"
          className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-bg-primary hover:bg-[#79b8ff] transition-colors">
          Browse Series →
        </Link>
      </div>
    </div>
  )
}
