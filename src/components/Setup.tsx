import React, { useState } from 'react';
import { useTournament } from '../store';
import { Users, UserPlus, Trash2, Trophy, Play } from 'lucide-react';

export default function Setup() {
  const { state, addTeam, removeTeam, addPlayer, removePlayer, startTournament } = useTournament();
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerNames, setNewPlayerNames] = useState<Record<string, string>>({});

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      addTeam(newTeamName.trim());
      setNewTeamName('');
    }
  };

  const handleAddPlayer = (teamId: string, e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlayerNames[teamId];
    if (name?.trim()) {
      addPlayer(teamId, name.trim());
      setNewPlayerNames({ ...newPlayerNames, [teamId]: '' });
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          Add Teams ({state.teams.length}/7+)
        </h2>
        <form onSubmit={handleAddTeam} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Team Name"
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors font-medium">
            Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.teams.map(team => (
          <div key={team.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{team.name}</h3>
              <button onClick={() => removeTeam(team.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={(e) => handleAddPlayer(team.id, e)} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newPlayerNames[team.id] || ''}
                onChange={(e) => setNewPlayerNames({ ...newPlayerNames, [team.id]: e.target.value })}
                placeholder="Player Name"
                className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </form>

            <ul className="space-y-2">
              {team.players.map(player => (
                <li key={player.id} className="flex justify-between items-center text-sm bg-slate-50 px-3 py-2 rounded-lg">
                  <span>{player.name}</span>
                  <button onClick={() => removePlayer(team.id, player.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
              {team.players.length === 0 && (
                <li className="text-sm text-slate-400 italic text-center py-2">No players added yet</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {state.teams.length > 0 && (
        <div className="flex justify-center pt-8 border-t border-slate-200">
          <button
            onClick={startTournament}
            disabled={state.teams.length < 2}
            className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
          >
            <Play className="w-6 h-6" />
            Start Tournament
          </button>
        </div>
      )}
    </div>
  );
}
