import { motion } from 'motion/react';

export function About() {
  const sections = [
    {
      title: "Personal Background",
      content: "Multilingual professional fluent in English, Zulu, and IsiXhosa. Driven by a passion for technology and its potential to solve real-world problems."
    },
    {
      title: "Professional Background",
      content: "Software Engineer and Network Engineer with experience in full-stack development, Cisco networking, cloud platforms, and agile workflows. Currently interning at Mindspyr."
    },
    {
      title: "Vision",
      content: "To become a leading engineer who bridges the gap between software and network infrastructure to build intelligent, scalable systems."
    },
    {
      title: "Mission",
      content: "To continuously grow technically and professionally while contributing to innovative projects that deliver real value to businesses and communities."
    },
    {
      title: "Career Goals",
      content: "To secure a full-time role as a Software or Network Engineer, obtain A+ and N+ certifications, and take on technical leadership responsibilities."
    },
    {
      title: "Professional Interests",
      content: "Full-stack development, network security, cloud infrastructure, AI tooling, and mobile application development."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto px-4 sm:px-8 py-12 md:py-20 flex-grow w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-12"
      >
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-6">About</h3>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
        {sections.map((section, index) => (
          <motion.div 
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
            className="space-y-2"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest">{section.title}</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
