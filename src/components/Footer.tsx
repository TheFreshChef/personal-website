import { profile } from "../data";
import { useReveal } from "../hooks";
import { GitHubIcon, LinkedInIcon } from "./Nav";

export default function Footer() {
  const ref = useReveal<HTMLElement>();

  return (
    <footer className="footer" id="contact" ref={ref}>
      <div className="footer-inner" data-reveal>
        <p className="section-label">05 — Contact</p>
        <h2 className="footer-title">
          Let&apos;s build something <span className="grad-text">worth shipping.</span>
        </h2>
        <p className="footer-sub">
          I&apos;m graduating in December 2026 and looking for new-grad software &amp; ML engineering
          roles. If my work resonates, my inbox is open.
        </p>
        <a className="btn btn-primary btn-lg" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <div className="footer-social">
          <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub">
            <GitHubIcon /> GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
            <LinkedInIcon /> LinkedIn
          </a>
        </div>
        <p className="footer-fine">
          © {new Date().getFullYear()} {profile.name} · {profile.location}
        </p>
      </div>
    </footer>
  );
}
