'use client'

import { useEffect, useState, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { useBudgetUpdates, useTransactionUpdates } from '@/hooks/useSocket'
import { BudgetOverview } from './BudgetOverview'
import { TransactionList } from './TransactionList'
import { TransactionForm } from './TransactionForm'
import { AdminPanel } from './AdminPanel'
import { ExcelExport } from './ExcelExport'
import { LogOut, Plus, Download, Settings } from 'lucide-react'

interface User {
  id: string
  email?: string | null
  role: string
  name?: string | null
}

interface DashboardProps {
  user: User
}

interface Budget {
  id: string
  totalAmount: number
  totalPending: number
  userPending: number
  availableAmount: number
  updatedAt: string
}

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export function Dashboard({ user }: DashboardProps) {
  const [budget, setBudget] = useState<Budget | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleBudgetUpdate = useCallback((data: any) => {
    console.log('Budget update received:', data)
    setRefreshKey(prev => prev + 1)
  }, [])

  const handleTransactionUpdate = useCallback((data: any) => {
    console.log('Transaction update received:', data)
    setRefreshKey(prev => prev + 1)
  }, [])

  useBudgetUpdates(budget?.id || '', handleBudgetUpdate)
  useTransactionUpdates(handleTransactionUpdate)

  useEffect(() => {
    fetchData()
  }, [refreshKey])

  const fetchData = async () => {
    try {
      const [budgetResponse, transactionsResponse] = await Promise.all([
        fetch('/api/budget'),
        fetch('/api/transactions')
      ])

      if (budgetResponse.ok) {
        const budgetData = await budgetResponse.json()
        setBudget(budgetData)
      }

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleTransactionSubmit = () => {
    setShowTransactionForm(false)
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner h-8 w-8"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Budget Tracker</h1>
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.name || user.email || 'User'}</span>
              <ExcelExport transactions={transactions} />
              <button
                onClick={handleSignOut}
                className="btn-secondary flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {budget && <BudgetOverview budget={budget} userRole={user.role} />}
          
          {user.role === 'ADMIN' && <AdminPanel onRefresh={() => setRefreshKey(prev => prev + 1)} />}

          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              {user.role === 'ADMIN' ? 'All Transactions' : 'My Transactions'}
            </h2>
            <button
              onClick={() => setShowTransactionForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Transaction</span>
            </button>
          </div>

          <TransactionList 
            transactions={transactions} 
            userRole={user.role}
            onRefresh={() => setRefreshKey(prev => prev + 1)}
          />
        </div>
      </main>

      {showTransactionForm && (
        <TransactionForm
          onClose={() => setShowTransactionForm(false)}
          onSubmit={handleTransactionSubmit}
        />
      )}
    </div>
  )
}