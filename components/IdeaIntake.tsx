import React, { useState, useEffect, useRef } from 'react';
import { Idea, IdeaStatus, Attachment, User, Project } from '../types';
import { MessageSquare, FileText, Paperclip, Mic, Send, AlertCircle, Info, Calculator, Save, RefreshCw, Mail, Upload, X, File as FileIcon, Image, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface IdeaIntakeProps {
  onSubmit: (idea: Partial<Idea>) => void;
  users: User[];
  currentUser: User;
  existingIdeas?: (Idea | Project)[];
  initialData?: Idea | Project;
  isEditing?: boolean;
}

const STORAGE_KEY = 'quadient_idea_draft';

interface ChatMessage {
    role: 'bot' | 'user';
    text: string;
    link?: string;
    linkText?: string;
}

const IdeaIntake: React.FC<IdeaIntakeProps> = ({ onSubmit, users, currentUser, existingIdeas = [], initialData, isEditing = false }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'form' | 'chat'>('form');
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State matching Business Case Template
  const [formData, setFormData] = useState<Partial<Idea>>({
    title: '',
    submitterId: currentUser.id,
    department: '',
    region: '',
    ideaType: 'Automation',
    // Problem
    description: '',
    frequency: '',
    noActionCost: 0,
    keyImpactedProcesses: '', 
    // New Governance Fields
    related3YP: 'NO',
    impactedBusinessFunction: '',
    requestorPriority: 'Medium',
    // Solution
    phase1: '',
    phase2: '',
    phase3: '',
    proposedTools: '',
    vendorNeeded: false,
    complexity: 'Medium',
    // Benefits
    benefitEstimate: 0,
    benefitRating: 'Medium', 
    intangibleBenefits: '',
    strategicFit: '',
    // Costs
    costEstimate: 0,
    costRating: 'Medium', 
    roiDescription: '',
    tags: [],
    // Attachments
    attachments: []
  });

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: "Hi! I'm the Quadient Idea Assistant. I can help you draft your Business Case. Let's start with the basics. What is the title of your idea?" }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load Initial Data if editing
  useEffect(() => {
    if (isEditing && initialData) {
        setFormData(initialData);
    } else {
        // Only load draft if NOT editing an existing item
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setFormData(parsed.formData);
            setMessages(parsed.messages);
            setMode(parsed.mode || 'form');
            setLastSaved(new Date(parsed.timestamp));
            setIsRestored(true);
          } catch (e) {
            console.error("Failed to restore draft", e);
          }
        }
    }
  }, [isEditing, initialData]);

  // Autosave Effect (Only for new drafts)
  useEffect(() => {
    if (!isEditing) {
        const timeoutId = setTimeout(() => {
          const dataToSave = {
            formData,
            messages,
            mode,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
          setLastSaved(new Date());
        }, 1000); // Debounce save every 1s
    
        return () => clearTimeout(timeoutId);
    }
  }, [formData, messages, mode, isEditing]);

  useEffect(scrollToBottom, [messages]);

  // Simulating Duplicate Detection in Form Mode
  useEffect(() => {
    if (formData.title && formData.title.length > 5 && !isEditing) {
      const isSimilar = existingIdeas.some(i => i.title.toLowerCase().includes(formData.title!.toLowerCase()) && i.submitterId !== currentUser.id);
      setShowDuplicateWarning(isSimilar);
    } else {
      setShowDuplicateWarning(false);
    }
  }, [formData.title, existingIdeas, currentUser.id, isEditing]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
         onSubmit({ ...formData, updatedAt: new Date().toISOString() });
    } else {
         onSubmit({ ...formData, status: IdeaStatus.PENDING_COE, createdAt: new Date().toISOString() });
    }
    
    if (!isEditing) localStorage.removeItem(STORAGE_KEY); // Clear draft on success
    navigate('/');
  };

  const handleReset = () => {
    if(window.confirm("Are you sure? This will delete your current draft.")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = (Array.from(e.target.files) as File[]).map(file => {
         let type: Attachment['type'] = 'other';
         if (file.type.includes('image')) type = 'image';
         else if (file.type.includes('pdf')) type = 'pdf';
         else if (file.type.includes('sheet') || file.type.includes('csv') || file.type.includes('excel')) type = 'spreadsheet';
         else if (file.type.includes('text') || file.type.includes('word')) type = 'document';

         return {
           id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
           name: file.name,
           url: URL.createObjectURL(file), // Create a local URL for preview
           type: type,
           size: (file.size / 1024).toFixed(1) + ' KB'
         };
      });

      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), ...newAttachments]
      }));
    }
  };

  const removeAttachment = (id: string) => {
    setFormData(prev => ({
        ...prev,
        attachments: (prev.attachments || []).filter(a => a.id !== id)
    }));
  };

  const handleChatSend = () => {
    if (!inputMsg.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, text: inputMsg }];
    setMessages(newMessages);
    setInputMsg('');

    // Simple bot logic to fill form data based on conversation progress
    setTimeout(() => {
      let botResponse = "Got it. What's next?";
      let linkUrl = undefined;
      let linkText = undefined;
      
      // State machine for the chat demo
      if (messages.length === 1) { 
        // User just sent title
        const enteredTitle = inputMsg;
        setFormData(prev => ({ ...prev, title: enteredTitle }));
        
        // CHECK FOR DUPLICATES
        const duplicate = existingIdeas.find(i => 
            i.title.toLowerCase().includes(enteredTitle.toLowerCase()) && i.submitterId !== currentUser.id
        );

        if (duplicate) {
            botResponse = `Wait! I found a similar idea already submitted: "${duplicate.title}". You might want to join forces or check if this covers your case. \n\nIf yours is different, tell me: Which Business Area/Department is this for?`;
            linkUrl = `/idea/${duplicate.id}`;
            linkText = `View ${duplicate.title}`;
        } else {
            botResponse = "Nice title. Which Business Area/Department is this for?";
        }

      } else if (messages.length === 3) {
        setFormData(prev => ({ ...prev, department: inputMsg }));
        botResponse = "Understood. Please describe the Pain Point. How is it impacting the department or clients?";
      } else if (messages.length === 5) {
        setFormData(prev => ({ ...prev, description: inputMsg }));
        botResponse = "Thanks. How often does this problem happen (Frequency)?";
      } else if (messages.length === 7) {
        setFormData(prev => ({ ...prev, frequency: inputMsg }));
        botResponse = "And what is the estimated Tangible Benefit (in €) if we solve this?";
      } else if (messages.length === 9) {
        setFormData(prev => ({ ...prev, benefitEstimate: parseInt(inputMsg) || 0 }));
        botResponse = "Great. I've updated the business case draft. You can switch to the 'Form' view to fill in the complex details like Phases and ROI, or type 'Submit' to finish now.";
      } else if (inputMsg.toLowerCase().includes('submit')) {
        onSubmit({ ...formData, status: IdeaStatus.PENDING_COE, createdAt: new Date().toISOString() });
        localStorage.removeItem(STORAGE_KEY);
        navigate('/');
        return;
      }

      setMessages(prev => [...prev, { role: 'bot', text: botResponse, link: linkUrl, linkText: linkText }]);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header & Autosave Status */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Business Case' : 'Submit New Idea'}</h1>
        
        {!isEditing && (
            <div className="flex space-x-4">
            <button 
                onClick={() => setMode('form')}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'form' 
                    ? 'bg-quadient-orange text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
                <FileText className="w-4 h-4 mr-2" />
                Business Case Form
            </button>
            <button 
                onClick={() => setMode('chat')}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'chat' 
                    ? 'bg-quadient-orange text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
                <MessageSquare className="w-4 h-4 mr-2" />
                Guided Assistant
            </button>
            </div>
        )}

        <div className="flex items-center space-x-4">
           {!isEditing && isRestored && (
             <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md animate-pulse">
               Draft Restored
             </span>
           )}
           <div className="flex items-center text-xs text-gray-400">
              <Save className="w-3 h-3 mr-1" />
              {lastSaved && !isEditing ? `Draft saved ${lastSaved.toLocaleTimeString()}` : ''}
           </div>
           {!isEditing && (
                <button onClick={handleReset} className="text-gray-400 hover:text-red-500" title="Clear Draft">
                    <RefreshCw className="w-4 h-4" />
                </button>
           )}
        </div>
      </div>

      {/* Duplicate Warning Banner in Form Mode */}
      {showDuplicateWarning && mode === 'form' && (
        <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-start">
          <AlertCircle className="text-orange-500 w-5 h-5 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-bold text-orange-800">Potential Duplicate Detected</h4>
            <p className="text-sm text-orange-700 mt-1">
              We found a similar project in the system. Please check the project list before submitting to avoid duplication.
            </p>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
        
        {/* FORM VIEW */}
        {mode === 'form' && (
          <div className="flex-1 overflow-y-auto p-8">
            <form onSubmit={handleFormSubmit} className="space-y-10">
              
              {/* Header Info */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700">Project / Idea Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                      placeholder="e.g., Automated Customer Onboarding"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700">Business Area (Name and Location)</label>
                    <input 
                      type="text"
                      required 
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                      placeholder="e.g. Finance, North America"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-700">Submission By</label>
                    <select
                        value={formData.submitterId || currentUser.id}
                        onChange={(e) => setFormData({...formData, submitterId: e.target.value})}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                    >
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                 </div>
              </div>

              {/* 1. PAIN POINT & PROBLEM */}
              <section>
                 <h3 className="text-lg font-bold text-quadient-orange border-b border-gray-200 pb-2 mb-4">1. Pain Point & Impact</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <label className="block text-sm font-bold text-gray-700 mb-1">Description of pain point/problem you are trying to solve</label>
                       <p className="text-xs text-gray-500 mb-2">Detail the problem fully, how it is impacting the department/company and clients.</p>
                       <textarea 
                          rows={4}
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">How often this problem happens or affects us</label>
                       <p className="text-xs text-gray-500 mb-2">How much is this costing the company today?</p>
                       <input 
                          type="text"
                          value={formData.frequency}
                          onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                          placeholder="e.g. Daily, 20 hours per week lost"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Key Business Processes Impacted</label>
                       <p className="text-xs text-gray-500 mb-2">List the main processes affected (e.g. Invoice Entry, Ticket Routing).</p>
                       <input 
                          type="text"
                          value={formData.keyImpactedProcesses}
                          onChange={(e) => setFormData({...formData, keyImpactedProcesses: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                          placeholder="e.g. Accounts Payable, Customer Onboarding"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Impacted business function</label>
                       <p className="text-xs text-gray-500 mb-2">Specify the exact functional area impacted.</p>
                       <input 
                          type="text"
                          value={formData.impactedBusinessFunction}
                          onChange={(e) => setFormData({...formData, impactedBusinessFunction: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                          placeholder="e.g. Accounts Receivable"
                       />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Requestor priority</label>
                       <p className="text-xs text-gray-500 mb-2">Importance of this request to your function.</p>
                       <select 
                           value={formData.requestorPriority}
                           onChange={(e) => setFormData({...formData, requestorPriority: e.target.value as any})}
                           className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                        >
                           <option value="Low">Low</option>
                           <option value="Medium">Medium</option>
                           <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Related 3YP demand?</label>
                       <p className="text-xs text-gray-500 mb-2">Is this part of the Three Year Plan?</p>
                       <select 
                           value={formData.related3YP}
                           onChange={(e) => setFormData({...formData, related3YP: e.target.value as any})}
                           className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                        >
                           <option value="NO">NO</option>
                           <option value="YES">YES</option>
                        </select>
                    </div>
                 </div>
              </section>

              {/* 2. PROPOSED SOLUTION & PHASES */}
              <section>
                 <h3 className="text-lg font-bold text-quadient-orange border-b border-gray-200 pb-2 mb-4">2. Proposed Solution & Phases</h3>
                 <p className="text-sm text-gray-600 mb-4">Describe the solution proposed to resolve the pain point. Break it down into phases if applicable.</p>
                 
                 <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-bold text-gray-900">Phase 1</label>
                        <p className="text-xs text-gray-500 mb-2">Details, timeline, and risks foreseen</p>
                        <textarea 
                           rows={2}
                           value={formData.phase1}
                           onChange={(e) => setFormData({...formData, phase1: e.target.value})}
                           className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                           placeholder="Describe Phase 1..."
                        />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-bold text-gray-900">Phase 2</label>
                        <p className="text-xs text-gray-500 mb-2">Details, timeline, and risks foreseen</p>
                        <textarea 
                           rows={2}
                           value={formData.phase2}
                           onChange={(e) => setFormData({...formData, phase2: e.target.value})}
                           className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                           placeholder="Describe Phase 2 (Optional)..."
                        />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-bold text-gray-900">Phase 3</label>
                        <p className="text-xs text-gray-500 mb-2">Details, timeline, and risks foreseen</p>
                        <textarea 
                           rows={2}
                           value={formData.phase3}
                           onChange={(e) => setFormData({...formData, phase3: e.target.value})}
                           className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                           placeholder="Describe Phase 3 (Optional)..."
                        />
                    </div>
                 </div>
              </section>

              {/* 3. BENEFITS */}
              <section>
                 <h3 className="text-lg font-bold text-quadient-orange border-b border-gray-200 pb-2 mb-4">3. Benefit in Numbers & Description</h3>
                 
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
                    <Mail className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Need help calculating benefits?</h4>
                        <p className="text-sm text-blue-800">
                           Contact the CoE Team at <a href="mailto:coe-help@quadient.com" className="underline font-bold">coe-help@quadient.com</a> for a benchmark model or assistance with the formula.
                        </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Tangible Benefit Rating</label>
                       <p className="text-xs text-gray-500 mb-2">Select the estimated level of benefit.</p>
                       <select 
                           value={formData.benefitRating}
                           onChange={(e) => setFormData({...formData, benefitRating: e.target.value as any})}
                           className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                        >
                           <option value="Low">Low (&lt; €10k)</option>
                           <option value="Medium">Medium (€10k - €100k)</option>
                           <option value="High">High (&gt; €100k)</option>
                        </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Tangible Benefits (€) - Optional</label>
                       <p className="text-xs text-gray-500 mb-2">Exact direct revenue or cost savings if known.</p>
                       <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">€</span>
                          </div>
                          <input 
                            type="number"
                            value={formData.benefitEstimate || ''}
                            onChange={(e) => setFormData({...formData, benefitEstimate: parseInt(e.target.value)})}
                            className="focus:ring-quadient-orange focus:border-quadient-orange block w-full pl-7 sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="0.00"
                          />
                       </div>
                    </div>
                    <div className="col-span-2">
                       <label className="block text-sm font-bold text-gray-700 mb-1">Intangible Benefits</label>
                       <p className="text-xs text-gray-500 mb-2">What we cannot financially measure but we know helps Quadient (e.g. Employee Satisfaction).</p>
                       <input 
                          type="text"
                          value={formData.intangibleBenefits}
                          onChange={(e) => setFormData({...formData, intangibleBenefits: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                       />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-sm font-bold text-gray-700 mb-1">Strategic Fit</label>
                       <p className="text-xs text-gray-500 mb-2">How does this initiative fit with Quadient 2030 goals?</p>
                       <textarea 
                          rows={2}
                          value={formData.strategicFit}
                          onChange={(e) => setFormData({...formData, strategicFit: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                       />
                    </div>
                 </div>
              </section>

              {/* 4. IMPLEMENTATION & TOOLS */}
              <section>
                 <h3 className="text-lg font-bold text-quadient-orange border-b border-gray-200 pb-2 mb-4">4. Implementation, Tools & ROI</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="col-span-2">
                       <label className="block text-sm font-bold text-gray-700 mb-1">Proposed AI Tools & Team</label>
                       <p className="text-xs text-gray-500 mb-2">AI Tool identified? Vendor needed? Who is the team?</p>
                       <textarea 
                          rows={2}
                          value={formData.proposedTools}
                          onChange={(e) => setFormData({...formData, proposedTools: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                          placeholder="e.g. Using ChatGPT Enterprise, need Vendor X, Team: IT + Finance"
                       />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Complexity to implement</label>
                        <select 
                           value={formData.complexity}
                           onChange={(e) => setFormData({...formData, complexity: e.target.value as any})}
                           className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                        >
                           <option value="Low">Low - Quick Win</option>
                           <option value="Medium">Medium - Project</option>
                           <option value="High">High - Strategic Initiative</option>
                        </select>
                    </div>
                 </div>

                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
                    <Mail className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-blue-900">Implementation Cost Support</h4>
                        <p className="text-sm text-blue-800">
                           Not sure about license costs? Contact the CoE Team at <a href="mailto:coe-help@quadient.com" className="underline font-bold">coe-help@quadient.com</a>.
                        </p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Cost of Implementation Rating</label>
                       <p className="text-xs text-gray-500 mb-2">Select the estimated cost range.</p>
                       <select 
                           value={formData.costRating}
                           onChange={(e) => setFormData({...formData, costRating: e.target.value as any})}
                           className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                        >
                           <option value="Low">Low (&lt; €5k)</option>
                           <option value="Medium">Medium (€5k - €50k)</option>
                           <option value="High">High (&gt; €50k)</option>
                        </select>
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-700 mb-1">Cost of Implementation (€) - Optional</label>
                       <p className="text-xs text-gray-500 mb-2">Exact license costs, people/vendor costs.</p>
                       <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">€</span>
                          </div>
                          <input 
                            type="number"
                            value={formData.costEstimate || ''}
                            onChange={(e) => setFormData({...formData, costEstimate: parseInt(e.target.value)})}
                            className="focus:ring-quadient-orange focus:border-quadient-orange block w-full pl-7 sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="0.00"
                          />
                       </div>
                    </div>
                    <div className="col-span-2">
                       <label className="block text-sm font-bold text-gray-700 mb-1">Return on Investment (Description)</label>
                       <p className="text-xs text-gray-500 mb-2">Given costs and benefits, what is the ROI? What are the risks?</p>
                       <textarea 
                          rows={3}
                          value={formData.roiDescription}
                          onChange={(e) => setFormData({...formData, roiDescription: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-quadient-orange focus:border-quadient-orange sm:text-sm p-2 border"
                          placeholder="e.g. Payback in 6 months, Risk of low adoption..."
                       />
                    </div>
                 </div>
              </section>

              {/* 5. SUPPORTING DOCUMENTATION */}
              <section>
                 <h3 className="text-lg font-bold text-quadient-orange border-b border-gray-200 pb-2 mb-4">5. Supporting Documentation</h3>
                 
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                     <div className="space-y-4">
                         <div className="flex justify-center">
                             <div className="p-3 bg-white rounded-full shadow-sm">
                                <Upload className="w-8 h-8 text-quadient-orange" />
                             </div>
                         </div>
                         <div>
                             <p className="text-sm font-bold text-gray-900">Upload Evidence</p>
                             <p className="text-xs text-gray-500 mt-1">
                                Attach screenshots of the current process, excel spreadsheets with volume data, or PDF diagrams.
                             </p>
                         </div>
                         <div>
                             <input 
                               type="file" 
                               ref={fileInputRef}
                               multiple
                               className="hidden"
                               onChange={handleFileChange}
                               accept=".png,.jpg,.jpeg,.pdf,.xlsx,.csv,.doc,.docx"
                             />
                             <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-white border border-gray-300 shadow-sm rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-quadient-orange"
                             >
                                Browse Files
                             </button>
                         </div>
                     </div>
                 </div>

                 {/* File List */}
                 {formData.attachments && formData.attachments.length > 0 && (
                     <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                         {formData.attachments.map((file) => (
                             <div key={file.id} className="flex items-center p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
                                 <div className="flex-shrink-0 mr-3">
                                     {file.type === 'image' && <Image className="w-8 h-8 text-purple-500" />}
                                     {file.type === 'spreadsheet' && <FileSpreadsheet className="w-8 h-8 text-green-500" />}
                                     {file.type === 'pdf' && <FileIcon className="w-8 h-8 text-red-500" />}
                                     {(file.type === 'document' || file.type === 'other') && <FileText className="w-8 h-8 text-blue-500" />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                     <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                     <p className="text-xs text-gray-500">{file.size}</p>
                                 </div>
                                 <button 
                                    type="button" 
                                    onClick={() => removeAttachment(file.id)}
                                    className="ml-2 text-gray-400 hover:text-red-500"
                                 >
                                     <X className="w-5 h-5" />
                                 </button>
                             </div>
                         ))}
                     </div>
                 )}
              </section>

              <div className="pt-6 flex justify-end space-x-3 border-t border-gray-200 mt-8">
                <button type="button" className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Save Draft
                </button>
                <button type="submit" className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-quadient-orange hover:bg-orange-700">
                  {isEditing ? 'Update Idea' : 'Submit Business Case'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CHAT VIEW */}
        {mode === 'chat' && !isEditing && (
          <div className="flex-1 flex flex-col bg-gray-50">
            <div className="flex-1 p-6 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-quadient-orange text-white rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    {msg.link && (
                        <div className="mt-3 pt-2 border-t border-gray-200/50">
                            <Link 
                                to={msg.link} 
                                target="_blank"
                                className="flex items-center text-xs font-bold text-blue-600 hover:underline"
                            >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                {msg.linkText || 'View Related Idea'}
                            </Link>
                        </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-white border-t border-gray-200">
               <div className="flex items-center space-x-2 bg-gray-50 rounded-full border border-gray-300 px-4 py-2">
                 <Paperclip className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                 <input 
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm outline-none"
                    placeholder="Type your response..."
                 />
                 <Mic className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
                 <button 
                    onClick={handleChatSend}
                    className="bg-quadient-orange text-white p-2 rounded-full hover:bg-orange-700 transition"
                 >
                    <Send className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default IdeaIntake;