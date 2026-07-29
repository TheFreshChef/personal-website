import Nav from "./components/Nav";
import Hero from "./components/Hero";
import TechTicker from "./components/TechTicker";
import Projects from "./components/Projects";
import Experience from "./components/Experience";
import MoreWork from "./components/MoreWork";
import About from "./components/About";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <div className="backdrop" aria-hidden="true">
        <div className="aurora aurora-a" />
        <div className="aurora aurora-b" />
        <div className="aurora aurora-c" />
      </div>
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
