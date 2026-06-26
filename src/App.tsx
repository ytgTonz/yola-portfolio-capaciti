/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Education } from './pages/Education';
import { Experience } from './pages/Experience';
import { Projects } from './pages/Projects';
import { Certifications } from './pages/Certifications';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row bg-[#fdfdfd] text-[#1a1a1a] font-sans selection:bg-blue-100 max-w-7xl mx-auto w-full">
        <Navbar />
        <div className="flex-grow flex flex-col w-full min-w-0 md:pl-12 lg:pl-20">
          <main className="flex-grow flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/education" element={<Education />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/certifications" element={<Certifications />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

