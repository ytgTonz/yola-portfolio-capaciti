import { motion } from 'motion/react';

export function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="flex-grow flex items-center bg-[#fdfdfd]"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-8 w-full py-12 md:py-24">
        <div className="flex flex-col-reverse md:flex-row items-center gap-12">
          
          <div className="flex-1 space-y-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-none mb-2"
              >
                Yola Gcolotela
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-6"
              >
                Software & Network Engineer
              </motion.p>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg italic font-serif text-gray-600 mb-4 leading-snug max-w-lg"
            >
              "Building intelligent systems, one solution at a time."
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-sm text-gray-500 leading-relaxed max-w-lg"
            >
              Highly skilled Software Engineer and Network Engineer with hands-on experience in full-stack development, network architecture, and IT infrastructure. Currently interning at Mindspyr, a tech startup, where I build real-world platforms using the MERN stack, React Native, and cloud technologies. Passionate about creating innovative, scalable solutions that make a meaningful impact.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex gap-3 pt-2"
            >
              <a 
                href="/projects" 
                className="px-5 py-2.5 bg-black text-white text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-gray-800 transition-colors inline-block text-center"
              >
                View My Work
              </a>
              <a 
                href="/resume.pdf" 
                download
                className="px-5 py-2.5 border border-black text-black text-[10px] uppercase tracking-widest font-bold rounded-sm hover:bg-gray-50 transition-colors inline-block text-center"
              >
                Download CV
              </a>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex-shrink-0"
          >
            <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-gray-200 rounded-full overflow-hidden mb-6 md:mb-0 shadow-sm border-4 border-white">
              <img 
                src="/profile.png" 
                alt="Yola Gcolotela" 
                className="object-cover w-full h-full object-top"
              />
            </div>
          </motion.div>
          
        </div>
      </div>
    </motion.div>
  );
}
