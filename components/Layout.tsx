import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  Settings, 
  Bell, 
  Search, 
  LogOut,
  User as UserIcon,
  Trophy,
  X
} from 'lucide-react';
import { Notification, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  notifications: Notification[];
  onLogout: () => void;
  onClearNotifications: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, notifications, onLogout, onClearNotifications }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Submit Idea', path: '/submit', icon: PlusCircle },
    { name: 'Projects', path: '/projects', icon: ListTodo },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Admin Console', path: '/admin', icon: Settings, adminOnly: true },
  ];

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Navigate to projects page with query param
      navigate(`/projects?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F5F7]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-quadient-border flex flex-col shadow-sm z-20">
        <div className="p-6 flex items-center justify-center border-b border-gray-100">
           {/* Mock Logo */}
           <div className="flex items-center space-x-2">
             <span className="text-2xl font-bold tracking-tight text-quadient-dark">quad<span className="text-quadient-orange">i</span>ent</span>
           </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
             if (item.adminOnly && user.role === 'Employee') return null;
             
             const isActive = location.pathname === item.path;
             return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-orange-50 text-quadient-orange' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-quadient-orange' : 'text-gray-400'}`} />
                {item.name}
              </Link>
             );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link to="/profile" className="flex items-center space-x-3 mb-4 group cursor-pointer">
            <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full border border-gray-200 group-hover:border-quadient-orange transition-colors object-cover" />
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-quadient-orange transition-colors">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </Link>
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleGlobalSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-quadient-orange focus:ring-1 focus:ring-quadient-orange sm:text-sm transition-all"
                placeholder="Search projects, ideas, or people (Press Enter)..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 relative">
             <button 
               onClick={() => setShowNotifications(!showNotifications)}
               className="relative text-gray-500 hover:text-quadient-orange transition-colors focus:outline-none"
             >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                    {unreadCount}
                  </span>
                )}
             </button>

             {/* Notification Dropdown */}
             {showNotifications && (
               <div className="absolute top-10 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                 <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-xs font-bold uppercase text-gray-500">Notifications</h3>
                    <button onClick={onClearNotifications} className="text-xs text-quadient-orange hover:text-orange-700">Mark all read</button>
                 </div>
                 <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`p-3 border-b border-gray-50 hover:bg-gray-50 ${!notif.read ? 'bg-orange-50/30' : ''}`}>
                          <p className="text-sm text-gray-800">{notif.text}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                 </div>
               </div>
             )}

             <div className="text-right hidden md:block border-l border-gray-200 pl-6">
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Region</p>
                <p className="text-sm font-medium text-gray-700">{user.region}</p>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative" onClick={() => setShowNotifications(false)}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;