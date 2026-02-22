import React, { useMemo } from 'react';
import { useTournament } from '../store';
import { Trophy, Medal, Star, Target, Zap, RotateCcw } from 'lucide-react';
import { Player, MatchPlayerStat } from '../types';

export default function Completed() {
  const { state, resetTournament } = useTournament();

  // Calculate overall stats
  const stats = useMemo(() => {
    const playerStats: Record<string, MatchPlayerStat & { name: string, teamName: string, motmCount: number }> = {};

    state.teams.forEach(team => {
      team.players.forEach(player => {
        playerStats[player.id] = {
          playerId: player.id,
          name: player.name,
          teamName: team.name,
          runs: 0, balls: 0, fours: 0, sixes: 0, overs: 0, runsConceded: 0, wickets: 0, motmCount: 0
        };
      });
    });

    state.matches.forEach(match => {
      if (match.status !== 'completed') return;
      
      if (match.manOfTheMatchId && playerStats[match.manOfTheMatchId]) {
        playerStats[match.manOfTheMatchId].motmCount++;
      }

      Object.entries(match.team1Stats).forEach(([pid, statValue]) => {
        const stat = statValue as MatchPlayerStat;
        if (playerStats[pid]) {
          playerStats[pid].runs += stat.runs || 0;
          playerStats[pid].balls += stat.balls || 0;
          playerStats[pid].fours += stat.fours || 0;
          playerStats[pid].sixes += stat.sixes || 0;
          playerStats[pid].overs += stat.overs || 0;
          playerStats[pid].runsConceded += stat.runsConceded || 0;
          playerStats[pid].wickets += stat.wickets || 0;
        }
      });
      Object.entries(match.team2Stats).forEach(([pid, statValue]) => {
        const stat = statValue as MatchPlayerStat;
        if (playerStats[pid]) {
          playerStats[pid].runs += stat.runs || 0;
          playerStats[pid].balls += stat.balls || 0;
          playerStats[pid].fours += stat.fours || 0;
          playerStats[pid].sixes += stat.sixes || 0;
          playerStats[pid].overs += stat.overs || 0;
          playerStats[pid].runsConceded += stat.runsConceded || 0;
          playerStats[pid].wickets += stat.wickets || 0;
        }
      });
    });

    const playersList = Object.values(playerStats);

    const mostRuns = [...playersList].sort((a, b) => b.runs - a.runs)[0];
    const mostWickets = [...playersList].sort((a, b) => b.wickets - a.wickets)[0];
    const mostSixes = [...playersList].sort((a, b) => b.sixes - a.sixes)[0];
    const mostMotm = [...playersList].sort((a, b) => b.motmCount - a.motmCount)[0];
    
    const totalSixes = playersList.reduce((sum, p) => sum + p.sixes, 0);
    const totalFours = playersList.reduce((sum, p) => sum + p.fours, 0);
    const totalRuns = playersList.reduce((sum, p) => sum + p.runs, 0);
    const totalWickets = playersList.reduce((sum, p) => sum + p.wickets, 0);

    // Simple heuristic for Man of the Tournament: 1 pt per run, 20 pts per wicket, 50 pts per MOTM
    const motmWinner = [...playersList].sort((a, b) => {
      const scoreA = a.runs + (a.wickets * 20) + (a.motmCount * 50);
      const scoreB = b.runs + (b.wickets * 20) + (b.motmCount * 50);
      return scoreB - scoreA;
    })[0];

    return { mostRuns, mostWickets, mostSixes, mostMotm, totalSixes, totalFours, totalRuns, totalWickets, motmWinner, playersList };
  }, [state]);

  // Determine winning team (team with most points)
  const standings = state.teams.map(team => {
    let won = 0;
    state.matches.forEach(m => {
      if (m.status === 'completed' && m.winnerId === team.id) won++;
    });
    return { ...team, points: won * 2 };
  }).sort((a, b) => b.points - a.points);

  const champion = standings[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl p-12 text-center text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <Trophy className="w-32 h-32 mx-auto mb-6 text-amber-100 drop-shadow-lg" />
        <h1 className="text-5xl font-black mb-2 drop-shadow-md">CHAMPIONS</h1>
        <h2 className="text-3xl font-bold text-amber-100 drop-shadow">{champion?.name}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600">
            <Star className="w-10 h-10" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Man of the Tournament</div>
            <div className="text-2xl font-bold text-slate-800">{stats.motmWinner?.name || 'N/A'}</div>
            <div className="text-slate-500">{stats.motmWinner?.teamName}</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Target className="w-10 h-10" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Most Runs (Orange Cap)</div>
            <div className="text-2xl font-bold text-slate-800">{stats.mostRuns?.name || 'N/A'} <span className="text-blue-600 text-lg">({stats.mostRuns?.runs})</span></div>
            <div className="text-slate-500">{stats.mostRuns?.teamName}</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="bg-purple-100 p-4 rounded-full text-purple-600">
            <Medal className="w-10 h-10" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Most Wickets (Purple Cap)</div>
            <div className="text-2xl font-bold text-slate-800">{stats.mostWickets?.name || 'N/A'} <span className="text-purple-600 text-lg">({stats.mostWickets?.wickets})</span></div>
            <div className="text-slate-500">{stats.mostWickets?.teamName}</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
          <div className="bg-rose-100 p-4 rounded-full text-rose-600">
            <Zap className="w-10 h-10" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Most Sixes</div>
            <div className="text-2xl font-bold text-slate-800">{stats.mostSixes?.name || 'N/A'} <span className="text-rose-600 text-lg">({stats.mostSixes?.sixes})</span></div>
            <div className="text-slate-500">{stats.mostSixes?.teamName}</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-4xl font-black text-amber-400 mb-2">{stats.totalRuns}</div>
          <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Runs</div>
        </div>
        <div>
          <div className="text-4xl font-black text-emerald-400 mb-2">{stats.totalWickets}</div>
          <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Wickets</div>
        </div>
        <div>
          <div className="text-4xl font-black text-rose-400 mb-2">{stats.totalSixes}</div>
          <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Sixes</div>
        </div>
        <div>
          <div className="text-4xl font-black text-blue-400 mb-2">{stats.totalFours}</div>
          <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total Fours</div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={resetTournament} className="flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition-colors">
          <RotateCcw className="w-5 h-5" /> Start New Tournament
        </button>
      </div>
    </div>
  );
}
