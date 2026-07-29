import { useEffect, useRef } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import TechTicker from "./components/TechTicker";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import MoreWork from "./components/MoreWork";
import About from "./components/About";
import Footer from "./components/Footer";

// Blue glow that trails the cursor over the black backdrop. Lerped via rAF so
// it drifts behind the pointer instead of sticking to it.
function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.35;
    let x = targetX;
    let y = targetY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const loop = () => {
      x += (targetX - x) * 0.1;
      y += (targetY - y) * 0.1;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div className="cursor-glow" ref={ref} aria-hidden="true" />;
}

export default function App() {
  return (
    <>
      <CursorGlow />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <TechTicker />
        <Projects />
        <Experience />
        <MoreWork />
        <About />
      </main>
      <Footer />
    </>
  );
}
