import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { GeminiService } from './services/GeminiService';
import { ChatSession, Message } from './types';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('lumen_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load sessions:", e);
      return [];
    }
  });
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('lumen_current_session_id');
      return saved && saved !== "null" ? saved : null;
    } catch (e) {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [geminiService] = useState(() => new GeminiService());

  useEffect(() => {
    localStorage.setItem('lumen_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('lumen_current_session_id', currentSessionId);
    } else {
      localStorage.removeItem('lumen_current_session_id');
    }
  }, [currentSessionId]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const handleNewChat = useCallback(() => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Exploration',
      messages: [],
      lastUpdated: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) {
      // If no session, create one first
      const newId = uuidv4();
      const newSession: ChatSession = {
        id: newId,
        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
        messages: [{ role: 'user', content, timestamp: Date.now() }],
        lastUpdated: Date.now(),
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newId);
      await processAIResponse(newId, [{ role: 'user', content, timestamp: Date.now() }]);
    } else {
      const userMessage: Message = { role: 'user', content, timestamp: Date.now() };
      const updatedMessages = [...(currentSession?.messages || []), userMessage];
      
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { 
              ...s, 
              messages: updatedMessages, 
              lastUpdated: Date.now(),
              title: s.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : s.title
            } 
          : s
      ));

      await processAIResponse(currentSessionId, updatedMessages);
    }
  };

  const processAIResponse = async (sessionId: string, history: Message[]) => {
    setIsLoading(true);
    let fullResponse = '';

    try {
      await geminiService.generateResponse(history, (chunk) => {
        fullResponse += chunk;
        setSessions(prev => prev.map(s => 
          s.id === sessionId 
            ? { 
                ...s, 
                messages: [
                  ...history, 
                  { role: 'model', content: fullResponse, timestamp: Date.now() }
                ] 
              } 
            : s
        ));
      });
    } catch (error) {
      console.error("AI Error:", error);
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { 
              ...s, 
              messages: [
                ...history, 
                { role: 'model', content: "I'm sorry, I encountered an error. Please try again.", timestamp: Date.now() }
              ] 
            } 
          : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(null);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <ChatInterface 
          messages={currentSession?.messages || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}
