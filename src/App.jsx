import { useMemo } from 'react';
import * as d3 from 'd3';
import Choropleth from './components/charts/Choropleth';
import StackedBar from './components/charts/StackedBar';
import HexbinMap from './components/charts/HexbinMap';
import BivariateChoropleth from './components/charts/BivariateChoropleth';
import ParallelSets from './components/charts/ParallelSets';
import StatCard from './components/charts/StatCard';
import regions from './data/regions.json';

function App() {
  const stats = useMemo(() => ({
    statesCovered: regions.length,
    avgIncome: d3.mean(regions, r => r.medianIncome),
    avgEducation: d3.mean(regions, r => r.educationPct),
    avgEmployment: d3.mean(regions, r => r.employmentRate) * 100, // stored as 0–1, scale to %
  }), []);

  return (
    <div className="flex min-h-screen bg-[#0b0b0f]">
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

        {/* Single unified grid — every tile, big or small, shares the same row height */}
        <div className="grid grid-cols-1 lg:grid-cols-4 auto-rows-[minmax(220px,auto)] gap-6">
          {/* Hero tile */}
          <div className="lg:col-span-3 lg:row-span-2">
            <Choropleth />
          </div>

          {/* Tall side tile */}
          <div className="lg:row-span-2">
            <StackedBar />
          </div>

          {/* Mid-weight pair */}
          <div className="lg:col-span-2">
            <BivariateChoropleth />
          </div>
          <div className="lg:col-span-2">
            <HexbinMap />
          </div>

          {/* Stat tiles — now share the grid's row height instead of sitting in their own shorter grid */}
          <StatCard label="States Covered" value={stats.statesCovered} />
          <StatCard label="Avg. Median Income" value={stats.avgIncome} prefix="$" decimals={0} />
          <StatCard label="Avg. Education Rate" value={stats.avgEducation} suffix="%" decimals={1} />
          <StatCard label="Avg. Employment Rate" value={stats.avgEmployment} suffix="%" decimals={1} />

          {/* Full-width closer */}
          <div className="lg:col-span-4">
            <ParallelSets />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;