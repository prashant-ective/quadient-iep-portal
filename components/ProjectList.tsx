
import React, { useState, useEffect } from 'react';
import { Idea, IdeaStatus, Project, User } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ArrowUpRight, ChevronRight, Search, FileText, Settings, ChevronDown, Check, User as UserIcon } from 'lucide-react';

interface ProjectListProps {
  items: (Idea | Project)[];
  currentUser: User;
  type?: 'idea' | 'project';
  users?: User[];
}

const ProjectList: React.FC<ProjectListProps> = ({ items, currentUser, type, users }) => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const filterStatusParam = searchParams.get('status');
  const filterMode = searchParams.get('mode'); // 'mine' or undefined
  
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState(filterStatusParam || 'All');
  const [filterSubmitter, setFilterSubmitter] = useState(filterMode === 'mine' ? 'My Submissions' : 'All');
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  // Column Visibility State
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'owner', 'department', 'region', 'status', 'benefit'
  ]);

  const AVAILABLE_COLUMNS = [
    { id: 'owner', label: 'Owner/Submitter' },
    { id: 'department', label: 'Business Area' },
    { id: 'region', label: 'Region' },
    { id: 'status', label: 'Status / Stage' },
    { id: 'benefit', label: 'Benefit Est.' },
    { id: 'cost', label: 'Cost Est.' },
    { id: 'priority', label: 'Priority' },
    { id: 'id', label: 'ID' }
  ];

  // Update local state if URL param changes
  useEffect(() => {
    const query = searchParams.get('q');
    if (query !== null) setSearchTerm(query);
    
    const status = searchParams.get('status');
    if (status !== null) setFilterStatus(status);
    
    const mode = searchParams.get('mode');
    if (mode === 'mine') {
        setFilterSubmitter('My Submissions');
    }
  }, [searchParams]);

  const toggleColumn = (colId: string) => {
    if (visibleColumns.includes(colId)) {
      setVisibleColumns(prev => prev.filter(c => c !== colId));
    } else {
      setVisibleColumns(prev => [...prev, colId]);
    }
  };

  // Derive unique lists for dropdowns
  const departments = Array.from(new Set(items.map(i => i.department))).sort();
  const allStatuses = Array.from(new Set(items.map(i => i.status))).sort();
  // Fixed: Explicitly type uniqueSubmitterIds as string[] to avoid unknown type inference issues
  const uniqueSubmitterIds: string[] = Array.from(new Set(items.map(i => i.submitterId))).sort();

  const getUserName = (id: string) => {
      const u = users?.find(user => user.id === id);
      return u ? u.name : id;
  };

  // Determine Title
  let pageTitle = 'Idea Pipeline';
  if (filterStatus === 'Draft') pageTitle = 'My Drafts';
  else if (filterStatus === 'Pending') pageTitle = 'Pending Reviews';
  else if (filterStatus === 'Project Active') pageTitle = 'Active Projects';
  else if (type === 'project') pageTitle = 'Active Projects';

  const filteredItems = items.filter(item => {
    // 1. Status Filter
    let matchesStatus = true;
    if (filterStatus !== 'All') {
        if (filterStatus === 'Pending') {
            matchesStatus = item.status.includes('Pending');
        } else {
            matchesStatus = item.status === filterStatus;
        }
    } else {
        // Default behavior: hide Drafts if no specific status requested (Public View)
        // Unless user selected 'All' explicitly, or filtering by 'My Submissions', we usually hide Drafts of others.
        if (item.status === 'Draft' && item.submitterId !== currentUser.id) matchesStatus = false;
    }

    // 2. Submitter Filter
    let matchesSubmitter = true;
    if (filterSubmitter === 'My Submissions') {
        matchesSubmitter = item.submitterId === currentUser.id;
    } else if (filterSubmitter !== 'All') {
        matchesSubmitter = item.submitterId === filterSubmitter;
    }

    // 3. Region Filter
    const matchesRegion = filterRegion === 'All' || item.region === filterRegion;

    // 4. Department Filter
    const matchesDept = filterDepartment === 'All' || item.department === filterDepartment;

    // 5. Search Filter
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item as Project).owner?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.submitterId.toLowerCase().includes(searchTerm.toLowerCase());
                          
    return matchesStatus && matchesSubmitter && matchesRegion && matchesDept && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
      {/* Header Controls */}
      <div className="p-6 border-b border-gray-100 flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                {filterStatus === 'Draft' && <FileText className="w-5 h-5 mr-2 text-gray-400" />}
                {pageTitle}
            </h2>
            <div className="flex space-x-2">
                <div className="relative flex-1 md:w-64">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-quadient-orange focus:border-quadient-orange w-full"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
            </div>
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                    <select 
                        value={filterRegion}
                        onChange={(e) => setFilterRegion(e.target.value)}
                        className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-quadient-orange focus:border-quadient-orange appearance-none bg-white min-w-[120px]"
                    >
                        <option value="All">All Regions</option>
                        <option value="NA">North America</option>
                        <option value="EU">Europe</option>
                        <option value="Global">Global</option>
                        <option value="APAC">APAC</option>
                    </select>
                    <Filter className="w-3 h-3 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                <div className="relative">
                    <select 
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                        className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-quadient-orange focus:border-quadient-orange appearance-none bg-white min-w-[140px]"
                    >
                        <option value="All">All Business Areas</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    <Filter className="w-3 h-3 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                <div className="relative">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-quadient-orange focus:border-quadient-orange appearance-none bg-white min-w-[140px]"
                    >
                        <option value="All">All Statuses</option>
                        {allStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <Filter className="w-3 h-3 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>

                <div className="relative">
                    <select 
                        value={filterSubmitter}
                        onChange={(e) => setFilterSubmitter(e.target.value)}
                        className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-xs font-medium focus:ring-quadient-orange focus:border-quadient-orange appearance-none bg-white min-w-[140px]"
                    >
                        <option value="All">All Submitters</option>
                        <option value="My Submissions">My Submissions</option>
                        {uniqueSubmitterIds.filter(id => id !== currentUser.id).map(id => (
                            <option key={id} value={id}>{getUserName(id)}</option>
                        ))}
                    </select>
                    <UserIcon className="w-3 h-3 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
            </div>

            {/* Column Selector */}
            <div className="relative">
                <button 
                  onClick={() => setShowColumnSelector(!showColumnSelector)}
                  className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                    <Settings className="w-3.5 h-3.5 mr-2 text-gray-500" />
                    Columns
                    <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
                </button>
                
                {showColumnSelector && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-2 animate-in fade-in zoom-in duration-100">
                        <div className="space-y-1">
                            {AVAILABLE_COLUMNS.map(col => (
                                <button
                                    key={col.id}
                                    onClick={() => toggleColumn(col.id)}
                                    className="flex items-center w-full px-2 py-1.5 text-xs text-left rounded-md hover:bg-gray-100"
                                >
                                    <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${visibleColumns.includes(col.id) ? 'bg-quadient-orange border-quadient-orange' : 'border-gray-300'}`}>
                                        {visibleColumns.includes(col.id) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-gray-700">{col.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Always show Title */}
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Title
              </th>

              {/* Dynamic Columns */}
              {visibleColumns.includes('id') && (
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
              )}
              {visibleColumns.includes('owner') && (
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Owner/Submitter</th>
              )}
              {visibleColumns.includes('department') && (
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Business Area</th>
              )}
              {visibleColumns.includes('region') && (
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Region</th>
              )}
              {visibleColumns.includes('status') && (
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status / Stage</th>
              )}
              {visibleColumns.includes('priority') && (
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
              )}
              {visibleColumns.includes('benefit') && (
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Benefit Est.</th>
              )}
              {visibleColumns.includes('cost') && (
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Cost Est.</th>
              )}
              
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.length > 0 ? filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                
                {/* Title Column */}
                <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 group-hover:bg-gray-50">
                  <div className="flex items-center">
                    <div>
                      <Link to={`/idea/${item.id}`} className="text-sm font-medium text-gray-900 hover:text-quadient-orange">
                        {item.title}
                      </Link>
                      {/* Fixed: Use inferred item type and ensure createdAt is treated as string for Date constructor */}
                      <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </td>

                {/* Dynamic Cells */}
                {visibleColumns.includes('id') && (
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">{item.id}</td>
                )}
                {visibleColumns.includes('owner') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                        {/* Fixed: Use type check 'owner' in item to safely access owner on Project vs Idea and ensure argument is string to avoid unknown errors in getUserName */}
                        {getUserName(('owner' in item ? (item as Project).owner : item.submitterId) as string)}
                    </div>
                    </td>
                )}
                {visibleColumns.includes('department') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                        {item.department}
                    </span>
                    </td>
                )}
                {visibleColumns.includes('region') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-800">
                        {item.region}
                    </span>
                    </td>
                )}
                {visibleColumns.includes('status') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (item as Project).stage 
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'Draft' ? 'bg-gray-100 text-gray-800' : 
                            item.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {(item as Project).stage || item.status}
                    </span>
                    {(item as Project).progress !== undefined && (item as Project).stage && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 max-w-[100px]">
                            <div className="bg-quadient-orange h-1.5 rounded-full" style={{ width: `${(item as Project).progress}%` }}></div>
                        </div>
                    )}
                    </td>
                )}
                {visibleColumns.includes('priority') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.coePriority || '-'}
                    </td>
                )}
                {visibleColumns.includes('benefit') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-medium">
                    €{item.benefitEstimate.toLocaleString()}
                    </td>
                )}
                {visibleColumns.includes('cost') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500 font-medium">
                    €{item.costEstimate.toLocaleString()}
                    </td>
                )}

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/idea/${item.id}`} className="text-gray-400 hover:text-quadient-orange">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="px-6 py-12 text-center text-gray-500">
                   <div className="flex flex-col items-center justify-center">
                       <FileText className="w-12 h-12 text-gray-300 mb-3" />
                       <p className="text-lg font-medium text-gray-900">No items found</p>
                       <p className="text-sm text-gray-500">
                           Try adjusting your filters to see more results.
                       </p>
                       {filterStatus === 'Draft' && (
                           <Link to="/submit" className="mt-4 px-4 py-2 bg-quadient-orange text-white rounded-md text-sm font-medium hover:bg-orange-700">
                               Create New Idea
                           </Link>
                       )}
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectList;
