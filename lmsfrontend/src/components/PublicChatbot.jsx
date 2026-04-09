import React, { useMemo, useState } from 'react';
import { MessageCircle, X, CalendarClock, Trophy } from 'lucide-react';

const PublicChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');

  const responses = useMemo(() => ({
    exams: {
      title: 'Near Exam Schedule',
      lines: [
        'Math Revision Test - 15 Apr, 10:00 AM',
        'Science Unit Exam - 18 Apr, 02:00 PM',
        'English Mock Test - 21 Apr, 11:30 AM'
      ]
    },
    leaderboard: {
      title: 'Top Students',
      lines: [
        '1st Place: Priya S (Average 96.2)',
        '2nd Place: Arjun K (Average 94.8)'
      ]
    }
  }), []);

  const current = selectedTopic ? responses[selectedTopic] : null;

  return (
    <>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 transition"
        aria-label="Open public chatbot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
            <div>
              <p className="font-bold">LMS Quick Help</p>
              <p className="text-xs text-indigo-100">Choose what you want to see</p>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close chatbot">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-3 bg-gray-50">
            <button
              onClick={() => setSelectedTopic('exams')}
              className="w-full text-left p-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 transition flex items-center gap-3"
            >
              <CalendarClock className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-gray-800">Near Exams Schedule</span>
            </button>

            <button
              onClick={() => setSelectedTopic('leaderboard')}
              className="w-full text-left p-3 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 transition flex items-center gap-3"
            >
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-gray-800">Who is 1st and 2nd Place?</span>
            </button>

            <div className="rounded-xl border border-indigo-100 bg-white p-3 min-h-[120px]">
              {!current && (
                <p className="text-sm text-gray-600">Click any option above to view details.</p>
              )}

              {current && (
                <div>
                  <p className="text-sm font-bold text-indigo-700 mb-2">{current.title}</p>
                  <ul className="space-y-2">
                    {current.lines.map((line) => (
                      <li key={line} className="text-sm text-gray-700">{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicChatbot;