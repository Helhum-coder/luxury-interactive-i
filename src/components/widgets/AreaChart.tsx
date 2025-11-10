import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  x: number | string
  y: number
  label?: string
}

interface Series {
  name: string
  data: DataPoint[]
  color: string
}

interface AreaChartProps {
  series: Series[]
  width?: number
  height?: number
  showGrid?: boolean
  animate?: boolean
  stacked?: boolean
}

export default function AreaChart({ 
  series, 
  width = 400, 
  height = 250,
  showGrid = true,
  animate = true,
  stacked = false
}: AreaChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !series || series.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const margin = { top: 20, right: 100, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const maxLength = Math.max(...series.map(s => s.data.length))
    
    const xScale = d3.scaleLinear()
      .domain([0, maxLength - 1])
      .range([0, innerWidth])

    let maxY = 0
    if (stacked) {
      for (let i = 0; i < maxLength; i++) {
        const sum = series.reduce((acc, s) => acc + (s.data[i]?.y || 0), 0)
        maxY = Math.max(maxY, sum)
      }
    } else {
      maxY = d3.max(series.flatMap(s => s.data.map(d => d.y))) || 100
    }

    const yScale = d3.scaleLinear()
      .domain([0, maxY])
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

    if (stacked) {
      const stackedData: number[][] = []
      for (let i = 0; i < maxLength; i++) {
        let cumulative = 0
        const stack: number[] = []
        series.forEach(s => {
          const value = s.data[i]?.y || 0
          stack.push(cumulative)
          cumulative += value
          stack.push(cumulative)
        })
        stackedData.push(stack)
      }

      series.forEach((s, seriesIndex) => {
        const area = d3.area<number>()
          .x((d, i) => xScale(Math.floor(i / 2)))
          .y0((d, i) => i % 2 === 0 ? yScale(d) : yScale(d))
          .y1((d, i) => i % 2 === 0 ? yScale(d) : yScale(d))
          .curve(d3.curveMonotoneX)

        const areaData: number[] = []
        for (let i = 0; i < maxLength; i++) {
          areaData.push(stackedData[i][seriesIndex * 2])
          areaData.push(stackedData[i][seriesIndex * 2 + 1])
        }

        const path = g.append('path')
          .datum(areaData)
          .attr('fill', s.color)
          .attr('opacity', 0.6)
          .attr('d', area)

        if (animate) {
          path
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .delay(seriesIndex * 200)
            .attr('opacity', 0.6)
        }
      })

    } else {
      series.forEach((s, index) => {
        const area = d3.area<DataPoint>()
          .x((d, i) => xScale(i))
          .y0(innerHeight)
          .y1(d => yScale(d.y))
          .curve(d3.curveMonotoneX)

        const path = g.append('path')
          .datum(s.data)
          .attr('fill', s.color)
          .attr('opacity', 0.3)
          .attr('d', area)

        if (animate) {
          path
            .attr('opacity', 0)
            .transition()
            .duration(1000)
            .delay(index * 200)
            .attr('opacity', 0.3)
        }

        const line = d3.line<DataPoint>()
          .x((d, i) => xScale(i))
          .y(d => yScale(d.y))
          .curve(d3.curveMonotoneX)

        const linePath = g.append('path')
          .datum(s.data)
          .attr('fill', 'none')
          .attr('stroke', s.color)
          .attr('stroke-width', 2)
          .attr('d', line)
          .attr('filter', `drop-shadow(0 0 6px ${s.color})`)

        if (animate) {
          const totalLength = linePath.node()?.getTotalLength() || 0
          linePath
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(1500)
            .delay(index * 200)
            .ease(d3.easeCubicInOut)
            .attr('stroke-dashoffset', 0)
        }
      })
    }

    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth + 10}, 0)`)

    series.forEach((s, index) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0, ${index * 25})`)

      legendRow.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', s.color)
        .attr('rx', 2)

      legendRow.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .attr('fill', 'oklch(0.95 0.01 270)')
        .attr('font-size', '12px')
        .text(s.name)
    })

  }, [series, width, height, showGrid, animate, stacked])

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height}
      style={{ overflow: 'visible' }}
    />
  )
}
