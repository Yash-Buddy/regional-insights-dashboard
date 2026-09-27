import { useState } from 'react';
import * as d3 from 'd3';
import { useD3 } from '../../hooks/useD3';
import flows from '../../data/flows.json';
import { CATEGORICAL } from '../../utils/colors';
import ChartTooltip from './ChartTooltip';

const DIMENSIONS = ['education', 'employment', 'income'];

function ribbonPath(x0, y0Top, y0Bot, x1, y1Top, y1Bot) {
  const xm = (x0 + x1) / 2;
  return `M${x0},${y0Top} C${xm},${y0Top} ${xm},${y1Top} ${x1},${y1Top} L${x1},${y1Bot} C${xm},${y1Bot} ${xm},${y0Bot} ${x0},${y0Bot} Z`;
}

export default function ParallelSets() {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, from: '', to: '', value: 0 });

  const ref = useD3((svg) => {
    const width = 960, height = 560, margin = { top: 30, right: 110, bottom: 20, left: 110 };
    const nodeWidth = 14, nodeGap = 6;
    svg.attr('viewBox', [0, 0, width, height]);
    svg.selectAll('*').remove();

    const xScale = d3.scalePoint().domain(DIMENSIONS).range([margin.left, width - margin.right]);
    const nodesByDim = {};
    DIMENSIONS.forEach(dim => { nodesByDim[dim] = Array.from(new Set(flows.map(f => f[dim]))); });

    const bandsByDim = {};
    DIMENSIONS.forEach(dim => {
      const cats = nodesByDim[dim];
      const totals = cats.map(cat => ({ cat, total: d3.sum(flows.filter(f => f[dim] === cat), f => f.count) }));
      const availableHeight = (height - margin.top - margin.bottom) - nodeGap * (totals.length - 1);
      const totalValue = d3.sum(totals, t => t.total) || 1;
      const scale = availableHeight / totalValue;
      let y = margin.top;
      const bands = {};
      totals.forEach(t => {
        const h = Math.max(t.total * scale, 1);
        bands[t.cat] = { y0: y, y1: y + h, total: t.total };
        y += h + nodeGap;
      });
      bandsByDim[dim] = bands;
    });

    const color = d3.scaleOrdinal().domain(nodesByDim.education).range(CATEGORICAL);

    for (let i = 0; i < DIMENSIONS.length - 1; i++) {
      const dimA = DIMENSIONS[i], dimB = DIMENSIONS[i + 1];
      const sourceCursor = {}, targetCursor = {};
      nodesByDim[dimA].forEach(c => { sourceCursor[c] = bandsByDim[dimA][c].y0; });
      nodesByDim[dimB].forEach(c => { targetCursor[c] = bandsByDim[dimB][c].y0; });

      const ordered = [...flows].sort((a, b) => d3.ascending(a[dimB], b[dimB]));
      const linkData = ordered.map(d => {
        const val = d.count;
        const srcBand = bandsByDim[dimA][d[dimA]], tgtBand = bandsByDim[dimB][d[dimB]];
        const srcH = (val / srcBand.total) * (srcBand.y1 - srcBand.y0);
        const tgtH = (val / tgtBand.total) * (tgtBand.y1 - tgtBand.y0);
        const y0Top = sourceCursor[d[dimA]], y0Bot = y0Top + srcH;
        sourceCursor[d[dimA]] = y0Bot;
        const y1Top = targetCursor[d[dimB]], y1Bot = y1Top + tgtH;
        targetCursor[d[dimB]] = y1Bot;
        return { x0: xScale(dimA) + nodeWidth, x1: xScale(dimB) - nodeWidth, y0Top, y0Bot, y1Top, y1Bot, education: d.education, from: d[dimA], to: d[dimB], value: val };
      });

      const ribbons = svg.append('g')
        .selectAll('path')
        .data(linkData)
        .join('path')
        .attr('d', d => ribbonPath(d.x0, d.y0Top, d.y0Bot, d.x1, d.y1Top, d.y1Bot))
        .attr('fill', d => color(d.education))
        .style('cursor', 'pointer')
        .attr('opacity', 0);

      ribbons.transition().duration(500).delay((d, i) => i * 4).attr('opacity', 0.55);

      ribbons
        .on('mouseenter', function (event, d) {
          svg.selectAll('path').transition().duration(100).attr('opacity', 0.12);
          d3.select(this).transition().duration(100).attr('opacity', 0.9);
          setTooltip({ visible: true, x: event.offsetX, y: event.offsetY, from: d.from, to: d.to, value: d.value });
        })
        .on('mousemove', (event) => setTooltip(t => ({ ...t, x: event.offsetX, y: event.offsetY })))
        .on('mouseleave', function () {
          svg.selectAll('path').transition().duration(150).attr('opacity', 0.55);
          setTooltip(t => ({ ...t, visible: false }));
        });
    }

    DIMENSIONS.forEach(dim => {
      const cats = nodesByDim[dim], bands = bandsByDim[dim];
      svg.append('g')
        .selectAll('rect')
        .data(cats)
        .join('rect')
        .attr('x', xScale(dim) - nodeWidth / 2)
        .attr('y', d => bands[d].y0)
        .attr('width', nodeWidth)
        .attr('height', d => Math.max(bands[d].y1 - bands[d].y0, 1))
        .attr('fill', '#e5e7eb')
        .attr('rx', 2)
        .style('cursor', 'pointer')
        .on('mouseenter', function (event, d) {
          setTooltip({ visible: true, x: event.offsetX, y: event.offsetY, from: d, to: '', value: bands[d].total });
        })
        .on('mousemove', (event) => setTooltip(t => ({ ...t, x: event.offsetX, y: event.offsetY })))
        .on('mouseleave', () => setTooltip(t => ({ ...t, visible: false })));

      svg.append('g')
        .selectAll('text')
        .data(cats)
        .join('text')
        .attr('x', xScale(dim) + (dim === DIMENSIONS[DIMENSIONS.length - 1] ? nodeWidth : -nodeWidth))
        .attr('y', d => (bands[d].y0 + bands[d].y1) / 2)
        .attr('text-anchor', dim === DIMENSIONS[DIMENSIONS.length - 1] ? 'start' : 'end')
        .attr('dy', '0.32em')
        .attr('fill', '#e5e7eb')
        .attr('font-size', 12)
        .text(d => d);
    });
  }, [flows]);

  return (
    <div className="relative bg-[#161619] border border-[#2a2a30] rounded-2xl p-4">
      <h2 className="text-white font-semibold mb-4">Education → Employment → Income Flow</h2>
      <svg ref={ref} className="w-full h-auto"></svg>
      <ChartTooltip x={tooltip.x} y={tooltip.y} visible={tooltip.visible}>
        {tooltip.to ? (
          <>
            <div className="font-semibold">{tooltip.from} → {tooltip.to}</div>
            <div>{tooltip.value} people</div>
          </>
        ) : (
          <div className="font-semibold">{tooltip.from}: {tooltip.value}</div>
        )}
      </ChartTooltip>
    </div>
  );
}