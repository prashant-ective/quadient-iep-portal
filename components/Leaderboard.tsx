import React from 'react';
import { User, Idea, Project } from '../types';
import { Trophy, Medal, Star, Flame } from 'lucide-react';

interface LeaderboardProps {
  users: User[];
  ideas: Idea[];
  projects: Project[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ users, ideas, projects }) => {
  
  // Calculate Reputation Scores based on explicit categories
  const rankedUsers = users.map(user => {
    const userIdeas = ideas.filter(i => i.submitterId === user.id);
    const userProjects = projects.filter(p => p.submitterId === user.id);
    const approvedCount = userProjects.length;
    const submittedCount = userIdeas.length;
    const badgeCount = user.badges.length;
    
    // Mock follower counts / comment counts for scoring
    const commentsCount = Math.floor(Math.random() * 20); // Simulating data
    const followersCount = Math.floor(Math.random() * 10); // Simulating data

    // Scoring Logic
    const innovationScore = (submittedCount * 5) + (approvedCount * 10);
    const executionScore = (approvedCount * 20); // High weight for doing the work
    const collaborationScore = (commentsCount * 2) + (followersCount * 1) + (badgeCount * 5);
    
    const totalScore = innovationScore + executionScore + collaborationScore;

    return {
      ...user,
      stats: {
        totalScore,
        innovationScore,
        executionScore,
        collaborationScore,
        approvedCount,
        submittedCount,
        badgeCount
      }
    };
  }).sort((a, b) => b.stats.totalScore - a.stats.totalScore);

  const topThree = rankedUsers.slice(0, 3);
  const restOfUsers = rankedUsers.slice(3);

  return (
    <div className="space-y-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Innovation Leaderboard</h1>
        <p className="text-gray-500 mt-2">Recognizing our top contributors across Innovation, Execution, and Collaboration.</p>
      </div>

      {/* Podium Section */}
      <div className="flex justify-center items-end space-x-4 mb-12">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
               <img src={topThree[1].avatar} alt={topThree[1].name} className="w-20 h-20 rounded-full border-4 border-gray-300 shadow-md object-cover" />
               <div className="absolute -bottom-2 -right-2 bg-gray-300 text-gray-800 w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm">
                 2
               </div>
            </div>
            <div className="bg-white p-4 rounded-t-xl rounded-b-lg shadow-sm border border-gray-100 text-center w-40 transform translate-y-4">
               <p className="font-bold text-gray-900 truncate">{topThree[1].name}</p>
               <div className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full">
                  <Star className="w-3 h-3 text-orange-400 mr-1" />
                  <span className="text-xs font-bold">{topThree[1].stats.totalScore} pts</span>
               </div>
            </div>
            <div className="h-24 w-40 bg-gray-200 rounded-t-lg shadow-inner flex items-end justify-center pb-4 opacity-50">
               <Medal className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="flex flex-col items-center z-10">
            <div className="relative mb-2">
               <Trophy className="w-12 h-12 text-yellow-400 absolute -top-14 left-1/2 transform -translate-x-1/2 animate-bounce" />
               <img src={topThree[0].avatar} alt={topThree[0].name} className="w-28 h-28 rounded-full border-4 border-yellow-400 shadow-xl object-cover" />
               <div className="absolute -bottom-3 -right-2 bg-yellow-400 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold border-4 border-white shadow-sm text-lg">
                 1
               </div>
            </div>
            <div className="bg-white p-5 rounded-t-xl rounded-b-lg shadow-lg border border-yellow-100 text-center w-48 transform translate-y-4">
               <p className="font-bold text-lg text-gray-900 truncate">{topThree[0].name}</p>
               <div className="inline-flex items-center px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full border border-yellow-200">
                  <Flame className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-sm font-bold">{topThree[0].stats.totalScore} pts</span>
               </div>
            </div>
            <div className="h-32 w-48 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-t-lg shadow-md flex items-end justify-center pb-4">
               <Trophy className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
               <img src={topThree[2].avatar} alt={topThree[2].name} className="w-20 h-20 rounded-full border-4 border-orange-300 shadow-md object-cover" />
               <div className="absolute -bottom-2 -right-2 bg-orange-300 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm">
                 3
               </div>
            </div>
            <div className="bg-white p-4 rounded-t-xl rounded-b-lg shadow-sm border border-gray-100 text-center w-40 transform translate-y-4">
               <p className="font-bold text-gray-900 truncate">{topThree[2].name}</p>
               <div className="inline-flex items-center px-2 py-1 bg-orange-50 rounded-full">
                  <Star className="w-3 h-3 text-orange-400 mr-1" />
                  <span className="text-xs font-bold">{topThree[2].stats.totalScore} pts</span>
               </div>
            </div>
            <div className="h-16 w-40 bg-orange-200 rounded-t-lg shadow-inner flex items-end justify-center pb-4 opacity-50">
               <Medal className="w-8 h-8 text-orange-700 opacity-50" />
            </div>
          </div>
        )}
      </div>

      {/* Detailed Leaderboard Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-6xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Innovation</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Execution</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Collaboration</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total Score</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {rankedUsers.map((user, idx) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                             <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${idx < 3 ? 'bg-orange-100 text-orange-800' : 'text-gray-500'}`}>
                                {idx + 1}
                             </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt="" />
                                <div className="ml-4">
                                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.department} • {user.region}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-700">{user.stats.innovationScore}</span>
                            <div className="text-[10px] text-gray-400">Submissions</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-700">{user.stats.executionScore}</span>
                             <div className="text-[10px] text-gray-400">Projects</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-700">{user.stats.collaborationScore}</span>
                             <div className="text-[10px] text-gray-400">Social</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                             <span className="text-lg font-bold text-quadient-orange">{user.stats.totalScore}</span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;