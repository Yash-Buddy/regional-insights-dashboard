import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { useD3 } from '../../hooks/useD3';
import regions from '../../data/regions.json';
import ChartTooltip from './ChartTooltip';
import ChartLoading from './ChartLoading';

const BIVARIATE_COLORS = [
  ['#e8e8e8', '#b5d3e7', '#4f96c4'],
  ['#e4acac', '#b0a6c0', '#5a7fa8'],
  ['#c85a5a', '#985a7f', '#3b4d8f'],
];

export default function BivariateChoropleth() {
  const [us, setUs] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: '', income: '', edu: '' });

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(res => res.json())
      .then(setUs);
  }, []);

  const dataByState = Object.fromEntries(regions.map(r => [r.state, r]));
  const incomeExtent = d3.extent(regions, d => d.medianIncome);
  const eduExtent = d3.extent(regions, d => d.educationPct);
  const incomeScale = d3.scaleQuantize().domain(incomeExtent).range([0, 1, 2]);
  const eduScale = d3.scaleQuantize().domain(eduExtent).range([0, 1, 2]);

  const ref = useD3((svg) => {
    if (!us) return;
    const width = 960, height = 600;
    svg.attr('viewBox', [0, 0, width, height]);
    svg.selectAll('*').remove();

    const statesGeo = topojson.feature(us, us.objects.states);
    const projection = d3.geoAlbersUsa().fitSize([width, height], statesGeo);
    const path = d3.geoPath(projection);

    const paths = svg.append('g')
      .selectAll('path')
      .data(statesGeo.features)
      .join('path')
      .attr('d', path)
      .attr('fill', d => {
        const r = dataByState[d.properties.name];
        if (!r) return '#2a2a30';
        return BIVARIATE_COLORS[eduScale(r.educationPct)][incomeScale(r.medianIncome)];
      })
      .attr('stroke', '#0b0b0f')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .attr('opacity', 0);

    paths.transition().duration(500).delay((d, i) => i * 8).attr('opacity', 1);

    paths
      .on('mouseenter', function (event, d) {
        const r = dataByState[d.properties.name];
        d3.selectAll(this.parentNode.childNodes).transition().duration(100).attr('opacity', 0.35);
        d3.select(this).transition().duration(100).attr('opacity', 1).attr('stroke', '#fff').attr('stroke-width', 1.2);
        setTooltip({
          visible: true, x: event.offsetX, y: event.offsetY,
          name: d.properties.name,
          income: r ? `$${r.medianIncome.toLocaleString()}` : 'No data',
          edu: r ? `${r.educationPct}%` : '—',
        });
      })
      .on('mousemove', (event) => setTooltip(t => ({ ...t, x: event.offsetX, y: event.offsetY })))
      .on('mouseleave', function () {
        d3.selectAll(this.parentNode.childNodes).transition().duration(150).attr('opacity', 1);
        d3.select(this).attr('stroke', '#0b0b0f').attr('stroke-width', 0.5);
        setTooltip(t => ({ ...t, visible: false }));
      });
  }, [us]);

  return (
    <div className="relative bg-[#161619] border border-[#2a2a30] rounded-2xl p-4">
      <h2 className="text-white font-semibold mb-4">Income vs Education (Bivariate)</h2>
      {!us ? <ChartLoading label="Loading map data…" /> : <svg ref={ref} className="w-full h-auto"></svg>}
      <p className="text-xs text-gray-400 mt-2">Darker blue = high income & high education. Darker red = high income, low education.</p>
      <ChartTooltip x={tooltip.x} y={tooltip.y} visible={tooltip.visible}>
        <div className="font-semibold">{tooltip.name}</div>
        <div>Income: {tooltip.income}</div>
        <div>Education: {tooltip.edu}</div>
      </ChartTooltip>
    </div>
  );
}