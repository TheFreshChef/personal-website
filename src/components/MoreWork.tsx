import { moreWork } from "../data";
import { useReveal, spotlight } from "../hooks";
import { Arrow } from "./Projects";

export default function MoreWork() {
  const ref = useReveal<HTMLElement>();

  return (
    <section className="section" id="more-work" ref={ref}>
      <div className="section-head" data-reveal>
        <p className="section-label">03 — More on GitHub</p>
        <h2 className="section-title">Deep dives &amp; research</h2>
      </div>

      <div className="mini-grid">
        {moreWork.map((r, i) => (
          <a
            className="card card-mini"
            key={r.name}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            data-reveal
            style={{ transitionDelay: `${i * 80}ms` }}
            onMouseMove={spotlight}
          >
            <div className="mini-head">
              <h3 className="mini-name">{r.name}</h3>
              <span className="mini-arrow" aria-hidden="true">
                <Arrow />
              </span>
            </div>
            {r.badge && <span className="badge">{r.badge}</span>}
            <p className="mini-blurb">{r.blurb}</p>
            <div className="tags">
              {r.tech.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
