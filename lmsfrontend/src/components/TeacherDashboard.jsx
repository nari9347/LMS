import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, Users, FileText, PlusCircle, Settings } from 'lucide-react';
import CreateCourseModal from './CreateCourseModal';
import CourseManager from './CourseManager';
import TeacherAssistantChat from './TeacherAssistantChat';

const TeacherDashboard = ({ theme = 'light' }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/dashboard/teacher', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(res.data);
    } catch (err) {
      console.error('Error fetching teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (selectedCourse) {
    return (
      <>
        <CourseManager 
          course={selectedCourse} 
          onBack={() => {
              setSelectedCourse(null);
              fetchDashboard(); // Refresh data when backing out
          }} 
        />

        <TeacherAssistantChat
          courses={dashboardData?.courses || []}
          onOpenCourse={(course) => setSelectedCourse(course)}
        />
      </>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 rounded-2xl shadow-lg text-white flex flex-col items-center justify-center relative overflow-hidden"
        >
          <BookOpen className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
          <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-2 z-10">Active Courses</p>
          <p className="text-5xl font-extrabold z-10">{dashboardData?.coursesCount || 0}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-rose-500 to-rose-700 p-6 rounded-2xl shadow-lg text-white flex flex-col items-center justify-center relative overflow-hidden"
        >
          <FileText className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
          <p className="text-rose-100 text-sm font-bold uppercase tracking-widest mb-2 z-10">Assignments</p>
          <p className="text-5xl font-extrabold z-10">{dashboardData?.assignmentsCount || 0}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-teal-500 to-teal-700 p-6 rounded-2xl shadow-lg text-white flex flex-col items-center justify-center relative overflow-hidden"
        >
          <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
          <p className="text-teal-100 text-sm font-bold uppercase tracking-widest mb-2 z-10">Total Students</p>
          <p className="text-5xl font-extrabold z-10">{dashboardData?.totalStudents || 0}</p>
        </motion.div>
      </div>

        {/* Courses List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`p-8 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}
        >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h3 className={`text-2xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
              <BookOpen className="text-indigo-600" />
              My Course Roster
            </h3>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Manage your active classes and curriculum.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition"
          >
            <PlusCircle className="w-5 h-5" />
            Create Course
          </motion.button>
        </div>
        
        <CreateCourseModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onCourseCreated={(newCourse) => {
            setDashboardData(prev => ({
              ...prev,
              coursesCount: prev.coursesCount + 1,
              courses: [...prev.courses, newCourse]
            }));
            setIsCreateModalOpen(false);
          }} 
        />

        {dashboardData?.courses?.length === 0 ? (
          <div className={`rounded-2xl p-12 text-center border-2 border-dashed ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'}`}>No courses yet</h4>
            <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}>You haven't created any courses. Start by clicking "Create Course".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData?.courses?.map((course, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                key={course._id} 
                className={`p-6 rounded-xl border shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all group flex flex-col justify-between ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className={`text-xl font-bold group-hover:text-indigo-600 transition-colors line-clamp-1 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{course.title}</h4>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {course.students ? course.students.length : 0} enrolled
                    </span>
                  </div>
                  <p className={`text-sm mb-6 line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{course.description}</p>
                </div>
                <div className={`mt-4 pt-4 border-t flex items-center justify-between ${theme === 'dark' ? 'border-slate-700' : 'border-gray-100'}`}>
                  <div className={`flex items-center text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    <Settings className="w-4 h-4 mr-1" /> Manage Course Dashboard
                  </div>
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="text-indigo-600 font-bold hover:text-indigo-800 transition"
                  >
                    Enter →
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button className="flex-1 flex justify-center items-center gap-2 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-700 py-2.5 rounded-lg font-semibold text-sm transition-colors">
                     Manage Course
                  </button>
                  <button className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </motion.div>
      </motion.div>

      <TeacherAssistantChat
        courses={dashboardData?.courses || []}
        onOpenCourse={(course) => setSelectedCourse(course)}
      />
    </>
  );
};

export default TeacherDashboard;
