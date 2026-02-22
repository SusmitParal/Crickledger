import React from 'react';
import { TournamentProvider, useTournament } from './store';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';
import Completed from './components/Completed';

function AppContent() {
  const { state } = useTournament();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-emerald-600 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Crickledger</h1>
          <div className="text-sm font-medium bg-emerald-700 px-3 py-1 rounded-full">
            {state.status === 'setup' && 'Tournament Setup'}
            {state.status === 'ongoing' && 'Tournament Ongoing'}
            {state.status === 'completed' && 'Tournament Completed'}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto p-4">
        {state.status === 'setup' && <Setup />}
        {state.status === 'ongoing' && <Dashboard />}
        {state.status === 'completed' && <Completed />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
}
