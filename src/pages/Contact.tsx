import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, Github, Linkedin, Check, Copy, Clock, Calendar, ChevronDown, ChevronUp, Coffee, MessageSquare } from 'lucide-react';

export function Contact() {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [currentTime, setCurrentTime] = useState('');

  // Calculate local time in GMT+2 (South Africa standard time)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // South Africa is UTC+2
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Johannesburg',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setCurrentTime(now.toLocaleTimeString('en-US', options) + ' SAST');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('yolatgcolotela@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('078 840 4160');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const faqs = [
    {
      q: "What types of projects do you take on?",
      a: "I specialize in building modular, responsive full-stack web applications, custom API pipelines, and interactive dashboards using React, TypeScript, and modern styling architectures."
    },
    {
      q: "Are you open to contract or full-time roles?",
      a: "Yes, I am fully open to freelance, contract, and permanent full-stack engineering roles, both remote and hybrid."
    },
    {
      q: "How fast is your typical response turnaround?",
      a: "I usually reply to direct email inquiries within 12 hours. For instant coordination, you can copy my details or connect on LinkedIn."
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
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-6">Contact & Hub</h3>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-xl font-light mb-8 max-w-sm">
            Interested in collaborating or have a question? Let's build something exceptional together.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 mr-4 text-gray-400" />
              <a href="mailto:yolatgcolotela@gmail.com" className="hover:text-black transition-colors">yolatgcolotela@gmail.com</a>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 mr-4 text-gray-400" />
              <span>078 840 4160</span>
            </div>
            <div className="flex items-center text-sm pt-4">
              <a 
                href="https://github.com/ytgTonz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors mr-6"
              >
                <Github className="w-4 h-4" />
                <span className="font-medium text-xs">GitHub</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/yola-gcolotela-586b19359" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span className="font-medium text-xs">LinkedIn</span>
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-6"
        >
          {/* Availability Card */}
          <div className="bg-gray-50 border border-gray-100 rounded-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-700">Work Status</span>
              </div>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 font-bold uppercase rounded-sm tracking-wide">
                Available for Projects
              </span>
            </div>

            <div className="space-y-3 pt-1 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span>Local Time</span>
                </div>
                <span className="font-mono font-semibold text-gray-800">{currentTime || '...'}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Coffee size={14} className="text-gray-400" />
                  <span>Typical Work Hours</span>
                </div>
                <span className="font-mono text-gray-700">08:00 - 18:00</span>
              </div>
            </div>

            {/* Quick Actions Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleCopyEmail}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 py-2 px-3 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer"
              >
                {copiedEmail ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Copy Email
                  </>
                )}
              </button>
              <button
                onClick={handleCopyPhone}
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 py-2 px-3 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer"
              >
                {copiedPhone ? (
                  <>
                    <Check size={12} className="text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Copy Phone
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Collapsible FAQ Accordion */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2 mb-3">
              <MessageSquare size={12} />
              Quick FAQ
            </h4>
            
            <div className="space-y-2">
              {faqs.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-gray-100 rounded-sm overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-3.5 text-left text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                  >
                    <span>{item.q}</span>
                    {activeFaq === index ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="border-t border-gray-50"
                      >
                        <p className="p-3.5 text-xs text-gray-500 leading-relaxed bg-gray-50/50">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

