export type Player = {
  id: string;
  name: string;
};

export type Team = {
  id: string;
  name: string;
  players: Player[];
};

export type MatchPlayerStat = {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  overs: number;
  runsConceded: number;
  wickets: number;
};

export type Match = {
  id: string;
  team1Id: string;
  team2Id: string;
  status: 'pending' | 'in_progress' | 'completed';
  team1Stats: Record<string, MatchPlayerStat>;
  team2Stats: Record<string, MatchPlayerStat>;
  team1Score: number;
  team1Wickets: number;
  team1Overs: number;
  team2Score: number;
  team2Wickets: number;
  team2Overs: number;
  winnerId?: string;
  manOfTheMatchId?: string;
};

export type TournamentState = {
  status: 'setup' | 'ongoing' | 'completed';
  teams: Team[];
  matches: Match[];
};
