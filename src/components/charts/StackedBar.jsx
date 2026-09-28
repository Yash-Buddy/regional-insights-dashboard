import { useState } from 'react';
import * as d3 from 'd3';
import { useD3 } from '../../hooks/useD3';
import regions from '../../data/regions.json';
import { CATEGORICAL } from '../../utils/colors';
import ChartTooltip from './ChartTooltip';

const INDUSTRIES = ['Tech', 'Healthcare', 'Manufacturing', 'Retail', 'Agriculture', 'Finance'];

export default function StackedBar() {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, state: '', industry: '', value: 0 });
  const top10 = [...regions].sort((a, b) => b.medianIncome - a.medianIncome).slice(0, 10);

  const ref = useD3((svg) => {
    const width = 500, height = 680, margin = { top: 20, right: 20, bottom: 30, left: 100 };
    svg.attr('viewBox', [0, 0, width, height]);
    svg.selectAll('*').remove();

    const stacked = d3.stack().keys(INDUSTRIES)(top10.map(r => r.industryMix));
    const x = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
    const y = d3.scaleBand().domain(top10.map(r => r.state)).range([margin.top, height - margin.bottom]).padding(0.2);
    const color = d3.scaleOrdinal().domain(INDUSTRIES).range(CATEGORICAL);

    const groups = svg.append('g')
      .selectAll('g')
      .data(stacked)
      .join('g')
      .attr('fill', d => color(d.key));

    const rects = groups.selectAll('rect')
      .data(d => d.map((seg, i) => ({ ...seg, industry: d.key, state: top10[i].state })))
      .join('rect')
      .attr('x', d => x(d[0]))
      .attr('y', d => y(d.state))
      .attr('width', 0)
      .attr('height', y.bandwidth())
      .style('cursor', 'pointer');

    rects.transition()
      .duration(700)
      .delay((d, i) => i * 15)
      .ease(d3.easeCubicOut)
      .attr('width', d => x(d[1]) - x(d[0]));

    rects
      .on('mouseenter', function (event, d) {
        svg.selectAll('rect').transition().duration(100).attr('opacity', o => (o === d ? 1 : 0.25));
        d3.select(this).attr('stroke', '#fff').attr('stroke-width', 1);
        setTooltip({
          visible: true,
          x: event.offsetX,
          y: event.offsetY,
          state: d.state,
          industry: d.industry,
          value: (d[1] - d[0]).toFixed(1),
        });
      })
      .on('mousemove', (event) => setTooltip(t => ({ ...t, x: event.offsetX, y: event.offsetY })))
      .on('mouseleave', function () {
        svg.selectAll('rect').transition().duration(150).attr('opacity', 1);
        d3.select(this).attr('stroke', 'none');
        setTooltip(t => ({ ...t, visible: false }));
      });

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr('color', '#9ca3af');

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .attr('color', '#9ca3af');

    svg.append('text')
      .attr('x', width - margin.right - 6)
      .attr('y', y(top10[0].state) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#fff')
      .attr('font-size', 10)
      .text('Highest income ▸');
  }, [regions]);

  return (
    <div className="relative bg-[#161619] border border-[#2a2a30] rounded-2xl p-4">
      <h2 className="text-white font-semibold mb-1">Industry Mix (Top 10 States by Income)</h2>
      <div className="flex gap-3 flex-wrap mb-2 text-xs text-gray-400">
        {INDUSTRIES.map((ind, i) => (
          <span key={ind} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: CATEGORICAL[i] }}></span>
            {ind}
          </span>
        ))}
      </div>
      <svg ref={ref} className="w-full h-auto"></svg>
      <ChartTooltip x={tooltip.x} y={tooltip.y} visible={tooltip.visible}>
        <div className="font-semibold">{tooltip.state}</div>
        <div>{tooltip.industry}: {tooltip.value}%</div>
      </ChartTooltip>
    </div>
  );
}
