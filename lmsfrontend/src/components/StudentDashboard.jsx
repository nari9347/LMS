import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Upload, PlusCircle, ArrowRight } from 'lucide-react';
import UploadAssignmentModal from './UploadAssignmentModal';
import StudentCourseView from './StudentCourseView';
import StudentAssistantChat from './StudentAssistantChat';

const StudentDashboard = ({ theme = 'light' }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/dashboard/student', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(res.data);
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/course/enroll/${courseId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optionally just refresh the whole dashboard to pull updated courses & assignments
      fetchDashboard();
      alert('Successfully enrolled!');
    } catch (err) {
      console.error('Error enrolling:', err);
      alert('Failed to enroll in the course.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (selectedCourse) {
    return (
      <>
        <StudentCourseView 
          course={selectedCourse} 
          onBack={() => { setSelectedCourse(null); fetchDashboard(); }} 
          allSubmissions={dashboardData?.recentSubmissions || []}
        />
        <StudentAssistantChat dashboardData={dashboardData} />
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg border border-indigo-200 text-white flex items-center justify-between"
        >
          <div>
            <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">Enrolled Courses</p>
            <p className="text-4xl font-extrabold">{dashboardData?.enrolledCoursesCount || 0}</p>
          </div>
          <div className="bg-white/20 p-4 rounded-xl">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-orange-400 to-rose-500 p-6 rounded-2xl shadow-lg border border-rose-200 text-white flex items-center justify-between"
        >
          <div>
            <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">Pending Assignments</p>
            <p className="text-4xl font-extrabold">{dashboardData?.pendingAssignmentsCount || 0}</p>
          </div>
          <div className="bg-white/20 p-4 rounded-xl">
            <Clock className="w-8 h-8 text-white" />
          </div>
        </motion.div>
      </div>

      {/* Enrolled Courses Section */}
      {dashboardData?.courses?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl shadow-sm border mb-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="text-purple-600 w-6 h-6" />
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>My Enrolled Courses</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.courses.map((course, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                key={course._id}
                className={`p-4 border rounded-xl hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group cursor-pointer ${theme === 'dark' ? 'border-slate-600 bg-slate-900' : 'border-indigo-100 bg-indigo-50/30'}`}
                onClick={() => setSelectedCourse(course)}
              >
                <div>
                  <h4 className="font-bold text-indigo-900 mb-1 group-hover:text-indigo-600 transition-colors">{course.title}</h4>
                  <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{course.description}</p>
                </div>
                <div className={`flex items-center justify-between mt-2 pt-3 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-indigo-100/50'}`}>
                  <span className="text-xs font-semibold text-indigo-800">Teacher: {course.teacher?.name || 'Unknown'}</span>
                  <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Available Courses Section */}
      {dashboardData?.availableCourses?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl shadow-sm border mb-8 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-indigo-600 w-6 h-6" />
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Available Courses</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.availableCourses.map((course, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                key={course._id}
                className={`p-4 border rounded-xl hover:shadow-md transition-all flex flex-col justify-between ${theme === 'dark' ? 'border-slate-600 bg-slate-900' : 'border-gray-200 bg-white'}`}
              >
                <div>
                  <h4 className="font-bold text-indigo-900 mb-1">{course.title}</h4>
                  <p className={`text-sm mb-3 line-clamp-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{course.description}</p>
                  <p className={`text-xs mb-4 font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Teacher: {course.teacher?.name || 'Unknown'}</p>
                </div>
                <button
                  onClick={() => handleEnroll(course._id)}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Enroll Now
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-orange-500 w-6 h-6" />
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Pending Assignments</h3>
          </div>
          
          {dashboardData?.pendingAssignments?.length === 0 ? (
            <div className={`text-center py-8 rounded-xl border-2 border-dashed ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>You are all caught up!</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {dashboardData?.pendingAssignments?.map((assignment, i) => (
                <motion.li 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={assignment._id} 
                  className="p-4 bg-gradient-to-r from-orange-50/50 to-transparent border border-orange-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="font-bold text-orange-900 group-hover:text-orange-600 transition-colors">{assignment.title}</div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-1">{assignment.description}</div>
                    <div className="text-xs text-orange-600 mt-2 font-semibold">Due: {new Date(assignment.dueDate).toLocaleDateString()}</div>
                  </div>
                  <button 
                    onClick={() => setSelectedAssignment(assignment)}
                    className="px-4 py-2 bg-orange-100 hover:bg-orange-500 text-orange-700 hover:text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" />
                    Submit
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-6 rounded-2xl shadow-sm border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="text-teal-600 w-6 h-6" />
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Recent Submissions</h3>
          </div>
          
          {dashboardData?.recentSubmissions?.length === 0 ? (
            <div className={`text-center py-8 rounded-xl border-2 border-dashed ${theme === 'dark' ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>No recent submissions found.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {dashboardData?.recentSubmissions?.map((sub, i) => (
                <motion.li 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  key={sub._id} 
                  className="p-4 bg-gradient-to-r from-teal-50/50 to-transparent border border-teal-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="font-bold text-teal-900 group-hover:text-teal-700 transition-colors">{sub.assignment?.title || 'Assignment'}</div>
                    <div className="text-xs text-gray-500 mt-1">Submitted on: {new Date(sub.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-sm font-bold text-center ${sub.grade ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                    {sub.grade ? `Grade: ${sub.grade}` : 'Pending Review'}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>

      {selectedAssignment && (
        <UploadAssignmentModal 
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          assignment={selectedAssignment}
          onUploadSuccess={(newSubmission) => {
            const assignmentDetails = dashboardData.pendingAssignments.find(a => a._id === newSubmission.assignment) || selectedAssignment;
            setDashboardData(prev => ({
              ...prev,
              pendingAssignmentsCount: prev.pendingAssignmentsCount - 1,
              pendingAssignments: prev.pendingAssignments.filter(a => a._id !== newSubmission.assignment),
              recentSubmissions: [{...newSubmission, assignment: assignmentDetails}, ...prev.recentSubmissions]
            }));
            setSelectedAssignment(null);
          }}
        />
      )}
      </motion.div>

      <StudentAssistantChat dashboardData={dashboardData} />
    </>
  );
};

export default StudentDashboard;
