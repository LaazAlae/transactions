'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

// Polling-based real-time updates for better Next.js App Router compatibility
export function useSocket() {
  const { data: session, status } = useSession()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setIsConnected(true)
    } else {
      setIsConnected(false)
    }
  }, [session])

  return { socket: null, isConnected }
}

export function useBudgetUpdates(budgetId: string, onUpdate: (data: any) => void) {
  const { data: session } = useSession()
  const intervalRef = useRef<NodeJS.Timeout>()
  const lastFetchRef = useRef<number>(0)

  useEffect(() => {
    if (!session?.user || !budgetId) return

    const pollBudgetUpdates = async () => {
      try {
        const response = await fetch(`/api/budgets/${budgetId}`)
        if (response.ok) {
          const budget = await response.json()
          const now = Date.now()
          
          // Only trigger update if data is newer than last fetch
          if (now - lastFetchRef.current > 2000) {
            onUpdate({
              type: 'BUDGET_UPDATED',
              budget
            })
            lastFetchRef.current = now
          }
        }
      } catch (error) {
        console.error('Budget polling error:', error)
      }
    }

    // Poll every 3 seconds for budget updates
    intervalRef.current = setInterval(pollBudgetUpdates, 3000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [budgetId, session, onUpdate])
}

export function useTransactionUpdates(onUpdate: (data: any) => void) {
  const { data: session } = useSession()
  const intervalRef = useRef<NodeJS.Timeout>()
  const lastFetchRef = useRef<number>(0)

  useEffect(() => {
    if (!session?.user) return

    const pollTransactionUpdates = async () => {
      try {
        const response = await fetch('/api/transactions')
        if (response.ok) {
          const transactions = await response.json()
          const now = Date.now()
          
          // Only trigger update if enough time has passed
          if (now - lastFetchRef.current > 2000) {
            onUpdate({
              type: 'TRANSACTIONS_UPDATED',
              transactions
            })
            lastFetchRef.current = now
          }
        }
      } catch (error) {
        console.error('Transaction polling error:', error)
      }
    }

    // Poll every 2 seconds for transaction updates
    intervalRef.current = setInterval(pollTransactionUpdates, 2000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [session, onUpdate])
}