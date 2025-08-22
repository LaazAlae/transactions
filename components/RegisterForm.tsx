'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'BUYER']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

interface RegisterFormProps {
  onSwitchToLogin: () => void
  isFirstUser?: boolean
}

export function RegisterForm({ onSwitchToLogin, isFirstUser = false }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: (isFirstUser ? 'ADMIN' : 'BUYER') as 'ADMIN' | 'BUYER',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const validation = registerSchema.safeParse(formData)
      
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {}
        validation.error.errors.forEach((error) => {
          fieldErrors[error.path[0] as string] = error.message
        })
        setErrors(fieldErrors)
        return
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || 'Registration failed' })
        return
      }

      // Auto-sign in the user after successful registration
      const signInResult = await signIn('credentials', {
        email: validation.data.email,
        password: validation.data.password,
        redirect: false,
      })

      if (signInResult?.ok && !signInResult?.error) {
        router.push('/dashboard')
      } else {
        setErrors({ general: 'Registration successful but login failed. Please sign in manually.' })
      }
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
    <div className="card">
      <div className="card-header">
        <h3 className="card-title text-center">
          {isFirstUser ? 'System Setup' : 'Create Account'}
        </h3>
        <p className="text-sm text-gray-600 text-center">
          {isFirstUser 
            ? 'Create the first admin account to initialize the system'
            : 'Create a new account to access the budget tracker'
          }
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
              placeholder="Enter your full name"
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
              placeholder="Enter your email address"
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
              placeholder="Create a password (min 8 characters)"
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
              placeholder="Confirm your password"
              required
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              id="role"
              className="input"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              disabled={isFirstUser}
              required
            >
              <option value="ADMIN">Admin (Can manage budget and approve transactions)</option>
              <option value="BUYER">Buyer (Can submit transactions for approval)</option>
            </select>
            {isFirstUser && (
              <p className="text-blue-600 text-sm mt-1">
                The first account must be an admin to manage the system
              </p>
            )}
            {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <div className="loading-spinner mr-2"></div>
                Creating Account...
              </>
            ) : (
              isFirstUser ? 'Initialize System' : 'Create Account'
            )}
          </button>
        </form>
      </div>
      
      {!isFirstUser && (
        <div className="px-6 pb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}