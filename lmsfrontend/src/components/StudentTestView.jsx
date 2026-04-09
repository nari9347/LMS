import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, AlertCircle, Award } from 'lucide-react';

const StudentTestView = ({ test, onBack, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // In a real application, you might fetch specific test details here if they aren't completely populated
  // For now, we assume `test.questions` exists.

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswerIndex) {
        correct++;
      }
    });
    return Math.round((correct / test.questions.length) * 100);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < test.questions.length) {
      if (!window.confirm("You have unanswered questions. Are you sure you want to submit?")) {
        return;
      }
    }
    
    const finalScore = calculateScore();
    setScore(finalScore);
    setIsSubmitted(true);

    // Normally you'd send this to the backend:
    // try {
    //   await axios.post(`http://localhost:5000/api/test/${test._id}/submit`, { answers, score: finalScore }, { headers: ... });
    // } catch(...) {}
  };

  if (isSubmitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto mt-10">
         <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
               <Award className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Test Completed!</h2>
            <p className="text-gray-500 mb-8">You have successfully submitted your answers for <strong>{test.title}</strong>.</p>
            
            <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-2xl mb-8 transform transition hover:scale-105">
               <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-1">Your Score</p>
               <p className="text-6xl font-black text-indigo-600">{score}%</p>
            </div>

            <button onClick={onBack} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
               Return to Course
            </button>
         </div>
      </motion.div>
    );
  }

  const question = test.questions[currentQuestionIndex];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto p-4 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
           <h2 className="text-2xl font-bold text-gray-900">{test.title}</h2>
           <p className="text-sm text-gray-500 font-semibold mt-1 bg-gray-100 inline-block px-2 py-1 rounded">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
        </div>
      </div>

      {/* QUESTION CARD */}
      {!question ? (
         <div className="p-8 text-center bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200 font-bold flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8" />
            This test has no questions yet. Please inform your teacher!
         </div>
      ) : (
         <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transform transition-all">
            <div className="p-8 md:p-10">
               <h3 className="text-2xl font-bold text-gray-800 mb-8 leading-snug">{question.questionText}</h3>
               
               <div className="space-y-4">
                 {question.options.map((opt, idx) => {
                    const isSelected = answers[currentQuestionIndex] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(currentQuestionIndex, idx)}
                        className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50 shadow-md transform scale-[1.01]' 
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                        }`}
                      >
                         <span className={`font-semibold text-lg ${isSelected ? 'text-indigo-900' : 'text-gray-700 group-hover:text-indigo-800'}`}>
                            {opt}
                         </span>
                         <div className={`w-6 h-6 rounded-full border-2 flex flex-shrink-0 items-center justify-center transition-colors ${
                           isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 group-hover:border-indigo-400'
                         }`}>
                            {isSelected && <CheckCircle className="w-4 h-4 text-white p-0.5" />}
                         </div>
                      </button>
                    )
                 })}
               </div>
            </div>
            
            <div className="bg-gray-50 p-6 flex items-center justify-between border-t border-gray-100">
               <button 
                 onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                 disabled={currentQuestionIndex === 0}
                 className="px-6 py-2.5 font-bold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  Previous
               </button>
               
               {currentQuestionIndex === test.questions.length - 1 ? (
                 <button 
                   onClick={handleSubmit}
                   className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-transform active:scale-95 flex items-center gap-2"
                 >
                    <CheckCircle className="w-5 h-5" /> Submit Test
                 </button>
               ) : (
                 <button 
                   onClick={() => setCurrentQuestionIndex(Math.min(test.questions.length - 1, currentQuestionIndex + 1))}
                   className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-transform active:scale-95"
                 >
                    Next Question
                 </button>
               )}
            </div>
         </div>
      )}
    </motion.div>
  );
};

export default StudentTestView;
