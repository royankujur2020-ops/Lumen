import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, User, Sparkles } from 'lucide-react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export const ChatInterface = ({ messages, onSendMessage, isLoading }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-12">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto rotate-3 hover:rotate-0 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Meet Lumen</h2>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                  Your elite AI Academic Coach. I'm here to help you master complex concepts through Socratic dialogue.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4">
              {[
                { title: "Explain a Concept", desc: "Quantum entanglement for a beginner", icon: "🔬" },
                { title: "Study Help", desc: "Create a quiz on the French Revolution", icon: "📚" },
                { title: "Math Problem", desc: "Help me solve this calculus integral", icon: "🧮" },
                { title: "Writing Support", desc: "Thesis statement for a climate change essay", icon: "✍️" }
              ].map((topic, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(topic.desc)}
                  className="flex flex-col items-start p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-left group"
                >
                  <span className="text-2xl mb-2">{topic.icon}</span>
                  <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{topic.title}</span>
                  <span className="text-xs text-slate-500 mt-1 italic">"{topic.desc}"</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex w-full gap-4",
                message.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                message.role === 'user' ? "bg-slate-200" : "bg-indigo-600"
              )}>
                {message.role === 'user' ? (
                  <User className="w-5 h-5 text-slate-600" />
                ) : (
                  <Sparkles className="w-5 h-5 text-white" />
                )}
              </div>
              <div className={cn(
                "max-w-[85%] p-4 rounded-2xl shadow-sm border",
                message.role === 'user' 
                  ? "bg-white border-slate-100 rounded-tr-none" 
                  : "bg-indigo-50/50 border-indigo-100 rounded-tl-none"
              )}>
                <MarkdownRenderer content={message.content} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-sm text-indigo-600 font-medium">Lumen is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question or share a topic..."
            className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          Lumen aims for accuracy but can make mistakes. Verify important facts.
        </p>
      </div>
    </div>
  );
};
