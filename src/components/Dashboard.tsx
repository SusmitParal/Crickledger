import React, { useState } from 'react';
import { useTournament } from '../store';
import MatchView from './MatchView';
import { Trophy, Activity, Users, ChevronRight } from 'lucide-react';
import { Match, Team, MatchPlayerStat } from '../types';

export default function Dashboard() {
  const { state, endTournament } = useTournament();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  if (selectedMatchId) {
    return <MatchView matchId={selectedMatchId} onBack={() => setSelectedMatchId(null)} />;
  }

  const getTeam = (id: string) => state.teams.find(t => t.id === id);

  // Calculate Standings
  const standings = state.teams.map(team => {
    let played = 0;
    let won = 0;
    let lost = 0;
    state.matches.forEach(m => {
      if (m.status === 'completed' && (m.team1Id === team.id || m.team2Id === team.id)) {
        played++;
        if (m.winnerId === team.id) won++;
        else lost++;
      }
    });
    return { ...team, played, won, lost, points: won * 2 };
  }).sort((a, b) => b.points - a.points);

  const allMatchesCompleted = state.matches.length > 0 && state.matches.every(m => m.status === 'completed');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Matches
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {state.matches.map(match => {
                const t1 = getTeam(match.team1Id);
                const t2 = getTeam(match.team2Id);
                return (
                  <div key={match.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <span className={`font-medium ${match.winnerId === t1?.id ? 'text-emerald-600' : ''}`}>{t1?.name}</span>
                        <span className="text-sm text-slate-400 font-mono">vs</span>
                        <span className={`font-medium ${match.winnerId === t2?.id ? 'text-emerald-600' : ''}`}>{t2?.name}</span>
                      </div>
                      {match.status === 'completed' && (
                        <div className="text-sm text-slate-500 mt-1">
                          {getTeam(match.winnerId!)?.name} won
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedMatchId(match.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1 ${
                        match.status === 'completed' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' :
                        match.status === 'in_progress' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                        'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {match.status === 'completed' ? 'View Result' : match.status === 'in_progress' ? 'Resume Match' : 'Start Match'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Points Table
              </h2>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3 text-center">P</th>
                    <th className="px-4 py-3 text-center">W</th>
                    <th className="px-4 py-3 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standings.map((team, idx) => (
                    <tr key={team.id} className={idx === 0 ? 'bg-amber-50/50' : ''}>
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <span className="text-slate-400 text-xs w-4">{idx + 1}</span>
                        {team.name}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{team.played}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{team.won}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {allMatchesCompleted && (
            <button
              onClick={endTournament}
              className="w-full bg-amber-500 text-white px-6 py-4 rounded-2xl font-bold text-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Trophy className="w-6 h-6" />
              End Tournament & Show Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
