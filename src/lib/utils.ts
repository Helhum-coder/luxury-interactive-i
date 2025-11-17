import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export interface APICredentials {
  github?: {
    token: string
    apiVersion?: string
  }
  linear?: {
    apiKey: string
  }
}
