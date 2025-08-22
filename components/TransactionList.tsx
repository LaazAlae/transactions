'use client'

import { useState } from 'react'
import { Check, X, Trash2 } from 'lucide-react'

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

interface TransactionListProps {
  transactions: Transaction[]
  userRole: string
  onRefresh: () => void
}

export function TransactionList({ transactions, userRole, onRefresh }: TransactionListProps) {
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleTransactionAction = async (transactionId: string, action: 'approve' | 'reject') => {
    setLoading(prev => ({ ...prev, [transactionId]: true }))

    try {
      const response = await fetch(`/api/transactions/${transactionId}/${action}`, {
        method: 'POST',
      })

      if (response.ok) {
        onRefresh()
      } else {
        const data = await response.json()
        console.error(`Failed to ${action} transaction:`, data.error)
      }
    } catch (error) {
      console.error(`Error ${action}ing transaction:`, error)
    } finally {
      setLoading(prev => ({ ...prev, [transactionId]: false }))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge-pending">Pending</span>
      case 'APPROVED':
        return <span className="badge-approved">Approved</span>
      case 'REJECTED':
        return <span className="badge-rejected">Rejected</span>
      default:
        return <span className="badge-pending">{status}</span>
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500">
              {userRole === 'BUYER' 
                ? 'Create your first transaction to get started.'
                : 'No transactions have been submitted yet.'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-content p-0">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-head">Description</th>
                <th className="table-head">Amount</th>
                <th className="table-head">Date</th>
                {userRole === 'ADMIN' && <th className="table-head">User</th>}
                <th className="table-head">Status</th>
                <th className="table-head">Submitted</th>
                {userRole === 'ADMIN' && <th className="table-head">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="table-row">
                  <td className="table-cell">
                    <div className="font-medium text-gray-900">
                      {transaction.description}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </div>
                  </td>
                  <td className="table-cell text-gray-600">
                    {formatDate(transaction.date)}
                  </td>
                  {userRole === 'ADMIN' && (
                    <td className="table-cell">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {transaction.user.name || transaction.user.email}
                        </div>
                        <div className="text-gray-500">{transaction.user.email}</div>
                      </div>
                    </td>
                  )}
                  <td className="table-cell">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="table-cell text-gray-600 text-sm">
                    {formatDate(transaction.createdAt)}
                  </td>
                  {userRole === 'ADMIN' && (
                    <td className="table-cell">
                      {transaction.status === 'PENDING' ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'approve')}
                            disabled={loading[transaction.id]}
                            className="btn-success px-2 py-1 h-8 text-xs"
                            title="Approve transaction"
                          >
                            {loading[transaction.id] ? (
                              <div className="loading-spinner h-3 w-3"></div>
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleTransactionAction(transaction.id, 'reject')}
                            disabled={loading[transaction.id]}
                            className="btn-danger px-2 py-1 h-8 text-xs"
                            title="Reject transaction"
                          >
                            {loading[transaction.id] ? (
                              <div className="loading-spinner h-3 w-3"></div>
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {transaction.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}