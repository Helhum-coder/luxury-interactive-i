export interface ImageOptimizationOptions {
  quality?: number
  format?: 'jpeg' | 'png' | 'webp' | 'avif'
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

export const getOptimizedImageSrc = (
  src: string,
  options: ImageOptimizationOptions = {}
): string => {
  const {
    quality = 90,
    format,
    width,
    height,
    fit = 'cover'
  } = options

  if (!src || src.startsWith('data:')) {
    return src
  }

  const params = new URLSearchParams()
  
  if (quality) params.append('q', quality.toString())
  if (format) params.append('fm', format)
  if (width) params.append('w', width.toString())
  if (height) params.append('h', height.toString())
  if (fit) params.append('fit', fit)

  const separator = src.includes('?') ? '&' : '?'
  return params.toString() ? `${src}${separator}${params.toString()}` : src
}

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

export const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    img.onerror = reject
    img.src = src
  })
}

export const createImagePlaceholder = (
  width: number = 400,
  height: number = 300,
  backgroundColor: string = '#1a1a2e',
  textColor: string = '#e8965a'
): string => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="system-ui, sans-serif"
        font-size="18"
        fill="${textColor}"
      >
        ${width} × ${height}
      </text>
    </svg>
  `
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const isValidImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return !!contentType && contentType.startsWith('image/')
  } catch {
    return false
  }
}

export const convertImageToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.9
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          file.type || 'image/jpeg',
          quality
        )
      }

      img.onerror = reject
      img.src = e.target?.result as string
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const loadImageWithFallback = async (
  primarySrc: string,
  fallbackSrc?: string
): Promise<string> => {
  try {
    await preloadImage(primarySrc)
    return primarySrc
  } catch {
    if (fallbackSrc) {
      try {
        await preloadImage(fallbackSrc)
        return fallbackSrc
      } catch {
        return createImagePlaceholder()
      }
    }
    return createImagePlaceholder()
  }
}
