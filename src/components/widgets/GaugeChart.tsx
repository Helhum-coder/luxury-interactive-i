import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface GaugeChartProps {
  value: number
  min?: number
  max?: number
  width?: number
  height?: number
  label?: string
  unit?: string
  animate?: boolean
}

export default function GaugeChart({ 
  value, 
  min = 0,
  max = 100,
  width = 300, 
  height = 200,
  label = 'PERFORMANCE',
  unit = '%',
  animate = true
}: GaugeChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const radius = Math.min(width, height * 1.5) / 2 - 20
    const centerX = width / 2
    const centerY = height - 20

    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX},${centerY})`)

    const startAngle = -Math.PI / 1.5
    const endAngle = Math.PI / 1.5
    const angleRange = endAngle - startAngle

    const colorScale = d3.scaleLinear<string>()
      .domain([min, max * 0.5, max])
      .range(['oklch(0.55 0.22 25)', 'oklch(0.75 0.15 85)', 'oklch(0.85 0.18 90)'])

    const backgroundArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .startAngle(startAngle)
      .endAngle(endAngle)

    g.append('path')
      .attr('d', backgroundArc as any)
      .attr('fill', 'oklch(0.28 0.10 290)')
      .attr('opacity', 0.3)

    const segments = 20
    for (let i = 0; i < segments; i++) {
      const segmentValue = min + (max - min) * (i / segments)
      const segmentStart = startAngle + (angleRange * i) / segments
      const segmentEnd = startAngle + (angleRange * (i + 1)) / segments

      const segmentArc = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius)
        .startAngle(segmentStart)
        .endAngle(segmentEnd)

      g.append('path')
        .attr('d', segmentArc as any)
        .attr('fill', colorScale(segmentValue))
        .attr('opacity', segmentValue <= value ? 0.8 : 0.1)
        .attr('filter', segmentValue <= value ? `drop-shadow(0 0 6px ${colorScale(segmentValue)})` : 'none')
    }

    const valueAngle = startAngle + (angleRange * (value - min)) / (max - min)
    
    const needleLength = radius * 0.6
    const needleWidth = 8

    const needleData = [
      [0, -needleWidth / 2],
      [needleLength, 0],
      [0, needleWidth / 2]
    ]

    const needle = g.append('g')
      .attr('transform', `rotate(${((startAngle * 180) / Math.PI)})`)

    needle.append('polygon')
      .attr('points', needleData.map(p => p.join(',')).join(' '))
      .attr('fill', 'oklch(0.85 0.18 90)')
      .attr('filter', 'drop-shadow(0 0 8px oklch(0.85 0.18 90))')

    needle.append('circle')
      .attr('r', 12)
      .attr('fill', 'oklch(0.35 0.15 300)')
      .attr('stroke', 'oklch(0.85 0.18 90)')
      .attr('stroke-width', 2)

    if (animate) {
      needle
        .transition()
        .duration(1500)
        .ease(d3.easeCubicOut)
        .attr('transform', `rotate(${(valueAngle * 180) / Math.PI})`)
    } else {
      needle.attr('transform', `rotate(${(valueAngle * 180) / Math.PI})`)
    }

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -radius * 0.3)
      .attr('fill', 'oklch(0.95 0.01 270)')
      .attr('font-size', '48px')
      .attr('font-weight', 'bold')
      .attr('class', 'font-orbitron')
      .attr('opacity', 0)
      .text(animate ? min : value)
      .transition()
      .duration(1500)
      .tween('text', function() {
        const interpolate = d3.interpolateNumber(min, value)
        return function(t) {
          d3.select(this).text(Math.round(interpolate(t)))
        }
      })
      .attr('opacity', 1)

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -radius * 0.3 + 35)
      .attr('fill', 'oklch(0.75 0.08 300)')
      .attr('font-size', '14px')
      .text(unit)
      .attr('opacity', 0)
      .transition()
      .delay(1000)
      .duration(500)
      .attr('opacity', 1)

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 40)
      .attr('fill', 'oklch(0.85 0.18 90)')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('class', 'font-orbitron')
      .text(label)
      .attr('opacity', 0)
      .transition()
      .delay(1000)
      .duration(500)
      .attr('opacity', 1)

    g.append('text')
      .attr('text-anchor', 'start')
      .attr('x', -radius)
      .attr('y', 20)
      .attr('fill', 'oklch(0.75 0.08 300)')
      .attr('font-size', '12px')
      .text(min)

    g.append('text')
      .attr('text-anchor', 'end')
      .attr('x', radius)
      .attr('y', 20)
      .attr('fill', 'oklch(0.75 0.08 300)')
      .attr('font-size', '12px')
      .text(max)

  }, [value, min, max, width, height, label, unit, animate])

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ overflow: 'visible' }}
    />
  )
}
