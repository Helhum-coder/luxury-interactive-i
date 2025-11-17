import { DashboardWidget } from './types'
import { DashboardTemplate, IndustryType } from './dashboard-templates'

export interface UserTemplate extends DashboardTemplate {
  userId: string
  createdAt: number
  updatedAt: number
  isCustom: boolean
  isFavorite: boolean
  category: 'work' | 'personal' | 'project' | 'client'
  notes?: string
  version: number
}

export interface TemplateBackup {
  timestamp: number
  templates: UserTemplate[]
  version: string
  userId: string
}

export function createUserTemplate(
  name: string,
  industry: IndustryType,
  description: string,
  widgets: DashboardWidget[],
  tags: string[],
  userId: string,
  category: 'work' | 'personal' | 'project' | 'client' = 'work',
  notes?: string
): UserTemplate {
  const now = Date.now()
  return {
    id: `custom-${now}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    industry,
    description,
    icon: getIndustryIcon(industry),
    color: getIndustryColor(industry),
    widgets: widgets.map(w => ({
      ...w,
      id: `${w.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })),
    tags,
    userId,
    createdAt: now,
    updatedAt: now,
    isCustom: true,
    isFavorite: false,
    category,
    notes,
    version: 1
  }
}

export function updateUserTemplate(
  template: UserTemplate,
  updates: Partial<UserTemplate>
): UserTemplate {
  return {
    ...template,
    ...updates,
    updatedAt: Date.now(),
    version: template.version + 1
  }
}

export function createTemplateBackup(
  templates: UserTemplate[],
  userId: string
): TemplateBackup {
  return {
    timestamp: Date.now(),
    templates: templates.map(t => ({ ...t })),
    version: '1.0.0',
    userId
  }
}

export function restoreFromBackup(backup: TemplateBackup): UserTemplate[] {
  return backup.templates.map(t => ({
    ...t,
    updatedAt: Date.now()
  }))
}

function getIndustryIcon(industry: IndustryType): string {
  const icons: Record<IndustryType, string> = {
    finance: 'ChartLine',
    healthcare: 'Heart',
    ecommerce: 'ShoppingCart',
    saas: 'Cloud',
    manufacturing: 'Factory',
    marketing: 'MegaphoneSimple',
    logistics: 'Package',
    education: 'GraduationCap',
    realEstate: 'Buildings',
    energy: 'Lightning'
  }
  return icons[industry]
}

function getIndustryColor(industry: IndustryType): string {
  const colors: Record<IndustryType, string> = {
    finance: 'oklch(0.85 0.18 90)',
    healthcare: 'oklch(0.65 0.20 180)',
    ecommerce: 'oklch(0.75 0.15 85)',
    saas: 'oklch(0.35 0.15 300)',
    manufacturing: 'oklch(0.55 0.22 30)',
    marketing: 'oklch(0.85 0.18 90)',
    logistics: 'oklch(0.65 0.20 180)',
    education: 'oklch(0.75 0.15 140)',
    realEstate: 'oklch(0.55 0.22 30)',
    energy: 'oklch(0.85 0.18 90)'
  }
  return colors[industry]
}

export function exportTemplateToJSON(template: UserTemplate): string {
  return JSON.stringify(template, null, 2)
}

export function importTemplateFromJSON(json: string, userId: string): UserTemplate {
  const parsed = JSON.parse(json)
  return {
    ...parsed,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isCustom: true,
    version: 1
  }
}

export function duplicateTemplate(template: UserTemplate, userId: string): UserTemplate {
  const now = Date.now()
  return {
    ...template,
    id: `custom-${now}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${template.name} (Copy)`,
    userId,
    createdAt: now,
    updatedAt: now,
    version: 1,
    widgets: template.widgets.map(w => ({
      ...w,
      id: `${w.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))
  }
}
