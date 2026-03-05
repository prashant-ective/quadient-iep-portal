import React from 'react';
import { Idea, IdeaStatus, Project, User, UserRole } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FileText, Zap, CheckCircle, Clock, ArrowRight, BadgeAlert, Trash2, Pencil, XCircle, TrendingUp, Layers, Award, Target, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: User;
  ideas: Idea[];
  projects: Project[];
  onDeleteIdea?: (id: string) => void;
  onApprove?: (id: string, routeType?: 'strategic' | 'standard') => void;
  onReject?: (id: string, reason: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, ideas, projects, onDeleteIdea, onApprove, onReject }) => {
  
  const isCouncil = user.role === UserRole.AI_COUNCIL;
  const isCoE = user.role === UserRole.COE_ADMIN;
  const isBudgetOwner = user.role === UserRole.REGIONAL_BUDGET_OWNER;
  const isApprover = isCoE || isCouncil || isBudgetOwner; 

  const myIdeas = ideas.filter(i => i.submitterId === user.id);
  
  // Specific view based on role stage
  let pendingIdeas = ideas.filter(i => {
      if (isCoE) return i.status === IdeaStatus.PENDING_COE;
      if (isCouncil) return i.status === IdeaStatus.PENDING_COUNCIL;
      if (isBudgetOwner) return i.status === IdeaStatus.PENDING_BUDGET_OWNER;
      return false;
  });
  
  const drafts = myIdeas.filter(i => i.status === 'Draft').length;
  const pendingCount = isApprover ? pendingIdeas.length : myIdeas.filter(i => i.status.includes('Pending')).length;
  const activeProjectsCount = projects.length; 

  const pipelineData = [
    { name: 'Discovery', count: projects.filter(p => p.stage === 'Discovery').length + 2 }, 
    { name: 'Pilot', count: projects.filter(p => p.stage === 'Pilot').length + 1 },
    { name: 'Scaling', count: projects.filter(p => p.stage === 'Scaling').length + 1 },
    { name: 'Done', count: projects.filter(p => p.stage === 'Done').length + 5 },
  ];

  const benefitsData = [
    { name: 'Q1', planned: 4000, actual: 2400 },
    { name: 'Q2', planned: 3000, actual: 1398 },
    { name: 'Q3', planned: 2000, actual: 9800 },
    { name: 'Q4', planned: 2780, actual: 3908 },
  ];
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const uniqueIds = new Set();
  const allItems: (Idea | Project)[] = [];
  [...projects, ...ideas].forEach(item => {
      if(!uniqueIds.has(item.id)){
          uniqueIds.add(item.id);
          allItems.push(item);
      }
  });

  const processStatsMap = new Map<string, { total: number; topPriority: number; ideas: (Idea | Project)[] }>();

  if (isCouncil) {
      allItems.forEach(item => {
          const procString = item.keyImpactedProcesses || 'Uncategorized';
          const procs = procString.split(',').map(s => s.trim());
          
          procs.forEach(proc => {
             if (proc) {
                 if (!processStatsMap.has(proc)) {
                     processStatsMap.set(proc, { total: 0, topPriority: 0, ideas: [] });
                 }
                 const entry = processStatsMap.get(proc)!;
                 entry.total += 1;
                 if (item.coePriority === 'Top Priority') {
                     entry.topPriority += 1;
                 }
                 entry.ideas.push(item);
             }
          });
      });
  }

  const processInsights = Array.from(processStatsMap.entries())
      .map(([name, data]) => ({
          name,
          total: data.total,
          topPriority: data.topPriority,
          topIdeas: data.ideas.sort((a, b) => (b.benefitEstimate || 0) - (a.benefitEstimate || 0)).slice(0, 3)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); 

  const topPriorityList = allItems.filter(i => i.coePriority === 'Top Priority');

  const handleDelete = (id: string, title: string) => {
      if (confirm(`Are you sure you want to discard the idea "${title}"? This action cannot be undone.`)) {
          if (onDeleteIdea) onDeleteIdea(id);
      }
  };

  const handleRouteToCouncil = (id: string) => {
      if (confirm("Route this Strategic AI initiative to the AI Council?")) {
          if (onApprove) onApprove(id, 'strategic');
      }
  };

  const handleRouteToBudgetOwner = (id: string) => {
      if (confirm("Route this request to the Regional Budget Owner?")) {
          if (onApprove) onApprove(id, 'standard');
      }
  };

  const handleQuickApprove = (id: string) => {
    if (confirm("Confirm final approval for this request?")) {
        if (onApprove) onApprove(id);
    }
  };

  const handleQuickReject = (id: string) => {
      const reason = prompt("Please provide a reason for rejection:");
      if (reason && onReject) {
          onReject(id, reason);
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-2">
              {isCouncil 
                ? 'Strategic overview of the innovation pipeline and priorities.' 
                : isCoE 
                    ? 'Governance and routing center for all innovation initiatives.'
                    : isBudgetOwner
                        ? 'Operational review and regional budget approvals.'
                        : 'Track your innovation journey and submitted ideas.'
              }
          </p>
        </div>
        <Link to="/submit" className="bg-quadient-orange hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-all flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Quick Submit Idea
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link to="/projects?status=Draft&mode=mine" className="block transform transition hover:scale-105">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full cursor-pointer hover:border-quadient-orange/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">My Drafts</h3>
              <FileText className="text-gray-400 w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{drafts}</p>
          </div>
        </Link>

        <Link to={isApprover ? "/admin" : "/projects?status=Pending&mode=mine"} className="block transform transition hover:scale-105">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full cursor-pointer hover:border-quadient-orange/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">{isApprover ? 'Action Required' : 'Pending Review'}</h3>
              <Clock className="text-yellow-500 w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
          </div>
        </Link>

        <Link to="/projects?status=Project%20Active" className="block transform transition hover:scale-105">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full cursor-pointer hover:border-quadient-orange/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 font-medium">Active Projects</h3>
              <Zap className="text-quadient-orange w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeProjectsCount}</p>
          </div>
        </Link>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total ROI (YTD)</h3>
            <CheckCircle className="text-green-500 w-6 h-6" />
          </div>
          <p className="text-3xl font-bold text-gray-900">€1.2M</p>
        </div>
      </div>
      
      {isCouncil ? (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Benefits Realized (k€)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={benefitsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                        />
                        <Legend />
                        <Bar dataKey="planned" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="actual" fill="#FF6A00" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Project Pipeline by Stage</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={pipelineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        >
                        {pipelineData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-quadient-orange" />
                        Idea Volume & Priority by Process
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={processInsights} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11}} />
                            <Tooltip cursor={{fill: 'transparent'}} wrapperStyle={{ zIndex: 100 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            <Legend />
                            <Bar dataKey="total" name="Total Ideas" fill="#E5E7EB" barSize={20} radius={[0, 4, 4, 0]} />
                            <Bar dataKey="topPriority" name="Top Priority" fill="#EF4444" barSize={20} radius={[0, 4, 4, 0]} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-y-auto max-h-[400px]">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Layers className="w-5 h-5 mr-2 text-blue-500" />
                        Top Innovation Sources
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">Business Areas submitting the top 3 highest value ideas per process.</p>
                    
                    <div className="space-y-6">
                        {processInsights.map((process, idx) => (
                            <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-gray-800 text-sm">{process.name}</h4>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                        {process.total} ideas
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {process.topIdeas.map((idea, i) => (
                                        <div key={i} className="flex items-center bg-blue-50 text-blue-800 text-xs px-3 py-1.5 rounded-lg border border-blue-100">
                                            <span className="font-bold mr-1">{idea.department}</span>
                                            <span className="text-blue-600 opacity-75 truncate max-w-[120px]">
                                                - {idea.title}
                                            </span>
                                        </div>
                                    ))}
                                    {process.topIdeas.length === 0 && <span className="text-xs text-gray-400 italic">No ideas yet</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
                    <h3 className="font-bold text-red-900 text-lg flex items-center">
                        <BadgeAlert className="w-5 h-5 mr-2 text-red-600" />
                        Top Priority Initiatives
                    </h3>
                    <div className="flex items-center space-x-4">
                        {isCouncil && pendingIdeas.length > 0 && (
                            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                                {pendingIdeas.length} Decisions Needed
                            </span>
                        )}
                        <Link to="/projects?status=All" className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center">
                            View Full Pipeline <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Idea Title</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Submitter</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Process</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Benefit Est.</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {topPriorityList.length > 0 ? topPriorityList.map(idea => (
                                <tr key={idea.id} className="hover:bg-red-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900 text-sm">{idea.title}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{idea.submitterId}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{idea.department}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{idea.keyImpactedProcesses || 'N/A'}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            idea.status.includes('Approved') || idea.status.includes('Active') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {idea.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                                        €{idea.benefitEstimate.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end space-x-2">
                                        {idea.status === IdeaStatus.PENDING_COUNCIL && (
                                            <button 
                                                onClick={() => handleQuickApprove(idea.id)}
                                                className="text-green-600 hover:text-green-800 p-1 bg-green-50 rounded"
                                                title="Approve"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                        <Link to={`/idea/${idea.id}`} className="text-quadient-orange hover:text-orange-800 text-sm font-medium p-1">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">No Top Priority ideas found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      ) : (
        <>
            <div className={`grid grid-cols-1 ${isApprover ? 'lg:grid-cols-2' : ''} gap-8`}>
                {isApprover && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Benefits Realized (k€)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={benefitsData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                            />
                            <Legend />
                            <Bar dataKey="planned" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="actual" fill="#FF6A00" radius={[4, 4, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
                </div>
                </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Project Pipeline by Stage</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={pipelineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        >
                        {pipelineData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg">
                    {isApprover ? 'Action Required: Governance Pipeline' : 'My Submitted Ideas'}
                </h3>
                <Link to={isApprover ? "/admin" : "/projects?mode=mine"} className="text-sm text-quadient-orange hover:text-orange-700 flex items-center font-medium">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                </div>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Idea Title</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {isApprover ? 'Status' : 'Progress'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">COE Priority</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cost Rating</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Benefit Rating</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {(isApprover ? pendingIdeas : myIdeas).length > 0 ? (isApprover ? pendingIdeas : myIdeas).map(idea => (
                        <tr key={idea.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-bold text-gray-900">{idea.title}</p>
                            <p className="text-xs text-gray-500">{new Date(idea.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                idea.status === 'Approved' || idea.status === 'Project Active' ? 'bg-green-100 text-green-800' :
                                idea.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                idea.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {idea.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            {idea.coePriority === 'Top Priority' ? (
                            <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit">
                                <BadgeAlert className="w-3 h-3 mr-1" /> Top Priority
                            </span>
                            ) : (
                            <span className="text-xs text-gray-500">{idea.coePriority || 'Standard'}</span>
                            )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                idea.costRating === 'High' ? 'bg-red-50 text-red-700' :
                                idea.costRating === 'Medium' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                            }`}>
                                {idea.costRating || 'N/A'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                idea.benefitRating === 'High' ? 'bg-green-50 text-green-700' :
                                idea.benefitRating === 'Medium' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                                {idea.benefitRating || 'N/A'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex items-center justify-end space-x-2">
                            {isApprover ? (
                                <>
                                    {isCoE && idea.status === IdeaStatus.PENDING_COE && (
                                        <>
                                            <button 
                                                onClick={() => handleRouteToCouncil(idea.id)}
                                                className="text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 p-1.5 rounded transition-colors flex items-center"
                                                title="Route to AI Council (Strategic)"
                                            >
                                                <Target className="w-4 h-4 mr-1" /> Strategic
                                            </button>
                                            <button 
                                                onClick={() => handleRouteToBudgetOwner(idea.id)}
                                                className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition-colors flex items-center"
                                                title="Route to Regional Budget Owner"
                                            >
                                                <Landmark className="w-4 h-4 mr-1" /> Standard
                                            </button>
                                        </>
                                    )}
                                    
                                    {((isCouncil && idea.status === IdeaStatus.PENDING_COUNCIL) || 
                                      (isBudgetOwner && idea.status === IdeaStatus.PENDING_BUDGET_OWNER)) && (
                                        <button 
                                            onClick={() => handleQuickApprove(idea.id)}
                                            className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-1.5 rounded transition-colors"
                                            title="Final Approve"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => handleQuickReject(idea.id)}
                                        className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-1.5 rounded transition-colors"
                                        title="Reject"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to={`/edit/${idea.id}`} className="text-gray-400 hover:text-blue-600 transition-colors" title="Edit Idea">
                                        <Pencil className="w-5 h-5" />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(idea.id, idea.title)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        title="Discard Idea"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                            <Link to={`/idea/${idea.id}`} className="text-gray-400 hover:text-quadient-orange" title="View Details">
                            <ArrowRight className="w-5 h-5" />
                            </Link>
                        </td>
                        </tr>
                    )) : (
                        <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                            {isApprover 
                                ? "No items currently assigned to your stage in the governance pipeline." 
                                : "You haven't submitted any ideas yet."
                            }
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;