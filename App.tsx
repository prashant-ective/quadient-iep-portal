import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import IdeaIntake from './components/IdeaIntake';
import ProjectList from './components/ProjectList';
import AdminConsole from './components/AdminConsole';
import Profile from './components/Profile';
import IdeaDetail from './components/IdeaDetail';
import Leaderboard from './components/Leaderboard';
import GlobalChatbot from './components/GlobalChatbot';
import { USERS, SAMPLE_IDEAS, SAMPLE_PROJECTS, SAMPLE_NOTIFICATIONS } from './constants';
import { Idea, User, Project, Notification, Comment, IdeaStatus, UserRole } from './types';

const App: React.FC = () => {
  // State Management (Simulating Backend)
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]); 
  const [ideas, setIdeas] = useState<Idea[]>(SAMPLE_IDEAS);
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);

  // Combine projects and ideas for the full list (deduplicating by ID, prioritizing Project objects)
  const allItems = [...projects, ...ideas.filter(i => !projects.some(p => p.id === i.id))];

  const handleLoginSwitch = () => {
    const currentIndex = USERS.findIndex(u => u.id === currentUser.id);
    const nextIndex = (currentIndex + 1) % USERS.length;
    setCurrentUser(USERS[nextIndex]);
    
    // Switch notifications context
    const userNotifs = SAMPLE_NOTIFICATIONS.filter(n => n.userId === USERS[nextIndex].id);
    setNotifications(userNotifs);
  };

  const handleIdeaSubmit = (newIdea: Partial<Idea>) => {
    const idea: Idea = {
      ...newIdea,
      id: `i${Date.now()}`,
      submitterId: newIdea.submitterId || currentUser.id,
      comments: [],
      updatedAt: new Date().toISOString(),
      // Defaults if missing
      title: newIdea.title || 'Untitled Idea',
      department: newIdea.department || currentUser.department,
      region: newIdea.region || currentUser.region,
      description: newIdea.description || '',
      ideaType: newIdea.ideaType || 'Automation',
      status: newIdea.status || IdeaStatus.PENDING_COE,
      costEstimate: newIdea.costEstimate || 0,
      benefitEstimate: newIdea.benefitEstimate || 0,
      strategicFit: 'Pending Evaluation',
      tags: newIdea.tags || [],
      createdAt: new Date().toISOString(),
      followers: [currentUser.id]
    } as Idea;

    setIdeas([idea, ...ideas]);
    
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      userId: currentUser.id,
      text: 'You earned the "First Spark" badge for submitting an idea!',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'success'
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleUpdateIdea = (updatedIdea: Partial<Idea>) => {
    // Update in Ideas list
    setIdeas(prev => prev.map(i => i.id === updatedIdea.id ? { ...i, ...updatedIdea } as Idea : i));
    
    // Update in Projects list if it exists there
    setProjects(prev => prev.map(p => p.id === updatedIdea.id ? { ...p, ...updatedIdea } as Project : p));
  };

  const handleDeleteIdea = (id: string) => {
    // Remove from both lists
    setIdeas(prev => prev.filter(i => i.id !== id));
    setProjects(prev => prev.filter(p => p.id !== id));
    
    // Add a notification about deletion
    const newNotif: Notification = {
        id: `n${Date.now()}`,
        userId: currentUser.id,
        text: 'Idea discarded successfully.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'info'
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleRejectIdea = (id: string, reason: string) => {
    setIdeas(ideas.map(i => 
      i.id === id ? { ...i, status: IdeaStatus.REJECTED, rejectionReason: reason } : i
    ));
    
    // Notify submitter (Mock)
    console.log(`Idea ${id} rejected: ${reason}`);
  };

  const handleRequestInfo = (id: string, question: string) => {
    setIdeas(ideas.map(i => 
        i.id === id ? { ...i, status: IdeaStatus.CHANGES_REQUESTED } : i
    ));

    handleAddComment(id, `[COE REQUEST] ${question}`);
  };

  const handleApproveIdea = (id: string, routeType?: 'strategic' | 'standard') => {
      setIdeas(ideas.map(i => {
          if (i.id === id) {
              if (i.status === IdeaStatus.PENDING_COE) {
                  // Strategic AI initiatives route to AI Council
                  if (routeType === 'strategic' || i.isStrategicAI) {
                      return { ...i, status: IdeaStatus.PENDING_COUNCIL, isStrategicAI: true };
                  } 
                  // Standard/Operational route to Regional Budget Owner
                  return { ...i, status: IdeaStatus.PENDING_BUDGET_OWNER, isStrategicAI: false };
              }
              if (i.status === IdeaStatus.PENDING_COUNCIL || i.status === IdeaStatus.PENDING_BUDGET_OWNER) {
                  return { ...i, status: IdeaStatus.APPROVED };
              }
              return i;
          }
          return i;
      }));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    const index = USERS.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) USERS[index] = updatedUser;
  };

  const handleToggleFollow = (ideaId: string) => {
    const updateFollowers = (item: Idea | Project) => {
        const isFollowing = item.followers.includes(currentUser.id);
        return {
            ...item,
            followers: isFollowing 
                ? item.followers.filter(id => id !== currentUser.id)
                : [...item.followers, currentUser.id]
        };
    };

    setIdeas(ideas.map(i => i.id === ideaId ? updateFollowers(i) as Idea : i));
    setProjects(projects.map(p => p.id === ideaId ? updateFollowers(p) as Project : p));
  };

  const handleAddComment = (ideaId: string, text: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      text: text,
      timestamp: new Date().toISOString(),
      likes: 0
    };

    const addCommentToItem = (item: Idea | Project) => ({
        ...item,
        comments: [...item.comments, newComment]
    });

    setIdeas(ideas.map(i => i.id === ideaId ? addCommentToItem(i) as Idea : i));
    setProjects(projects.map(p => p.id === ideaId ? addCommentToItem(p) as Project : p));
  };

  const handleClearNotifications = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  // Wrapper for IdeaDetail
  const IdeaDetailWrapper = () => {
    const { id } = useParams<{ id: string }>();
    const idea = [...projects, ...ideas].find(i => i.id === id);
    if (!idea) return <div className="p-8 text-center">Idea not found</div>;
    return (
      <IdeaDetail 
        idea={idea} 
        currentUser={currentUser} 
        onFollowToggle={handleToggleFollow}
        onAddComment={handleAddComment}
        onDelete={handleDeleteIdea}
      />
    );
  };

  // Wrapper for Editing an Idea
  const EditIdeaWrapper = () => {
    const { id } = useParams<{ id: string }>();
    const idea = [...projects, ...ideas].find(i => i.id === id);
    
    // If not found or user is not submitter, redirect
    if (!idea) return <Navigate to="/" />;
    if (idea.submitterId !== currentUser.id && currentUser.role !== UserRole.COE_ADMIN) {
         return <div className="p-8 text-center text-red-600">You do not have permission to edit this idea.</div>;
    }

    return (
      <IdeaIntake 
        onSubmit={handleUpdateIdea} 
        users={USERS} 
        currentUser={currentUser} 
        initialData={idea}
        isEditing={true}
      />
    );
  };

  return (
    <Router>
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={handleLoginSwitch}
          className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg text-xs font-mono opacity-80 hover:opacity-100 transition"
        >
          Current: {currentUser.role} (Click to Switch)
        </button>
      </div>

      <Layout 
        user={currentUser} 
        notifications={notifications} 
        onLogout={() => alert('Logout clicked')}
        onClearNotifications={handleClearNotifications}
      >
        <Routes>
          <Route path="/" element={
              <Dashboard 
                  user={currentUser} 
                  ideas={ideas} 
                  projects={projects} 
                  onDeleteIdea={handleDeleteIdea}
                  onApprove={handleApproveIdea}
                  onReject={handleRejectIdea} 
              />
          } />
          <Route path="/submit" element={<IdeaIntake onSubmit={handleIdeaSubmit} users={USERS} currentUser={currentUser} existingIdeas={allItems} />} />
          <Route path="/edit/:id" element={<EditIdeaWrapper />} />
          <Route path="/projects" element={<ProjectList items={allItems} currentUser={currentUser} type="project" users={USERS} />} />
          <Route path="/admin" element={
            currentUser.role !== UserRole.EMPLOYEE 
            ? <AdminConsole items={ideas} currentUser={currentUser} onReject={handleRejectIdea} onApprove={handleApproveIdea} onRequestInfo={handleRequestInfo} /> 
            : <div className="text-center pt-20 text-gray-500">Access Denied</div>
          } />
          <Route path="/profile" element={
            <Profile 
              user={currentUser} 
              onUpdateUser={handleUpdateUser} 
              ideaCount={ideas.filter(i => i.submitterId === currentUser.id).length}
              approvedCount={projects.filter(p => p.submitterId === currentUser.id).length}
            />
          } />
          <Route path="/leaderboard" element={<Leaderboard users={USERS} ideas={ideas} projects={projects} />} />
          <Route path="/idea/:id" element={<IdeaDetailWrapper />} />
        </Routes>
        
        {/* Global Chatbot Overlay */}
        <GlobalChatbot 
            currentUser={currentUser}
            ideas={ideas}
            projects={projects}
            users={USERS}
        />
      </Layout>
    </Router>
  );
};

export default App;