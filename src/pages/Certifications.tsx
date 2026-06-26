import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Pencil, Trash2, ExternalLink, Award, Download } from 'lucide-react';
import { PDFViewer } from '../components/PDFViewer';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  status: 'Completed' | 'In Progress';
  pdfUrl?: string;
}

const isExternalHtml = (url?: string): boolean => {
  if (!url) return false;
  if (url.startsWith('/') || url.startsWith('.') || !url.startsWith('http')) return false;
  
  const cleanUrl = url.split('?')[0].toLowerCase();
  const hasEmbeddableExtension = 
    cleanUrl.endsWith('.pdf') || 
    cleanUrl.endsWith('.png') || 
    cleanUrl.endsWith('.jpg') || 
    cleanUrl.endsWith('.jpeg') || 
    cleanUrl.endsWith('.gif') || 
    cleanUrl.endsWith('.webp');
    
  return !hasEmbeddableExtension;
};

const defaultCertifications: Certification[] = [
  { id: '1', name: 'CCNA Intro to Networks', issuer: 'Cisco', status: 'Completed' },
  { id: '2', name: 'CCNA Enterprise', issuer: 'Cisco', status: 'Completed' },
  { id: '3', name: 'CompTIA A+', issuer: 'CompTIA', status: 'In Progress' },
  { id: '4', name: 'CompTIA N+', issuer: 'CompTIA', status: 'In Progress' }
];

export function Certifications() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  
  // Edit/Add modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Partial<Certification>>({});
  
  // Bulk Add modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCerts, setBulkCerts] = useState<Partial<Certification>[]>([{ status: 'Completed' }]);
  const [isDragging, setIsDragging] = useState(false);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'certifications'));
        if (!querySnapshot.empty) {
          const data = querySnapshot.docs.map(doc => {
            const d = doc.data();
            return {
              ...d,
              id: doc.id,
              name: d.name || 'Untitled',
              issuer: d.issuer || 'Unknown',
              status: d.status || 'Planned'
            } as Certification;
          });
          setCerts(data);
          localStorage.setItem('yola_certs', JSON.stringify(data));
        } else {
          const saved = localStorage.getItem('yola_certs');
          const initialCerts = saved ? JSON.parse(saved) : defaultCertifications;
          for (let i = 0; i < initialCerts.length; i++) {
            const c = initialCerts[i];
            const cleanC: any = { ...c };
            if (!cleanC.id) cleanC.id = `migrated-${Date.now()}-${i}`;
            Object.keys(cleanC).forEach(key => {
              if (cleanC[key] === undefined) delete cleanC[key];
            });
            await setDoc(doc(db, 'certifications', cleanC.id), cleanC);
          }
          setCerts(initialCerts);
          localStorage.setItem('yola_certs', JSON.stringify(initialCerts));
        }
      } catch (err) {
        console.error("Error fetching certifications from Firebase:", err);
        const saved = localStorage.getItem('yola_certs');
        if (saved) {
          setCerts(JSON.parse(saved));
        } else {
          setCerts(defaultCertifications);
        }
      }
    };
    fetchCerts();

    const isAlreadyAdmin = localStorage.getItem('yola_is_admin') === 'true';
    setIsAdmin(isAlreadyAdmin);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'certifications', id));
      const newCerts = certs.filter(c => c.id !== id);
      setCerts(newCerts);
      localStorage.setItem('yola_certs', JSON.stringify(newCerts));
    } catch (err) {
      console.error("Error deleting certification:", err);
    }
  };

  const handleSave = async () => {
    if (!editingCert.name || !editingCert.issuer || !editingCert.status) return;

    try {
      const certToSave: any = { ...editingCert };
      if (!certToSave.id) {
        certToSave.id = Date.now().toString();
      }
      
      // Remove undefined values to prevent Firestore errors
      Object.keys(certToSave).forEach(key => {
        if (certToSave[key] === undefined) {
          delete certToSave[key];
        }
      });

      await setDoc(doc(db, 'certifications', certToSave.id as string), certToSave as Certification);
      
      let newCerts;
      if (editingCert.id) {
        newCerts = certs.map(c => c.id === certToSave.id ? certToSave as Certification : c);
      } else {
        newCerts = [...certs, certToSave as Certification];
      }
      setCerts(newCerts);
      localStorage.setItem('yola_certs', JSON.stringify(newCerts));
    } catch (err) {
      console.error("Error saving certification:", err);
    }

    setIsEditModalOpen(false);
    setEditingCert({});
  };

  const handleBulkSave = async () => {
    const validCerts = bulkCerts.filter(c => c.name && c.issuer && c.status);
    if (validCerts.length === 0) return;

    try {
      const newCerts = validCerts.map((c, index) => {
        const cert: any = {
          ...c,
          id: Date.now().toString() + index.toString()
        };
        Object.keys(cert).forEach(key => {
          if (cert[key] === undefined) {
            delete cert[key];
          }
        });
        return cert as Certification;
      });

      for (const c of newCerts) {
        await setDoc(doc(db, 'certifications', c.id), c);
      }

      const allCerts = [...certs, ...newCerts];
      setCerts(allCerts);
      localStorage.setItem('yola_certs', JSON.stringify(allCerts));
    } catch (err) {
      console.error("Error bulk saving certifications:", err);
    }

    setIsBulkModalOpen(false);
    setBulkCerts([{ status: 'Completed' }]);
  };

  const handleFileUpload = async (file: File, callback: (url: string) => void) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
      const { storage } = await import('../lib/firebase');
      
      const fileRef = ref(storage, `certifications/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      
      callback(url);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setUploadError(error.message || "An error occurred during file upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const openEdit = (cert?: Certification) => {
    if (cert) {
      setEditingCert(cert);
    } else {
      setEditingCert({ status: 'Completed' });
    }
    setIsEditModalOpen(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      
      const newRows = files.map(file => ({
        name: file.name.split('.')[0],
        issuer: '',
        status: 'Completed' as const,
        pdfUrl: ''
      }));

      const validExistingCerts = bulkCerts.filter(c => c.name || c.issuer || c.pdfUrl);
      const updatedCerts = [...validExistingCerts, ...newRows];
      setBulkCerts(updatedCerts);

      files.forEach((file, fileIndex) => {
        const targetIndex = validExistingCerts.length + fileIndex;
        handleFileUpload(file, (url) => {
          setBulkCerts(prevCerts => {
            const newCerts = [...prevCerts];
            if (newCerts[targetIndex]) {
              newCerts[targetIndex].pdfUrl = url;
            }
            return newCerts;
          });
        });
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="max-w-3xl mx-auto px-4 sm:px-8 py-12 md:py-20 flex-grow w-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Certifications</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 sm:mt-0 flex items-center space-x-4"
        >
          {isAdmin && (
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => {
                  localStorage.removeItem('yola_is_admin');
                  setIsAdmin(false);
                }}
                className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-600 transition-colors mr-2"
              >
                Exit Admin Mode
              </button>
              <button 
                onClick={() => {
                  setBulkCerts([{ status: 'Completed' }]);
                  setIsBulkModalOpen(true);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-black rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors"
              >
                <Plus size={12} />
                <span>Bulk Add</span>
              </button>
              <button 
                onClick={() => openEdit()}
                className="flex items-center space-x-1 px-3 py-1.5 bg-black text-white rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
              >
                <Plus size={12} />
                <span>Add New</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {certs.map((cert, index) => (
          <motion.div 
            key={cert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
            className="p-5 bg-gray-50 rounded border border-gray-100 hover:border-gray-200 hover:bg-gray-100/50 transition-all duration-300 relative group cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between min-h-[140px]"
            onClick={() => setSelectedCert(cert)}
          >
            <div>
              <div className="flex justify-between items-start mb-2 pr-12">
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-semibold">{cert.issuer}</p>
              </div>
              <h4 className="text-sm font-bold leading-snug mb-3 group-hover:text-blue-600 transition-colors">{cert.name}</h4>
            </div>
            
            <div className="flex items-center justify-between mt-auto">
              <span className={`px-2 py-1 text-[9px] uppercase tracking-widest font-bold rounded-sm ${
                cert.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}>
                {cert.status}
              </span>
              
              {cert.pdfUrl && (
                <span className="text-[9px] uppercase tracking-widest text-blue-600 font-bold group-hover:underline flex items-center gap-1">
                  View <ExternalLink size={10} />
                </span>
              )}
            </div>

            {isAdmin && (
              <div 
                className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); openEdit(cert); }} 
                  className="p-1.5 bg-white border border-gray-100 rounded text-gray-400 hover:text-black hover:border-gray-200 transition-colors"
                >
                  <Pencil size={11} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(cert.id); }} 
                  className="p-1.5 bg-white border border-gray-100 rounded text-gray-400 hover:text-red-600 hover:border-red-100 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCert(null)}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-sm shadow-2xl border border-gray-100 w-full max-w-4xl p-6 sm:p-10 max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedCert(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-colors z-10 animate-fade-in"
              >
                <X size={18} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
                {/* Left Column: Certificate Preview (Span 8) */}
                <div className="lg:col-span-8 flex flex-col justify-center bg-gray-50 border border-gray-100 rounded-sm overflow-hidden min-h-[350px] lg:min-h-[500px]">
                  {selectedCert.pdfUrl ? (
                    <div className="p-2 sm:p-4 flex flex-col items-center justify-center w-full h-full">
                      {selectedCert.pdfUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <div className="relative group max-w-full max-h-[65vh] overflow-hidden rounded shadow-sm border border-gray-200/50 bg-white flex items-center justify-center">
                          <img 
                            src={selectedCert.pdfUrl} 
                            alt={selectedCert.name} 
                            className="max-w-full max-h-[60vh] object-contain" 
                          />
                        </div>
                      ) : isExternalHtml(selectedCert.pdfUrl) ? (
                        <div className="w-full max-w-md bg-white border border-gray-200 rounded p-6 sm:p-10 text-center flex flex-col items-center shadow-sm">
                          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-5 animate-pulse">
                            <Award size={28} />
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-1">Official Credential</p>
                          <h3 className="text-sm font-bold text-gray-800 mb-4">{selectedCert.issuer} Verification</h3>
                          <p className="text-xs text-gray-500 max-w-xs mb-8 leading-relaxed">
                            This certification is hosted on <strong className="text-gray-700">{selectedCert.issuer}</strong>. External learning platforms restrict direct embedding within other websites for privacy and security.
                          </p>
                          <a 
                            href={selectedCert.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-sm text-[10px] uppercase tracking-widest font-bold transition-colors shadow-sm"
                          >
                            Verify on {selectedCert.issuer} <ExternalLink size={12} />
                          </a>
                        </div>
                      ) : (
                        <PDFViewer url={selectedCert.pdfUrl} />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <Award size={48} className="mb-4 stroke-[1]" />
                      <p className="text-[10px] uppercase tracking-[0.15em] font-bold">No attachment uploaded</p>
                    </div>
                  )}
                </div>

                {/* Right Column: Information & Actions (Span 4) */}
                <div className="lg:col-span-4 flex flex-col justify-between py-2">
                  <div className="space-y-6">
                    <div>
                      <span className={`inline-block px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold rounded-sm mb-4 ${
                        selectedCert.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {selectedCert.status}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-2">{selectedCert.name}</h2>
                      <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-gray-400">Issued by {selectedCert.issuer}</p>
                    </div>

                    <div className="border-t border-gray-100 pt-6 space-y-4">
                      <h3 className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-400">Verification & Access</h3>
                      
                      {selectedCert.pdfUrl ? (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500 leading-relaxed">
                            A verified copy of this certification is securely stored in cloud storage. You can view it full size or download the original file.
                          </p>
                          <div className="flex flex-col gap-2 pt-2">
                            <a 
                              href={selectedCert.pdfUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-sm text-[10px] uppercase tracking-widest font-bold transition-colors shadow-sm text-center"
                            >
                              Open in New Tab <ExternalLink size={12} />
                            </a>
                            <a 
                              href={selectedCert.pdfUrl} 
                              download
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-colors shadow-sm text-center"
                            >
                              Download File <Download size={12} />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No document link is available for this entry yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Bottom details or admin quick actions */}
                  <div className="border-t border-gray-100 pt-6 mt-6 lg:mt-0">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-gray-400">
                      <span>Verification:</span>
                      <span className="font-semibold text-gray-700">
                        {selectedCert.pdfUrl ? 'Cloud Verified' : 'Self-declared'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-sm shadow-2xl border border-gray-100 w-full max-w-sm p-8"
            >
              <h2 className="text-sm uppercase tracking-widest font-bold mb-6">
                {editingCert.id ? 'Edit Certificate' : 'Add Certificate'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Name</label>
                  <input 
                    type="text" 
                    value={editingCert.name || ''}
                    onChange={e => setEditingCert({...editingCert, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Issuer</label>
                  <input 
                    type="text" 
                    value={editingCert.issuer || ''}
                    onChange={e => setEditingCert({...editingCert, issuer: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Status</label>
                  <select 
                    value={editingCert.status || 'Completed'}
                    onChange={e => setEditingCert({...editingCert, status: e.target.value as 'Completed' | 'In Progress'})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">PDF URL / File</label>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      value={editingCert.pdfUrl || ''}
                      onChange={e => setEditingCert({...editingCert, pdfUrl: e.target.value})}
                      placeholder="https://example.com/certificate.pdf"
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                      disabled={isUploading}
                    />
                    <label className={`cursor-pointer bg-gray-200 text-black px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-300 transition-colors flex items-center ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploading ? '...' : 'Upload'}
                      <input 
                        type="file" 
                        accept="application/pdf,image/*" 
                        className="hidden" 
                        disabled={isUploading}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], (url) => {
                              setEditingCert({...editingCert, pdfUrl: url});
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {isUploading && (
                    <p className="text-[10px] text-blue-600 font-semibold animate-pulse mt-1">Uploading file...</p>
                  )}
                  {uploadError && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">{uploadError}</p>
                  )}
                </div>
                <div className="pt-4 flex gap-2">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-black text-white py-2 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-gray-100 text-black py-2 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Add Modal */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBulkModalOpen(false)}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-sm shadow-2xl border border-gray-100 w-full max-w-2xl p-8 max-h-[90vh] flex flex-col"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <h2 className="text-sm uppercase tracking-widest font-bold mb-6 flex-shrink-0">
                Bulk Add Certificates
              </h2>

              <div 
                className={`mb-6 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-sm transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className={`text-xs uppercase tracking-widest font-bold ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}>
                  {isDragging ? 'Drop files now' : 'Drop files here'}
                </p>
              </div>

              <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                {bulkCerts.map((cert, index) => (
                  <div key={index} className="flex flex-col gap-4 items-start bg-gray-50 p-4 rounded-sm border border-gray-100 relative">
                    {bulkCerts.length > 1 && (
                      <button 
                        onClick={() => {
                          const newCerts = bulkCerts.filter((_, i) => i !== index);
                          setBulkCerts(newCerts);
                        }}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 w-full pr-8">
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Name</label>
                        <input 
                          type="text" 
                          value={cert.name || ''}
                          onChange={e => {
                            const newCerts = [...bulkCerts];
                            newCerts[index].name = e.target.value;
                            setBulkCerts(newCerts);
                          }}
                          className="w-full bg-white border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                          placeholder="e.g. AWS Certified"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Issuer</label>
                        <input 
                          type="text" 
                          value={cert.issuer || ''}
                          onChange={e => {
                            const newCerts = [...bulkCerts];
                            newCerts[index].issuer = e.target.value;
                            setBulkCerts(newCerts);
                          }}
                          className="w-full bg-white border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                          placeholder="e.g. Amazon Web Services"
                        />
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Status</label>
                        <select 
                          value={cert.status || 'Completed'}
                          onChange={e => {
                            const newCerts = [...bulkCerts];
                            newCerts[index].status = e.target.value as 'Completed' | 'In Progress';
                            setBulkCerts(newCerts);
                          }}
                          className="w-full bg-white border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                        >
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                        </select>
                      </div>
                    </div>
                    <div className="w-full">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">PDF URL / File</label>
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          value={cert.pdfUrl || ''}
                          onChange={e => {
                            const newCerts = [...bulkCerts];
                            newCerts[index].pdfUrl = e.target.value;
                            setBulkCerts(newCerts);
                          }}
                          className="flex-1 bg-white border border-gray-200 rounded-sm p-2 text-xs focus:outline-none focus:border-black"
                          placeholder="https://example.com/certificate.pdf"
                          disabled={isUploading}
                        />
                        <label className={`cursor-pointer bg-gray-200 text-black px-3 py-2 rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-300 transition-colors flex items-center ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          {isUploading ? '...' : 'Upload'}
                          <input 
                            type="file" 
                            accept="application/pdf,image/*" 
                            className="hidden" 
                            disabled={isUploading}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(e.target.files[0], (url) => {
                                  const newCerts = [...bulkCerts];
                                  newCerts[index].pdfUrl = url;
                                  setBulkCerts(newCerts);
                                });
                              }
                            }}
                          />
                        </label>
                      </div>
                      {isUploading && (
                        <p className="text-[10px] text-blue-600 font-semibold animate-pulse mt-1">Uploading file...</p>
                      )}
                      {uploadError && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">{uploadError}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 flex justify-between items-center flex-shrink-0 mt-4 border-t border-gray-100">
                <button 
                  onClick={() => setBulkCerts([...bulkCerts, { status: 'Completed' }])}
                  className="text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                >
                  <Plus size={12} /> Add Row
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsBulkModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-black rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleBulkSave}
                    className="px-4 py-2 bg-black text-white rounded-sm text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors"
                  >
                    Save All
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
