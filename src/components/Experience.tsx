import { experience } from "../data";
import { useReveal } from "../hooks";

export default function Experience() {
  const ref = useReveal<HTMLElement>();

  return (
    <section className="section" id="experience" ref={ref}>
      <div className="section-head" data-reveal>
        <p className="section-label">02 — Experience</p>
        <h2 className="section-title">Where I&apos;ve worked</h2>
      </div>

      <div className="timeline">
        {experience.map((job, i) => (
          <article
            className="timeline-item"
            key={job.company}
            data-reveal
            style={{ transitionDelay: `${i * 90}ms` }}
          >
            <div className="timeline-rail" aria-hidden="true">
              <span className="timeline-dot" />
            </div>
            <div className="timeline-body">
              <div className="timeline-meta">
                <span className="timeline-period">{job.period}</span>
                <span className="timeline-loc">{job.location}</span>
              </div>
              <h3 className="timeline-role">{job.role}</h3>
              <p className="timeline-company">{job.company}</p>
              <ul className="card-points">
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <div className="tags">
                {job.tech.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
