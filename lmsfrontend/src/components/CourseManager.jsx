import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Users, LogOut, CheckCircle, Upload, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CourseManager = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState('assignments'); // assignments, attendance, leaderboard, tests
  const [courseInfo, setCourseInfo] = useState(course);

  // State arrays
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [tests, setTests] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState({ avgRating: 0, total: 0 });

  const [loading, setLoading] = useState(true);

  // Assignment Modal
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });

  // Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [newTest, setNewTest] = useState({ title: '', minGradeRequired: 0 });

  const getAssignmentId = (assignmentValue) => {
    if (assignmentValue && typeof assignmentValue === 'object') {
      return assignmentValue._id;
    }
    return assignmentValue;
  };

  const isPendingGrade = (grade) => {
    if (grade === undefined || grade === null) return true;
    return String(grade).trim().toLowerCase() === 'pending' || String(grade).trim() === '';
  };

  const getStudentId = (studentValue) => {
    if (studentValue && typeof studentValue === 'object') {
      return studentValue._id;
    }
    return studentValue;
  };

  const getStudentName = (studentValue) => {
    if (studentValue && typeof studentValue === 'object' && studentValue.name) {
      return studentValue.name;
    }
    return 'Unknown Student';
  };

  useEffect(() => {
    fetchCourseData();
  }, [course._id]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Fetch latest course details so enrolled student names are always available
      const courseRes = await axios.get(`http://localhost:5000/api/course/${course._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourseInfo(courseRes.data);
      
      // Fetch assignments
      const asnRes = await axios.get(`http://localhost:5000/api/assignment/course/${course._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(asnRes.data);

      // Fetch submissions for all those assignments
      let allSubmissions = [];
      for (const a of asnRes.data) {
        const subRes = await axios.get(`http://localhost:5000/api/assignment/submissions/${a._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // append assignment details to ease UI rendering
        const subData = subRes.data.map(s => ({ ...s, assignmentDetails: a }));
        allSubmissions = [...allSubmissions, ...subData];
      }
      setSubmissions(allSubmissions);

      // Fetch Tests
      const tstRes = await axios.get(`http://localhost:5000/api/test/${course._id}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      setTests(tstRes.data);

      // Fetch feedback rating summary for teacher view
      const feedbackRes = await axios.get(`http://localhost:5000/api/course/${course._id}/feedback`, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => ({ data: null }));

      if (feedbackRes?.data?.summary) {
        setFeedbackSummary({
          avgRating: Number(feedbackRes.data.summary.avgRating || 0),
          total: Number(feedbackRes.data.summary.total || 0)
        });
      }

      // Initialize Attendance Default (Present for all students)
      const studentsForAttendance = courseRes.data?.students || [];
      if (studentsForAttendance.length > 0) {
        const initialAtt = studentsForAttendance.map(student => ({ student: getStudentId(student), status: 'Present' }));
        setAttendanceRecords(initialAtt);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/assignment', { 
        ...newAssignment, course: course._id 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments([...assignments, res.data]);
      setIsAssignmentModalOpen(false);
      setNewAssignment({ title: '', description: '', dueDate: '' });
      alert('Assignment created successfully!');
    } catch (err) {
      console.error(err);
      alert('Error creating assignment.');
    }
  };

  const handleCreateTest = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:5000/api/test', {
           course: course._id,
           title: newTest.title,
           minGradeRequired: newTest.minGradeRequired,
           // Mocking an empty question array for now
           questions: [{ questionText: "Demo question?", options: ["A", "B"], correctAnswerIndex: 0 }]
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTests([...tests, res.data]);
        setIsTestModalOpen(false);
        setNewTest({ title: '', minGradeRequired: 0 });
        alert('Test created successfully!');
      } catch (err) {
          console.error(err);
          alert('Error creating test.');
      }
  }

  const handleGradeSubmission = async (subId, grade) => {
    try {
      const numericGrade = Number(grade);
      if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
        alert('Please enter a valid grade between 0 and 100.');
        return;
      }

      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/assignment/grade/${subId}`, { grade: numericGrade }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newSubs = submissions.map(s => s._id === subId ? { ...s, grade: res.data.grade } : s);
      setSubmissions(newSubs);
      alert('Graded successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/attendance/${course._id}`, {
         date: attendanceDate,
         records: attendanceRecords
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Attendance saved!');
    } catch (err) {
      console.error(err);
      alert('Error saving attendance.');
    }
  };

  const handleAttendanceChange = (studentId, status) => {
      setAttendanceRecords(records => 
        records.map(r => String(r.student) === String(studentId) ? { ...r, status } : r)
      );
  };

  // Calculate Leaderboard
  const studentScores = {};
  submissions.forEach(s => {
      if (!isPendingGrade(s.grade) && !Number.isNaN(Number(s.grade)) && s.student) {
          const sid = typeof s.student === 'object' ? s.student._id : s.student;
          const sName = typeof s.student === 'object' ? s.student.name : 'Student';
          if (!studentScores[sid]) studentScores[sid] = { name: sName, total: 0, count: 0 };
        studentScores[sid].total += Number(s.grade) || 0;
          studentScores[sid].count += 1;
      }
  });

  const leaderboard = Object.values(studentScores).map(score => ({
      name: score.name,
      avg: Math.round(score.total / score.count)
  })).sort((a, b) => b.avg - a.avg);

  if (loading) return <div className="p-8 text-center bg-white rounded-xl">Loading course data...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">{courseInfo?.title || course.title} Manager</h2>
           <p className="text-gray-500">Manage assignments, grades, and tests for your class.</p>
        </div>
        <button onClick={onBack} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-lg transition">
           &larr; Back to Dashboard
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        {['assignments', 'attendance', 'leaderboard', 'tests', 'rating'].map(tab => (
           <button 
             key={tab} 
             onClick={() => setActiveTab(tab)}
             className={`pb-3 px-2 font-bold capitalize transition-colors border-b-4 ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
           >
             {tab}
           </button>
        ))}
      </div>

      {activeTab === 'assignments' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <h3 className="font-bold text-indigo-900">Assignments Library</h3>
             <button onClick={() => setIsAssignmentModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow hover:bg-indigo-700">
                + New Assignment
             </button>
           </div>

           <div className="grid gap-6">
             {assignments.map(a => (
                <div key={a._id} className="p-5 border border-gray-200 rounded-xl mb-4 group shadow-sm hover:border-indigo-200 transition-colors">
                   <h4 className="text-lg font-bold text-gray-800">{a.title}</h4>
                   <p className="text-gray-600 text-sm mb-4">{a.description} &bull; Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                   
                   <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-bold text-sm text-gray-700 mb-3">Submissions: {submissions.filter(s => getAssignmentId(s.assignment) === a._id).length}</h5>
                    {submissions.filter(s => getAssignmentId(s.assignment) === a._id).map(sub => (
                        <div key={sub._id} className="flex flex-col md:flex-row items-center justify-between gap-4 p-3 bg-white rounded-lg border border-gray-200 mb-2">
                           <div>
                              <p className="font-bold text-sm">{sub.student?.name || 'Student'}</p>
                          <p className="text-xs text-gray-500">Submitted: {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString()}</p>
                              <p className="text-sm mt-1 bg-yellow-50 text-yellow-700 inline-block px-2 py-0.5 rounded">Msg: {sub.content || 'No text'}</p>
                           </div>
                           <div className="flex items-center gap-2">
                          {!isPendingGrade(sub.grade) ? (
                                <span className="font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-lg border border-teal-100">Grade: {sub.grade}</span>
                              ) : (
                                <div className="flex gap-2">
                                  <input type="number" id={`grade-${sub._id}`} className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-200 outline-none" min="0" max="100" placeholder="0-100" />
                                  <button onClick={() => {
                                      const val = document.getElementById(`grade-${sub._id}`).value;
                                      if(val) handleGradeSubmission(sub._id, val);
                                  }} className="bg-indigo-600 text-white px-3 py-1 font-semibold rounded hover:bg-indigo-700">Grade</button>
                                </div>
                              )}
                           </div>
                        </div>
                     ))}
                   </div>
                </div>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'attendance' && (
         <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-gray-800 text-xl"><CheckCircle className="inline mr-2 text-indigo-600"/>Take Attendance</h3>
                 <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="p-2 border rounded-lg outline-none focus:border-indigo-500" />
             </div>
             {(!courseInfo?.students || courseInfo.students.length === 0) ? <p className="text-gray-500">No students enrolled yet.</p> : (
                 <div className="space-y-3">
                {courseInfo.students?.map((student, i) => {
                      const studentId = getStudentId(student);
                      return (
                      <div key={studentId} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <span className="font-bold">{getStudentName(student)}</span>
                           <select 
                          value={attendanceRecords.find(r => String(r.student) === String(studentId))?.status || 'Present'} 
                             onChange={(e) => handleAttendanceChange(studentId, e.target.value)}
                             className="p-2 border border-gray-200 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-indigo-200"
                           >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Late">Late</option>
                           </select>
                        </div>
                    )})}
                    <button onClick={handleSaveAttendance} className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
                        Save Attendance Record
                    </button>
                 </div>
             )}
         </div>
      )}

      {activeTab === 'leaderboard' && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
              <h3 className="font-extrabold text-2xl text-center text-indigo-900 mb-6">Class Leaderboard 🏆</h3>
              {leaderboard.length === 0 ? <p className="text-center text-gray-500 p-8 bg-white/50 rounded-xl">No graded assignments yet.</p> : (
                 <div className="max-w-2xl mx-auto space-y-4">
                    {leaderboard.map((u, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md border border-gray-100 transform hover:scale-[1.02] transition-transform">
                             <div className="flex items-center gap-4">
                                <span className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xl 
                                    ${i === 0 ? 'bg-yellow-400 text-white shadow-yellow-200 shadow-lg' : 
                                      i === 1 ? 'bg-gray-300 text-white shadow-gray-200 shadow-lg' : 
                                      i === 2 ? 'bg-amber-600 text-white shadow-amber-200 shadow-lg' : 'bg-indigo-50 text-indigo-400'}
                                `}>
                                   #{i + 1}
                                </span>
                                <span className="font-bold text-gray-800 text-lg">{u.name}</span>
                             </div>
                             <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                {u.avg} pt avg
                             </span>
                        </div>
                    ))}
                 </div>
              )}
          </div>
      )}

      {activeTab === 'tests' && (
          <div className="space-y-6">
              <div className="flex justify-between items-center bg-rose-50 p-4 rounded-xl border border-rose-100">
                 <h3 className="font-bold text-rose-900"><Shield className="inline mr-2"/>Restricted Tests & Quizzes</h3>
                 <button onClick={() => setIsTestModalOpen(true)} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-bold shadow hover:bg-rose-700">
                    + Create Conditional Test
                 </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {tests.map(test => (
                    <div key={test._id} className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition">
                       <h4 className="font-bold text-xl text-gray-800 mb-2">{test.title}</h4>
                       <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded flex items-center gap-2 text-sm font-bold mb-4 w-max border border-rose-200">
                          <Shield className="w-4 h-4"/> Requires &gt; {test.minGradeRequired}% Avg Grade
                       </div>
                       <p className="text-gray-500 text-sm">{test.questions?.length || 1} Questions mapped.</p>
                    </div>
                 ))}
                 {tests.length === 0 && <div className="col-span-full text-center text-gray-500 py-10 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">No active tests. Create one to challenge your students.</div>}
              </div>
          </div>
      )}

          {activeTab === 'rating' && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Course Feedback Rating</h3>
              <p className="text-5xl font-extrabold text-indigo-600 mb-2">{feedbackSummary.avgRating.toFixed(1)} / 5</p>
              <p className="text-gray-600 font-semibold">Based on {feedbackSummary.total} student response{feedbackSummary.total === 1 ? '' : 's'}</p>
            </div>
          )}

      {/* CREATE ASSIGNMENT MODAL */}
      <AnimatePresence>
        {isAssignmentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-8 rounded-2xl w-full max-w-md relative shadow-2xl">
               <h3 className="text-2xl font-bold mb-6 text-indigo-900">New Assignment for {course.title}</h3>
               <form onSubmit={handleCreateAssignment} className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                   <input required type="text" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-300" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Instructions / Description</label>
                   <textarea required value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-300 min-h-[100px]" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
                   <input required type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-300" />
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                   <button type="button" onClick={() => setIsAssignmentModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                   <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95">Post Assignment</button>
                 </div>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE TEST MODAL */}
      <AnimatePresence>
        {isTestModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-8 rounded-2xl w-full max-w-md relative shadow-2xl">
               <h3 className="text-2xl font-bold mb-6 text-rose-900"><Shield className="inline mr-2 text-rose-600"/>Conditional Test</h3>
               <p className="text-sm text-gray-500 mb-6">Create a test that unlocks automatically only for students matching the required average score.</p>
               <form onSubmit={handleCreateTest} className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Test Title</label>
                   <input required type="text" value={newTest.title} onChange={e => setNewTest({...newTest, title: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-rose-300" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Average Required (0-100)</label>
                   <input required type="number" min="0" max="100" value={newTest.minGradeRequired} onChange={e => setNewTest({...newTest, minGradeRequired: e.target.value})} className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-rose-300" />
                   <p className="text-xs text-amber-600 mt-2 font-semibold bg-amber-50 p-2 rounded">Example: Entering 70 means only students with a 70+ point average can open this test.</p>
                 </div>
                 <div className="flex justify-end gap-3 pt-4">
                   <button type="button" onClick={() => setIsTestModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
                   <button type="submit" className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-bold shadow-lg hover:bg-rose-700 transition active:scale-95">Enable Test Gate</button>
                 </div>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CourseManager;
