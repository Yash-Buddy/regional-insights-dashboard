import regions from '../data/regions.json';
import { UI, CATEGORICAL } from '../utils/colors';
import Figure from '../components/Figure';
import Choropleth from '../components/charts/Choropleth';
import BivariateChoropleth from '../components/charts/BivariateChoropleth';
import StackedBar from '../components/charts/StackedBar';
import ParallelSets from '../components/charts/ParallelSets';

const ACCENT = CATEGORICAL[2]; // Mellow Yellow, from your palette
const fmt = (n) => '$' + Math.round(n).toLocaleString();

// Numbers in the text are computed from the data, so text and charts never disagree.
function useFindings() {
  const byIncome = [...regions].sort((a, b) => b.medianIncome - a.medianIncome);
  const byEdu = [...regions].sort((a, b) => b.educationPct - a.educationPct);
  const avg = (k) => regions.reduce((s, r) => s + r[k], 0) / regions.length;
  return {
    topIncome: byIncome[0],
    lowIncome: byIncome[byIncome.length - 1],
    topEdu: byEdu[0],
    avgIncome: avg('medianIncome'),
    avgEdu: avg('educationPct'),
    gap: byIncome[0].medianIncome - byIncome[byIncome.length - 1].medianIncome,
  };
}

export default function Article() {
  const f = useFindings();
  const body = { color: '#e5e7eb', fontFamily: 'Georgia, "Times New Roman", serif' };

  return (
    <article className="max-w-3xl mx-auto px-4 py-12" style={body}>
      <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight" style={{ fontFamily: 'inherit' }}>
        Where income and education line up across the US
      </h1>
      <p className="mt-4 text-xl" style={{ color: UI.textMuted }}>
        A state-by-state look at earnings, schooling and the industries behind them.
      </p>
      <p className="mt-4 text-sm" style={{ color: UI.textMuted }}>
        By Your Name · Regional Insights · Illustrative data
      </p>

      <aside
        className="mt-10 p-6 rounded-xl"
        style={{ background: UI.card, border: `1px solid ${UI.border}`, borderLeft: `4px solid ${ACCENT}` }}
      >
        <h2 className="text-white font-semibold mb-3">Key findings</h2>
        <ul className="list-disc pl-5 space-y-2 leading-relaxed">
          <li>{f.topIncome.state} has the highest median income at {fmt(f.topIncome.medianIncome)}.</li>
          <li>{f.lowIncome.state} has the lowest at {fmt(f.lowIncome.medianIncome)}, a gap of {fmt(f.gap)}.</li>
          <li>{f.topEdu.state} leads on education, with {f.topEdu.educationPct}% holding a degree.</li>
        </ul>
      </aside>

      <h2 className="text-2xl font-bold text-white mt-14 mb-4">The income map</h2>
      <p className="leading-8 text-lg">
        Across all {regions.length} states, the average median income is {fmt(f.avgIncome)}. Figure 1 shows how
        far each state sits from that average. Darker shades mean higher income.
      </p>
      <Figure number={1} caption="Median household income by state." source="Regional Insights dataset (illustrative)">
        <Choropleth />
      </Figure>

      <h2 className="text-2xl font-bold text-white mt-14 mb-4">Income and education together</h2>
      <p className="leading-8 text-lg">
        Income alone hides half the story. On average {f.avgEdu.toFixed(0)}% of residents hold a degree, but the
        states that lead on one measure do not always lead on the other. Figure 2 plots both at once.
      </p>
      <Figure number={2} caption="Income (blue) and education (pink) shown together." source="Regional Insights dataset (illustrative)">
        <BivariateChoropleth />
      </Figure>

      <h2 className="text-2xl font-bold text-white mt-14 mb-4">What people do for work</h2>
      <p className="leading-8 text-lg">
        The ten highest-earning states are not built on the same industries. Figure 3 breaks down each
        state&apos;s workforce by sector.
      </p>
      <Figure number={3} caption="Industry mix in the ten states with the highest median income." source="Regional Insights dataset (illustrative)">
        <StackedBar />
      </Figure>

      <h2 className="text-2xl font-bold text-white mt-14 mb-4">From degree to paycheck</h2>
      <p className="leading-8 text-lg">
        Finally, Figure 4 follows people from education level, through employment status, to income bracket.
      </p>
      <Figure number={4} caption="Flow from education to employment to income bracket." source="Regional Insights dataset (illustrative)">
        <ParallelSets />
      </Figure>

      <footer className="mt-16 pt-6 text-sm leading-relaxed" style={{ borderTop: `1px solid ${UI.border}`, color: UI.textMuted }}>
        <p>Note: all figures use generated sample data and are for demonstration only. Replace with a real source before publishing.</p>
      </footer>
    </article>
  );
}
