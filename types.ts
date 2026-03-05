export enum UserRole {
  EMPLOYEE = 'Employee',
  COE_ADMIN = 'CoE Admin',
  AI_COUNCIL = 'AI Council',
  STEERCO = 'Steerco',
  REGIONAL_BUDGET_OWNER = 'Regional Budget Owner'
}

export enum IdeaStatus {
  DRAFT = 'Draft',
  PENDING_COE = 'Pending CoE Review',
  CHANGES_REQUESTED = 'Changes Requested',
  PENDING_BUDGET_OWNER = 'Pending Budget Owner',
  PENDING_COUNCIL = 'Pending AI Council',
  PENDING_STEERCO = 'Pending Steerco',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  PROJECT_ACTIVE = 'Project Active'
}

export enum ProjectStage {
  DISCOVERY = 'Discovery',
  PILOT = 'Pilot',
  SHADOW_RUN = 'Shadow Run',
  SCALING = 'Scaling',
  DONE = 'Done',
  ON_HOLD = 'On Hold'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  region: string;
  avatar: string;
  bio?: string;
  joinedAt?: string;
  badges: Badge[];
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
  link?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  region: string;
  email: string;
  avatar?: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
}

export interface ProjectRisk {
  id: string;
  description: string;
  impact: 'Low' | 'Medium' | 'High';
  mitigation: string;
}

export interface ProjectFinancials {
  budget: number;
  actuals: number;
  forecast: number;
  currency: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'spreadsheet' | 'pdf' | 'document' | 'other';
  size: string;
}

export interface Idea {
  id: string;
  title: string;
  submitterId: string;
  department: string;
  region: string;
  ideaType: 'AI' | 'Automation' | 'Process' | 'Other';
  status: IdeaStatus;
  rejectionReason?: string;
  
  // PROBLEM SECTION
  description: string; // Pain point
  frequency?: string; // How often this happens
  noActionCost?: number; // Cost of not resolving
  keyImpactedProcesses?: string; // New field
  
  // NEW GOVERNANCE FIELDS
  related3YP?: 'YES' | 'NO';
  impactedBusinessFunction?: string;
  requestorPriority?: 'Low' | 'Medium' | 'High';
  isStrategicAI?: boolean;

  // SOLUTION SECTION
  phase1?: string;
  phase2?: string;
  phase3?: string;
  proposedTools?: string;
  vendorNeeded?: boolean;
  complexity?: 'Low' | 'Medium' | 'High';

  // BENEFITS SECTION
  benefitEstimate: number; // Tangible (Revenue/Savings)
  benefitRating?: 'Low' | 'Medium' | 'High'; // New field
  intangibleBenefits?: string;
  strategicFit: string;
  
  // ROI & IMPLEMENTATION COST
  costEstimate: number;
  costRating?: 'Low' | 'Medium' | 'High'; // New field
  roiDescription?: string;
  
  // Metadata
  tags: string[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
  
  // Workflow
  score?: number; // 0-10
  comments: Comment[];
  followers: string[]; // List of User IDs

  // COE Fields
  coePriority?: 'Top Priority' | 'Standard'; // New field
}

export interface Project extends Idea {
  stage: ProjectStage;
  progress: number; // 0-100
  startDate?: string;
  targetCompletionDate?: string;
  
  // PMO / PMI Light
  ragStatus?: 'Red' | 'Amber' | 'Green';
  financials?: ProjectFinancials;
  milestones?: ProjectMilestone[];
  risks?: ProjectRisk[] | string; 
  riskRegister?: ProjectRisk[]; 
  
  owner: string;
  team: TeamMember[];
}