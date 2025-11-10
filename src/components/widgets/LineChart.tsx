import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  x: number | string
  y: number
  label?: string
}

interface LineChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  color?: string
  showGrid?: boolean
  animate?: boolean
}

export default function LineChart({ 
  data, 
  width = 400, 
  height = 250,
  color = 'oklch(0.85 0.18 90)',
  showGrid = true,
  animate = true
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y) || 100])
      .nice()
      .range([innerHeight, 0])

    if (showGrid) {
      g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.1)
        .call(
          d3.axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickFormat(() => '')
        )
    }

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr('color', 'oklch(0.75 0.08 300)')

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .attr('color', 'oklch(0.75 0.08 300)')

    const line = d3.line<DataPoint>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d.y))
      .curve(d3.curveMonotoneX)

    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', line)
      .attr('filter', 'drop-shadow(0 0 8px ' + color + ')')

    if (animate) {
      const totalLength = path.node()?.getTotalLength() || 0
      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1500)
        .ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0)
    }

    const area = d3.area<DataPoint>()
      .x((d, i) => xScale(i))
      .y0(innerHeight)
      .y1(d => yScale(d.y))
      .curve(d3.curveMonotoneX)

    g.append('path')
      .datum(data)
      .attr('fill', color)
      .attr('opacity', 0.1)
      .attr('d', area)

    g.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d, i) => xScale(i))
      .attr('cy', d => yScale(d.y))
      .attr('r', 0)
      .attr('fill', color)
      .attr('filter', 'drop-shadow(0 0 4px ' + color + ')')
      .transition()
      .delay((d, i) => i * 100)
      .duration(300)
      .attr('r', 4)

  }, [data, width, height, color, showGrid, animate])

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ overflow: 'visible' }}
    />
  )
}
