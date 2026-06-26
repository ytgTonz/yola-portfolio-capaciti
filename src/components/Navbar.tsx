import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Education', path: '/education' },
  { name: 'Experience', path: '/experience' },
  { name: 'Projects', path: '/projects' },
  { name: 'Certifications', path: '/certifications' },
  { name: 'Contact', path: '/contact' },
];

export function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start py-6 md:py-12 px-4 sm:px-8 md:px-8 md:w-56 sticky top-0 md:h-screen z-50 bg-[#fdfdfd]/90 md:bg-transparent backdrop-blur-md md:backdrop-blur-none border-b border-gray-100 md:border-none">
      <a href="/" className="text-base font-bold tracking-tight text-[#1a1a1a] md:mb-10" onClick={() => setIsOpen(false)}>
        Yola Gcolotela
      </a>
      <div className="hidden md:flex flex-col gap-4 text-[13px] font-medium text-gray-500 w-full">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.path}
            className={cn(
              "transition-colors hover:text-black",
              location.pathname === link.path ? "text-black cursor-default" : ""
            )}
          >
            {link.name}
          </a>
        ))}
      </div>
      
      <button 
        className="md:hidden p-1 text-gray-500 hover:text-black focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-20 left-4 right-4 bg-white border border-gray-100 rounded-lg shadow-xl"
          >
            <div className="flex flex-col space-y-4 px-6 py-6 text-sm font-medium text-gray-500">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "transition-colors hover:text-black",
                    location.pathname === link.path ? "text-black" : ""
                  )}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
