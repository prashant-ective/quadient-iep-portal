import { Badge, Idea, IdeaStatus, Notification, Project, ProjectStage, User, UserRole } from './types';

// Badges Definition
export const BADGES: Badge[] = [
  { id: 'b1', name: 'First Spark', description: 'Submitted your first idea', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'b2', name: 'Innovator', description: 'Had 5 ideas approved', icon: '🚀', color: 'bg-purple-100 text-purple-800' },
  { id: 'b3', name: 'Money Maker', description: 'Generated >€100k in value', icon: '💰', color: 'bg-green-100 text-green-800' },
  { id: 'b4', name: 'Community Voice', description: 'Posted 10 helpful comments', icon: '🗣️', color: 'bg-blue-100 text-blue-800' },
  { id: 'b5', name: 'Trend Watcher', description: 'Following 5+ active projects', icon: '👀', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'b6', name: 'Collaborator', description: 'Replied to 3 questions', icon: '🤝', color: 'bg-pink-100 text-pink-800' },
  { id: 'b7', name: 'Scout', description: 'First to comment on a new idea', icon: '🔭', color: 'bg-teal-100 text-teal-800' }
];

// Expanded User List for Leaderboard
export const USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Alex Employee', 
    role: UserRole.EMPLOYEE, 
    department: 'Marketing', 
    region: 'NA', 
    avatar: 'https://i.pravatar.cc/150?u=u1',
    bio: 'Passionate about automating marketing workflows.',
    joinedAt: '2023-01-15',
    badges: [BADGES[0], BADGES[4], BADGES[5]]
  },
  { 
    id: 'u2', 
    name: 'Sarah CoE', 
    role: UserRole.COE_ADMIN, 
    department: 'IT', 
    region: 'Global', 
    avatar: 'https://i.pravatar.cc/150?u=u2',
    bio: 'Guiding digital transformation.',
    joinedAt: '2022-11-01',
    badges: [BADGES[0], BADGES[1], BADGES[3], BADGES[6]]
  },
  { 
    id: 'u3', 
    name: 'David Council', 
    role: UserRole.AI_COUNCIL, 
    department: 'Finance', 
    region: 'EU', 
    avatar: 'https://i.pravatar.cc/150?u=u3',
    bio: 'Ensuring sustainable AI investments.',
    joinedAt: '2022-08-20',
    badges: [BADGES[2], BADGES[5]]
  },
  { 
    id: 'u13', 
    name: 'Mark Budget', 
    role: UserRole.REGIONAL_BUDGET_OWNER, 
    department: 'Operations', 
    region: 'NA', 
    avatar: 'https://i.pravatar.cc/150?u=u13',
    bio: 'Managing regional investment budgets for efficiency initiatives.',
    joinedAt: '2023-03-10',
    badges: [BADGES[3], BADGES[5]]
  },
  { 
    id: 'u4', name: 'Emily Chen', role: UserRole.EMPLOYEE, department: 'R&D', region: 'APAC', 
    avatar: 'https://i.pravatar.cc/150?u=u4', badges: [BADGES[1], BADGES[2]], bio: 'AI Researcher.'
  },
  { 
    id: 'u5', name: 'Michael Ross', role: UserRole.EMPLOYEE, department: 'Sales', region: 'NA', 
    avatar: 'https://i.pravatar.cc/150?u=u5', badges: [BADGES[0]], bio: 'Sales optimization.'
  },
  { 
    id: 'u6', name: 'Linda Kim', role: UserRole.EMPLOYEE, department: 'HR', region: 'Global', 
    avatar: 'https://i.pravatar.cc/150?u=u6', badges: [BADGES[3], BADGES[4], BADGES[5]], bio: 'People analytics.'
  },
  { 
    id: 'u7', name: 'James Wilson', role: UserRole.STEERCO, department: 'Ops', region: 'EU', 
    avatar: 'https://i.pravatar.cc/150?u=u7', badges: [BADGES[2]], bio: 'Operational excellence.'
  },
  { 
    id: 'u8', name: 'Patricia Moore', role: UserRole.EMPLOYEE, department: 'Legal', region: 'NA', 
    avatar: 'https://i.pravatar.cc/150?u=u8', badges: [], bio: 'Compliance & AI.'
  },
  { 
    id: 'u9', name: 'Robert Taylor', role: UserRole.EMPLOYEE, department: 'IT', region: 'EU', 
    avatar: 'https://i.pravatar.cc/150?u=u9', badges: [BADGES[0], BADGES[6]], bio: 'Infrastructure.'
  },
  { 
    id: 'u10', name: 'Jennifer Garcia', role: UserRole.EMPLOYEE, department: 'Marketing', region: 'APAC', 
    avatar: 'https://i.pravatar.cc/150?u=u10', badges: [BADGES[1]], bio: 'Content automation.'
  },
    { 
    id: 'u11', name: 'Thomas Anderson', role: UserRole.EMPLOYEE, department: 'IT', region: 'NA', 
    avatar: 'https://i.pravatar.cc/150?u=u11', badges: [BADGES[0], BADGES[3], BADGES[4]], bio: 'The Matrix.'
  },
  { 
    id: 'u12', name: 'Maria Rodriguez', role: UserRole.EMPLOYEE, department: 'Sales', region: 'EU', 
    avatar: 'https://i.pravatar.cc/150?u=u12', badges: [BADGES[2], BADGES[5]], bio: 'CRM Expert.'
  }
];

export const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u1', text: 'Your idea "Automated Invoice Processing" has advanced to Pilot stage.', timestamp: '2023-10-26T09:00:00Z', read: false, type: 'success', link: '/projects' },
  { id: 'n2', userId: 'u1', text: 'Sarah CoE commented on your draft.', timestamp: '2023-10-25T14:30:00Z', read: true, type: 'info', link: '/submit' },
];

export const SAMPLE_IDEAS: Idea[] = [
  {
    id: 'i1',
    title: 'Automated Invoice Processing',
    submitterId: 'u1',
    description: 'Manual entry of invoices is taking 20 hours a week. We can use OCR + LLM to extract data and feed it directly into SAP.',
    department: 'Finance',
    region: 'NA',
    ideaType: 'Automation',
    status: IdeaStatus.PROJECT_ACTIVE,
    costEstimate: 50000,
    costRating: 'Medium',
    benefitEstimate: 120000,
    benefitRating: 'High',
    keyImpactedProcesses: 'Accounts Payable, Vendor Management',
    strategicFit: 'High Efficiency',
    tags: ['invoice', 'finance', 'ocr'],
    createdAt: '2023-10-01',
    updatedAt: '2023-10-05',
    score: 8.5,
    comments: [
      { id: 'c1', authorId: 'u2', authorName: 'Sarah CoE', authorAvatar: 'https://i.pravatar.cc/150?u=u2', text: 'Great initiative. Have you checked the GDPR compliance for vendor data?', timestamp: '2023-10-02T10:00:00Z', likes: 2 }
    ],
    followers: ['u2', 'u3'],
    coePriority: 'Top Priority',
    attachments: [
        { id: 'a1', name: 'process_flow_diagram.pdf', url: '#', type: 'pdf', size: '1.2 MB' },
        { id: 'a2', name: 'vendor_analysis_v2.xlsx', url: '#', type: 'spreadsheet', size: '450 KB' }
    ]
  },
  {
    id: 'i2',
    title: 'Customer Support Chatbot for Lockers',
    submitterId: 'u1',
    description: 'High volume of "where is my package" calls. A chatbot could handle 60% of these simple queries.',
    department: 'Customer Service',
    region: 'EU',
    ideaType: 'AI',
    status: IdeaStatus.PENDING_COE,
    costEstimate: 25000,
    costRating: 'Low',
    benefitEstimate: 80000,
    benefitRating: 'High',
    keyImpactedProcesses: 'Customer Inquiries, Ticket Routing',
    strategicFit: 'Customer Experience',
    tags: ['chatbot', 'support', 'llm'],
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    comments: [],
    followers: [],
    coePriority: 'Standard',
    attachments: [
        { id: 'a3', name: 'chatbot_mockup.png', url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', type: 'image', size: '2.4 MB' }
    ]
  },
  {
    id: 'i3',
    title: 'Predictive Maintenance for Mailing Systems',
    submitterId: 'u2',
    description: 'Reduce downtime by predicting part failures using IoT sensor data.',
    department: 'R&D',
    region: 'Global',
    ideaType: 'AI',
    status: IdeaStatus.APPROVED,
    costEstimate: 150000,
    costRating: 'High',
    benefitEstimate: 500000,
    benefitRating: 'High',
    keyImpactedProcesses: 'Maintenance Operations, Field Service',
    strategicFit: 'Product Innovation',
    tags: ['iot', 'predictive', 'maintenance'],
    createdAt: '2023-09-10',
    updatedAt: '2023-10-12',
    score: 9.2,
    comments: [],
    followers: ['u1'],
    coePriority: 'Top Priority',
    attachments: []
  },
  {
    id: 'i4',
    title: 'HR Resume Screening Assistant',
    submitterId: 'u1',
    description: 'Screening thousands of CVs manually. AI can rank them by relevance to the JD.',
    department: 'HR',
    region: 'NA',
    ideaType: 'AI',
    status: IdeaStatus.DRAFT,
    costEstimate: 10000,
    costRating: 'Low',
    benefitEstimate: 40000,
    benefitRating: 'Medium',
    keyImpactedProcesses: 'Recruitment, Candidate Selection',
    strategicFit: 'Efficiency',
    tags: ['hr', 'recruiting'],
    createdAt: '2023-10-20',
    updatedAt: '2023-10-20',
    comments: [],
    followers: [],
    attachments: []
  }
];

export const SAMPLE_PROJECTS: Project[] = [
  {
    ...SAMPLE_IDEAS[0],
    stage: ProjectStage.PILOT,
    progress: 65,
    risks: 'Low', // kept for backwards compat
    owner: 'Sarah CoE',
    startDate: '2023-11-01',
    targetCompletionDate: '2024-03-31',
    ragStatus: 'Green',
    financials: {
        budget: 50000,
        actuals: 15000,
        forecast: 48000,
        currency: 'EUR'
    },
    milestones: [
        { id: 'm1', name: 'Requirements Sign-off', dueDate: '2023-11-15', status: 'Completed' },
        { id: 'm2', name: 'Vendor Selection', dueDate: '2023-12-01', status: 'Completed' },
        { id: 'm3', name: 'Pilot Launch', dueDate: '2024-01-15', status: 'In Progress' },
        { id: 'm4', name: 'Go Live', dueDate: '2024-03-31', status: 'Pending' },
    ],
    riskRegister: [
        { id: 'r1', description: 'Data privacy compliance delays', impact: 'Medium', mitigation: 'Early engagement with Legal team.' },
        { id: 'r2', description: 'API limit on legacy system', impact: 'High', mitigation: 'Requesting quota increase from IT.' }
    ],
    team: [
        { id: 'tm1', name: 'Sarah CoE', role: 'Project Owner', department: 'IT', region: 'Global', email: 'sarah.coe@quadient.com', avatar: 'https://i.pravatar.cc/150?u=u2' },
        { id: 'tm2', name: 'Alex Employee', role: 'Lead Developer', department: 'R&D', region: 'NA', email: 'alex.e@quadient.com', avatar: 'https://i.pravatar.cc/150?u=u1' },
        { id: 'tm3', name: 'John Doe', role: 'Business Analyst', department: 'Finance', region: 'NA', email: 'j.doe@quadient.com' }
    ]
  },
  {
    ...SAMPLE_IDEAS[2],
    stage: ProjectStage.DISCOVERY,
    progress: 20,
    risks: 'Medium',
    owner: 'David Council',
    startDate: '2023-12-01',
    targetCompletionDate: '2024-06-30',
    ragStatus: 'Amber',
    financials: {
        budget: 150000,
        actuals: 5000,
        forecast: 160000,
        currency: 'EUR'
    },
    milestones: [
        { id: 'm1', name: 'Sensor Selection', dueDate: '2023-12-15', status: 'Delayed' },
        { id: 'm2', name: 'Connectivity Test', dueDate: '2024-01-30', status: 'Pending' }
    ],
    riskRegister: [
        { id: 'r1', description: 'Hardware supply chain shortage', impact: 'High', mitigation: 'Identify alternative suppliers.' }
    ],
    team: [
        { id: 'tm1', name: 'David Council', role: 'Project Sponsor', department: 'Finance', region: 'EU', email: 'd.council@quadient.com', avatar: 'https://i.pravatar.cc/150?u=u3' }
    ]
  }
];