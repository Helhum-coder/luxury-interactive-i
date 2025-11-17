import { DashboardWidget } from './types'

export type IndustryType = 
  | 'finance' 
  | 'healthcare' 
  | 'ecommerce' 
  | 'saas' 
  | 'manufacturing'
  | 'marketing'
  | 'logistics'
  | 'education'
  | 'realEstate'
  | 'energy'

export interface DashboardTemplate {
  id: string
  name: string
  industry: IndustryType
  description: string
  icon: string
  color: string
  widgets: DashboardWidget[]
  tags: string[]
}

const generateTimeSeriesData = (points: number, min: number, max: number, trend: 'up' | 'down' | 'flat' = 'flat') => {
  return Array.from({ length: points }, (_, i) => {
    const trendValue = trend === 'up' ? i * 2 : trend === 'down' ? -i * 2 : 0
    return {
      x: i,
      y: Math.floor(Math.random() * (max - min) + min + trendValue)
    }
  })
}

export const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'finance-dashboard',
    name: 'Financial Analytics',
    industry: 'finance',
    description: 'Comprehensive financial performance tracking with revenue, expenses, and portfolio metrics',
    icon: 'ChartLine',
    color: 'oklch(0.85 0.18 90)',
    tags: ['revenue', 'expenses', 'portfolio', 'cash-flow'],
    widgets: [
      {
        id: 'finance-revenue-trend',
        type: 'area',
        title: 'Revenue & Expenses Trend',
        data: [
          {
            name: 'Revenue',
            data: generateTimeSeriesData(12, 80000, 120000, 'up'),
            color: 'oklch(0.75 0.15 140)'
          },
          {
            name: 'Expenses',
            data: generateTimeSeriesData(12, 40000, 60000, 'up'),
            color: 'oklch(0.65 0.20 30)'
          },
          {
            name: 'Profit',
            data: generateTimeSeriesData(12, 30000, 50000, 'up'),
            color: 'oklch(0.85 0.18 90)'
          }
        ],
        position: { x: 0, y: 0, w: 6, h: 2 },
        chartConfig: { showGrid: true, animate: true }
      },
      {
        id: 'finance-metrics',
        type: 'metric',
        title: 'Key Financial Metrics',
        data: {
          'Total Revenue': '$1,247,850',
          'Net Profit': '$487,320',
          'Profit Margin': '39.1%',
          'Operating Cash Flow': '$623,450',
          'ROI': '24.3%',
          'Burn Rate': '$145K/mo'
        },
        position: { x: 6, y: 0, w: 3, h: 2 }
      },
      {
        id: 'finance-portfolio',
        type: 'pie',
        title: 'Portfolio Distribution',
        data: [
          { label: 'Stocks', value: 45, color: 'oklch(0.85 0.18 90)' },
          { label: 'Bonds', value: 25, color: 'oklch(0.75 0.15 140)' },
          { label: 'Real Estate', value: 18, color: 'oklch(0.65 0.20 180)' },
          { label: 'Commodities', value: 12, color: 'oklch(0.55 0.22 30)' }
        ],
        position: { x: 9, y: 0, w: 3, h: 2 },
        chartConfig: { innerRadius: 60, animate: true, showLabels: true }
      },
      {
        id: 'finance-quarterly',
        type: 'bar',
        title: 'Quarterly Performance',
        data: [
          { label: 'Q1', value: 287000 },
          { label: 'Q2', value: 298000 },
          { label: 'Q3', value: 325000 },
          { label: 'Q4', value: 337000 }
        ],
        position: { x: 0, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.85 0.18 90)', animate: true }
      },
      {
        id: 'finance-cashflow',
        type: 'line',
        title: 'Cash Flow Forecast',
        data: generateTimeSeriesData(12, 100000, 180000, 'up'),
        position: { x: 4, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.75 0.15 140)', showGrid: true, animate: true }
      },
      {
        id: 'finance-health',
        type: 'gauge',
        title: 'Financial Health Score',
        data: { value: 87, label: 'HEALTH SCORE', unit: '/100' },
        position: { x: 8, y: 2, w: 4, h: 2 },
        chartConfig: { min: 0, max: 100, animate: true }
      }
    ]
  },
  {
    id: 'healthcare-dashboard',
    name: 'Healthcare Operations',
    industry: 'healthcare',
    description: 'Patient care metrics, bed occupancy, staff utilization, and clinical outcomes',
    icon: 'Heart',
    color: 'oklch(0.65 0.20 180)',
    tags: ['patients', 'occupancy', 'staff', 'outcomes'],
    widgets: [
      {
        id: 'health-patients',
        type: 'line',
        title: 'Daily Patient Admissions',
        data: generateTimeSeriesData(30, 45, 85),
        position: { x: 0, y: 0, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.65 0.20 180)', showGrid: true, animate: true }
      },
      {
        id: 'health-occupancy',
        type: 'gauge',
        title: 'Bed Occupancy Rate',
        data: { value: 76, label: 'OCCUPANCY', unit: '%' },
        position: { x: 4, y: 0, w: 3, h: 2 },
        chartConfig: { min: 0, max: 100, animate: true }
      },
      {
        id: 'health-departments',
        type: 'bar',
        title: 'Department Utilization',
        data: [
          { label: 'Emergency', value: 92 },
          { label: 'ICU', value: 78 },
          { label: 'Surgery', value: 85 },
          { label: 'Pediatrics', value: 67 },
          { label: 'Cardiology', value: 73 }
        ],
        position: { x: 7, y: 0, w: 5, h: 2 },
        chartConfig: { color: 'oklch(0.65 0.20 180)', animate: true, horizontal: true }
      },
      {
        id: 'health-metrics',
        type: 'metric',
        title: 'Clinical Metrics',
        data: {
          'Active Patients': '1,247',
          'Avg Wait Time': '18 min',
          'Staff on Duty': '187',
          'Available Beds': '42',
          'Patient Satisfaction': '4.6/5',
          'Emergency Response': '4.2 min'
        },
        position: { x: 0, y: 2, w: 4, h: 2 }
      },
      {
        id: 'health-outcomes',
        type: 'radar',
        title: 'Care Quality Indicators',
        data: [
          { axis: 'Patient Safety', value: 92 },
          { axis: 'Treatment Efficacy', value: 88 },
          { axis: 'Response Time', value: 85 },
          { axis: 'Staff Training', value: 90 },
          { axis: 'Equipment Ready', value: 87 },
          { axis: 'Hygiene Standards', value: 95 }
        ],
        position: { x: 4, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.65 0.20 180)', levels: 5, animate: true }
      },
      {
        id: 'health-status',
        type: 'status',
        title: 'Facility Status',
        data: {
          'Emergency Room': 'Operational',
          'Laboratory': 'Operational',
          'Imaging (MRI/CT)': 'Operational',
          'Pharmacy': 'Operational',
          'Blood Bank': 'Stocked',
          'Backup Generator': 'Ready'
        },
        position: { x: 8, y: 2, w: 4, h: 2 }
      }
    ]
  },
  {
    id: 'ecommerce-dashboard',
    name: 'E-Commerce Analytics',
    industry: 'ecommerce',
    description: 'Sales tracking, conversion rates, customer behavior, and inventory management',
    icon: 'ShoppingCart',
    color: 'oklch(0.75 0.15 85)',
    tags: ['sales', 'conversion', 'customers', 'inventory'],
    widgets: [
      {
        id: 'ecom-sales',
        type: 'area',
        title: 'Sales Performance',
        data: [
          {
            name: 'Online Sales',
            data: generateTimeSeriesData(14, 15000, 35000, 'up'),
            color: 'oklch(0.75 0.15 85)'
          },
          {
            name: 'In-Store Sales',
            data: generateTimeSeriesData(14, 8000, 18000),
            color: 'oklch(0.65 0.20 180)'
          }
        ],
        position: { x: 0, y: 0, w: 6, h: 2 },
        chartConfig: { showGrid: true, animate: true }
      },
      {
        id: 'ecom-conversion',
        type: 'gauge',
        title: 'Conversion Rate',
        data: { value: 3.42, label: 'CONVERSION', unit: '%' },
        position: { x: 6, y: 0, w: 3, h: 2 },
        chartConfig: { min: 0, max: 10, animate: true }
      },
      {
        id: 'ecom-traffic',
        type: 'pie',
        title: 'Traffic Sources',
        data: [
          { label: 'Organic Search', value: 42, color: 'oklch(0.85 0.18 90)' },
          { label: 'Direct', value: 28, color: 'oklch(0.75 0.15 85)' },
          { label: 'Social Media', value: 18, color: 'oklch(0.65 0.20 180)' },
          { label: 'Referral', value: 12, color: 'oklch(0.55 0.22 30)' }
        ],
        position: { x: 9, y: 0, w: 3, h: 2 },
        chartConfig: { innerRadius: 60, animate: true, showLabels: true }
      },
      {
        id: 'ecom-metrics',
        type: 'metric',
        title: 'Key E-Commerce Metrics',
        data: {
          'Total Orders': '4,287',
          'Revenue': '$187,450',
          'Avg Order Value': '$43.72',
          'Active Carts': '847',
          'Cart Abandonment': '68.3%',
          'Return Rate': '4.2%'
        },
        position: { x: 0, y: 2, w: 4, h: 2 }
      },
      {
        id: 'ecom-categories',
        type: 'bar',
        title: 'Top Product Categories',
        data: [
          { label: 'Electronics', value: 45820 },
          { label: 'Fashion', value: 38940 },
          { label: 'Home & Garden', value: 32450 },
          { label: 'Sports', value: 28930 },
          { label: 'Beauty', value: 24680 }
        ],
        position: { x: 4, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.75 0.15 85)', animate: true }
      },
      {
        id: 'ecom-customer',
        type: 'radar',
        title: 'Customer Experience Score',
        data: [
          { axis: 'Page Speed', value: 88 },
          { axis: 'Search Quality', value: 92 },
          { axis: 'Checkout UX', value: 78 },
          { axis: 'Product Info', value: 85 },
          { axis: 'Support', value: 90 }
        ],
        position: { x: 8, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.75 0.15 85)', levels: 5, animate: true }
      }
    ]
  },
  {
    id: 'saas-dashboard',
    name: 'SaaS Metrics',
    industry: 'saas',
    description: 'MRR, churn rate, user growth, feature adoption, and customer lifetime value',
    icon: 'Cloud',
    color: 'oklch(0.35 0.15 300)',
    tags: ['mrr', 'churn', 'growth', 'retention'],
    widgets: [
      {
        id: 'saas-mrr',
        type: 'line',
        title: 'Monthly Recurring Revenue (MRR)',
        data: generateTimeSeriesData(12, 85000, 145000, 'up'),
        position: { x: 0, y: 0, w: 5, h: 2 },
        chartConfig: { color: 'oklch(0.35 0.15 300)', showGrid: true, animate: true }
      },
      {
        id: 'saas-churn',
        type: 'gauge',
        title: 'Monthly Churn Rate',
        data: { value: 2.8, label: 'CHURN', unit: '%' },
        position: { x: 5, y: 0, w: 3, h: 2 },
        chartConfig: { min: 0, max: 10, animate: true }
      },
      {
        id: 'saas-plans',
        type: 'pie',
        title: 'Subscription Distribution',
        data: [
          { label: 'Enterprise', value: 15, color: 'oklch(0.85 0.18 90)' },
          { label: 'Professional', value: 38, color: 'oklch(0.35 0.15 300)' },
          { label: 'Starter', value: 47, color: 'oklch(0.65 0.20 180)' }
        ],
        position: { x: 8, y: 0, w: 4, h: 2 },
        chartConfig: { innerRadius: 60, animate: true, showLabels: true }
      },
      {
        id: 'saas-metrics',
        type: 'metric',
        title: 'SaaS KPIs',
        data: {
          'Active Users': '12,847',
          'New Signups': '342',
          'CAC': '$127',
          'LTV': '$2,840',
          'LTV/CAC Ratio': '22.4x',
          'Trial Conversion': '18.5%'
        },
        position: { x: 0, y: 2, w: 4, h: 2 }
      },
      {
        id: 'saas-growth',
        type: 'bar',
        title: 'User Growth by Cohort',
        data: [
          { label: 'Jan 2025', value: 1847 },
          { label: 'Feb 2025', value: 2134 },
          { label: 'Mar 2025', value: 2456 },
          { label: 'Apr 2025', value: 2789 },
          { label: 'May 2025', value: 3245 }
        ],
        position: { x: 4, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.35 0.15 300)', animate: true }
      },
      {
        id: 'saas-features',
        type: 'radar',
        title: 'Feature Adoption Rate',
        data: [
          { axis: 'Dashboard', value: 95 },
          { axis: 'Reports', value: 78 },
          { axis: 'API Access', value: 45 },
          { axis: 'Integrations', value: 62 },
          { axis: 'Mobile App', value: 58 },
          { axis: 'Collaboration', value: 82 }
        ],
        position: { x: 8, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.35 0.15 300)', levels: 5, animate: true }
      }
    ]
  },
  {
    id: 'manufacturing-dashboard',
    name: 'Manufacturing Operations',
    industry: 'manufacturing',
    description: 'Production efficiency, equipment utilization, quality control, and supply chain',
    icon: 'Factory',
    color: 'oklch(0.55 0.22 30)',
    tags: ['production', 'efficiency', 'quality', 'supply-chain'],
    widgets: [
      {
        id: 'mfg-production',
        type: 'line',
        title: 'Daily Production Output',
        data: generateTimeSeriesData(20, 850, 1200),
        position: { x: 0, y: 0, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.55 0.22 30)', showGrid: true, animate: true }
      },
      {
        id: 'mfg-oee',
        type: 'gauge',
        title: 'Overall Equipment Effectiveness',
        data: { value: 82, label: 'OEE', unit: '%' },
        position: { x: 4, y: 0, w: 3, h: 2 },
        chartConfig: { min: 0, max: 100, animate: true }
      },
      {
        id: 'mfg-downtime',
        type: 'pie',
        title: 'Downtime Causes',
        data: [
          { label: 'Maintenance', value: 35, color: 'oklch(0.85 0.18 90)' },
          { label: 'Material Shortage', value: 28, color: 'oklch(0.65 0.20 30)' },
          { label: 'Equipment Failure', value: 22, color: 'oklch(0.55 0.22 30)' },
          { label: 'Changeover', value: 15, color: 'oklch(0.65 0.20 180)' }
        ],
        position: { x: 7, y: 0, w: 5, h: 2 },
        chartConfig: { innerRadius: 60, animate: true, showLabels: true }
      },
      {
        id: 'mfg-metrics',
        type: 'metric',
        title: 'Production Metrics',
        data: {
          'Units Produced': '24,847',
          'Cycle Time': '4.2 min',
          'Defect Rate': '0.8%',
          'On-Time Delivery': '96.5%',
          'Capacity Utilization': '87%',
          'Scrap Rate': '1.2%'
        },
        position: { x: 0, y: 2, w: 4, h: 2 }
      },
      {
        id: 'mfg-lines',
        type: 'bar',
        title: 'Production Line Performance',
        data: [
          { label: 'Line A', value: 92 },
          { label: 'Line B', value: 88 },
          { label: 'Line C', value: 85 },
          { label: 'Line D', value: 78 },
          { label: 'Line E', value: 83 }
        ],
        position: { x: 4, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.55 0.22 30)', animate: true, horizontal: true }
      },
      {
        id: 'mfg-quality',
        type: 'radar',
        title: 'Quality Control Metrics',
        data: [
          { axis: 'Dimensional', value: 94 },
          { axis: 'Visual', value: 92 },
          { axis: 'Functional', value: 89 },
          { axis: 'Material', value: 96 },
          { axis: 'Packaging', value: 88 }
        ],
        position: { x: 8, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.55 0.22 30)', levels: 5, animate: true }
      }
    ]
  },
  {
    id: 'marketing-dashboard',
    name: 'Marketing Performance',
    industry: 'marketing',
    description: 'Campaign ROI, lead generation, social engagement, and brand awareness',
    icon: 'MegaphoneSimple',
    color: 'oklch(0.85 0.18 90)',
    tags: ['campaigns', 'leads', 'social', 'roi'],
    widgets: [
      {
        id: 'mkt-roi',
        type: 'area',
        title: 'Campaign ROI Trend',
        data: [
          {
            name: 'Digital Ads',
            data: generateTimeSeriesData(12, 180, 320, 'up'),
            color: 'oklch(0.85 0.18 90)'
          },
          {
            name: 'Content Marketing',
            data: generateTimeSeriesData(12, 120, 240, 'up'),
            color: 'oklch(0.75 0.15 85)'
          },
          {
            name: 'Email Campaigns',
            data: generateTimeSeriesData(12, 90, 180),
            color: 'oklch(0.65 0.20 180)'
          }
        ],
        position: { x: 0, y: 0, w: 6, h: 2 },
        chartConfig: { showGrid: true, animate: true }
      },
      {
        id: 'mkt-leads',
        type: 'line',
        title: 'Lead Generation',
        data: generateTimeSeriesData(30, 120, 280, 'up'),
        position: { x: 6, y: 0, w: 6, h: 2 },
        chartConfig: { color: 'oklch(0.85 0.18 90)', showGrid: true, animate: true }
      },
      {
        id: 'mkt-metrics',
        type: 'metric',
        title: 'Marketing KPIs',
        data: {
          'Total Leads': '8,472',
          'MQL to SQL': '32%',
          'Cost per Lead': '$42',
          'Campaign ROI': '485%',
          'Email Open Rate': '24.5%',
          'Social Reach': '2.4M'
        },
        position: { x: 0, y: 2, w: 4, h: 2 }
      },
      {
        id: 'mkt-channels',
        type: 'bar',
        title: 'Channel Performance',
        data: [
          { label: 'Google Ads', value: 3248 },
          { label: 'LinkedIn', value: 2187 },
          { label: 'Facebook', value: 1892 },
          { label: 'Twitter', value: 1234 },
          { label: 'Content SEO', value: 911 }
        ],
        position: { x: 4, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.85 0.18 90)', animate: true }
      },
      {
        id: 'mkt-engagement',
        type: 'radar',
        title: 'Engagement Metrics',
        data: [
          { axis: 'Website Traffic', value: 88 },
          { axis: 'Social Shares', value: 76 },
          { axis: 'Email Clicks', value: 82 },
          { axis: 'Video Views', value: 68 },
          { axis: 'Downloads', value: 74 },
          { axis: 'Webinar Attend', value: 65 }
        ],
        position: { x: 8, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.85 0.18 90)', levels: 5, animate: true }
      }
    ]
  },
  {
    id: 'logistics-dashboard',
    name: 'Logistics & Supply Chain',
    industry: 'logistics',
    description: 'Shipment tracking, delivery performance, fleet management, and warehouse efficiency',
    icon: 'Package',
    color: 'oklch(0.65 0.20 180)',
    tags: ['shipping', 'delivery', 'fleet', 'warehouse'],
    widgets: [
      {
        id: 'log-deliveries',
        type: 'line',
        title: 'Daily Deliveries',
        data: generateTimeSeriesData(30, 450, 750),
        position: { x: 0, y: 0, w: 5, h: 2 },
        chartConfig: { color: 'oklch(0.65 0.20 180)', showGrid: true, animate: true }
      },
      {
        id: 'log-ontime',
        type: 'gauge',
        title: 'On-Time Delivery Rate',
        data: { value: 94, label: 'ON-TIME', unit: '%' },
        position: { x: 5, y: 0, w: 3, h: 2 },
        chartConfig: { min: 0, max: 100, animate: true }
      },
      {
        id: 'log-status',
        type: 'pie',
        title: 'Shipment Status',
        data: [
          { label: 'Delivered', value: 68, color: 'oklch(0.75 0.15 140)' },
          { label: 'In Transit', value: 22, color: 'oklch(0.85 0.18 90)' },
          { label: 'Processing', value: 7, color: 'oklch(0.65 0.20 180)' },
          { label: 'Delayed', value: 3, color: 'oklch(0.65 0.20 30)' }
        ],
        position: { x: 8, y: 0, w: 4, h: 2 },
        chartConfig: { innerRadius: 60, animate: true, showLabels: true }
      },
      {
        id: 'log-metrics',
        type: 'metric',
        title: 'Logistics Metrics',
        data: {
          'Active Shipments': '4,287',
          'Avg Delivery Time': '2.8 days',
          'Fleet Utilization': '87%',
          'Fuel Efficiency': '8.2 MPG',
          'Customer Rating': '4.7/5',
          'Cost per Mile': '$2.43'
        },
        position: { x: 0, y: 2, w: 4, h: 2 }
      },
      {
        id: 'log-routes',
        type: 'bar',
        title: 'Route Performance',
        data: [
          { label: 'Route A (North)', value: 96 },
          { label: 'Route B (South)', value: 92 },
          { label: 'Route C (East)', value: 88 },
          { label: 'Route D (West)', value: 94 },
          { label: 'Route E (Central)', value: 90 }
        ],
        position: { x: 4, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.65 0.20 180)', animate: true, horizontal: true }
      },
      {
        id: 'log-warehouse',
        type: 'radar',
        title: 'Warehouse Efficiency',
        data: [
          { axis: 'Pick Accuracy', value: 98 },
          { axis: 'Pack Speed', value: 85 },
          { axis: 'Space Utilization', value: 82 },
          { axis: 'Inventory Accuracy', value: 96 },
          { axis: 'Labor Efficiency', value: 88 }
        ],
        position: { x: 8, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.65 0.20 180)', levels: 5, animate: true }
      }
    ]
  },
  {
    id: 'education-dashboard',
    name: 'Education Analytics',
    industry: 'education',
    description: 'Student performance, enrollment trends, course completion, and engagement metrics',
    icon: 'GraduationCap',
    color: 'oklch(0.75 0.15 140)',
    tags: ['students', 'courses', 'performance', 'engagement'],
    widgets: [
      {
        id: 'edu-enrollment',
        type: 'area',
        title: 'Enrollment Trends',
        data: [
          {
            name: 'Online Courses',
            data: generateTimeSeriesData(12, 850, 1450, 'up'),
            color: 'oklch(0.75 0.15 140)'
          },
          {
            name: 'In-Person Classes',
            data: generateTimeSeriesData(12, 450, 750),
            color: 'oklch(0.65 0.20 180)'
          }
        ],
        position: { x: 0, y: 0, w: 6, h: 2 },
        chartConfig: { showGrid: true, animate: true }
      },
      {
        id: 'edu-completion',
        type: 'gauge',
        title: 'Course Completion Rate',
        data: { value: 78, label: 'COMPLETION', unit: '%' },
        position: { x: 6, y: 0, w: 3, h: 2 },
        chartConfig: { min: 0, max: 100, animate: true }
      },
      {
        id: 'edu-grades',
        type: 'pie',
        title: 'Grade Distribution',
        data: [
          { label: 'A (90-100)', value: 28, color: 'oklch(0.75 0.15 140)' },
          { label: 'B (80-89)', value: 35, color: 'oklch(0.85 0.18 90)' },
          { label: 'C (70-79)', value: 24, color: 'oklch(0.65 0.20 180)' },
          { label: 'D & Below', value: 13, color: 'oklch(0.65 0.20 30)' }
        ],
        position: { x: 9, y: 0, w: 3, h: 2 },
        chartConfig: { innerRadius: 60, animate: true, showLabels: true }
      },
      {
        id: 'edu-metrics',
        type: 'metric',
        title: 'Academic Metrics',
        data: {
          'Active Students': '8,472',
          'Avg Attendance': '89%',
          'Courses Offered': '247',
          'Faculty Members': '156',
          'Student-Teacher': '18:1',
          'Avg GPA': '3.42'
        },
        position: { x: 0, y: 2, w: 4, h: 2 }
      },
      {
        id: 'edu-performance',
        type: 'bar',
        title: 'Department Performance',
        data: [
          { label: 'Engineering', value: 87 },
          { label: 'Business', value: 84 },
          { label: 'Sciences', value: 89 },
          { label: 'Arts', value: 82 },
          { label: 'Medicine', value: 91 }
        ],
        position: { x: 4, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.75 0.15 140)', animate: true }
      },
      {
        id: 'edu-engagement',
        type: 'radar',
        title: 'Student Engagement',
        data: [
          { axis: 'Class Participation', value: 76 },
          { axis: 'Assignment Submit', value: 88 },
          { axis: 'Discussion Forums', value: 65 },
          { axis: 'Office Hours', value: 58 },
          { axis: 'Study Groups', value: 72 },
          { axis: 'Online Resources', value: 82 }
        ],
        position: { x: 8, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.75 0.15 140)', levels: 5, animate: true }
      }
    ]
  },
  {
    id: 'realestate-dashboard',
    name: 'Real Estate Insights',
    industry: 'realEstate',
    description: 'Property listings, market trends, sales performance, and client engagement',
    icon: 'Buildings',
    color: 'oklch(0.55 0.22 30)',
    tags: ['properties', 'sales', 'market', 'clients'],
    widgets: [
      {
        id: 're-sales',
        type: 'line',
        title: 'Property Sales Trend',
        data: generateTimeSeriesData(12, 45, 85, 'up'),
        position: { x: 0, y: 0, w: 5, h: 2 },
        chartConfig: { color: 'oklch(0.55 0.22 30)', showGrid: true, animate: true }
      },
      {
        id: 're-avgprice',
        type: 'gauge',
        title: 'Avg Sale Price',
        data: { value: 485000, label: 'AVG PRICE', unit: '' },
        position: { x: 5, y: 0, w: 3, h: 2 },
        chartConfig: { min: 0, max: 1000000, animate: true }
      },
      {
        id: 're-types',
        type: 'pie',
        title: 'Property Types',
        data: [
          { label: 'Single Family', value: 48, color: 'oklch(0.55 0.22 30)' },
          { label: 'Condos', value: 28, color: 'oklch(0.65 0.20 180)' },
          { label: 'Townhouses', value: 15, color: 'oklch(0.85 0.18 90)' },
          { label: 'Multi-Family', value: 9, color: 'oklch(0.75 0.15 85)' }
        ],
        position: { x: 8, y: 0, w: 4, h: 2 },
        chartConfig: { innerRadius: 60, animate: true, showLabels: true }
      },
      {
        id: 're-metrics',
        type: 'metric',
        title: 'Real Estate Metrics',
        data: {
          'Active Listings': '247',
          'Closed Deals': '87',
          'Avg Days on Market': '32',
          'Total Revenue': '$42.2M',
          'Commission Earned': '$1.27M',
          'Client Satisfaction': '4.8/5'
        },
        position: { x: 0, y: 2, w: 4, h: 2 }
      },
      {
        id: 're-neighborhoods',
        type: 'bar',
        title: 'Top Neighborhoods',
        data: [
          { label: 'Downtown', value: 28 },
          { label: 'Westside', value: 24 },
          { label: 'Eastside', value: 19 },
          { label: 'Suburbs North', value: 16 },
          { label: 'Suburbs South', value: 13 }
        ],
        position: { x: 4, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.55 0.22 30)', animate: true }
      },
      {
        id: 're-performance',
        type: 'radar',
        title: 'Market Performance',
        data: [
          { axis: 'Buyer Demand', value: 82 },
          { axis: 'Seller Interest', value: 76 },
          { axis: 'Price Growth', value: 68 },
          { axis: 'Inventory Level', value: 74 },
          { axis: 'Closing Speed', value: 88 }
        ],
        position: { x: 8, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.55 0.22 30)', levels: 5, animate: true }
      }
    ]
  },
  {
    id: 'energy-dashboard',
    name: 'Energy Management',
    industry: 'energy',
    description: 'Power consumption, renewable generation, grid stability, and efficiency metrics',
    icon: 'Lightning',
    color: 'oklch(0.85 0.18 90)',
    tags: ['consumption', 'renewable', 'grid', 'efficiency'],
    widgets: [
      {
        id: 'energy-consumption',
        type: 'area',
        title: 'Energy Consumption & Generation',
        data: [
          {
            name: 'Total Demand',
            data: generateTimeSeriesData(24, 450, 850),
            color: 'oklch(0.65 0.20 30)'
          },
          {
            name: 'Renewable Supply',
            data: generateTimeSeriesData(24, 200, 550),
            color: 'oklch(0.75 0.15 140)'
          },
          {
            name: 'Grid Supply',
            data: generateTimeSeriesData(24, 250, 450),
            color: 'oklch(0.85 0.18 90)'
          }
        ],
        position: { x: 0, y: 0, w: 6, h: 2 },
        chartConfig: { showGrid: true, animate: true }
      },
      {
        id: 'energy-efficiency',
        type: 'gauge',
        title: 'Energy Efficiency Score',
        data: { value: 84, label: 'EFFICIENCY', unit: '%' },
        position: { x: 6, y: 0, w: 3, h: 2 },
        chartConfig: { min: 0, max: 100, animate: true }
      },
      {
        id: 'energy-sources',
        type: 'pie',
        title: 'Energy Sources',
        data: [
          { label: 'Solar', value: 32, color: 'oklch(0.85 0.18 90)' },
          { label: 'Wind', value: 28, color: 'oklch(0.75 0.15 140)' },
          { label: 'Hydro', value: 18, color: 'oklch(0.65 0.20 180)' },
          { label: 'Grid', value: 22, color: 'oklch(0.55 0.22 30)' }
        ],
        position: { x: 9, y: 0, w: 3, h: 2 },
        chartConfig: { innerRadius: 60, animate: true, showLabels: true }
      },
      {
        id: 'energy-metrics',
        type: 'metric',
        title: 'Energy Metrics',
        data: {
          'Current Load': '687 MW',
          'Peak Demand': '842 MW',
          'Renewable %': '58%',
          'CO₂ Avoided': '1,247 tons',
          'Grid Stability': '99.8%',
          'Cost Savings': '$87K/day'
        },
        position: { x: 0, y: 2, w: 4, h: 2 }
      },
      {
        id: 'energy-facilities',
        type: 'bar',
        title: 'Facility Energy Usage',
        data: [
          { label: 'Headquarters', value: 1247 },
          { label: 'Warehouse A', value: 987 },
          { label: 'Warehouse B', value: 834 },
          { label: 'Data Center', value: 2145 },
          { label: 'Store Locations', value: 756 }
        ],
        position: { x: 4, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.85 0.18 90)', animate: true }
      },
      {
        id: 'energy-performance',
        type: 'radar',
        title: 'Grid Performance',
        data: [
          { axis: 'Reliability', value: 98 },
          { axis: 'Capacity', value: 82 },
          { axis: 'Load Balance', value: 88 },
          { axis: 'Response Time', value: 92 },
          { axis: 'Fault Recovery', value: 87 }
        ],
        position: { x: 8, y: 2, w: 4, h: 2 },
        chartConfig: { color: 'oklch(0.85 0.18 90)', levels: 5, animate: true }
      }
    ]
  }
]

export function getTemplateById(id: string): DashboardTemplate | undefined {
  return dashboardTemplates.find(t => t.id === id)
}

export function getTemplatesByIndustry(industry: IndustryType): DashboardTemplate[] {
  return dashboardTemplates.filter(t => t.industry === industry)
}

export function getTemplatesByTags(tags: string[]): DashboardTemplate[] {
  return dashboardTemplates.filter(t => 
    t.tags.some(tag => tags.includes(tag))
  )
}
