import { profile } from "../data";
import { useReveal } from "../hooks";

export default function Hero() {
  const ref = useReveal<HTMLElement>();

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-inner">
        <p className="hero-kicker" data-reveal>
          <span className="pulse-dot" aria-hidden="true" />
          Open to new-grad SWE &amp; ML roles · Graduating Dec 2026
        </p>
        <h1 className="hero-title" data-reveal style={{ transitionDelay: "80ms" }}>
          Building intelligent systems,
          <br />
          <span className="grad-text">from RAG pipelines to games.</span>
        </h1>
        <p className="hero-sub" data-reveal style={{ transitionDelay: "160ms" }}>
          I&apos;m Edric — a CS senior at UC Santa Barbara and AI engineer. I&apos;ve shipped
          document-extraction platforms in industry, ML for particle accelerators at SLAC, and a
          cyberpunk FPS you can play right now.
        </p>
        <div className="hero-cta" data-reveal style={{ transitionDelay: "240ms" }}>
          <a className="btn btn-primary" href="#projects">
            See my work
          </a>
          <a className="btn btn-ghost" href={`mailto:${profile.email}`}>
            Get in touch
          </a>
        </div>
      </div>
    </section>
  );
}
