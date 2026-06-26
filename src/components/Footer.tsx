import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="h-16 bg-white border-t border-gray-100 flex items-center justify-between px-4 sm:px-8 mt-auto w-full">
      <div className="flex gap-4 sm:gap-8 items-center">
        <div className="hidden sm:flex flex-col">
          <span className="text-[9px] uppercase text-gray-400 font-bold tracking-widest">Email</span>
          <span className="text-xs font-medium">yolatgcolotela@gmail.com</span>
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-[9px] uppercase text-gray-400 font-bold tracking-widest">Phone</span>
          <span className="text-xs font-medium">078 840 4160</span>
        </div>
      </div>
      <div className="flex gap-4">
        <a href="https://www.linkedin.com/in/yola-gcolotela-586b19359" target="_blank" rel="noopener noreferrer" className="text-xs font-bold border-b border-black text-[#1a1a1a]">LinkedIn</a>
        <a href="https://github.com/ytgTonz" target="_blank" rel="noopener noreferrer" className="text-xs font-bold border-b border-black text-[#1a1a1a]">GitHub</a>
      </div>
      <div className="text-[10px] text-gray-400">
        © {year} Yola Gcolotela. All rights reserved.
      </div>
    </footer>
  );
}
