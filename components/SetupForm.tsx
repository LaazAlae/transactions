'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { z } from 'zod'

const setupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'BUYER']),
  initialBudget: z.number().min(0, 'Budget must be non-negative').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

interface SetupFormProps {
  onSuccess: () => void
}

export function SetupForm({ onSuccess }: SetupFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'ADMIN' as const,
    initialBudget: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const validation = setupSchema.safeParse(formData)
      
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {}
        validation.error.errors.forEach((error) => {
          fieldErrors[error.path[0] as string] = error.message
        })
        setErrors(fieldErrors)
        return
      }

      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || 'Setup failed' })
        return
      }

      // Auto-sign in the user after setup
      if (data.autoSignIn) {
        const signInResult = await signIn('credentials', {
          email: validation.data.email,
          password: validation.data.password,
          redirect: false,
        })

        if (signInResult?.ok && !signInResult?.error) {
          // Redirect to dashboard directly
          window.location.href = '/dashboard'
          return
        }
      }

      onSuccess()
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title text-center">System Setup</h3>
        <p className="text-sm text-gray-600 text-center">
          Create the first user account to initialize the system
        </p>
      </div>
      <div className="card-content">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              required
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              className="input"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              required
            >
              <option value="ADMIN">Admin</option>
              <option value="BUYER">Buyer</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          {formData.role === 'ADMIN' && (
            <div>
              <label htmlFor="initialBudget" className="block text-sm font-medium text-gray-700 mb-1">
                Initial Budget (Optional)
              </label>
              <input
                id="initialBudget"
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={formData.initialBudget}
                onChange={(e) => handleInputChange('initialBudget', parseFloat(e.target.value) || 0)}
              />
              {errors.initialBudget && <p className="text-red-500 text-sm mt-1">{errors.initialBudget}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Setting up...
              </>
            ) : (
              'Initialize System'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}