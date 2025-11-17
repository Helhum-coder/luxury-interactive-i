import { useState, useEffect, ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { 
  getOptimizedImageSrc, 
  createImagePlaceholder, 
  preloadImage,
  ImageOptimizationOptions 
} from '@/lib/image-utils'
import { Skeleton } from '@/components/ui/skeleton'

interface EnhancedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src: string
  fallbackSrc?: string
  optimization?: ImageOptimizationOptions
  showPlaceholder?: boolean
  placeholderClassName?: string
  onLoadComplete?: () => void
  onError?: (error: Error) => void
}

export default function EnhancedImage({
  src,
  fallbackSrc,
  optimization,
  showPlaceholder = true,
  placeholderClassName,
  onLoadComplete,
  onError,
  className,
  alt = '',
  ...props
}: EnhancedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadImage = async () => {
      if (!src) {
        setHasError(true)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setHasError(false)

      try {
        const optimizedSrc = optimization 
          ? getOptimizedImageSrc(src, optimization)
          : src

        await preloadImage(optimizedSrc)

        if (isMounted) {
          setImageSrc(optimizedSrc)
          setIsLoading(false)
          onLoadComplete?.()
        }
      } catch (error) {
        if (!isMounted) return

        if (fallbackSrc) {
          try {
            await preloadImage(fallbackSrc)
            if (isMounted) {
              setImageSrc(fallbackSrc)
              setIsLoading(false)
            }
          } catch (fallbackError) {
            if (isMounted) {
              setHasError(true)
              setIsLoading(false)
              onError?.(fallbackError as Error)
            }
          }
        } else {
          if (isMounted) {
            setHasError(true)
            setIsLoading(false)
            onError?.(error as Error)
          }
        }
      }
    }

    loadImage()

    return () => {
      isMounted = false
    }
  }, [src, fallbackSrc, optimization])

  if (isLoading && showPlaceholder) {
    return (
      <Skeleton 
        className={cn(
          'w-full h-full',
          placeholderClassName,
          className
        )}
      />
    )
  }

  if (hasError) {
    const placeholderSrc = createImagePlaceholder(
      optimization?.width || 400,
      optimization?.height || 300
    )
    
    return (
      <img
        src={placeholderSrc}
        alt={alt || 'Failed to load image'}
        className={cn('opacity-50', className)}
        {...props}
      />
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoading ? 'opacity-0' : 'opacity-100',
        className
      )}
      {...props}
    />
  )
}
