import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: DataPoint[]
  width?: number
  height?: number
  baseColor?: string
  animate?: boolean
  horizontal?: boolean
}

export default function BarChart({ 
  data, 
  width = 400, 
  height = 250,
  baseColor = 'oklch(0.85 0.18 90)',
  animate = true,
  horizontal = false
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 30, bottom: 60, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    if (!horizontal) {
      const xScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerWidth])
        .padding(0.3)

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) || 100])
        .nice()
        .range([innerHeight, 0])

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .attr('color', 'oklch(0.75 0.08 300)')
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')

      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
        .attr('color', 'oklch(0.75 0.08 300)')

      const bars = g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.label) || 0)
        .attr('y', innerHeight)
        .attr('width', xScale.bandwidth())
        .attr('height', 0)
        .attr('fill', d => d.color || baseColor)
        .attr('filter', 'drop-shadow(0 0 8px ' + baseColor + ')')
        .attr('rx', 4)

      if (animate) {
        bars
          .transition()
          .duration(1000)
          .delay((d, i) => i * 100)
          .ease(d3.easeCubicOut)
          .attr('y', d => yScale(d.value))
          .attr('height', d => innerHeight - yScale(d.value))
      } else {
        bars
          .attr('y', d => yScale(d.value))
          .attr('height', d => innerHeight - yScale(d.value))
      }

      g.selectAll('.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'oklch(0.95 0.01 270)')
        .attr('font-size', '12px')
        .attr('opacity', 0)
        .text(d => d.value.toLocaleString())
        .transition()
        .delay(1000)
        .duration(500)
        .attr('opacity', 1)

    } else {
      const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) || 100])
        .nice()
        .range([0, innerWidth])

      const yScale = d3.scaleBand()
        .domain(data.map(d => d.label))
        .range([0, innerHeight])
        .padding(0.3)

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .attr('color', 'oklch(0.75 0.08 300)')

      g.append('g')
        .call(d3.axisLeft(yScale))
        .attr('color', 'oklch(0.75 0.08 300)')

      const bars = g.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', d => yScale(d.label) || 0)
        .attr('width', 0)
        .attr('height', yScale.bandwidth())
        .attr('fill', d => d.color || baseColor)
        .attr('filter', 'drop-shadow(0 0 8px ' + baseColor + ')')
        .attr('rx', 4)

      if (animate) {
        bars
          .transition()
          .duration(1000)
          .delay((d, i) => i * 100)
          .ease(d3.easeCubicOut)
          .attr('width', d => xScale(d.value))
      } else {
        bars.attr('width', d => xScale(d.value))
      }

      g.selectAll('.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => xScale(d.value) + 10)
        .attr('y', d => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'oklch(0.95 0.01 270)')
        .attr('font-size', '12px')
        .attr('opacity', 0)
        .text(d => d.value.toLocaleString())
        .transition()
        .delay(1000)
        .duration(500)
        .attr('opacity', 1)
    }

  }, [data, width, height, baseColor, animate, horizontal])

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ overflow: 'visible' }}
    />
  )
}
