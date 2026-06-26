import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ExternalLink, 
  Layers, 
  Code, 
  Network, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  FolderGit2,
  Tag,
  Github,
  Globe,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface Project {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  overview: string;
  role: string;
  outcomes?: string; // Optional field mapping to legacy schemas if any
  longDescription: string;
  tags: string[];
  metrics: string[];
  githubUrl?: string;
  siteUrl?: string;
  imageUrl?: string;
}

const defaultProjects: Project[] = [
  {
    id: "1",
    name: "Hexaura",
    subtitle: "MERN • React Native • Hardware",
    category: "Full-Stack",
    overview: "Transformed frontline interactions into customer loyalty moments.",
    role: "Contributor — in-field testing, admin features, hardware, and performance integration.",
    longDescription: "A comprehensive customer loyalty and frontline feedback system designed to bridge physical in-store customer touchpoints with digital analytics pipelines. Deployed both in-store and on mobile devices.",
    tags: ["React Native", "Expo", "MongoDB", "Express", "Node.js", "Hardware Integration", "MERN"],
    metrics: [
      "Interactive analytics dashboard built with real-time feedback ingestion.",
      "Facilitated in-field hardware installation and customer usability tests.",
      "Engineered reliable local synchronization schemas for offline-capable devices."
    ],
    githubUrl: "https://github.com",
    siteUrl: "https://hexaura.com"
  },
  {
    id: "2",
    name: "nomadyQ",
    subtitle: "Booking Engine • MongoDB • API",
    category: "Full-Stack",
    overview: "Users post accommodation needs; providers respond in a reverse-booking marketplace.",
    role: "Core developer — booking flows, backend APIs, database architecture.",
    longDescription: "A novel marketplace concept flipping the traditional booking dynamic. Instead of browsing listings, guests state their requirements, and approved accommodation providers pitch tailored offers.",
    tags: ["React", "Node.js", "Express", "MongoDB", "REST APIs", "Reverse Bidding", "Marketplace Engine"],
    metrics: [
      "Architected optimized queries supporting complex geolocation filter criteria.",
      "Implemented secure negotiation channels with automated expiry timers.",
      "Constructed intuitive client interface minimizing friction for booking requests."
    ],
    githubUrl: "https://github.com",
    siteUrl: "https://nomadyq.com"
  },
  {
    id: "3",
    name: "Delegat",
    subtitle: "Full-stack Lead • Render.com",
    category: "Full-Stack",
    overview: "Full-stack web-based boardroom booking system in active production.",
    role: "Lead developer — database design, API development, deployment, user training.",
    longDescription: "An elegant enterprise booking hub used to coordinate corporate boardrooms, eliminate scheduling conflicts, and manage company resources with role-based permissions.",
    tags: ["React", "Express", "Node.js", "PostgreSQL", "Render.com", "Enterprise scheduling", "Authentication"],
    metrics: [
      "Reduced daily booking administrative overlaps by implementing strict calendar locks.",
      "Integrated dynamic roles: Administrator, Facilitator, and Standard Guest profiles.",
      "Completed secure CI/CD migration deploying the client and database to isolated cloud run environments."
    ],
    githubUrl: "https://github.com",
    siteUrl: "https://delegat.co.za"
  },
  {
    id: "4",
    name: "3-Tier Network",
    subtitle: "Cisco Packet Tracer • Security",
    category: "Networks & Security",
    overview: "Designed a comprehensive 3-tier network to optimise performance, security, and scalability.",
    role: "Designer and implementer.",
    longDescription: "A simulated high-security enterprise network structured with physical Core, Distribution, and Access layers to safeguard critical business servers and separate user departments.",
    tags: ["Cisco Packet Tracer", "Network Architecture", "Access Control Lists", "Subnetting", "VLANs", "Enterprise Security"],
    metrics: [
      "Designed strict VLAN tagging rules to segment public, administration, and database traffic.",
      "Constructed Access Control Lists (ACLs) providing fine-grained access policies on key subnets.",
      "Implemented redundant spanning-tree configurations to prevent network loops and single points of failure."
    ],
    githubUrl: "https://github.com",
    siteUrl: ""
  }
];

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Edit/Add Project modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project>>({});
  const [tagsInput, setTagsInput] = useState('');
  const [metricsInput, setMetricsInput] = useState('');

  useEffect(() => {
    // Check Admin status
    const isAlreadyAdmin = localStorage.getItem('yola_is_admin') === 'true';
    setIsAdmin(isAlreadyAdmin);

    // Fetch projects from Firebase
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs.map(doc => {
            const d = doc.data();
            return {
              ...d,
              id: doc.id,
              name: d.name || 'Untitled',
              subtitle: d.subtitle || '',
              category: d.category || 'Other',
              overview: d.overview || '',
              role: d.role || '',
              longDescription: d.longDescription || '',
              tags: d.tags || [],
              metrics: d.metrics || []
            } as Project;
          });
          setProjects(data);
          localStorage.setItem('yola_projects', JSON.stringify(data));
        } else {
          // If Firestore is empty, try to seed from localStorage first, else defaultProjects
          const saved = localStorage.getItem('yola_projects');
          const initialProjects = saved ? JSON.parse(saved) : defaultProjects;
          for (let i = 0; i < initialProjects.length; i++) {
            const p = initialProjects[i];
            const cleanP: any = { ...p };
            if (!cleanP.id) cleanP.id = `migrated-${Date.now()}-${i}`;
            // Remove undefined fields
            Object.keys(cleanP).forEach(key => {
              if (cleanP[key] === undefined) delete cleanP[key];
            });
            await setDoc(doc(db, 'projects', cleanP.id), cleanP);
          }
          setProjects(initialProjects);
          localStorage.setItem('yola_projects', JSON.stringify(initialProjects));
        }
      } catch (err: any) {
        console.error("Error fetching projects from Firebase:", err);
        setFetchError(err.message || String(err));
        const saved = localStorage.getItem('yola_projects');
        if (saved) {
          setProjects(JSON.parse(saved));
        } else {
          setProjects(defaultProjects);
        }
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid expanding card
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        localStorage.setItem('yola_projects', JSON.stringify(updated));
      } catch (err) {
        console.error("Error deleting project:", err);
      }
    }
  };

  const openAddModal = () => {
    setEditingProject({
      category: 'Full-Stack',
      tags: [],
      metrics: [],
      githubUrl: '',
      siteUrl: ''
    });
    setTagsInput('');
    setMetricsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid expanding card
    setEditingProject(project);
    setTagsInput(project.tags.join(', '));
    setMetricsInput(project.metrics.join('\n'));
    setIsModalOpen(true);
  };

  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject.name || !editingProject.subtitle || !editingProject.overview || !editingProject.longDescription) {
      alert("Please fill in all the required fields.");
      return;
    }

    const processedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const processedMetrics = metricsInput
      .split('\n')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const updatedProject: Project = {
      id: editingProject.id || Date.now().toString(),
      name: editingProject.name || '',
      subtitle: editingProject.subtitle || '',
      category: editingProject.category || 'Full-Stack',
      overview: editingProject.overview || '',
      role: editingProject.role || 'Lead Developer',
      longDescription: editingProject.longDescription || '',
      tags: processedTags || [],
      metrics: processedMetrics || [],
      githubUrl: editingProject.githubUrl || '',
      siteUrl: editingProject.siteUrl || '',
      imageUrl: editingProject.imageUrl || ''
    };

    let updatedList: Project[];
    if (editingProject.id) {
      updatedList = projects.map(p => p.id === editingProject.id ? updatedProject : p);
    } else {
      updatedList = [...projects, updatedProject];
    }

    const saveProject = async () => {
      try {
        const cleanProject: any = { ...updatedProject };
        Object.keys(cleanProject).forEach(key => {
          if (cleanProject[key] === undefined) delete cleanProject[key];
        });
        await setDoc(doc(db, 'projects', cleanProject.id), cleanProject);
        setProjects(updatedList);
        localStorage.setItem('yola_projects', JSON.stringify(updatedList));
      } catch (err) {
        console.error("Error saving project:", err);
      }
      setIsModalOpen(false);
      setEditingProject({});
    };

    saveProject();
  };

  // Derive unique categories from projects plus an 'All' option
  const categories = useMemo(() => {
    const list = new Set(projects.map(p => p.category));
    return ['All', ...Array.from(list)];
  }, [projects]);

  // Filter projects by both active category and active search text
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
      const lowerQuery = searchQuery.toLowerCase();
      const matchesSearch = 
        project.name.toLowerCase().includes(lowerQuery) ||
        project.subtitle.toLowerCase().includes(lowerQuery) ||
        project.overview.toLowerCase().includes(lowerQuery) ||
        project.tags.some(t => t.toLowerCase().includes(lowerQuery));
      return matchesCategory && matchesSearch;
    });
  }, [projects, searchQuery, selectedCategory]);

  const toggleExpand = (projectName: string) => {
    setExpandedProject(prev => prev === projectName ? null : projectName);
  };

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking a tag
    setSearchQuery(tag);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Icon mapping for categories to add a highly interactive polished layout
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Full-Stack':
        return <Code size={12} />;
      case 'Networks & Security':
        return <Network size={12} />;
      default:
        return <Layers size={12} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto px-4 sm:px-8 py-12 md:py-20 flex-grow w-full"
    >
      {fetchError && (
        <div className="bg-red-50 text-red-600 p-4 mb-6 rounded-sm border border-red-200">
          <p className="font-semibold text-sm">Error connecting to database. Showing locally saved data.</p>
          <p className="text-xs mt-1 font-mono">{fetchError}</p>
        </div>
      )}
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2">Projects Hub</h3>
          <p className="text-xs text-gray-500 font-light">
            Explore production systems, network simulations, and contribution benchmarks.
          </p>
        </motion.div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <motion.button
              onClick={openAddModal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={14} /> Add Project
            </motion.button>
            <motion.button
              onClick={() => {
                localStorage.removeItem('yola_is_admin');
                setIsAdmin(false);
                window.dispatchEvent(new Event('storage'));
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors shadow-sm cursor-pointer"
            >
              Exit Admin
            </motion.button>
          </div>
        )}
      </div>

      {/* Modern Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-stretch md:items-center justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 order-2 md:order-1">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-gray-50 text-gray-400 border border-gray-100 hover:text-black hover:bg-gray-100'
              }`}
            >
              {category !== 'All' && getCategoryIcon(category)}
              {category}
            </button>
          ))}
        </div>

        {/* Live Search Bar */}
        <div className="relative order-1 md:order-2 flex-grow max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags, frameworks or names..."
            className="w-full bg-gray-50 border border-gray-100 rounded-sm py-2 pl-9 pr-8 text-xs focus:outline-none focus:border-black focus:bg-white transition-all text-gray-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] uppercase font-bold text-gray-400 hover:text-black cursor-pointer bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid/List View */}
      <AnimatePresence mode="popLayout">
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16 bg-gray-50/50 border border-dashed border-gray-100 rounded-sm p-8"
          >
            <FolderGit2 className="mx-auto text-gray-300 mb-3" size={32} />
            <p className="text-xs font-semibold text-gray-700">No projects match the criteria</p>
            <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
              Try adjusting your active category pill or clearing the search text queries.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); clearSearch(); }}
              className="mt-4 px-4 py-2 bg-black text-white text-[10px] uppercase font-bold tracking-widest rounded-sm hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredProjects.map((project) => {
              const isExpanded = expandedProject === project.name;
              return (
                <motion.div
                  key={project.id}
                  layout="position"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => toggleExpand(project.name)}
                  className={`group border rounded-sm p-6 bg-white transition-all cursor-pointer ${
                    isExpanded 
                      ? 'border-black shadow-sm ring-1 ring-black' 
                      : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-black transition-colors flex flex-wrap items-center gap-2">
                        {project.name}
                        <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-sm font-mono tracking-normal">
                          {project.category}
                        </span>
                      </h4>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mt-1">
                        {project.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 mr-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => openEditModal(project, e)}
                            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-sm transition-all"
                            title="Edit Project"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(project.id, e)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                            title="Delete Project"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-black transition-all">
                        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 font-light mt-3 leading-relaxed max-w-2xl">
                    {project.overview}
                  </p>

                  {/* Highlights and Links bottom panel */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-3 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map(tag => (
                        <span
                          key={tag}
                          onClick={(e) => handleTagClick(tag, e)}
                          className={`inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-2 py-0.5 rounded-sm border cursor-pointer transition-colors ${
                            searchQuery.toLowerCase() === tag.toLowerCase()
                              ? 'bg-black text-white border-black'
                              : 'bg-gray-50/70 text-gray-500 border-gray-100 hover:border-gray-300 hover:text-black'
                          }`}
                        >
                          <Tag size={8} />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Links Buttons */}
                    <div className="flex items-center gap-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-black rounded-sm border border-gray-200 text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm"
                        >
                          <Github size={12} /> GitHub
                        </a>
                      )}
                      {project.siteUrl && (
                        <a
                          href={project.siteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-sm text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm"
                        >
                          <Globe size={12} /> Live Site
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Fully Expanded Details Drawer */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-6 pt-6 border-t border-gray-100"
                        onClick={(e) => e.stopPropagation()} // Prevent collapse inside content
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Long Description and Role */}
                          <div className="md:col-span-2 space-y-4">
                            <div>
                              <h5 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5 flex items-center gap-1.5">
                                <Sparkles size={11} className="text-amber-500" />
                                Project Core
                              </h5>
                              <p className="text-xs text-gray-600 leading-relaxed font-light whitespace-pre-line">
                                {project.longDescription}
                              </p>
                            </div>

                            <div>
                              <h5 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                                My Contribution & Role
                              </h5>
                              <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 p-3 rounded-sm font-light">
                                {project.role}
                              </p>
                            </div>
                          </div>

                          {/* Outcomes Checklist */}
                          <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-sm space-y-3">
                            <h5 className="text-[10px] uppercase tracking-widest font-bold text-gray-700">
                              Outcomes & Highlights
                            </h5>
                            {project.metrics && project.metrics.length > 0 ? (
                              <ul className="space-y-2 text-xs text-gray-500">
                                {project.metrics.map((metric, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                    <span className="leading-relaxed font-light">{metric}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-[10px] text-gray-400 italic font-light">No specific metrics or milestones listed yet.</p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-gray-100 shadow-2xl rounded-sm max-w-lg w-full p-6 sm:p-8 relative my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-black transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                  <FolderGit2 size={16} />
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest font-bold text-gray-800">
                    {editingProject.id ? 'Edit Project' : 'Add New Project'}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-light">
                    Complete the configuration schema below to persist the project.
                  </p>
                </div>
              </div>

              <form onSubmit={handleModalSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.name || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                      placeholder="e.g. Hexaura"
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                      Tech subtitle *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingProject.subtitle || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                      placeholder="e.g. MERN • React Native"
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                      Category *
                    </label>
                    <select
                      value={editingProject.category || 'Full-Stack'}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                    >
                      <option value="Full-Stack">Full-Stack</option>
                      <option value="Networks & Security">Networks & Security</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                      My Contribution / Role
                    </label>
                    <input
                      type="text"
                      value={editingProject.role || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, role: e.target.value })}
                      placeholder="e.g. Lead Developer"
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                    Overview Teaser *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProject.overview || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, overview: e.target.value })}
                    placeholder="Short 1-sentence tagline describing the core outcome."
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                    Project Core Description (Long) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editingProject.longDescription || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, longDescription: e.target.value })}
                    placeholder="In-depth details about architectural choices, problems solved, and capabilities."
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                      Tech Tags (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="React, Node.js, Express"
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                      Outcomes (One per line)
                    </label>
                    <textarea
                      rows={2}
                      value={metricsInput}
                      onChange={(e) => setMetricsInput(e.target.value)}
                      placeholder="Reduced overlaps by 40%&#10;Integrated dynamic user permissions"
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={editingProject.githubUrl || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                      Live Site URL
                    </label>
                    <input
                      type="url"
                      value={editingProject.siteUrl || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, siteUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-black hover:bg-gray-800 text-white text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors cursor-pointer"
                  >
                    Save Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-black text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
