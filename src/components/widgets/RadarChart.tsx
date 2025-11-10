import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  axis: string
  value: number
}

interface RadarChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  color?: string
  levels?: number
  animate?: boolean
}

export default function RadarChart({ 
  data, 
  width = 400, 
  height = 400,
  color = 'oklch(0.85 0.18 90)',
  levels = 5,
  animate = true
}: RadarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const radius = Math.min(width, height) / 2 - 60
    const centerX = width / 2
    const centerY = height / 2

    const g = svg
      .append('g')
      .attr('transform', `translate(${centerX},${centerY})`)

    const angleSlice = (Math.PI * 2) / data.length
    const maxValue = d3.max(data, d => d.value) || 100

    const rScale = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, radius])

    for (let i = 0; i < levels; i++) {
      const levelFactor = radius * ((i + 1) / levels)
      
      const points = data.map((d, index) => {
        const angle = angleSlice * index - Math.PI / 2
        return [
          Math.cos(angle) * levelFactor,
          Math.sin(angle) * levelFactor
        ]
      })
      points.push(points[0])

      g.append('polygon')
        .attr('points', points.map(p => p.join(',')).join(' '))
        .attr('fill', 'none')
        .attr('stroke', 'oklch(0.35 0.12 280)')
        .attr('stroke-width', 1)
        .attr('opacity', 0.3)
    }

    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const lineCoord = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      }

      g.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', lineCoord.x)
        .attr('y2', lineCoord.y)
        .attr('stroke', 'oklch(0.35 0.12 280)')
        .attr('stroke-width', 1)
        .attr('opacity', 0.5)

      g.append('text')
        .attr('x', lineCoord.x * 1.15)
        .attr('y', lineCoord.y * 1.15)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'oklch(0.95 0.01 270)')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(d.axis)
    })

    const radarLine = d3.lineRadial<DataPoint>()
      .angle((d, i) => angleSlice * i)
      .radius(d => rScale(d.value))
      .curve(d3.curveLinearClosed)

    const radarArea = d3.areaRadial<DataPoint>()
      .angle((d, i) => angleSlice * i)
      .innerRadius(0)
      .outerRadius(d => rScale(d.value))
      .curve(d3.curveLinearClosed)

    const area = g.append('path')
      .datum(data)
      .attr('fill', color)
      .attr('fill-opacity', 0.3)
      .attr('d', radarArea)
      .attr('transform', 'rotate(-90)')

    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', radarLine)
      .attr('transform', 'rotate(-90)')
      .attr('filter', `drop-shadow(0 0 8px ${color})`)

    if (animate) {
      const totalLength = path.node()?.getTotalLength() || 0
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0)

      area
        .attr('fill-opacity', 0)
        .transition()
        .duration(1000)
        .delay(500)
        .attr('fill-opacity', 0.3)
    }

    data.forEach((d, i) => {
      const angle = angleSlice * i - Math.PI / 2
      const x = Math.cos(angle) * rScale(d.value)
      const y = Math.sin(angle) * rScale(d.value)

      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 0)
        .attr('fill', color)
        .attr('filter', `drop-shadow(0 0 4px ${color})`)
        .transition()
        .delay(i * 100 + 1000)
        .duration(300)
        .attr('r', 5)
    })

  }, [data, width, height, color, levels, animate])

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ overflow: 'visible' }}
    />
  )
}
