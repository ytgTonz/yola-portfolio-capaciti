import { motion } from 'motion/react';

export function Education() {
  const educationData = [
    {
      degree: "Diploma in IT (Comm Networks)",
      institution: "Nelson Mandela University",
      period: "2020–2024",
      highlight: "Merit Award (Top Achiever)",
      color: "bg-black"
    },
    {
      degree: "Matric (Grade 12)",
      institution: "Khanyisa High School",
      period: "2019",
      highlight: null,
      color: "bg-gray-200"
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
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-6">Education</h3>
      </motion.div>

      <div className="border-l border-gray-100 ml-1.5 pl-6 space-y-12">
        {educationData.map((item, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
            className="relative"
          >
            <div className={`absolute -left-[30px] top-0 w-3 h-3 rounded-full border-2 border-white ${item.color}`}></div>
            <p className="text-sm font-bold">{item.institution}</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider my-1">{item.degree} | {item.period}</p>
            {item.highlight && (
              <p className="text-[10px] text-blue-600 font-medium mt-2 uppercase tracking-wide">{item.highlight}</p>
            )}
            {item.degree.includes("IT") && (
              <div className="mt-4 text-xs text-gray-600 leading-relaxed">
                <p className="mb-1"><span className="font-semibold text-gray-900">Coursework:</span> Software Development, Network Engineering, IT Support, Network Security.</p>
                <p><span className="font-semibold text-gray-900">Programming:</span> C#, Python, JavaScript/TypeScript.</p>
              </div>
            )}
            {item.degree.includes("Matric") && (
              <div className="mt-4 text-xs text-gray-600 leading-relaxed">
                <p><span className="font-semibold text-gray-900">Subjects:</span> Mathematics, Physical Sciences, Life Sciences, Information Technology.</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
