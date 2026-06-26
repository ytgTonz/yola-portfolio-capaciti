import { motion } from 'motion/react';

export function Experience() {
  const experienceData = [
    {
      role: "Software Engineer Intern",
      company: "Mindspyr (Tech Startup)",
      period: "2024–2026",
      details: [
        "Led backend and frontend development for Delegat, a boardroom booking application, managing database design, API framework, deployment, and stakeholder presentations.",
        "Developed core features for nomadyQ, a reverse accommodation booking platform, including request submission flows, provider response systems, matching logic, and database schema design.",
        "Contributed to Hexaura, a customer experience platform, by conducting in-field testing with real customers, handling admin functionality, manufacturing physical components, and integrating performance metrics.",
        "Configured and managed Virtual Communication Networks on Oracle Cloud Platform, assigned Virtual Machines, implemented SSH tunneling, and hosted websites and services.",
        "Developed mobile applications using React Native and Expo with cross-platform compatibility."
      ],
      color: "bg-blue-600"
    },
    {
      role: "Digital Associate",
      company: "CAPACITI (UVU Africa)",
      period: "2026–Present",
      details: [
        "Selected for the CAPACITI GQ IT Hub Programme, a 12-month Tech Career Accelerator designed to equip candidates with industry-relevant skills.",
        "Enrolled in the Software Development stream (Software Engineering Practitioner pathway), progressing through Bootcamp Training, Applied Learning, and Hosted Employment.",
        "Developing practical, industry-aligned competencies in software engineering within an agile, professional environment."
      ],
      color: "bg-gray-300"
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
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-6">Experience</h3>
      </motion.div>

      <div className="space-y-12 pl-3">
        {experienceData.map((exp, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
            className="relative"
          >
            <span className={`absolute -left-6 top-1.5 w-1.5 h-1.5 ${exp.color} rounded-full`}></span>
            <p className="text-sm font-bold">{exp.company}</p>
            <p className="text-[10px] text-gray-500 mb-3 uppercase tracking-wider">{exp.role} | {exp.period}</p>
            <ul className="text-xs text-gray-600 space-y-2 leading-relaxed">
              {exp.details.map((detail, idx) => (
                <li key={idx}>• {detail}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
