
import React, { useState } from 'react';
import { Idea, Project, User, IdeaStatus, ProjectStage } from '../types';
import { Heart, MessageSquare, Share2, ArrowLeft, Clock, MapPin, Briefcase, Zap, Send, Activity, DollarSign, Calendar, AlertTriangle, Users, Mail, XCircle, FileSpreadsheet, Image, FileText, Download, File, Pencil, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IdeaDetailProps {
  idea: Idea | Project;
  currentUser: User;
  onFollowToggle: (ideaId: string) => void;
  onAddComment: (ideaId: string, text: string) => void;
  onDelete?: (id: string) => void;
}

const IdeaDetail: React.FC<IdeaDetailProps> = ({ idea, currentUser, onFollowToggle, onAddComment, onDelete }) => {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'business' | 'execution' | 'discussion'>('business');
  
  const isFollowing = idea.followers.includes(currentUser.id);
  const isProject = idea.status === IdeaStatus.PROJECT_ACTIVE || idea.status === IdeaStatus.APPROVED;
  const projectData = isProject ? (idea as Project) : null;
  const isOwner = currentUser.id === idea.submitterId;

  // Ensure we default to execution tab if it is a project to show KPIs immediately
  React.useEffect(() => {
    if (isProject) {
        setActiveTab('execution');
    }
  }, [isProject]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(idea.id, newComment);
    setNewComment('');
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to discard "${idea.title}"? This action cannot be undone.`)) {
        if (onDelete) {
            onDelete(idea.id);
            navigate('/');
        }
    }
  };

  const getStatusColor = (status: string) => {
      if (status === 'Green') return 'bg-green-500';
      if (status === 'Amber') return 'bg-yellow-500';
      return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
         <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{idea.title}</h1>
                  {idea.status === IdeaStatus.REJECTED && (
                      <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-bold flex items-center">
                          <XCircle className="w-4 h-4 mr-1"/> Rejected
                      </span>
                  )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                 <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isProject ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {projectData?.stage || idea.status}
                 </span>
                 <span>Created {new Date(idea.createdAt).toLocaleDateString()}</span>
                 {isProject && <span>• Owner: {projectData?.owner}</span>}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
                {isOwner && (
                    <>
                        <Link 
                            to={`/edit/${idea.id}`}
                            className="flex items-center px-4 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                        </Link>
                        <button 
                            onClick={handleDelete}
                            className="flex items-center px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 transition-all"
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Discard
                        </button>
                    </>
                )}
                <button 
                  onClick={() => onFollowToggle(idea.id)}
                  className={`flex items-center px-4 py-2 rounded-full border transition-all ${
                    isFollowing 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                   <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                   {isFollowing ? 'Following' : 'Follow'}
                </button>
            </div>
         </div>

         {/* Rejection Reason Banner */}
         {idea.status === IdeaStatus.REJECTED && idea.rejectionReason && (
             <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
                 <h4 className="text-red-800 font-bold text-sm uppercase">Reason for Rejection</h4>
                 <p className="text-red-700 mt-1">{idea.rejectionReason}</p>
             </div>
         )}

         {/* Tab Navigation */}
         <div className="border-b border-gray-200 mt-8">
            <nav className="-mb-px flex space-x-8">
                <button 
                    onClick={() => setActiveTab('execution')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'execution' ? 'border-quadient-orange text-quadient-orange' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} ${!isProject ? 'hidden' : ''}`}
                >
                    Project Execution
                </button>
                <button 
                    onClick={() => setActiveTab('business')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'business' ? 'border-quadient-orange text-quadient-orange' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Business Case
                </button>
                <button 
                    onClick={() => setActiveTab('discussion')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'discussion' ? 'border-quadient-orange text-quadient-orange' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Discussion <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{idea.comments.length}</span>
                </button>
            </nav>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* --- EXECUTION TAB (PMO/PMI KPIs) --- */}
            {activeTab === 'execution' && projectData && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Health Status</h4>
                             <div className="flex items-center space-x-3">
                                 <div className={`w-4 h-4 rounded-full ${getStatusColor(projectData.ragStatus || 'Green')}`}></div>
                                 <span className="text-2xl font-bold text-gray-900">{projectData.ragStatus || 'Green'}</span>
                             </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Budget Consumed</h4>
                             <div className="flex items-center space-x-2">
                                 <DollarSign className="w-5 h-5 text-gray-400"/>
                                 <span className="text-2xl font-bold text-gray-900">
                                     {Math.round(((projectData.financials?.actuals || 0) / (projectData.financials?.budget || 1)) * 100)}%
                                 </span>
                             </div>
                             <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${Math.round(((projectData.financials?.actuals || 0) / (projectData.financials?.budget || 1)) * 100)}%`}}></div>
                             </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Days Remaining</h4>
                             <div className="flex items-center space-x-2">
                                 <Calendar className="w-5 h-5 text-gray-400"/>
                                 <span className="text-2xl font-bold text-gray-900">45</span>
                             </div>
                             <p className="text-xs text-gray-500 mt-1">Target: {projectData.targetCompletionDate}</p>
                        </div>
                    </div>

                    {/* Financials Details */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                             <DollarSign className="w-5 h-5 mr-2 text-quadient-orange"/> Financial Overview
                         </h3>
                         <div className="grid grid-cols-3 gap-6 text-center mb-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase">Budget</p>
                                <p className="text-xl font-bold text-gray-900">€{projectData.financials?.budget.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase">Actuals</p>
                                <p className="text-xl font-bold text-blue-600">€{projectData.financials?.actuals.toLocaleString()}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase">Forecast</p>
                                <p className="text-xl font-bold text-gray-900">€{projectData.financials?.forecast.toLocaleString()}</p>
                            </div>
                         </div>
                    </div>

                    {/* Milestones */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                             <Activity className="w-5 h-5 mr-2 text-quadient-orange"/> Project Milestones
                         </h3>
                         <div className="space-y-4">
                             {projectData.milestones?.map(m => (
                                 <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                     <div className="flex items-center space-x-3">
                                         <div className={`w-3 h-3 rounded-full ${m.status === 'Completed' ? 'bg-green-500' : m.status === 'Delayed' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                         <span className="font-medium text-gray-900">{m.name}</span>
                                     </div>
                                     <div className="flex items-center space-x-4">
                                         <span className="text-sm text-gray-500">{m.dueDate}</span>
                                         <span className={`text-xs px-2 py-1 rounded-full ${m.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                                             {m.status}
                                         </span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>

                    {/* Risk Register */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                             <AlertTriangle className="w-5 h-5 mr-2 text-red-500"/> Risk Register
                         </h3>
                         <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                     <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Risk</th>
                                     <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Impact</th>
                                     <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Mitigation</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100">
                                 {projectData.riskRegister?.map(r => (
                                     <tr key={r.id}>
                                         <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.description}</td>
                                         <td className="px-4 py-3">
                                             <span className={`text-xs px-2 py-1 rounded font-bold ${r.impact === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                 {r.impact}
                                             </span>
                                         </td>
                                         <td className="px-4 py-3 text-sm text-gray-600">{r.mitigation}</td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                    </div>

                    {/* Team Roster */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                             <Users className="w-5 h-5 mr-2 text-quadient-orange"/> Project Team
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {projectData.team?.map(member => (
                                 <div key={member.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-3">
                                         {member.avatar ? <img src={member.avatar} className="w-10 h-10 rounded-full"/> : member.name.charAt(0)}
                                     </div>
                                     <div className="flex-1 overflow-hidden">
                                         <p className="font-bold text-gray-900 truncate">{member.name}</p>
                                         <p className="text-xs text-gray-500 truncate">{member.role} • {member.department}</p>
                                     </div>
                                     <a href={`mailto:${member.email}`} className="p-2 text-gray-400 hover:text-quadient-orange">
                                         <Mail className="w-4 h-4" />
                                     </a>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
            )}

            {/* --- BUSINESS CASE TAB --- */}
            {activeTab === 'business' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8 animate-in fade-in">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Pain Point & Description</h3>
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{idea.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                         <div>
                             <h4 className="text-sm font-bold text-gray-900 mb-2">Strategic Fit</h4>
                             <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">{idea.strategicFit}</p>
                         </div>
                         <div>
                             <h4 className="text-sm font-bold text-gray-900 mb-2">Idea Type & Tags</h4>
                             <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">{idea.ideaType}</span>
                                {idea.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-orange-50 text-orange-800 rounded-full text-xs">#{tag}</span>
                                ))}
                             </div>
                         </div>
                    </div>
                    
                    {/* Attachments Section */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <FileSpreadsheet className="w-5 h-5 mr-2 text-quadient-orange"/> Supporting Documentation
                        </h3>
                        {idea.attachments && idea.attachments.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {idea.attachments.map(att => (
                                    <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition group">
                                        <div className="flex-shrink-0 mr-4">
                                            {att.type === 'image' && <Image className="w-10 h-10 text-purple-600 bg-purple-50 p-2 rounded-lg" />}
                                            {att.type === 'spreadsheet' && <FileSpreadsheet className="w-10 h-10 text-green-600 bg-green-50 p-2 rounded-lg" />}
                                            {att.type === 'pdf' && <FileText className="w-10 h-10 text-red-600 bg-red-50 p-2 rounded-lg" />}
                                            {(att.type === 'document' || att.type === 'other') && <File className="w-10 h-10 text-blue-600 bg-blue-50 p-2 rounded-lg" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-quadient-orange">{att.name}</p>
                                            <p className="text-xs text-gray-500">{att.size} • {att.type.toUpperCase()}</p>
                                        </div>
                                        <Download className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center">
                                No documentation attached to this idea.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- DISCUSSION TAB --- */}
            {activeTab === 'discussion' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                 <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-gray-400" />
                    Discussion ({idea.comments.length})
                 </h3>
                 {/* Comment Input */}
                 <div className="flex space-x-4 mb-8">
                    <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full border border-gray-200" />
                    <form className="flex-1" onSubmit={handleSubmitComment}>
                       <div className="relative">
                         <textarea
                           value={newComment}
                           onChange={e => setNewComment(e.target.value)}
                           className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-quadient-orange focus:border-quadient-orange shadow-sm resize-none"
                           placeholder="Ask a question or share your thoughts..."
                           rows={3}
                         />
                         <button 
                           type="submit"
                           className="absolute bottom-2 right-2 p-1.5 bg-quadient-orange text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                           disabled={!newComment.trim()}
                         >
                           <Send className="w-4 h-4" />
                         </button>
                       </div>
                    </form>
                 </div>
                 {/* Comment List */}
                 <div className="space-y-6">
                   {idea.comments.length === 0 ? (
                     <p className="text-center text-gray-500 py-4 italic">No comments yet. Be the first to share your thoughts!</p>
                   ) : (
                     idea.comments.map(comment => (
                       <div key={comment.id} className="flex space-x-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <img src={comment.authorAvatar} alt={comment.authorName} className="w-10 h-10 rounded-full border border-gray-200" />
                          <div className="flex-1 bg-gray-50 rounded-lg p-4">
                             <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm text-gray-900">{comment.authorName}</span>
                                <span className="text-xs text-gray-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                             </div>
                             <p className="text-gray-800 text-sm">{comment.text}</p>
                          </div>
                       </div>
                     ))
                   )}
                 </div>
              </div>
            )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           {/* ROI Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Business Case</h3>
              <div className="space-y-4">
                 <div>
                    <span className="text-sm text-gray-500">Est. Benefit (Annual)</span>
                    <p className="text-2xl font-bold text-green-600">€{idea.benefitEstimate.toLocaleString()}</p>
                 </div>
                 <div>
                    <span className="text-sm text-gray-500">Est. Cost</span>
                    <p className="text-xl font-bold text-gray-900">€{idea.costEstimate.toLocaleString()}</p>
                 </div>
                 <div className="pt-2">
                    <span className="text-sm text-gray-500">ROI Calculation</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                       <div className="bg-green-500 h-2 rounded-full" style={{width: '80%'}}></div>
                    </div>
                    <p className="text-xs text-right text-gray-400 mt-1">High Return Potential</p>
                 </div>
              </div>
           </div>

           {/* Owner Card */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Ownership</h3>
              <div className="flex items-center space-x-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                    {idea.submitterId.substring(0,2).toUpperCase()}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-gray-900">Submitter ID: {idea.submitterId}</p>
                    <p className="text-xs text-gray-500">{idea.department} • {idea.region}</p>
                 </div>
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                 <Briefcase className="w-4 h-4 mr-2 text-gray-400" /> {idea.department}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                 <MapPin className="w-4 h-4 mr-2 text-gray-400" /> {idea.region}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetail;
