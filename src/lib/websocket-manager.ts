export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending'

export interface StatusUpdate {
  id: string
  timestamp: number
  type: StatusType
  source: string
  message: string
  details?: any
  metadata?: Record<string, any>
}

export interface ConnectionStatus {
  connected: boolean
  lastUpdate: number
  reconnectAttempts: number
  latency?: number
}

type StatusListener = (update: StatusUpdate) => void
type ConnectionListener = (status: ConnectionStatus) => void

class WebSocketManager {
  private listeners: Set<StatusListener> = new Set()
  private connectionListeners: Set<ConnectionListener> = new Set()
  private connectionStatus: ConnectionStatus = {
    connected: false,
    lastUpdate: Date.now(),
    reconnectAttempts: 0
  }
  private simulatedConnection: boolean = false
  private updateInterval?: number
  private reconnectTimeout?: number
  private statusHistory: StatusUpdate[] = []
  private maxHistorySize = 100

  constructor() {
    this.simulateWebSocket()
  }

  private simulateWebSocket() {
    this.simulatedConnection = true
    this.connectionStatus = {
      connected: true,
      lastUpdate: Date.now(),
      reconnectAttempts: 0,
      latency: Math.floor(Math.random() * 50) + 20
    }
    this.notifyConnectionListeners()
    
    this.updateInterval = window.setInterval(() => {
      this.connectionStatus.lastUpdate = Date.now()
      this.connectionStatus.latency = Math.floor(Math.random() * 50) + 20
      this.notifyConnectionListeners()
    }, 5000)
  }

  connect() {
    if (this.simulatedConnection) return
    this.simulateWebSocket()
  }

  disconnect() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = undefined
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = undefined
    }
    this.simulatedConnection = false
    this.connectionStatus = {
      connected: false,
      lastUpdate: Date.now(),
      reconnectAttempts: 0
    }
    this.notifyConnectionListeners()
  }

  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  subscribeToConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener)
    listener(this.connectionStatus)
    return () => this.connectionListeners.delete(listener)
  }

  sendUpdate(update: Omit<StatusUpdate, 'id' | 'timestamp'>) {
    const fullUpdate: StatusUpdate = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...update
    }
    
    this.statusHistory.unshift(fullUpdate)
    if (this.statusHistory.length > this.maxHistorySize) {
      this.statusHistory = this.statusHistory.slice(0, this.maxHistorySize)
    }
    
    this.notifyListeners(fullUpdate)
  }

  private notifyListeners(update: StatusUpdate) {
    this.listeners.forEach(listener => {
      try {
        listener(update)
      } catch (error) {
        console.error('Error in status listener:', error)
      }
    })
  }

  private notifyConnectionListeners() {
    this.connectionListeners.forEach(listener => {
      try {
        listener(this.connectionStatus)
      } catch (error) {
        console.error('Error in connection listener:', error)
      }
    })
  }

  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  getHistory(limit: number = 50): StatusUpdate[] {
    return this.statusHistory.slice(0, limit)
  }

  clearHistory() {
    this.statusHistory = []
  }

  isConnected(): boolean {
    return this.connectionStatus.connected
  }
}

export const wsManager = new WebSocketManager()
