import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, FileText, CheckCircle, Upload, ShieldAlert, Award, TrendingUp, Calendar, MessageCircleHeart } from 'lucide-react';
import UploadAssignmentModal from './UploadAssignmentModal';
import StudentTestView from './StudentTestView';
import { AuthContext, BACKEND_URL } from '../context/AuthContext';

const StudentCourseView = ({ course, onBack, allSubmissions }) => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [feedbackSummary, setFeedbackSummary] = useState({ total: 0, avgRating: 0, sentiments: { good: 0, avg: 0, bad: 0, worst: 0 } });
  const [myFeedback, setMyFeedback] = useState(null);
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, sentiment: 'good', comment: '' });
  
  // Calculate average grade for this course
  // 1. Group submissions by assignment
  // 2. Filter out 'Pending' grades
  // 3. Calculate average
  const courseSubmissions = allSubmissions.filter(s => 
     assignments.some(a => a._id === (s.assignment?._id || s.assignment))
  );
  
  const gradedSubs = courseSubmissions.filter(s => s.grade !== 'Pending' && !isNaN(Number(s.grade)));
  const totalScore = gradedSubs.reduce((acc, s) => acc + Number(s.grade), 0);
  const averageGrade = gradedSubs.length > 0 ? (totalScore / gradedSubs.length).toFixed(1) : 0;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [assRes, testRes, attRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/assignment/course/${course._id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BACKEND_URL}/api/test/${course._id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BACKEND_URL}/api/attendance/${course._id}`, { headers: { Authorization: `Bearer ${token}` } }),
          // Calculate leaderboard dynamically or fetch if there's an API, here we just fetch assignments and all subs if possible.
          // Since we need to show the actual leaderboard, we'll fetch all subs for the course and build it, or we could just use the existing attendance data.
        ]);
        setAssignments(assRes.data);
        setTests(testRes.data);
        setAttendance(attRes.data);

        const feedbackRes = await axios.get(`${BACKEND_URL}/api/course/${course._id}/feedback`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null }));
        if (feedbackRes?.data) {
          setFeedbackSummary(feedbackRes.data.summary || { total: 0, avgRating: 0, sentiments: { good: 0, avg: 0, bad: 0, worst: 0 } });
          setMyFeedback(feedbackRes.data.myFeedback || null);
          if (feedbackRes.data.myFeedback) {
            setFeedbackForm({
              rating: feedbackRes.data.myFeedback.rating || 5,
              sentiment: feedbackRes.data.myFeedback.sentiment || 'good',
              comment: feedbackRes.data.myFeedback.comment || ''
            });
          }
        }

        // Build the leaderboard from all submissions in the class
        const allSubsRes = await axios.get(`${BACKEND_URL}/api/assignment/course/${course._id}/submissions-all`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: [] }));
        // If we can't get all submissions cleanly, we'll just skip the leaderboard on student side or mock it from their own data for now.
        // Let's assume we can calculate a simplified leaderboard or fetch it.
        // Actually, we did add a teacher leaderboard. Let's see if we can get it from the submissions.
        if (allSubsRes && allSubsRes.data) {
           const grouped = {};
           allSubsRes.data.forEach(sub => {
              if(sub.grade !== 'Pending' && !isNaN(Number(sub.grade))) {
                 const id = sub.student._id;
                 if(!grouped[id]) grouped[id] = { name: sub.student.name, total: 0, count: 0 };
                 grouped[id].total += Number(sub.grade);
                 grouped[id].count += 1;
              }
           });
           const board = Object.values(grouped).map(u => ({
              name: u.name,
              avg: (u.total / u.count).toFixed(1)
           })).sort((a,b) => b.avg - a.avg);
           setLeaderboard(board);
        }

      } catch (err) {
        console.error('Error fetching course details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [course._id]);

  // Find out pending vs completed assignments
  const pendingAssignments = assignments.filter(a => !courseSubmissions.some(s => (s.assignment?._id || s.assignment) === a._id));
  const completedAssignments = assignments.filter(a => courseSubmissions.some(s => (s.assignment?._id || s.assignment) === a._id));

  const submitFeedback = async (e) => {
    e.preventDefault();

    try {
      setFeedbackSaving(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/course/${course._id}/feedback`,
        {
          rating: Number(feedbackForm.rating),
          sentiment: feedbackForm.sentiment,
          comment: feedbackForm.comment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const feedbackRes = await axios.get(`${BACKEND_URL}/api/course/${course._id}/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFeedbackSummary(feedbackRes.data.summary || { total: 0, avgRating: 0, sentiments: { good: 0, avg: 0, bad: 0, worst: 0 } });
      setMyFeedback(feedbackRes.data.myFeedback || null);
      alert('Feedback submitted successfully!');
    } catch (err) {
      console.error('Feedback submit failed', err);
      alert(err?.response?.data?.msg || 'Failed to submit feedback');
    } finally {
      setFeedbackSaving(false);
    }
  };

  if (selectedTest) {
      return <StudentTestView test={selectedTest} onBack={() => setSelectedTest(null)} onComplete={() => {
          setSelectedTest(null);
          // Optional: refetch test attempts to show grades logic
      }} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-800 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <button onClick={onBack} className="mt-1 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h2 className="text-3xl font-extrabold mb-1">{course.title}</h2>
              <p className="text-indigo-100 max-w-xl">{course.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-semibold">
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
                  <BookOpen className="w-4 h-4" /> {assignments.length} Assignments
                </span>
                <span className="flex items-center gap-1 bg-amber-500/80 px-3 py-1.5 rounded-full">
                  <Award className="w-4 h-4 text-white" /> My Average: {averageGrade} pt
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-5 py-3 rounded-t-xl font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'assignments' ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
          }`}
        >
          <FileText className="w-5 h-5" /> Assignments
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-5 py-3 rounded-t-xl font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'tests' ? 'bg-rose-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-700'
          }`}
        >
          <CheckCircle className="w-5 h-5" /> Tests & Quizzes
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-5 py-3 rounded-t-xl font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'attendance' ? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-700'
          }`}
        >
          <Calendar className="w-5 h-5" /> My Attendance
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-5 py-3 rounded-t-xl font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'leaderboard' ? 'bg-yellow-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700'
          }`}
        >
          <TrendingUp className="w-5 h-5" /> Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-5 py-3 rounded-t-xl font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'feedback' ? 'bg-fuchsia-600 text-white' : 'bg-gray-50 text-gray-600 hover:bg-fuchsia-50 hover:text-fuchsia-700'
          }`}
        >
          <MessageCircleHeart className="w-5 h-5" /> Feedback
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="text-center py-10"><div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="min-h-[400px]">
          {activeTab === 'assignments' && (
            <div className="space-y-8">
              {/* PENDING */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-orange-500" /> Action Required
                </h3>
                {pendingAssignments.length === 0 ? (
                  <p className="text-gray-500 bg-green-50/50 p-6 rounded-xl border border-green-100 text-center font-semibold">You are all caught up on assignments!</p>
                ) : (
                  <div className="grid gap-4">
                    {pendingAssignments.map(a => (
                      <div key={a._id} className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-300 transition-colors">
                         <div>
                            <h4 className="font-bold text-indigo-900 text-lg group-hover:text-indigo-600">{a.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-1 mt-1">{a.description}</p>
                            <p className="text-xs font-bold text-orange-600 mt-2 bg-orange-50 inline-block px-2 py-1 rounded">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                         </div>
                         <button 
                           onClick={() => setSelectedAssignment(a)}
                           className="flex-shrink-0 flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white px-5 py-2.5 rounded-lg font-bold transition-colors"
                         >
                           <Upload className="w-4 h-4" /> Submit Work
                         </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COMPLETED */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Completed</h3>
                <div className="grid gap-4 opacity-80">
                  {completedAssignments.map(a => {
                    const sub = courseSubmissions.find(s => (s.assignment?._id || s.assignment) === a._id);
                    return (
                        <div key={a._id} className="p-5 bg-gray-50 border border-gray-100 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div>
                              <h4 className="font-bold text-gray-900">{a.title}</h4>
                              <p className="text-sm text-gray-500 line-clamp-1 mt-1">{a.description}</p>
                           </div>
                           <div className="flex-shrink-0 text-right">
                              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Grade</span>
                              <span className={`text-lg font-extrabold ${sub?.grade === 'Pending' ? 'text-orange-500' : 'text-teal-600'}`}>
                                {sub?.grade || 'N/A'}
                              </span>
                           </div>
                        </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
             <div className="space-y-6">
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-4 mb-6">
                    <ShieldAlert className="w-8 h-8 text-rose-500 mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-rose-900">Conditional Tests</h4>
                        <p className="text-sm text-rose-800/80 mt-1">Some tests are locked until you reach a certain average score across your graded assignments. Keep up the good work to unlock access!</p>
                    </div>
                </div>

                {tests.length === 0 ? (
                  <p className="text-gray-500 text-center p-8 bg-gray-50 rounded-xl border border-gray-100">No tests assigned yet.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                     {tests.map(test => {
                        const canTake = Number(averageGrade) >= (test.minGradeRequired || 0);
                        return (
                            <div key={test._id} className={`p-6 rounded-2xl border ${canTake ? 'bg-white border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60'} flex flex-col justify-between`}>
                                <div>
                                   <div className="flex justify-between items-start mb-2">
                                     <h4 className="font-bold text-xl text-gray-900">{test.title}</h4>
                                     {!canTake && <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Locked 🔒</span>}
                                     {canTake && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">Unlocked 🔓</span>}
                                   </div>
                                   <p className="text-xs font-bold text-gray-500 mt-2">Required Average: {test.minGradeRequired || 0}</p>
                                </div>
                                <button disabled={!canTake} onClick={() => setSelectedTest(test)} className={`mt-6 w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${canTake ? 'bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                                    {canTake ? <><CheckCircle className="w-4 h-4"/> Take Test Now</> : 'Score Too Low to Take'}
                                </button>
                            </div>
                        )
                     })}
                  </div>
                )}
             </div>
          )}
          {activeTab === 'attendance' && (
             <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-teal-600" /> My Attendance History
                </h3>
                {attendance.length === 0 ? (
                  <p className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-gray-100 text-center font-semibold">No attendance records found yet.</p>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                     <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                           <tr>
                              <th className="p-4 font-bold text-gray-700">Date</th>
                              <th className="p-4 font-bold text-gray-700">Status</th>
                           </tr>
                        </thead>
                        <tbody>
                           {attendance.map((record) => {
                              const dt = new Date(record.date).toLocaleDateString();
                              // The backend stores attendance records by course and date for all students.
                              // Find my specific attendance record in this list (we need to be careful as student records could be embedded)
                              const myUserId = user?._id || user?.id;
                              const myRecord = record.records?.find((r) => {
                                const recordStudentId = typeof r.student === 'object' ? (r.student?._id || r.student?.id) : r.student;
                                return String(recordStudentId) === String(myUserId);
                              });
                              const status = myRecord?.status || 'Not Marked';
                              const colors = {
                                Present: 'text-green-700 bg-green-100',
                                Absent: 'text-red-700 bg-red-100',
                                Late: 'text-amber-700 bg-amber-100',
                                'Not Marked': 'text-gray-700 bg-gray-100'
                              };
                              return (
                                 <tr key={record._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-semibold text-gray-800">{dt}</td>
                                    <td className="p-4">
                                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[status] || colors.Present}`}>
                                          {status}
                                       </span>
                                    </td>
                                 </tr>
                              )
                           })}
                        </tbody>
                     </table>
                  </div>
                )}
             </div>
          )}

          {activeTab === 'leaderboard' && (
             <div className="space-y-6">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200 shadow-sm">
                    <h3 className="font-extrabold text-2xl text-center text-yellow-900 mb-6">🏆 Class Leaderboard</h3>
                    {leaderboard.length === 0 ? (
                       <p className="text-center text-gray-500 font-semibold p-4">No graded assignments yet. Be the first to secure the top spot!</p>
                    ) : (
                       <div className="max-w-2xl mx-auto space-y-3">
                          {leaderboard.map((u, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md border border-yellow-100 transform hover:scale-[1.02] transition-transform">
                                   <div className="flex items-center gap-4">
                                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xl 
                                          ${i === 0 ? 'bg-yellow-400 text-white shadow-yellow-200 shadow-lg' : 
                                            i === 1 ? 'bg-gray-300 text-white shadow-gray-200 shadow-lg' : 
                                            i === 2 ? 'bg-amber-600 text-white shadow-amber-200 shadow-lg' : 'bg-gray-100 text-gray-400'}
                                      `}>
                                         #{i + 1}
                                      </span>
                                      <span className="font-bold text-gray-800 text-lg">{u.name}</span>
                                   </div>
                                   <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-600">
                                      {u.avg} pt avg
                                   </span>
                              </div>
                          ))}
                       </div>
                    )}
                </div>
             </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <div className="bg-fuchsia-50 border border-fuchsia-200 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-fuchsia-900 mb-2">Course Feedback</h3>
                <p className="text-sm text-fuchsia-800/80">Share your course experience using rating + category.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4">Course Feedback Summary</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Average Rating:</strong> {feedbackSummary.avgRating} / 5</p>
                    <p><strong>Total Feedback:</strong> {feedbackSummary.total}</p>
                    <p><strong>Good:</strong> {feedbackSummary.sentiments?.good || 0}</p>
                    <p><strong>Average:</strong> {feedbackSummary.sentiments?.avg || 0}</p>
                    <p><strong>Bad:</strong> {feedbackSummary.sentiments?.bad || 0}</p>
                    <p><strong>Worst:</strong> {feedbackSummary.sentiments?.worst || 0}</p>
                  </div>
                </div>

                <form onSubmit={submitFeedback} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-4">
                  <h4 className="font-bold text-gray-900">Submit Your Feedback</h4>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Rating (1 to 5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={feedbackForm.rating}
                      onChange={(e) => setFeedbackForm((prev) => ({ ...prev, rating: e.target.value }))}
                      className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-200 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={feedbackForm.sentiment}
                      onChange={(e) => setFeedbackForm((prev) => ({ ...prev, sentiment: e.target.value }))}
                      className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-200 outline-none"
                    >
                      <option value="good">Good</option>
                      <option value="avg">Avg</option>
                      <option value="bad">Bad</option>
                      <option value="worst">Worst</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Comment (optional)</label>
                    <textarea
                      value={feedbackForm.comment}
                      onChange={(e) => setFeedbackForm((prev) => ({ ...prev, comment: e.target.value }))}
                      className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-200 outline-none min-h-[90px]"
                      placeholder="Write your feedback"
                    />
                  </div>

                  {myFeedback && (
                    <p className="text-xs text-gray-500">You already submitted feedback. New submit will update it.</p>
                  )}

                  <button
                    type="submit"
                    disabled={feedbackSaving}
                    className="w-full py-2.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold transition disabled:opacity-60"
                  >
                    {feedbackSaving ? 'Saving...' : 'Submit Feedback'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {selectedAssignment && (
        <UploadAssignmentModal
          isOpen={!!selectedAssignment}
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onUploadSuccess={(newSub) => {
             // In a real app we'd update state or refetch. 
             // Since we use the parent submissions we can just trigger a reload by callback or remount.
             alert("Submitted!");
             setSelectedAssignment(null);
             onBack(); // Refresh dashboard data temporarily as easiest path to reload submissions
          }}
        />
      )}
    </motion.div>
  );
};

export default StudentCourseView;
