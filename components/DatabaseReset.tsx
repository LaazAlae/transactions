'use client'

import { useState } from 'react'

export function DatabaseReset() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const resetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the database? This will delete all data.')) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/reset-db', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Database reset successfully! Refreshing page...')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage('Failed to reset database')
    } finally {
      setLoading(false)
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="mt-6 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
      <h3 className="text-sm font-medium text-yellow-800 mb-2">
        Development Tools
      </h3>
      <p className="text-sm text-yellow-700 mb-3">
        If you're having login issues, you can reset the database to start fresh.
      </p>
      <button
        onClick={resetDatabase}
        disabled={loading}
        className="btn-danger text-sm"
      >
        {loading ? 'Resetting...' : 'Reset Database'}
      </button>
      {message && (
        <p className={`mt-2 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}