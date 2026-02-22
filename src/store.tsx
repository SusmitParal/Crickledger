import React, { createContext, useContext, useState, useEffect } from 'react';
import { TournamentState, Team, Match, Player, MatchPlayerStat } from './types';

type TournamentContextType = {
  state: TournamentState;
  addTeam: (name: string) => void;
  removeTeam: (id: string) => void;
  addPlayer: (teamId: string, playerName: string) => void;
  removePlayer: (teamId: string, playerId: string) => void;
  startTournament: () => void;
  startMatch: (matchId: string) => void;
  updateMatchStat: (matchId: string, teamId: string, playerId: string, stat: Partial<MatchPlayerStat>) => void;
  updateMatchScore: (matchId: string, teamId: string, score: number, wickets: number, overs: number) => void;
  completeMatch: (matchId: string, winnerId: string, motmId: string) => void;
  endTournament: () => void;
  resetTournament: () => void;
};

const initialState: TournamentState = {
  status: 'setup',
  teams: [],
  matches: [],
};

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TournamentState>(() => {
    const saved = localStorage.getItem('crickledger_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('crickledger_state', JSON.stringify(state));
  }, [state]);

  const addTeam = (name: string) => {
    setState(s => ({
      ...s,
      teams: [...s.teams, { id: crypto.randomUUID(), name, players: [] }]
    }));
  };

  const removeTeam = (id: string) => {
    setState(s => ({
      ...s,
      teams: s.teams.filter(t => t.id !== id)
    }));
  };

  const addPlayer = (teamId: string, playerName: string) => {
    setState(s => ({
      ...s,
      teams: s.teams.map(t => t.id === teamId ? {
        ...t, players: [...t.players, { id: crypto.randomUUID(), name: playerName }]
      } : t)
    }));
  };

  const removePlayer = (teamId: string, playerId: string) => {
    setState(s => ({
      ...s,
      teams: s.teams.map(t => t.id === teamId ? {
        ...t, players: t.players.filter(p => p.id !== playerId)
      } : t)
    }));
  };

  const startTournament = () => {
    if (state.teams.length < 2) return;
    
    const matches: Match[] = [];
    const teams = [...state.teams];
    
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: crypto.randomUUID(),
          team1Id: teams[i].id,
          team2Id: teams[j].id,
          status: 'pending',
          team1Stats: {},
          team2Stats: {},
          team1Score: 0,
          team1Wickets: 0,
          team1Overs: 0,
          team2Score: 0,
          team2Wickets: 0,
          team2Overs: 0,
        });
      }
    }

    setState(s => ({ ...s, status: 'ongoing', matches }));
  };

  const startMatch = (matchId: string) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => m.id === matchId ? { ...m, status: 'in_progress' } : m)
    }));
  };

  const updateMatchStat = (matchId: string, teamId: string, playerId: string, stat: Partial<MatchPlayerStat>) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => {
        if (m.id !== matchId) return m;
        const isTeam1 = m.team1Id === teamId;
        const statsKey = isTeam1 ? 'team1Stats' : 'team2Stats';
        const currentStats = m[statsKey][playerId] || {
          playerId, runs: 0, balls: 0, fours: 0, sixes: 0, overs: 0, runsConceded: 0, wickets: 0
        };
        return {
          ...m,
          [statsKey]: {
            ...m[statsKey],
            [playerId]: { ...currentStats, ...stat }
          }
        };
      })
    }));
  };

  const updateMatchScore = (matchId: string, teamId: string, score: number, wickets: number, overs: number) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => {
        if (m.id !== matchId) return m;
        if (m.team1Id === teamId) {
          return { ...m, team1Score: score, team1Wickets: wickets, team1Overs: overs };
        } else {
          return { ...m, team2Score: score, team2Wickets: wickets, team2Overs: overs };
        }
      })
    }));
  };

  const completeMatch = (matchId: string, winnerId: string, motmId: string) => {
    setState(s => ({
      ...s,
      matches: s.matches.map(m => m.id === matchId ? {
        ...m, status: 'completed', winnerId, manOfTheMatchId: motmId
      } : m)
    }));
  };

  const endTournament = () => {
    setState(s => ({ ...s, status: 'completed' }));
  };

  const resetTournament = () => {
    setState(initialState);
  };

  return (
    <TournamentContext.Provider value={{
      state, addTeam, removeTeam, addPlayer, removePlayer, startTournament,
      startMatch, updateMatchStat, updateMatchScore, completeMatch, endTournament, resetTournament
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error('useTournament must be used within TournamentProvider');
  return context;
};
