import React, { useState } from 'react';
import { Idea, IdeaStatus, User, UserRole } from '../types';
import { CheckCircle, XCircle, AlertCircle, MessageSquare, Download, Settings, ChevronDown, Landmark, Target } from 'lucide-react';

interface AdminConsoleProps {
  items: Idea[];
  currentUser: User;
  onApprove?: (id: string, routeType?: 'strategic' | 'standard') => void;
  onReject?: (id: string, reason: string) => void;
  onRequestInfo?: (id: string, question: string) => void;
}

const AVAILABLE_COLUMNS = [
  { key: 'department', label: 'Department' },
  { key: 'region', label: 'Region' },
  { key: 'status', label: 'Status' },
  { key: 'costEstimate', label: 'Cost Est.' },
  { key: 'benefitEstimate', label: 'Benefit Est.' },
  { key: 'strategicFit', label: 'Strategic Fit' },
  { key: 'ideaType', label: 'Type' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'coePriority', label: 'Priority' },
  { key: 'costRating', label: 'Cost Rating' },
  { key: 'benefitRating', label: 'Benefit Rating' },
  { key: 'createdAt', label: 'Created Date' }
];

const AdminConsole: React.FC<AdminConsoleProps> = ({ items, currentUser, onApprove, onReject, onRequestInfo }) => {
  const isCoE = currentUser.role === UserRole.COE_ADMIN;
  const isCouncil = currentUser.role === UserRole.AI_COUNCIL;
  const isBudgetOwner = currentUser.role === UserRole.REGIONAL_BUDGET_OWNER;

  // Filter based on role's stage
  const pendingItems = items.filter(i => {
      if (isCoE) return i.status === IdeaStatus.PENDING_COE;
      if (isCouncil) return i.status === IdeaStatus.PENDING_COUNCIL;
      if (isBudgetOwner) return i.status === IdeaStatus.PENDING_BUDGET_OWNER;
      return false;
  });
  
  // Modals State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestInfoModalOpen, setRequestInfoModalOpen] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  
  // Text Inputs
  const [rejectionReason, setRejectionReason] = useState('');
  const [infoQuestion, setInfoQuestion] = useState('');

  // Column State
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'department', 'costEstimate', 'benefitEstimate', 'strategicFit'
  ]);

  const openRejectModal = (id: string) => {
    setSelectedIdeaId(id);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const openRequestInfoModal = (id: string) => {
    setSelectedIdeaId(id);
    setInfoQuestion('');
    setRequestInfoModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedIdeaId && onReject) {
        onReject(selectedIdeaId, rejectionReason || 'No specific reason provided.');
    }
    setRejectModalOpen(false);
  };

  const handleConfirmRequestInfo = () => {
    if (selectedIdeaId && onRequestInfo) {
        onRequestInfo(selectedIdeaId, infoQuestion);
    }
    setRequestInfoModalOpen(false);
  };

  const toggleColumn = (key: string) => {
    if (visibleColumns.includes(key)) {
      setVisibleColumns(visibleColumns.filter(c => c !== key));
    } else {
      setVisibleColumns([...visibleColumns, key]);
    }
  };

  const handleExport = () => {
    if (pendingItems.length === 0) {
        alert("No pending items to export.");
        return;
    }

    const fixedHeaders = ["ID", "Title", "Submitter"];
    const dynamicHeaders = visibleColumns.map(col => AVAILABLE_COLUMNS.find(c => c.key === col)?.label || col);
    const headers = [...fixedHeaders, ...dynamicHeaders];

    const rows = pendingItems.map(item => {
        const fixedData = [
            item.id,
            `"${item.title.replace(/"/g, '""')}"`, 
            item.submitterId
        ];
        
        const dynamicData = visibleColumns.map(col => {
            const val = (item as any)[col];
            if (typeof val === 'number') return val;
            if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
            return val || '';
        });

        return [...fixedData, ...dynamicData];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pending_approvals_report_${new Date().toISOString().split('T')[0]}.csv`); 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Governance & Routing Console</h2>
            <p className="text-sm text-gray-500">Currently reviewing: Stage <strong>{currentUser.role}</strong></p>
        </div>
        <div className="space-x-3 flex items-center">
           <div className="relative">
             <button 
               onClick={() => setShowColumnSelector(!showColumnSelector)}
               className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
             >
               <Settings className="w-4 h-4 mr-2" />
               Customize View
               <ChevronDown className="w-3 h-3 ml-2" />
             </button>
             
             {showColumnSelector && (
               <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20 p-4">
                 <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Visible Columns</h4>
                 <div className="space-y-2 max-h-60 overflow-y-auto">
                    {AVAILABLE_COLUMNS.map(col => (
                      <label key={col.key} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns.includes(col.key)}
                          onChange={() => toggleColumn(col.key)}
                          className="rounded text-quadient-orange focus:ring-quadient-orange"
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                 </div>
               </div>
             )}
           </div>

           <button 
             onClick={handleExport}
             className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
           >
             <Download className="w-4 h-4 mr-2" />
             Export Report (.csv)
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto min-h-[400px]">
        <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Routing & Decisions - Comparison View</h3>
            <p className="text-sm text-gray-500">
                {isCoE && "Categorize initiatives as Strategic AI or Standard to route appropriately."}
                {isCouncil && "Final evaluation of Strategic AI initiatives for investment approval."}
                {isBudgetOwner && "Final approval for operational efficiency initiatives."}
            </p>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
             <tr>
                 <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-48 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">Metric</th>
                 {pendingItems.map(item => (
                     <th key={item.id} className="px-6 py-4 text-left text-sm font-bold text-gray-900 min-w-[220px] border-l border-gray-200">
                         {item.title}
                         <div className="text-xs font-normal text-gray-500 mt-1">by {item.submitterId}</div>
                     </th>
                 ))}
             </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
             {visibleColumns.map(colKey => {
               const colDef = AVAILABLE_COLUMNS.find(c => c.key === colKey);
               return (
                 <tr key={colKey}>
                    <td className="px-6 py-4 text-sm font-bold text-gray-500 sticky left-0 bg-white z-10 border-r border-gray-200">
                      {colDef?.label}
                    </td>
                    {pendingItems.map(item => {
                      const val = (item as any)[colKey];
                      return (
                        <td key={item.id} className="px-6 py-4 text-sm text-gray-900 border-l border-gray-200">
                           {colKey.toLowerCase().includes('cost') || colKey.toLowerCase().includes('benefit') && typeof val === 'number' 
                              ? `€${val.toLocaleString()}`
                              : val
                           }
                        </td>
                      );
                    })}
                 </tr>
               );
             })}

             <tr className="bg-gray-50">
                 <td className="px-6 py-4 text-sm font-bold text-gray-500 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">Decision/Route</td>
                 {pendingItems.map(item => (
                     <td key={item.id} className="px-6 py-4 text-sm text-gray-900 border-l border-gray-200">
                         <div className="flex flex-col space-y-2">
                             {item.status === IdeaStatus.PENDING_COE && isCoE && (
                                 <>
                                     <button 
                                        onClick={() => onApprove && onApprove(item.id, 'strategic')}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-xs font-medium flex justify-center items-center transition-colors"
                                     >
                                         <Target className="w-3 h-3 mr-1" /> Route: AI Council
                                     </button>
                                     <button 
                                        onClick={() => onApprove && onApprove(item.id, 'standard')}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs font-medium flex justify-center items-center transition-colors"
                                     >
                                         <Landmark className="w-3 h-3 mr-1" /> Route: Budget Owner
                                     </button>
                                 </>
                             )}
                             {((item.status === IdeaStatus.PENDING_COUNCIL && isCouncil) || 
                               (item.status === IdeaStatus.PENDING_BUDGET_OWNER && isBudgetOwner)) && (
                                 <button 
                                    onClick={() => onApprove && onApprove(item.id)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs font-medium flex justify-center items-center transition-colors"
                                 >
                                     <CheckCircle className="w-3 h-3 mr-1" /> Final Approve
                                 </button>
                             )}
                             <button 
                                onClick={() => openRejectModal(item.id)}
                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded text-xs font-medium flex justify-center items-center transition-colors"
                             >
                                 <XCircle className="w-3 h-3 mr-1" /> Reject
                             </button>
                             <button 
                                onClick={() => openRequestInfoModal(item.id)}
                                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-3 rounded text-xs font-medium flex justify-center items-center transition-colors"
                             >
                                 <MessageSquare className="w-3 h-3 mr-1" /> Request Info
                             </button>
                         </div>
                     </td>
                 ))}
             </tr>
          </tbody>
        </table>
        {pendingItems.length === 0 && (
            <div className="p-8 text-center text-gray-500">
                No items currently pending review for your role's stage.
            </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center mb-4 text-red-600">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-bold">Reject Idea</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                    Please provide a reason for rejecting this idea.
                </p>
                <textarea
                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-red-500 focus:border-red-500"
                    rows={4}
                    placeholder="Reason for rejection (required)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                ></textarea>
                <div className="mt-6 flex justify-end space-x-3">
                    <button 
                        onClick={() => setRejectModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmReject}
                        disabled={!rejectionReason.trim()}
                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Confirm Rejection
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Request Info Modal */}
      {requestInfoModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center mb-4 text-blue-600">
                    <MessageSquare className="w-6 h-6 mr-2" />
                    <h3 className="text-lg font-bold">Request More Information</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                    What information is missing? Status will change to "Changes Requested".
                </p>
                <textarea
                    className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="E.g., Please provide more details on the vendor costs..."
                    value={infoQuestion}
                    onChange={(e) => setInfoQuestion(e.target.value)}
                ></textarea>
                <div className="mt-6 flex justify-end space-x-3">
                    <button 
                        onClick={() => setRequestInfoModalOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirmRequestInfo}
                        disabled={!infoQuestion.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send Request
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminConsole;