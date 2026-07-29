import { education, skills, interests } from "../data";
import { useReveal } from "../hooks";

export default function About() {
  const ref = useReveal<HTMLElement>();

  return (
    <section className="section" id="about" ref={ref}>
      <div className="section-head" data-reveal>
        <p className="section-label">04 — About</p>
        <h2 className="section-title">Education &amp; toolkit</h2>
      </div>

      <div className="about-grid">
        <div className="card about-edu" data-reveal>
          <p className="edu-school">{education.school}</p>
          <p className="edu-degree">{education.degree}</p>
          <div className="edu-facts">
            <span>GPA {education.gpa}</span>
            {education.honors.map((h) => (
              <span key={h}>{h}</span>
            ))}
            <span>Class of {education.graduation}</span>
          </div>
          <p className="edu-course-label">Selected coursework</p>
          <div className="tags">
            {education.coursework.map((c) => (
              <span className="tag" key={c}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="card about-skills" data-reveal style={{ transitionDelay: "90ms" }}>
          {Object.entries(skills).map(([group, list]) => (
            <div className="skill-group" key={group}>
              <p className="skill-label">{group}</p>
              <div className="tags">
                {list.map((s) => (
                  <span className="tag" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="skill-group">
            <p className="skill-label">Off the clock</p>
            <p className="interests">{interests.join(" · ")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
