import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, File as FileIcon } from 'lucide-react';

const UploadAssignmentModal = ({ isOpen, onClose, assignment, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !content) return alert('Provide text content or upload a file.');

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('assignmentId', assignment._id);
      formData.append('content', content);
      if (file) {
        formData.append('file', file);
      }

      const res = await axios.post('http://localhost:5000/api/assignment/submit', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      onUploadSuccess(res.data);
      setFile(null);
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error submitting assignment', error);
      alert('Failed to submit assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg relative"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">Submit Assignment</h2>
            <p className="text-gray-500 text-sm mb-6">{assignment?.title}</p>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Comments (Optional)</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter any notes for your teacher..."
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition min-h-[100px]"
                ></textarea>
              </div>

              <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 flex flex-col justify-center items-center bg-indigo-50/50 hover:bg-indigo-50 transition cursor-pointer relative">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {file ? (
                  <div className="flex flex-col items-center text-center">
                    <FileIcon className="text-indigo-600 w-12 h-12 mb-3" />
                    <p className="text-indigo-900 font-bold max-w-[200px] truncate">{file.name}</p>
                    <p className="text-indigo-400 text-sm mt-1">Click or drag to change</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <UploadCloud className="text-indigo-400 w-12 h-12 mb-3" />
                    <p className="text-indigo-900 font-bold">Select a file</p>
                    <p className="text-indigo-400 text-sm mt-1">PDF, DOCX, ZIP up to 10MB</p>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={loading || (!file && !content)}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition active:scale-95 disabled:opacity-70 disabled:scale-100"
              >
                {loading ? 'Uploading...' : 'Submit Work'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadAssignmentModal;
