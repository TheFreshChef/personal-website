import { projects } from "../data";
import { useReveal, spotlight } from "../hooks";

const shots = ["/zer0shot/shot1.png", "/zer0shot/shot2.png", "/zer0shot/shot3.png", "/zer0shot/shot4.png"];

export default function Projects() {
  const ref = useReveal<HTMLElement>();
  const [game, ...rest] = projects;

  return (
    <section className="section" id="projects" ref={ref}>
      <div className="section-head" data-reveal>
        <p className="section-label">01 — Projects</p>
        <h2 className="section-title">Things I&apos;ve built</h2>
      </div>

      {/* Featured game card spans the full row */}
      <article
        className={`card card-feature accent-${game.accent}`}
        data-reveal
        onMouseMove={spotlight}
      >
        <div className="feature-media" aria-hidden="true">
          {shots.map((s, i) => (
            <img key={s} src={s} alt="" loading="lazy" className={`feature-shot shot-${i + 1}`} />
          ))}
          <div className="feature-media-fade" />
        </div>
        <div className="feature-body">
          <div className="card-top">
            <span className="card-role">{game.role}</span>
            <span className="card-period">{game.period}</span>
          </div>
          <h3 className="card-name feature-name">{game.name}</h3>
          <p className="card-blurb">{game.blurb}</p>
          <ul className="card-points">
            {game.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <div className="card-foot">
            <div className="tags">
              {game.tech.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
            {game.links.map((l) => (
              <a className="card-link" key={l.url} href={l.url} target="_blank" rel="noreferrer">
                {l.label} <Arrow />
              </a>
            ))}
          </div>
        </div>
      </article>

      <div className="project-grid">
        {rest.map((p, i) => (
          <article
            className={`card accent-${p.accent}`}
            key={p.name}
            data-reveal
            style={{ transitionDelay: `${i * 90}ms` }}
            onMouseMove={spotlight}
          >
            <div className="card-top">
              <span className="card-role">{p.role}</span>
              <span className="card-period">{p.period}</span>
            </div>
            <h3 className="card-name">{p.name}</h3>
            {p.award && <span className="award">{p.award}</span>}
            <p className="card-blurb">{p.blurb}</p>
            <ul className="card-points">
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="card-foot">
              <div className="tags">
                {p.tech.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="card-links">
                {p.links.map((l) => (
                  <a className="card-link" key={l.url} href={l.url} target="_blank" rel="noreferrer">
                    {l.label} <Arrow />
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
      <path
        d="M4 12 12 4m0 0H5.5M12 4v6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
