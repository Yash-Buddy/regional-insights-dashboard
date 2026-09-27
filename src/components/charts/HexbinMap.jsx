import { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { hexbin as d3hexbin } from 'd3-hexbin';
import * as topojson from 'topojson-client';
import { useD3 } from '../../hooks/useD3';
import points from '../../data/points.json';
import { SEQUENTIAL_BLUE } from '../../utils/colors';
import ChartTooltip from './ChartTooltip';
import ChartLoading from './ChartLoading';

export default function HexbinMap() {
  const [us, setUs] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, count: 0 });

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(res => res.json())
      .then(setUs);
  }, []);

  const ref = useD3((svg) => {
    if (!us) return;
    const width = 960, height = 600;
    svg.attr('viewBox', [0, 0, width, height]);
    svg.selectAll('*').remove();

    const statesGeo = topojson.feature(us, us.objects.states);
    const projection = d3.geoAlbersUsa().fitSize([width, height], statesGeo);
    const path = d3.geoPath(projection);

    svg.append('g')
      .selectAll('path')
      .data(statesGeo.features)
      .join('path')
      .attr('d', path)
      .attr('fill', '#161619')
      .attr('stroke', '#2a2a30')
      .attr('stroke-width', 0.5);

    const projected = points.map(p => projection([p.lng, p.lat])).filter(p => p !== null);
    const hexbin = d3hexbin().radius(8).extent([[0, 0], [width, height]]);
    const bins = hexbin(projected);
    const color = d3.scaleSequential(d3.interpolateRgbBasis(['#0b0b0f', ...SEQUENTIAL_BLUE])).domain([0, d3.max(bins, d => d.length)]);

    const hexes = svg.append('g')
      .selectAll('path')
      .data(bins)
      .join('path')
      .attr('d', d => hexbin.hexagon())
      .attr('transform', d => `translate(${d.x},${d.y}) scale(0.01)`)
      .attr('fill', d => color(d.length))
      .attr('stroke', '#0b0b0f')
      .attr('stroke-width', 0.3)
      .style('cursor', 'pointer');

    hexes.transition()
      .duration(500)
      .delay((d, i) => Math.min(i * 2, 400))
      .ease(d3.easeBackOut)
      .attr('transform', d => `translate(${d.x},${d.y}) scale(1)`);

    hexes
      .on('mouseenter', function (event, d) {
        d3.select(this).transition().duration(100).attr('stroke', '#fff').attr('stroke-width', 1.5);
        setTooltip({ visible: true, x: event.offsetX, y: event.offsetY, count: d.length });
      })
      .on('mousemove', (event) => setTooltip(t => ({ ...t, x: event.offsetX, y: event.offsetY })))
      .on('mouseleave', function () {
        d3.select(this).attr('stroke', '#0b0b0f').attr('stroke-width', 0.3);
        setTooltip(t => ({ ...t, visible: false }));
      });
  }, [us]);

  return (
    <div className="relative bg-[#161619] border border-[#2a2a30] rounded-2xl p-4">
      <h2 className="text-white font-semibold mb-4">Density Hexbin Map</h2>
      {!us ? <ChartLoading label="Loading points…" /> : <svg ref={ref} className="w-full h-auto"></svg>}
      <ChartTooltip x={tooltip.x} y={tooltip.y} visible={tooltip.visible}>
        <div>{tooltip.count} points</div>
      </ChartTooltip>
    </div>
  );
}