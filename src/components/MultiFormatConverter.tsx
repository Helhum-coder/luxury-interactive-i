import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, FileCode, Copy, Download, Lightning } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

type ConversionFormat = 'json-to-typescript' | 'html-to-jsx' | 'css-to-tailwind' | 'javascript-to-typescript' | 'xml-to-json'

interface ConversionOption {
  value: ConversionFormat
  label: string
  description: string
  from: string
  to: string
}

const CONVERSION_OPTIONS: ConversionOption[] = [
  {
    value: 'json-to-typescript',
    label: 'JSON to TypeScript',
    description: 'Convert JSON objects to TypeScript interfaces',
    from: 'JSON',
    to: 'TypeScript'
  },
  {
    value: 'html-to-jsx',
    label: 'HTML to JSX',
    description: 'Convert HTML markup to React JSX',
    from: 'HTML',
    to: 'JSX'
  },
  {
    value: 'css-to-tailwind',
    label: 'CSS to Tailwind',
    description: 'Convert CSS styles to Tailwind classes',
    from: 'CSS',
    to: 'Tailwind'
  },
  {
    value: 'javascript-to-typescript',
    label: 'JavaScript to TypeScript',
    description: 'Convert JavaScript code to TypeScript',
    from: 'JavaScript',
    to: 'TypeScript'
  },
  {
    value: 'xml-to-json',
    label: 'XML to JSON',
    description: 'Convert XML data to JSON format',
    from: 'XML',
    to: 'JSON'
  }
]

export function MultiFormatConverter() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [conversionType, setConversionType] = useState<ConversionFormat>('json-to-typescript')
  const [isConverting, setIsConverting] = useState(false)

  const jsonToTypeScript = (json: string): string => {
    try {
      const obj = JSON.parse(json)
      const generateInterface = (obj: any, name: string = 'Root'): string => {
        let result = `interface ${name} {\n`
        
        for (const key in obj) {
          const value = obj[key]
          const type = Array.isArray(value)
            ? `${typeof value[0]}[]`
            : typeof value === 'object' && value !== null
            ? `${key.charAt(0).toUpperCase() + key.slice(1)}`
            : typeof value
          
          result += `  ${key}: ${type}\n`
        }
        
        result += '}\n'
        return result
      }
      
      return generateInterface(obj)
    } catch (error) {
      throw new Error('Invalid JSON format')
    }
  }

  const htmlToJsx = (html: string): string => {
    let jsx = html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/onclick=/gi, 'onClick=')
      .replace(/onchange=/gi, 'onChange=')
      .replace(/onsubmit=/gi, 'onSubmit=')
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
    
    return jsx
  }

  const cssToTailwind = (css: string): string => {
    const conversions: Record<string, string> = {
      'display: flex': 'flex',
      'display: block': 'block',
      'display: inline': 'inline',
      'display: grid': 'grid',
      'justify-content: center': 'justify-center',
      'justify-content: space-between': 'justify-between',
      'align-items: center': 'items-center',
      'flex-direction: column': 'flex-col',
      'flex-direction: row': 'flex-row',
      'margin: 0 auto': 'mx-auto',
      'padding: 1rem': 'p-4',
      'padding: 0.5rem': 'p-2',
      'margin: 1rem': 'm-4',
      'margin: 0.5rem': 'm-2',
      'font-weight: bold': 'font-bold',
      'font-weight: 600': 'font-semibold',
      'text-align: center': 'text-center',
      'color: white': 'text-white',
      'background-color: white': 'bg-white',
      'border-radius: 0.25rem': 'rounded',
      'border-radius: 0.5rem': 'rounded-lg',
      'width: 100%': 'w-full',
      'height: 100%': 'h-full',
    }
    
    let result = 'Tailwind classes:\n\n'
    const lines = css.split(';').map(l => l.trim()).filter(l => l)
    
    lines.forEach(line => {
      const found = conversions[line]
      if (found) {
        result += `${found} `
      } else {
        result += `/* ${line} - manual conversion needed */ `
      }
    })
    
    return result
  }

  const javascriptToTypeScript = (js: string): string => {
    let ts = js
      .replace(/function\s+(\w+)\s*\(([^)]*)\)/g, 'function $1($2): any')
      .replace(/const\s+(\w+)\s*=/g, 'const $1: any =')
      .replace(/let\s+(\w+)\s*=/g, 'let $1: any =')
      .replace(/var\s+(\w+)\s*=/g, 'let $1: any =')
    
    return `// TypeScript conversion (add proper types)\n${ts}`
  }

  const xmlToJson = (xml: string): string => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xml, 'text/xml')
      
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
          return node.nodeValue
        }
        
        if (node.hasChildNodes()) {
          for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i]
            const nodeName = child.nodeName
            
            if (typeof obj[nodeName] === 'undefined') {
              obj[nodeName] = xmlToJsonObj(child)
            } else {
              if (typeof obj[nodeName].push === 'undefined') {
                const old = obj[nodeName]
                obj[nodeName] = []
                obj[nodeName].push(old)
              }
              obj[nodeName].push(xmlToJsonObj(child))
            }
          }
        }
        
        return obj
      }
      
      const result = xmlToJsonObj(xmlDoc)
      return JSON.stringify(result, null, 2)
    } catch (error) {
      throw new Error('Invalid XML format')
    }
  }

  const handleConvert = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some content to convert')
      return
    }

    setIsConverting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let result = ''
      
      switch (conversionType) {
        case 'json-to-typescript':
          result = jsonToTypeScript(inputText)
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
        default:
          result = 'Conversion type not supported'
      }
      
      setOutputText(result)
      toast.success('Conversion completed!')
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
    const extension = selectedOption?.to.toLowerCase() || 'txt'
    const fileName = `converted.${extension === 'jsx' ? 'jsx' : extension === 'tailwind' ? 'txt' : extension}`
    
    const blob = new Blob([outputText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    toast.success('File downloaded!')
  }

  const selectedOption = CONVERSION_OPTIONS.find(opt => opt.value === conversionType)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <FileCode size={32} weight="duotone" className="text-accent" />
            </div>
            <div>
              <CardTitle>Multi-Format File Converter</CardTitle>
              <CardDescription>Convert between JSON, TypeScript, HTML, JSX, CSS, and more</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Conversion Type</label>
            <Select value={conversionType} onValueChange={(value) => setConversionType(value as ConversionFormat)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose conversion type" />
              </SelectTrigger>
              <SelectContent>
                {CONVERSION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {option.from} → {option.to}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedOption && (
              <p className="text-sm text-muted-foreground">{selectedOption.description}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Input ({selectedOption?.from})</label>
                <Badge variant="outline">{inputText.length} chars</Badge>
              </div>
              <Textarea
                placeholder={`Paste your ${selectedOption?.from} code here...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Output ({selectedOption?.to})</label>
                <div className="flex items-center gap-2">
                  {outputText && (
                    <>
                      <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
                        <Copy size={16} />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2">
                        <Download size={16} />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Textarea
                placeholder="Converted code will appear here..."
                value={outputText}
                readOnly
                className="min-h-[400px] font-mono text-sm bg-muted/30"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleConvert}
              disabled={isConverting || !inputText.trim()}
              size="lg"
              className="gap-2 min-w-[200px]"
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

          <Card className="bg-muted/30 border-accent/20">
            <CardHeader>
              <CardTitle className="text-sm">Supported Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CONVERSION_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">
                      {option.from}
                    </Badge>
                    <ArrowRight size={12} className="text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {option.to}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
