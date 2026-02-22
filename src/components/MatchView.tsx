import React, { useState } from 'react';
import { useTournament } from '../store';
import { ArrowLeft, Save, Plus, UserPlus } from 'lucide-react';
import { MatchPlayerStat } from '../types';

export default function MatchView({ matchId, onBack }: { matchId: string, onBack: () => void }) {
  const { state, startMatch, updateMatchStat, updateMatchScore, completeMatch, addPlayer } = useTournament();
  const match = state.matches.find(m => m.id === matchId)!;
  const team1 = state.teams.find(t => t.id === match.team1Id)!;
  const team2 = state.teams.find(t => t.id === match.team2Id)!;

  const [activeTab, setActiveTab] = useState<'summary' | 'team1' | 'team2'>('summary');
  const [winnerId, setWinnerId] = useState<string>(match.winnerId || '');
  const [motmId, setMotmId] = useState<string>(match.manOfTheMatchId || '');

  const [newPlayerNames, setNewPlayerNames] = useState<Record<string, string>>({});

  const handleStart = () => startMatch(matchId);

  const handleScoreChange = (teamId: string, field: 'score' | 'wickets' | 'overs', value: number) => {
    if (teamId === team1.id) {
      updateMatchScore(matchId, team1.id, 
        field === 'score' ? value : match.team1Score,
        field === 'wickets' ? value : match.team1Wickets,
        field === 'overs' ? value : match.team1Overs
      );
    } else {
      updateMatchScore(matchId, team2.id, 
        field === 'score' ? value : match.team2Score,
        field === 'wickets' ? value : match.team2Wickets,
        field === 'overs' ? value : match.team2Overs
      );
    }
  };

  const handleStatChange = (teamId: string, playerId: string, field: keyof MatchPlayerStat, value: number) => {
    updateMatchStat(matchId, teamId, playerId, { [field]: value });
  };

  const handleComplete = () => {
    if (winnerId && motmId) {
      completeMatch(matchId, winnerId, motmId);
      onBack();
    } else {
      alert("Please select a winner and Man of the Match");
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

  if (match.status === 'pending') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2">{team1.name} vs {team2.name}</h2>
        <p className="text-slate-500 mb-8">This match hasn't started yet.</p>
        <div className="flex justify-center gap-4">
          <button onClick={onBack} className="px-6 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors font-medium">
            Back
          </button>
          <button onClick={handleStart} className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium">
            Start Match
          </button>
        </div>
      </div>
    );
  }

  const renderTeamStats = (team: typeof team1, isTeam1: boolean) => {
    const stats = isTeam1 ? match.team1Stats : match.team2Stats;
    const score = isTeam1 ? match.team1Score : match.team2Score;
    const wickets = isTeam1 ? match.team1Wickets : match.team2Wickets;
    const overs = isTeam1 ? match.team1Overs : match.team2Overs;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Runs</label>
            <input type="number" value={score} onChange={e => handleScoreChange(team.id, 'score', +e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" disabled={match.status === 'completed'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Wickets</label>
            <input type="number" value={wickets} onChange={e => handleScoreChange(team.id, 'wickets', +e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" disabled={match.status === 'completed'} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Overs</label>
            <input type="number" step="0.1" value={overs} onChange={e => handleScoreChange(team.id, 'overs', +e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" disabled={match.status === 'completed'} />
          </div>
        </div>

        {match.status !== 'completed' && (
          <form onSubmit={(e) => handleAddPlayer(team.id, e)} className="flex gap-2">
            <input
              type="text"
              value={newPlayerNames[team.id] || ''}
              onChange={(e) => setNewPlayerNames({ ...newPlayerNames, [team.id]: e.target.value })}
              placeholder="Add new player during match"
              className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1 text-sm font-medium">
              <UserPlus className="w-4 h-4" /> Add
            </button>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2 text-center" colSpan={4}>Batting (R/B/4s/6s)</th>
                <th className="px-3 py-2 text-center" colSpan={3}>Bowling (O/R/W)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team.players.map(p => {
                const s = stats[p.id] || { runs: 0, balls: 0, fours: 0, sixes: 0, overs: 0, runsConceded: 0, wickets: 0 };
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-1 py-2"><input type="number" value={s.runs} onChange={e => handleStatChange(team.id, p.id, 'runs', +e.target.value)} className="w-12 px-1 py-1 text-center border rounded" disabled={match.status === 'completed'} /></td>
                    <td className="px-1 py-2"><input type="number" value={s.balls} onChange={e => handleStatChange(team.id, p.id, 'balls', +e.target.value)} className="w-12 px-1 py-1 text-center border rounded" disabled={match.status === 'completed'} /></td>
                    <td className="px-1 py-2"><input type="number" value={s.fours} onChange={e => handleStatChange(team.id, p.id, 'fours', +e.target.value)} className="w-12 px-1 py-1 text-center border rounded" disabled={match.status === 'completed'} /></td>
                    <td className="px-1 py-2"><input type="number" value={s.sixes} onChange={e => handleStatChange(team.id, p.id, 'sixes', +e.target.value)} className="w-12 px-1 py-1 text-center border rounded" disabled={match.status === 'completed'} /></td>
                    
                    <td className="px-1 py-2"><input type="number" step="0.1" value={s.overs} onChange={e => handleStatChange(team.id, p.id, 'overs', +e.target.value)} className="w-12 px-1 py-1 text-center border rounded" disabled={match.status === 'completed'} /></td>
                    <td className="px-1 py-2"><input type="number" value={s.runsConceded} onChange={e => handleStatChange(team.id, p.id, 'runsConceded', +e.target.value)} className="w-12 px-1 py-1 text-center border rounded" disabled={match.status === 'completed'} /></td>
                    <td className="px-1 py-2"><input type="number" value={s.wickets} onChange={e => handleStatChange(team.id, p.id, 'wickets', +e.target.value)} className="w-12 px-1 py-1 text-center border rounded" disabled={match.status === 'completed'} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const allPlayers = [...team1.players, ...team2.players];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="font-bold text-lg">
          {team1.name} <span className="text-slate-400 font-normal">vs</span> {team2.name}
        </div>
        <div className="w-20"></div>
      </div>

      <div className="flex border-b border-slate-100">
        <button onClick={() => setActiveTab('summary')} className={`flex-1 py-3 font-medium text-sm ${activeTab === 'summary' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>Summary</button>
        <button onClick={() => setActiveTab('team1')} className={`flex-1 py-3 font-medium text-sm ${activeTab === 'team1' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>{team1.name}</button>
        <button onClick={() => setActiveTab('team2')} className={`flex-1 py-3 font-medium text-sm ${activeTab === 'team2' ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>{team2.name}</button>
      </div>

      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-8 max-w-xl mx-auto">
            <div className="flex justify-between items-center text-center">
              <div className="flex-1">
                <div className="text-sm text-slate-500 font-medium mb-1">{team1.name}</div>
                <div className="text-4xl font-bold">{match.team1Score}/{match.team1Wickets}</div>
                <div className="text-sm text-slate-400 mt-1">({match.team1Overs} ov)</div>
              </div>
              <div className="text-2xl font-black text-slate-200 px-4">VS</div>
              <div className="flex-1">
                <div className="text-sm text-slate-500 font-medium mb-1">{team2.name}</div>
                <div className="text-4xl font-bold">{match.team2Score}/{match.team2Wickets}</div>
                <div className="text-sm text-slate-400 mt-1">({match.team2Overs} ov)</div>
              </div>
            </div>

            {match.status === 'in_progress' && (
              <div className="bg-slate-50 p-6 rounded-2xl space-y-4 border border-slate-100">
                <h3 className="font-semibold text-lg text-center">Complete Match</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Winner</label>
                  <select value={winnerId} onChange={e => setWinnerId(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select Winner</option>
                    <option value={team1.id}>{team1.name}</option>
                    <option value={team2.id}>{team2.name}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Man of the Match</label>
                  <select value={motmId} onChange={e => setMotmId(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                    <option value="">Select Player</option>
                    <optgroup label={team1.name}>
                      {team1.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </optgroup>
                    <optgroup label={team2.name}>
                      {team2.players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </optgroup>
                  </select>
                </div>

                <button onClick={handleComplete} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> Save & Complete Match
                </button>
              </div>
            )}

            {match.status === 'completed' && (
              <div className="bg-emerald-50 text-emerald-800 p-6 rounded-2xl text-center border border-emerald-100">
                <div className="font-bold text-xl mb-2">
                  {winnerId === team1.id ? team1.name : team2.name} won the match!
                </div>
                <div className="text-emerald-600 font-medium">
                  Man of the Match: {allPlayers.find(p => p.id === match.manOfTheMatchId)?.name}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'team1' && renderTeamStats(team1, true)}
        {activeTab === 'team2' && renderTeamStats(team2, false)}
      </div>
    </div>
  );
}
