'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { z } from 'zod'

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  date: z.string().min(1, 'Date is required'),
})

interface TransactionFormProps {
  onClose: () => void
  onSubmit: () => void
}

export function TransactionForm({ onClose, onSubmit }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const validation = transactionSchema.safeParse({
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
      })

      if (!validation.success) {
        const fieldErrors: Record<string, string> = {}
        validation.error.errors.forEach((error) => {
          fieldErrors[error.path[0] as string] = error.message
        })
        setErrors(fieldErrors)
        return
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || 'Failed to create transaction' })
        return
      }

      onSubmit()
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">New Transaction</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                className="input"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0.00"
                required
              />
              {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                id="description"
                type="text"
                className="input"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="What was purchased?"
                required
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                id="date"
                type="date"
                className="input"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Transaction'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}