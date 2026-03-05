
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, ExternalLink, Loader2 } from 'lucide-react';
import { Idea, Project, User } from '../types';

interface GlobalChatbotProps {
  currentUser: User;
  ideas: Idea[];
  projects: Project[];
  users: User[];
}

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionLink?: string; // URL to navigate to
}

const STORAGE_KEY = 'quadient_global_chat_history';

const GlobalChatbot: React.FC<GlobalChatbotProps> = ({ currentUser, ideas, projects, users }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load chat history");
      }
    } else {
      setMessages([{
        id: 'init',
        role: 'bot',
        text: `Hi ${currentUser.name.split(' ')[0]}! 👋 I'm your Quadient AI Assistant.\n\nI can help you find projects, navigate the portal, or answer questions about ongoing initiatives. How can I help today?`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [currentUser]);

  // Autosave
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate "Thinking" time
    setTimeout(() => {
        processBotResponse(userMsg.text);
    }, 1200);
  };

  const processBotResponse = (query: string) => {
    const lowerQ = query.toLowerCase();
    let responseText = "";
    let actionLink = undefined;

    // --- 1. CONVERSATIONAL / SMALL TALK ---
    if (['hi', 'hello', 'hey', 'greetings'].some(w => lowerQ.startsWith(w))) {
        responseText = "Hello there! Great to see you. Looking for anything specific in the portal today?";
    }
    else if (lowerQ.includes('how are you')) {
        responseText = "I'm functioning perfectly and ready to help you innovate! How about you?";
    }
    else if (lowerQ.includes('thank')) {
        responseText = "You're very welcome! Let me know if you need anything else.";
    }
    else if (lowerQ.includes('bye') || lowerQ.includes('goodbye')) {
        responseText = "Goodbye! Keep those great ideas coming.";
    }

    // --- 2. NAVIGATION COMMANDS ---
    else if (lowerQ.includes('dashboard') || lowerQ.includes('home') || lowerQ.includes('main')) {
      responseText = "Sure thing. Taking you to the Dashboard now.";
      actionLink = "/";
    } 
    else if (lowerQ.includes('submit') || lowerQ.includes('create') || lowerQ.includes('new idea')) {
      responseText = "I'll open the Idea Intake form for you. Good luck with your submission!";
      actionLink = "/submit";
    } 
    else if (lowerQ.includes('leaderboard') || lowerQ.includes('rank') || lowerQ.includes('top user') || lowerQ.includes('score')) {
      responseText = "Let's see who is leading the innovation charge. Opening the Leaderboard.";
      actionLink = "/leaderboard";
    } 
    else if (lowerQ.includes('profile') || lowerQ.includes('my account') || lowerQ.includes('avatar')) {
      responseText = "Opening your profile settings.";
      actionLink = "/profile";
    } 
    else if (lowerQ.includes('project list') || lowerQ.includes('all projects')) {
        responseText = "Here is the full list of active projects and ideas.";
        actionLink = "/projects";
    }

    // --- 3. DATA QUERY & SEARCH (CONTEXT AWARENESS) ---
    else {
        // A. Search for specific Idea/Project by Name
        const foundItem = [...projects, ...ideas].find(i => lowerQ.includes(i.title.toLowerCase()));
        
        if (foundItem) {
            const isProj = projects.find(p => p.id === foundItem.id);
            responseText = `I found "${foundItem.title}". \n\nIt is currently in the **${foundItem.status}** status${isProj ? ` (Stage: ${isProj.stage})` : ''}. \n\nWould you like to view the details?`;
            actionLink = `/idea/${foundItem.id}`;
        }
        // B. Search for People/Owners
        else if (lowerQ.includes('who') && (lowerQ.includes('working') || lowerQ.includes('owner'))) {
             // Try to find a project name in the query to contextually answer
             const foundProjectInContext = projects.find(p => lowerQ.includes(p.title.toLowerCase()));
             if (foundProjectInContext) {
                 responseText = `The owner of "${foundProjectInContext.title}" is ${foundProjectInContext.owner}.`;
                 actionLink = `/idea/${foundProjectInContext.id}`;
             } else {
                 responseText = "I can tell you who is working on a project if you provide the project name. For example: 'Who is working on Automated Invoice Processing?'";
             }
        }
        // C. Aggregation Stats
        else if (lowerQ.includes('how many') && (lowerQ.includes('project') || lowerQ.includes('active'))) {
            responseText = `There are currently ${projects.length} active projects in flight across Quadient.`;
            actionLink = "/projects";
        }
        else if (lowerQ.includes('how many') && lowerQ.includes('idea')) {
            responseText = `We have ${ideas.length} total ideas in the pipeline (including drafts and active projects).`;
             actionLink = "/projects";
        }
        else if (lowerQ.includes('benefit') || lowerQ.includes('roi') || lowerQ.includes('value')) {
             const total = projects.reduce((acc, curr) => acc + curr.benefitEstimate, 0);
             responseText = `The total estimated benefit of all active projects is €${total.toLocaleString()}. Impressive!`;
        }
        // D. Fallback
        else {
            responseText = "I'm not quite sure I understood that. You can ask me to 'Find a project', 'Show the leaderboard', 'Go to dashboard', or ask 'How many active projects?'.";
        }
    }

    const botMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'bot',
        text: responseText,
        timestamp: new Date().toISOString(),
        actionLink
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);

    if (actionLink) {
        // Small delay before navigating to let user read
        setTimeout(() => navigate(actionLink!), 1000);
    }
  };

  const handleClear = () => {
    if (confirm("Clear chat history?")) {
      setMessages([{
        id: Date.now().toString(),
        role: 'bot',
        text: "History cleared. How can I help?",
        timestamp: new Date().toISOString()
      }]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden pointer-events-auto flex flex-col h-[500px] animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-quadient-dark p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Bot className="w-5 h-5 text-quadient-orange" />
              </div>
              <div>
                <span className="font-bold text-sm block">Quadient Assistant</span>
                <span className="text-[10px] text-gray-300 flex items-center">
                   <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span> Online
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
               <button onClick={handleClear} className="text-xs text-gray-400 hover:text-white transition">Clear</button>
               <button onClick={() => setIsOpen(false)} className="hover:text-quadient-orange transition">
                  <X className="w-5 h-5" />
               </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                        <Bot className="w-3 h-3 text-gray-600"/>
                    </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-quadient-orange text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}>
                  <p>{msg.text}</p>
                  {msg.actionLink && (
                    <button 
                        onClick={() => navigate(msg.actionLink!)}
                        className="mt-3 pt-2 border-t border-gray-100/20 flex items-center text-xs opacity-90 font-bold hover:underline"
                    >
                        <ExternalLink className="w-3 h-3 mr-1" /> Open Page
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
                <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-1">
                        <Bot className="w-3 h-3 text-gray-600"/>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-quadient-orange/50 focus-within:bg-white focus-within:shadow-sm transition-all">
               <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none placeholder-gray-400"
               />
               <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="text-quadient-orange hover:text-orange-700 disabled:opacity-50 transition p-1"
               >
                  <Send className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto h-14 w-14 bg-quadient-orange hover:bg-orange-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
      >
         {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
         
         {/* Simple notification dot simulation if closed */}
         {!isOpen && messages.length > 1 && (
             <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 border-2 border-white"></span>
         )}
      </button>
    </div>
  );
};

export default GlobalChatbot;
