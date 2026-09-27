import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { useD3 } from '../../hooks/useD3';
import regions from '../../data/regions.json';
import { SEQUENTIAL_BLUE } from '../../utils/colors';
import ChartTooltip from './ChartTooltip';
import ChartLoading from './ChartLoading';

export default function Choropleth() {
  const [us, setUs] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: '', value: '' });

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(res => res.json())
      .then(setUs);
  }, []);

  const incomeByState = Object.fromEntries(regions.map(r => [r.state, r.medianIncome]));

  const ref = useD3((svg) => {
    if (!us) return;
    const width = 960, height = 600;
    svg.attr('viewBox', [0, 0, width, height]);
    svg.selectAll('*').remove();

    const states = topojson.feature(us, us.objects.states).features;
    const projection = d3.geoAlbersUsa().fitSize([width, height], topojson.feature(us, us.objects.states));
    const path = d3.geoPath(projection);
    const color = d3.scaleQuantize().domain(d3.extent(regions, d => d.medianIncome)).range(SEQUENTIAL_BLUE);

    const paths = svg.append('g')
      .selectAll('path')
      .data(states)
      .join('path')
      .attr('d', path)
      .attr('fill', d => {
        const income = incomeByState[d.properties.name];
        return income ? color(income) : '#2a2a30';
      })
      .attr('stroke', '#0b0b0f')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .attr('opacity', 0);

    paths.transition().duration(500).delay((d, i) => i * 8).attr('opacity', 1);

    paths
      .on('mouseenter', function (event, d) {
        d3.selectAll(this.parentNode.childNodes).transition().duration(100).attr('opacity', 0.35);
        d3.select(this).transition().duration(100).attr('opacity', 1).attr('stroke', '#fff').attr('stroke-width', 1.2);
        setTooltip({
          visible: true, x: event.offsetX, y: event.offsetY,
          name: d.properties.name,
          value: incomeByState[d.properties.name] ? `$${incomeByState[d.properties.name].toLocaleString()}` : 'No data',
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
      <h2 className="text-white font-semibold mb-4">Median Income by State</h2>
      {!us ? <ChartLoading label="Loading map data…" /> : <svg ref={ref} className="w-full h-auto"></svg>}
      <ChartTooltip x={tooltip.x} y={tooltip.y} visible={tooltip.visible}>
        <div className="font-semibold">{tooltip.name}</div>
        <div>{tooltip.value}</div>
      </ChartTooltip>
    </div>
  );
}