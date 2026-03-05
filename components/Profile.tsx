
import React, { useState } from 'react';
import { User, Badge } from '../types';
import { Save, User as UserIcon, MapPin, Briefcase, Calendar, Award, Camera, Edit2 } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  ideaCount: number;
  approvedCount: number;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, ideaCount, approvedCount }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    department: user.department,
    region: user.region,
    bio: user.bio || '',
    avatar: user.avatar
  });

  const handleSave = () => {
    onUpdateUser({ ...user, ...formData });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header / Main Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-orange-400 to-red-500"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
             <div className="flex items-end">
                <div className="relative group">
                  <img 
                    src={formData.avatar} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex flex-col items-center justify-center border-4 border-transparent transition-opacity">
                       <Camera className="text-white w-8 h-8 opacity-90 mb-1" />
                       <span className="text-[10px] text-white font-semibold">EDIT PHOTO</span>
                       
                       {/* Floating input for URL */}
                       <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-64 bg-white p-2 rounded shadow-lg border border-gray-200 z-50">
                           <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Image URL</label>
                           <input 
                              type="text" 
                              placeholder="https://..."
                              className="w-full text-xs p-1 border border-gray-300 rounded focus:ring-quadient-orange focus:border-quadient-orange"
                              value={formData.avatar}
                              onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                              autoFocus
                           />
                       </div>
                    </div>
                  )}
                </div>
                
                <div className="ml-6 mb-2">
                   {isEditing ? (
                     <input 
                       type="text" 
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:border-quadient-orange focus:outline-none bg-transparent"
                     />
                   ) : (
                     <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                   )}
                   <p className="text-gray-500 font-medium">{user.role}</p>
                </div>
             </div>
             
             <button 
               onClick={() => isEditing ? handleSave() : setIsEditing(true)}
               className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center ${
                 isEditing 
                   ? 'bg-green-600 hover:bg-green-700 text-white' 
                   : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
               }`}
             >
               {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
               {isEditing ? 'Save Changes' : 'Edit Profile'}
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Details */}
            <div className="md:col-span-2 space-y-6">
              
              <div className="space-y-4">
                 <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">About Me</h3>
                 {isEditing ? (
                   <textarea
                     rows={4}
                     value={formData.bio}
                     onChange={e => setFormData({...formData, bio: e.target.value})}
                     className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-quadient-orange focus:border-quadient-orange"
                     placeholder="Tell us about yourself..."
                   />
                 ) : (
                   <p className="text-gray-600 leading-relaxed">
                     {user.bio || "No bio yet. Click edit to add one!"}
                   </p>
                 )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="flex items-center text-gray-600">
                    <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                    {isEditing ? (
                      <select 
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        className="border-gray-300 rounded text-sm py-1 px-2 focus:ring-quadient-orange"
                      >
                         <option value="Marketing">Marketing</option>
                         <option value="IT">IT</option>
                         <option value="Finance">Finance</option>
                         <option value="R&D">R&D</option>
                         <option value="HR">HR</option>
                         <option value="Sales">Sales</option>
                         <option value="Customer Service">Customer Service</option>
                         <option value="Legal">Legal</option>
                         <option value="Ops">Ops</option>
                      </select>
                    ) : (
                      <span>{user.department}</span>
                    )}
                 </div>
                 <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {isEditing ? (
                      <select 
                        value={formData.region}
                        onChange={e => setFormData({...formData, region: e.target.value})}
                        className="border-gray-300 rounded text-sm py-1 px-2 focus:ring-quadient-orange"
                      >
                         <option value="NA">North America</option>
                         <option value="EU">Europe</option>
                         <option value="APAC">Asia Pacific</option>
                         <option value="Global">Global</option>
                      </select>
                    ) : (
                      <span>{user.region}</span>
                    )}
                 </div>
                 <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Joined {user.joinedAt || '2023'}</span>
                 </div>
              </div>

            </div>

            {/* Right Column: Stats & Badges */}
            <div className="space-y-6">
               <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4">Contribution Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="text-center">
                        <span className="block text-2xl font-bold text-gray-900">{ideaCount}</span>
                        <span className="text-xs text-gray-500">Submitted</span>
                     </div>
                     <div className="text-center">
                        <span className="block text-2xl font-bold text-quadient-orange">{approvedCount}</span>
                        <span className="text-xs text-gray-500">Approved</span>
                     </div>
                  </div>
               </div>

               <div>
                 <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-500" /> 
                    Badges & Awards
                 </h3>
                 <div className="grid grid-cols-1 gap-3">
                   {user.badges.length > 0 ? user.badges.map(badge => (
                     <div key={badge.id} className={`flex items-center p-3 rounded-lg border border-transparent ${badge.color}`}>
                        <span className="text-2xl mr-3">{badge.icon}</span>
                        <div>
                           <p className="text-sm font-bold">{badge.name}</p>
                           <p className="text-xs opacity-80">{badge.description}</p>
                        </div>
                     </div>
                   )) : (
                     <p className="text-sm text-gray-400 italic">No badges earned yet. Submit ideas to earn them!</p>
                   )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
