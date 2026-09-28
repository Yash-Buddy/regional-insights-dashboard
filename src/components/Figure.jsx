sed -i 's/my-12 -mx-4 lg:-mx-16/my-0/' src/components/Figure.jsx
cat > src/pages/Article.jsx << 'EOF'
import regions from '../data/regions.json';
import { UI, CATEGORICAL } from '../utils/colors';
import Figure from '../components/Figure';
import Choropleth from '../components/charts/Choropleth';
import BivariateChoropleth from '../components/charts/BivariateChoropleth';
import StackedBar from '../components/charts/StackedBar';
import ParallelSets from '../components/charts/ParallelSets';

const ACCENT = CATEGORICAL[2];
const fmt = (n) => '$' + Math.round(n).toLocaleString();
const serif = { fontFamily: 'Georgia, "Times New Roman", serif' };
const rule = { borderColor: UI.border };

export default function Article() {
  const byInc = [...regions].sort((a, b) => b.medianIncome - a.medianIncome);
  const top = byInc[0], low = byInc[byInc.length - 1];
  const topEdu = [...regions].sort((a, b) => b.educationPct - a.educationPct)[0];
  const avg = (k) => regions.reduce((s, r) => s + r[k], 0) / regions.length;

  return (
    <article className="max-w-6xl mx-auto px-4 py-10 text-gray-200" style={serif}>
      <header className="border-y-2 py-8 mb-10" style={{ borderColor: '#fff' }}>
        <h1 className="text-5xl lg:text-7xl font-bold text-white leading-none">
          Where income and education line up across the US
        </h1>
        <div className="mt-5 flex flex-wrap justify-between gap-2 text-gray-400">
          <p className="text-xl max-w-2xl">A state-by-state look at earnings, schooling and the industries behind them.</p>
          <p className="text-sm self-end">By Your Name · Illustrative data</p>
        </div>
      </header>

      <section className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <p className="text-lg leading-8 mb-6 first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-none" style={{ '--tw': 0 }}>
            Across {regions.length} states the average median income is {fmt(avg('medianIncome'))}. The map shows
            how far each state sits from that line, with darker shades meaning higher income.
          </p>
          <Figure number={1} caption="Median household income by state." source="Regional Insights (illustrative)">
            <Choropleth />
          </Figure>
        </div>
        <aside className="space-y-8">
          <div className="p-5 rounded-xl" style={{ background: UI.card, border: `1px solid ${UI.border}`, borderLeft: `4px solid ${ACCENT}` }}>
            <h2 className="text-white font-semibold mb-2">Key findings</h2>
            <ul className="list-disc pl-5 space-y-2 leading-relaxed">
              <li>{top.state} leads on income at {fmt(top.medianIncome)}.</li>
              <li>{low.state} trails at {fmt(low.medianIncome)}, a gap of {fmt(top.medianIncome - low.medianIncome)}.</li>
              <li>{topEdu.state} tops education at {topEdu.educationPct}% with a degree.</li>
            </ul>
          </div>
          <Figure number={3} caption="Industry mix, ten highest-income states." source="Regional Insights (illustrative)">
            <StackedBar />
          </Figure>
        </aside>
      </section>

      <hr className="my-12" style={rule} />

      <section className="grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="text-3xl font-bold text-white mb-3">Income and education together</h2>
          <p className="text-lg leading-8 mb-6">
            Income alone hides half the story. About {avg('educationPct').toFixed(0)}% of residents hold a degree
            on average, but the states that lead on one measure rarely lead on the other.
          </p>
          <Figure number={2} caption="Income (blue) and education (pink)." source="Regional Insights (illustrative)">
            <BivariateChoropleth />
          </Figure>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-3">From degree to paycheck</h2>
          <p className="text-lg leading-8 mb-6">
            Following people from education level, through employment status, to income bracket shows where
            the strongest and weakest paths sit.
          </p>
          <Figure number={4} caption="Education to employment to income." source="Regional Insights (illustrative)">
            <ParallelSets />
          </Figure>
        </div>
      </section>

      <footer className="mt-14 pt-5 border-t text-sm text-gray-400" style={rule}>
        All figures use generated sample data. Replace with a real source before publishing.
      </footer>
    </article>
  );
}
EOF
npm run dev
