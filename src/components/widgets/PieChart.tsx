import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface PieChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  innerRadius?: number
  animate?: boolean
  showLabels?: boolean
}

export default function PieChart({ 
  data, 
  width = 400, 
  height = 300,
  innerRadius = 0,
  animate = true,
  showLabels = true
}: PieChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const radius = Math.min(width, height) / 2 - 40
    const centerX = width / 2
    const centerY = height / 2

    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX},${centerY})`)

    const colorScale = d3.scaleOrdinal<string>()
      .domain(data.map(d => d.label))
      .range([
        'oklch(0.85 0.18 90)',
        'oklch(0.75 0.15 85)',
        'oklch(0.35 0.15 300)',
        'oklch(0.55 0.22 25)',
        'oklch(0.65 0.20 180)',
        'oklch(0.70 0.18 270)',
      ])

    const pie = d3.pie<DataPoint>()
      .value(d => d.value)
      .sort(null)

    const arc = d3.arc<d3.PieArcDatum<DataPoint>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)

    const outerArc = d3.arc<d3.PieArcDatum<DataPoint>>()
      .innerRadius(radius + 10)
      .outerRadius(radius + 10)

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')

    const paths = arcs.append('path')
      .attr('fill', d => d.data.color || colorScale(d.data.label))
      .attr('stroke', 'oklch(0.20 0.02 270)')
      .attr('stroke-width', 2)
      .attr('filter', d => `drop-shadow(0 0 8px ${d.data.color || colorScale(d.data.label)})`)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', function() {
            const [x, y] = arc.centroid(d)
            return `translate(${x * 0.1},${y * 0.1})`
          })
          .attr('opacity', 0.8)
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('transform', 'translate(0,0)')
          .attr('opacity', 1)
      })

    if (animate) {
      paths
        .transition()
        .duration(1000)
        .attrTween('d', function(d) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
          return function(t) {
            return arc(interpolate(t)) || ''
          }
        })
    } else {
      paths.attr('d', arc)
    }

    if (showLabels) {
      const labels = arcs.append('text')
        .attr('transform', d => {
          const pos = outerArc.centroid(d)
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
          pos[0] = radius * 1.2 * (midAngle < Math.PI ? 1 : -1)
          return `translate(${pos})`
        })
        .attr('text-anchor', d => {
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
          return midAngle < Math.PI ? 'start' : 'end'
        })
        .attr('fill', 'oklch(0.95 0.01 270)')
        .attr('font-size', '12px')
        .attr('opacity', 0)
        .text(d => `${d.data.label}: ${d.data.value}`)

      if (animate) {
        labels
          .transition()
          .delay(1000)
          .duration(500)
          .attr('opacity', 1)
      } else {
        labels.attr('opacity', 1)
      }

      arcs.append('polyline')
        .attr('stroke', 'oklch(0.75 0.08 300)')
        .attr('stroke-width', 1)
        .attr('fill', 'none')
        .attr('opacity', 0)
        .attr('points', d => {
          const posA = arc.centroid(d)
          const posB = outerArc.centroid(d)
          const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
          const posC = [radius * 1.15 * (midAngle < Math.PI ? 1 : -1), posB[1]]
          return [posA, posB, posC].map(p => p.join(',')).join(' ')
        })
        .transition()
        .delay(1000)
        .duration(500)
        .attr('opacity', 0.5)
    }

    if (innerRadius > 0) {
      const total = d3.sum(data, d => d.value)
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .attr('fill', 'oklch(0.95 0.01 270)')
        .attr('font-size', '24px')
        .attr('font-weight', 'bold')
        .attr('class', 'font-orbitron')
        .attr('opacity', 0)
        .text(total.toLocaleString())
        .transition()
        .delay(1000)
        .duration(500)
        .attr('opacity', 1)

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1em')
        .attr('fill', 'oklch(0.75 0.08 300)')
        .attr('font-size', '12px')
        .attr('opacity', 0)
        .text('TOTAL')
        .transition()
        .delay(1000)
        .duration(500)
        .attr('opacity', 1)
    }

  }, [data, width, height, innerRadius, animate, showLabels])

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ overflow: 'visible' }}
    />
  )
}
