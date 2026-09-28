import { useState } from 'react';
import Choropleth from './components/charts/Choropleth';
import StackedBar from './components/charts/StackedBar';
import HexbinMap from './components/charts/HexbinMap';
import BivariateChoropleth from './components/charts/BivariateChoropleth';
import ParallelSets from './components/charts/ParallelSets';
import Article from './pages/Article';
import { UI } from './utils/colors';

function Dashboard() {
  return (
    <div className="flex min-h-screen" style={{ background: UI.background }}>
      <aside className="w-64 bg-[#161619] border-r border-[#2a2a30] p-6 hidden lg:block">
        <h2 className="text-white font-semibold mb-4">Filters</h2>
        <p className="text-gray-400 text-sm mb-2">Metric</p>
        <select className="w-full bg-[#0b0b0f] border border-[#2a2a30] text-white rounded-lg p-2 text-sm">
          <option>Median Income</option>
          <option>Education %</option>
          <option>Employment Rate</option>
        </select>
      </aside>

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Regional Insights Dashboard</h1>
        <p className="text-gray-400 mb-8">Explore income, education, and industry data across US states</p>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Choropleth />
          <BivariateChoropleth />
          <HexbinMap />
          <StackedBar />
        </div>
        <div className="mt-6">
          <ParallelSets />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('article');
  const tab = (id, label) => (
    <button
      onClick={() => setView(id)}
      className="px-4 py-2 text-sm rounded-lg"
      style={{
        background: view === id ? UI.card : 'transparent',
        color: view === id ? UI.textPrimary : UI.textMuted,
        border: `1px solid ${view === id ? UI.border : 'transparent'}`,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ background: UI.background, minHeight: '100vh' }}>
      <nav className="flex gap-2 p-3 border-b" style={{ borderColor: UI.border }}>
        {tab('article', 'Article')}
        {tab('dashboard', 'Dashboard')}
      </nav>
      {view === 'article' ? <Article /> : <Dashboard />}
    </div>
  );
}
