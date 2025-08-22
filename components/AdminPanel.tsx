'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

interface AdminPanelProps {
  onRefresh: () => void
}

export function AdminPanel({ onRefresh }: AdminPanelProps) {
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description || 'Funds added by admin',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to add funds')
        return
      }

      setAmount('')
      setDescription('')
      setShowAddFunds(false)
      onRefresh()
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h3 className="card-title">Admin Panel</h3>
          <button
            onClick={() => setShowAddFunds(!showAddFunds)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Funds</span>
          </button>
        </div>
      </div>
      {showAddFunds && (
        <div className="card-content border-t border-gray-200">
          <form onSubmit={handleAddFunds} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="addAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  id="addAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label htmlFor="addDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  id="addDescription"
                  type="text"
                  className="input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Reason for adding funds"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowAddFunds(false)}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !amount}
                className="btn-success"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Adding...
                  </>
                ) : (
                  'Add Funds'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}