import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowRight, 
  FileCode, 
  Copy, 
  Download, 
  Lightning, 
  ArrowsClockwise,
  FileJs,
  FileTs,
  FileHtml,
  FileCss,
  X,
  FileText,
  Cube
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { marked } from 'marked'

type ConversionFormat = 
  | 'json-to-typescript' 
  | 'html-to-jsx' 
  | 'css-to-tailwind' 
  | 'javascript-to-typescript' 
  | 'xml-to-json'
  | 'typescript-to-javascript'
  | 'jsx-to-html'
  | 'tailwind-to-css'
  | 'markdown-to-html'
  | 'yaml-to-json'

interface ConversionOption {
  value: ConversionFormat
  label: string
  description: string
  from: string
  to: string
  icon: React.ReactNode
  color: string
}

const CONVERSION_OPTIONS: ConversionOption[] = [
  {
    value: 'json-to-typescript',
    label: 'JSON to TypeScript',
    description: 'Convert JSON objects to TypeScript interfaces',
    from: 'JSON',
    to: 'TypeScript',
    icon: <FileCode size={20} weight="duotone" />,
    color: 'text-yellow-600'
  },
  {
    value: 'markdown-to-html',
    label: 'Markdown to HTML',
    description: 'Convert Markdown documents to formatted HTML',
    from: 'Markdown',
    to: 'HTML',
    icon: <FileText size={20} weight="duotone" />,
    color: 'text-indigo-600'
  },
  {
    value: 'yaml-to-json',
    label: 'YAML to JSON',
    description: 'Convert YAML configuration to JSON format',
    from: 'YAML',
    to: 'JSON',
    icon: <Cube size={20} weight="duotone" />,
    color: 'text-purple-600'
  },
  {
    value: 'html-to-jsx',
    label: 'HTML to JSX',
    description: 'Convert HTML markup to React JSX components',
    from: 'HTML',
    to: 'JSX',
    icon: <FileHtml size={20} weight="duotone" />,
    color: 'text-orange-600'
  },
  {
    value: 'css-to-tailwind',
    label: 'CSS to Tailwind',
    description: 'Convert CSS styles to Tailwind utility classes',
    from: 'CSS',
    to: 'Tailwind',
    icon: <FileCss size={20} weight="duotone" />,
    color: 'text-blue-600'
  },
  {
    value: 'javascript-to-typescript',
    label: 'JavaScript to TypeScript',
    description: 'Convert JavaScript code to TypeScript with type annotations',
    from: 'JavaScript',
    to: 'TypeScript',
    icon: <FileJs size={20} weight="duotone" />,
    color: 'text-yellow-500'
  },
  {
    value: 'xml-to-json',
    label: 'XML to JSON',
    description: 'Convert XML data structure to JSON format',
    from: 'XML',
    to: 'JSON',
    icon: <FileCode size={20} weight="duotone" />,
    color: 'text-green-600'
  },
  {
    value: 'typescript-to-javascript',
    label: 'TypeScript to JavaScript',
    description: 'Strip TypeScript types and convert to pure JavaScript',
    from: 'TypeScript',
    to: 'JavaScript',
    icon: <FileTs size={20} weight="duotone" />,
    color: 'text-blue-500'
  },
  {
    value: 'jsx-to-html',
    label: 'JSX to HTML',
    description: 'Convert React JSX back to standard HTML',
    from: 'JSX',
    to: 'HTML',
    icon: <FileHtml size={20} weight="duotone" />,
    color: 'text-red-600'
  },
  {
    value: 'tailwind-to-css',
    label: 'Tailwind to CSS',
    description: 'Convert Tailwind classes to standard CSS',
    from: 'Tailwind',
    to: 'CSS',
    icon: <FileCss size={20} weight="duotone" />,
    color: 'text-cyan-600'
  }
]

interface ConversionHistory {
  id: string
  type: ConversionFormat
  timestamp: Date
  inputPreview: string
  outputPreview: string
}

export function FileConverterInterface({ onClose }: { onClose?: () => void }) {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [conversionType, setConversionType] = useState<ConversionFormat>('json-to-typescript')
  const [isConverting, setIsConverting] = useState(false)
  const [history, setHistory] = useState<ConversionHistory[]>([])
  const [activeTab, setActiveTab] = useState<'converter' | 'history'>('converter')

  const jsonToTypeScript = (json: string): string => {
    try {
      const obj = JSON.parse(json)
      const generateInterface = (obj: any, name: string = 'Root', depth: number = 0): string => {
        const indent = '  '.repeat(depth)
        let result = `${indent}interface ${name} {\n`
        
        for (const key in obj) {
          const value = obj[key]
          let type = 'any'
          
          if (Array.isArray(value)) {
            if (value.length > 0) {
              const firstItem = value[0]
              if (typeof firstItem === 'object' && firstItem !== null) {
                type = `${key.charAt(0).toUpperCase() + key.slice(1)}Item[]`
              } else {
                type = `${typeof firstItem}[]`
              }
            } else {
              type = 'any[]'
            }
          } else if (value === null) {
            type = 'null'
          } else if (typeof value === 'object') {
            type = key.charAt(0).toUpperCase() + key.slice(1)
          } else {
            type = typeof value
          }
          
          result += `${indent}  ${key}: ${type}\n`
        }
        
        result += `${indent}}\n`
        return result
      }
      
      return generateInterface(obj)
    } catch (error) {
      throw new Error('Invalid JSON format. Please check your syntax.')
    }
  }

  const htmlToJsx = (html: string): string => {
    let jsx = html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/onclick=/gi, 'onClick=')
      .replace(/onchange=/gi, 'onChange=')
      .replace(/onsubmit=/gi, 'onSubmit=')
      .replace(/onmouseover=/gi, 'onMouseOver=')
      .replace(/onmouseout=/gi, 'onMouseOut=')
      .replace(/onfocus=/gi, 'onFocus=')
      .replace(/onblur=/gi, 'onBlur=')
      .replace(/style="([^"]*)"/g, (match, styles) => {
        const styleObj = styles.split(';')
          .filter((s: string) => s.trim())
          .map((s: string) => {
            const [key, value] = s.split(':').map((p: string) => p.trim())
            const camelKey = key.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())
            return `${camelKey}: '${value}'`
          })
          .join(', ')
        return `style={{${styleObj}}}`
      })
      .replace(/<br>/gi, '<br />')
      .replace(/<hr>/gi, '<hr />')
      .replace(/<img([^>]*)>/gi, '<img$1 />')
      .replace(/<input([^>]*)>/gi, '<input$1 />')
      .replace(/<meta([^>]*)>/gi, '<meta$1 />')
      .replace(/<link([^>]*)>/gi, '<link$1 />')
    
    return `import React from 'react'\n\nexport default function Component() {\n  return (\n    ${jsx}\n  )\n}`
  }

  const cssToTailwind = (css: string): string => {
    const conversions: Record<string, string> = {
      'display: flex': 'flex',
      'display: block': 'block',
      'display: inline': 'inline',
      'display: inline-block': 'inline-block',
      'display: grid': 'grid',
      'display: none': 'hidden',
      'justify-content: center': 'justify-center',
      'justify-content: space-between': 'justify-between',
      'justify-content: space-around': 'justify-around',
      'justify-content: flex-start': 'justify-start',
      'justify-content: flex-end': 'justify-end',
      'align-items: center': 'items-center',
      'align-items: flex-start': 'items-start',
      'align-items: flex-end': 'items-end',
      'flex-direction: column': 'flex-col',
      'flex-direction: row': 'flex-row',
      'margin: 0 auto': 'mx-auto',
      'padding: 1rem': 'p-4',
      'padding: 0.5rem': 'p-2',
      'padding: 2rem': 'p-8',
      'margin: 1rem': 'm-4',
      'margin: 0.5rem': 'm-2',
      'font-weight: bold': 'font-bold',
      'font-weight: 600': 'font-semibold',
      'font-weight: 500': 'font-medium',
      'text-align: center': 'text-center',
      'text-align: left': 'text-left',
      'text-align: right': 'text-right',
      'color: white': 'text-white',
      'color: black': 'text-black',
      'background-color: white': 'bg-white',
      'background-color: black': 'bg-black',
      'border-radius: 0.25rem': 'rounded',
      'border-radius: 0.5rem': 'rounded-lg',
      'border-radius: 9999px': 'rounded-full',
      'width: 100%': 'w-full',
      'height: 100%': 'h-full',
      'position: relative': 'relative',
      'position: absolute': 'absolute',
      'position: fixed': 'fixed',
      'overflow: hidden': 'overflow-hidden',
      'overflow: auto': 'overflow-auto',
    }
    
    let result = '/* Converted Tailwind Classes */\n\n'
    const lines = css.split(';').map(l => l.trim()).filter(l => l)
    const classes: string[] = []
    
    lines.forEach(line => {
      const found = conversions[line]
      if (found) {
        classes.push(found)
      } else {
        result += `/* ${line} - requires manual conversion */\n`
      }
    })
    
    result += `\nclassName="${classes.join(' ')}"`
    return result
  }

  const javascriptToTypeScript = (js: string): string => {
    let ts = js
      .replace(/function\s+(\w+)\s*\(([^)]*)\)\s*{/g, (match, name, params) => {
        const typedParams = params.split(',').map((p: string) => p.trim() ? `${p.trim()}: any` : '').join(', ')
        return `function ${name}(${typedParams}): any {`
      })
      .replace(/const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g, (match, name, params) => {
        const typedParams = params.split(',').map((p: string) => p.trim() ? `${p.trim()}: any` : '').join(', ')
        return `const ${name} = (${typedParams}): any =>`
      })
      .replace(/\.map\(\s*(\w+)\s*=>/g, '.map(($1: any) =>')
      .replace(/\.filter\(\s*(\w+)\s*=>/g, '.filter(($1: any) =>')
      .replace(/\.reduce\(\s*(\w+)\s*=>/g, '.reduce(($1: any) =>')
    
    return `// Converted to TypeScript - Add proper types as needed\n\n${ts}`
  }

  const xmlToJson = (xml: string): string => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xml, 'text/xml')
      
      const parseError = xmlDoc.querySelector('parsererror')
      if (parseError) {
        throw new Error('Invalid XML format')
      }
      
      const xmlToJsonObj = (node: any): any => {
        const obj: any = {}
        
        if (node.nodeType === 1) {
          if (node.attributes.length > 0) {
            obj['@attributes'] = {}
            for (let i = 0; i < node.attributes.length; i++) {
              const attr = node.attributes[i]
              obj['@attributes'][attr.nodeName] = attr.nodeValue
            }
          }
        } else if (node.nodeType === 3) {
          const text = node.nodeValue?.trim()
          return text || null
        }
        
        if (node.hasChildNodes()) {
          for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i]
            const nodeName = child.nodeName
            
            if (child.nodeType === 3) {
              const text = child.nodeValue?.trim()
              if (text) {
                return text
              }
              continue
            }
            
            const childData = xmlToJsonObj(child)
            
            if (typeof obj[nodeName] === 'undefined') {
              obj[nodeName] = childData
            } else {
              if (!Array.isArray(obj[nodeName])) {
                obj[nodeName] = [obj[nodeName]]
              }
              obj[nodeName].push(childData)
            }
          }
        }
        
        return obj
      }
      
      const result = xmlToJsonObj(xmlDoc.documentElement)
      return JSON.stringify({ [xmlDoc.documentElement.nodeName]: result }, null, 2)
    } catch (error) {
      throw new Error('Invalid XML format. Please check your syntax.')
    }
  }

  const typescriptToJavascript = (ts: string): string => {
    let js = ts
      .replace(/:\s*\w+(\[\])?/g, '')
      .replace(/interface\s+\w+\s*{[^}]*}/g, '')
      .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/as\s+\w+/g, '')
      .replace(/public\s+|private\s+|protected\s+/g, '')
    
    return `// Converted to JavaScript - Types removed\n\n${js}`
  }

  const jsxToHtml = (jsx: string): string => {
    let html = jsx
      .replace(/className=/g, 'class=')
      .replace(/htmlFor=/g, 'for=')
      .replace(/onClick=/g, 'onclick=')
      .replace(/onChange=/g, 'onchange=')
      .replace(/onSubmit=/g, 'onsubmit=')
      .replace(/style={{([^}]*)}}/g, (match, styles) => {
        const cssStyles = styles
          .split(',')
          .map((s: string) => {
            const [key, value] = s.split(':').map((p: string) => p.trim())
            const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
            return `${kebabKey}:${value.replace(/'/g, '')}`
          })
          .join(';')
        return `style="${cssStyles}"`
      })
      .replace(/<br\s*\/>/gi, '<br>')
      .replace(/<hr\s*\/>/gi, '<hr>')
    
    return html
  }

  const tailwindToCss = (tailwind: string): string => {
    const conversions: Record<string, string> = {
      'flex': 'display: flex;',
      'block': 'display: block;',
      'inline': 'display: inline;',
      'grid': 'display: grid;',
      'hidden': 'display: none;',
      'justify-center': 'justify-content: center;',
      'justify-between': 'justify-content: space-between;',
      'items-center': 'align-items: center;',
      'flex-col': 'flex-direction: column;',
      'flex-row': 'flex-direction: row;',
      'mx-auto': 'margin: 0 auto;',
      'p-4': 'padding: 1rem;',
      'p-2': 'padding: 0.5rem;',
      'm-4': 'margin: 1rem;',
      'font-bold': 'font-weight: bold;',
      'text-center': 'text-align: center;',
      'rounded': 'border-radius: 0.25rem;',
      'rounded-lg': 'border-radius: 0.5rem;',
      'w-full': 'width: 100%;',
      'h-full': 'height: 100%;',
    }
    
    const classes = tailwind.match(/[\w-]+/g) || []
    let css = '/* Converted CSS */\n\n.element {\n'
    
    classes.forEach(cls => {
      if (conversions[cls]) {
        css += `  ${conversions[cls]}\n`
      }
    })
    
    css += '}'
    return css
  }

  const markdownToHtml = async (markdown: string): Promise<string> => {
    try {
      marked.setOptions({
        gfm: true,
        breaks: true,
      })
      
      const htmlContent = await marked.parse(markdown)
      
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Markdown</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    h1 { font-size: 2em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    code {
      background: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background: #f4f4f4;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: transparent;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1em;
      margin-left: 0;
      color: #666;
      font-style: italic;
    }
    a {
      color: #0066cc;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }
    th {
      background: #f4f4f4;
      font-weight: 600;
    }
    ul, ol {
      padding-left: 2em;
    }
    li {
      margin: 0.25em 0;
    }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`
      
      return fullHtml
    } catch (error) {
      throw new Error('Failed to convert Markdown. Please check your syntax.')
    }
  }

  const yamlToJson = (yaml: string): string => {
    try {
      const lines = yaml.trim().split('\n')
      const result: any = {}
      const stack: Array<{ obj: any; indent: number }> = [{ obj: result, indent: -1 }]
      
      for (let line of lines) {
        if (line.trim().startsWith('#') || line.trim() === '') continue
        
        const indent = line.search(/\S/)
        const trimmedLine = line.trim()
        
        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
          stack.pop()
        }
        
        const current = stack[stack.length - 1].obj
        
        if (trimmedLine.startsWith('- ')) {
          const value = trimmedLine.substring(2).trim()
          
          if (!Array.isArray(current)) {
            const lastKey = Object.keys(current).pop()
            if (lastKey && !Array.isArray(current[lastKey])) {
              current[lastKey] = []
            }
          }
          
          const targetArray = Array.isArray(current) ? current : current[Object.keys(current).pop()!]
          
          if (value.includes(':')) {
            const obj: any = {}
            const [k, v] = value.split(':').map(s => s.trim())
            obj[k] = parseValue(v)
            targetArray.push(obj)
            stack.push({ obj, indent })
          } else {
            targetArray.push(parseValue(value))
          }
        } else if (trimmedLine.includes(':')) {
          const colonIndex = trimmedLine.indexOf(':')
          const key = trimmedLine.substring(0, colonIndex).trim()
          const value = trimmedLine.substring(colonIndex + 1).trim()
          
          if (value === '' || value === '|' || value === '>') {
            current[key] = {}
            stack.push({ obj: current[key], indent })
          } else {
            current[key] = parseValue(value)
          }
        }
      }
      
      function parseValue(value: string): any {
        if (value === 'true' || value === 'yes' || value === 'on') return true
        if (value === 'false' || value === 'no' || value === 'off') return false
        if (value === 'null' || value === '~') return null
        if (value.startsWith('"') && value.endsWith('"')) return value.slice(1, -1)
        if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1)
        if (!isNaN(Number(value)) && value !== '') return Number(value)
        return value
      }
      
      return JSON.stringify(result, null, 2)
    } catch (error) {
      throw new Error('Invalid YAML format. Please check your syntax.')
    }
  }

  const handleConvert = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some content to convert')
      return
    }

    setIsConverting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      let result = ''
      
      switch (conversionType) {
        case 'json-to-typescript':
          result = jsonToTypeScript(inputText)
          break
        case 'markdown-to-html':
          result = await markdownToHtml(inputText)
          break
        case 'yaml-to-json':
          result = yamlToJson(inputText)
          break
        case 'html-to-jsx':
          result = htmlToJsx(inputText)
          break
        case 'css-to-tailwind':
          result = cssToTailwind(inputText)
          break
        case 'javascript-to-typescript':
          result = javascriptToTypeScript(inputText)
          break
        case 'xml-to-json':
          result = xmlToJson(inputText)
          break
        case 'typescript-to-javascript':
          result = typescriptToJavascript(inputText)
          break
        case 'jsx-to-html':
          result = jsxToHtml(inputText)
          break
        case 'tailwind-to-css':
          result = tailwindToCss(inputText)
          break
        default:
          result = 'Conversion type not supported'
      }
      
      setOutputText(result)
      
      const newHistory: ConversionHistory = {
        id: Date.now().toString(),
        type: conversionType,
        timestamp: new Date(),
        inputPreview: inputText.substring(0, 100) + (inputText.length > 100 ? '...' : ''),
        outputPreview: result.substring(0, 100) + (result.length > 100 ? '...' : '')
      }
      setHistory(prev => [newHistory, ...prev.slice(0, 9)])
      
      toast.success('Conversion completed successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Conversion failed')
      setOutputText('')
    } finally {
      setIsConverting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const selectedOption = CONVERSION_OPTIONS.find(opt => opt.value === conversionType)
    const extensionMap: Record<string, string> = {
      'TypeScript': 'ts',
      'JavaScript': 'js',
      'JSX': 'jsx',
      'HTML': 'html',
      'CSS': 'css',
      'JSON': 'json',
      'Tailwind': 'txt',
      'XML': 'xml',
      'Markdown': 'md',
      'YAML': 'yaml'
    }
    const extension = extensionMap[selectedOption?.to || 'txt'] || 'txt'
    const fileName = `converted-${Date.now()}.${extension}`
    
    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    toast.success('File downloaded successfully!')
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    toast.info('Cleared')
  }

  const handleSwap = () => {
    setInputText(outputText)
    setOutputText('')
    toast.info('Swapped input and output')
  }

  const selectedOption = CONVERSION_OPTIONS.find(opt => opt.value === conversionType)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl"
            >
              <FileCode size={40} weight="duotone" className="text-primary" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                File Converter Studio
              </h1>
              <p className="text-muted-foreground mt-1">
                Transform code between multiple formats instantly
              </p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X size={24} />
            </Button>
          )}
        </motion.div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'converter' | 'history')} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="converter" className="gap-2">
              <FileCode size={18} />
              Converter
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <ArrowsClockwise size={18} />
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="converter" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl">Select Conversion Type</CardTitle>
                  <CardDescription>Choose how you want to transform your code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CONVERSION_OPTIONS.map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setConversionType(option.value)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          conversionType === option.value
                            ? 'border-primary bg-primary/5 shadow-lg'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={option.color}>{option.icon}</div>
                          <Badge variant={conversionType === option.value ? "default" : "outline"} className="text-xs">
                            {option.from} → {option.to}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{option.label}</p>
                      </motion.button>
                    ))}
                  </div>
                  {selectedOption && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg"
                    >
                      {selectedOption.description}
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold flex items-center gap-2">
                          {selectedOption && <span className={selectedOption.color}>{selectedOption.icon}</span>}
                          Input ({selectedOption?.from})
                        </label>
                        <Badge variant="secondary">{inputText.length} characters</Badge>
                      </div>
                      <Textarea
                        placeholder={`Paste your ${selectedOption?.from} code here...\n\n${
                          conversionType === 'markdown-to-html' 
                            ? 'Example:\n# My Heading\n\nThis is **bold** and this is *italic*.\n\n- List item 1\n- List item 2'
                            : conversionType === 'yaml-to-json'
                            ? 'Example:\nname: John Doe\nage: 30\nhobbies:\n  - reading\n  - coding\naddress:\n  city: New York\n  country: USA'
                            : 'Try pasting JSON, HTML, CSS, or any supported format.'
                        }`}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[500px] font-mono text-sm resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold">Output ({selectedOption?.to})</label>
                        <div className="flex items-center gap-2">
                          {outputText && (
                            <AnimatePresence>
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex gap-2"
                              >
                                <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
                                  <Copy size={16} />
                                  Copy
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2">
                                  <Download size={16} />
                                  Download
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleSwap} className="gap-2">
                                  <ArrowsClockwise size={16} />
                                  Swap
                                </Button>
                              </motion.div>
                            </AnimatePresence>
                          )}
                        </div>
                      </div>
                      <Textarea
                        placeholder="Converted code will appear here..."
                        value={outputText}
                        readOnly
                        className="min-h-[500px] font-mono text-sm bg-muted/30 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      disabled={!inputText && !outputText}
                      className="gap-2"
                    >
                      <X size={18} />
                      Clear All
                    </Button>
                    <Button
                      onClick={handleConvert}
                      disabled={isConverting || !inputText.trim()}
                      size="lg"
                      className="gap-2 min-w-[240px]"
                    >
                      {isConverting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Lightning size={20} weight="fill" />
                          </motion.div>
                          Converting...
                        </>
                      ) : (
                        <>
                          <ArrowRight size={20} weight="bold" />
                          Convert {selectedOption?.from} to {selectedOption?.to}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="inline-flex p-6 bg-muted rounded-full mb-4">
                    <ArrowsClockwise size={48} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No conversion history yet</h3>
                  <p className="text-muted-foreground">
                    Your recent conversions will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {history.map((item, index) => {
                  const option = CONVERSION_OPTIONS.find(opt => opt.value === item.type)
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:border-accent/50 transition-colors">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {option && <span className={option.color}>{option.icon}</span>}
                              <div>
                                <CardTitle className="text-base">{option?.label}</CardTitle>
                                <CardDescription className="text-xs">
                                  {item.timestamp.toLocaleString()}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {option?.from} → {option?.to}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
                            <div className="p-3 bg-muted/30 rounded-lg">
                              <p className="text-muted-foreground mb-1">Input:</p>
                              <p className="line-clamp-2">{item.inputPreview}</p>
                            </div>
                            <div className="p-3 bg-accent/5 rounded-lg">
                              <p className="text-muted-foreground mb-1">Output:</p>
                              <p className="line-clamp-2">{item.outputPreview}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
