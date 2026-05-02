const BOOKS = [
  {
    title: 'CBT Self-Help Course',
    author: 'Carol Vivyan',
    desc: 'Free 7-week cognitive behavioral therapy course.',
    url: 'https://www.getselfhelp.co.uk/docs/SelfHelpCourse.pdf',
    cta: 'Read PDF',
  },
  {
    title: 'Overcoming Depression',
    author: 'Centre for Clinical Interventions',
    desc: 'Evidence-based workbook for managing depression.',
    url: 'https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Depression',
    cta: 'Access Workbook',
  },
  {
    title: 'Understanding PTSD',
    author: 'Mind UK',
    desc: 'Comprehensive guide on Post-Traumatic Stress Disorder.',
    url: 'https://www.mind.org.uk/information-support/types-of-mental-health-problems/post-traumatic-stress-disorder-ptsd-and-complex-ptsd/about-ptsd/',
    cta: 'Read More',
  },
]

export default function Resources() {
  return (
    <div className="page-container">
      <h1 className="page-title">Self-Help Resources</h1>
      <p className="page-subtitle">Free, evidence-based books and workbooks to support your journey.</p>

      <div className="mt-3" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {BOOKS.map(({ title, author, desc, url, cta }) => (
          <div key={title} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div className="resource-icon">📖</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: '0.2rem' }}>{title}</h2>
              <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>by {author}</p>
              <p>{desc}</p>
              <a href={url} target="_blank" rel="noreferrer" className="btn btn-primary mt-2">{cta} ↗</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}