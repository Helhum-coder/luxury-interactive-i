import { useState, useEffect, useCallback } from 'react'
import { wsManager, StatusUpdate, ConnectionStatus } from '@/lib/websocket-manager'

export function useWebSocketStatus() {
  const [updates, setUpdates] = useState<StatusUpdate[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    wsManager.getConnectionStatus()
  )

  useEffect(() => {
    const unsubscribeStatus = wsManager.subscribe((update) => {
      setUpdates(prev => [update, ...prev].slice(0, 100))
    })

    const unsubscribeConnection = wsManager.subscribeToConnection((status) => {
      setConnectionStatus(status)
    })

    wsManager.connect()

    return () => {
      unsubscribeStatus()
      unsubscribeConnection()
    }
  }, [])

  const sendUpdate = useCallback((update: Omit<StatusUpdate, 'id' | 'timestamp'>) => {
    wsManager.sendUpdate(update)
  }, [])

  const clearUpdates = useCallback(() => {
    setUpdates([])
  }, [])

  return {
    updates,
    connectionStatus,
    sendUpdate,
    clearUpdates,
    isConnected: connectionStatus.connected
  }
}

export function useRealtimeMonitor(source: string) {
  const { sendUpdate } = useWebSocketStatus()

  const reportSuccess = useCallback((message: string, details?: any) => {
    sendUpdate({
      type: 'success',
      source,
      message,
      details
    })
  }, [source, sendUpdate])

  const reportError = useCallback((message: string, details?: any) => {
    sendUpdate({
      type: 'error',
      source,
      message,
      details
    })
  }, [source, sendUpdate])

  const reportWarning = useCallback((message: string, details?: any) => {
    sendUpdate({
      type: 'warning',
      source,
      message,
      details
    })
  }, [source, sendUpdate])

  const reportInfo = useCallback((message: string, details?: any) => {
    sendUpdate({
      type: 'info',
      source,
      message,
      details
    })
  }, [source, sendUpdate])

  const reportPending = useCallback((message: string, details?: any) => {
    sendUpdate({
      type: 'pending',
      source,
      message,
      details
    })
  }, [source, sendUpdate])

  return {
    reportSuccess,
    reportError,
    reportWarning,
    reportInfo,
    reportPending
  }
}
