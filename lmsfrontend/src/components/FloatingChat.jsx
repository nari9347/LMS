import React, { useState, useEffect, useRef, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { BACKEND_URL } from '../context/AuthContext';

const socket = io(BACKEND_URL);

const FloatingChat = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            socket.emit('joinRoom', 'global');
        }

        socket.on('message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off('message');
        };
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim()) {
            socket.emit('chatMessage', {
                room: 'global',
                user: user.name,
                text: message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setMessage('');
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Chat Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all z-50 flex items-center justify-center glow"
            >
                <MessageCircle className="w-7 h-7" />
            </motion.button>

            {/* Chat Box */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-6 w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 flex flex-col h-[500px]"
                    >
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex justify-between items-center text-white">
                            <div>
                                <h3 className="font-bold">Classroom Chat</h3>
                                <span className="text-xs text-indigo-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span> Global Room
                                </span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-3">
                            {messages.length === 0 && (
                                <p className="text-center text-gray-400 text-sm mt-10">Say hello to the class! 👋</p>
                            )}
                            {messages.map((msg, index) => {
                                const isMe = msg.user === user.name;
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={index} 
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <span className="text-[10px] text-gray-500 mb-1 px-1">{isMe ? 'You' : msg.user} • {msg.time}</span>
                                        <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 transition text-sm"
                            />
                            <button 
                                type="submit"
                                disabled={!message.trim()}
                                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:scale-100 active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingChat;
