import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Experience } from "./components/Experience";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Beyond } from "./components/Beyond";
import { Contact } from "./components/Contact";

function App() {
  return (
    <div className="bg-brand-bg text-brand-text min-h-screen selection:bg-brand-primary/30 selection:text-white overflow-x-hidden w-full max-w-full">
      <Nav />
      <main className="overflow-x-hidden w-full max-w-full">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Beyond />
      </main>
      <Contact />
    </div>
  );
}

export default App;
