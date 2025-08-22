'use client'

import { useEffect, useState } from 'react'
import { SignInForm } from './SignInForm'
import { RegisterForm } from './RegisterForm'

export function AuthFlow() {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null)
  const [showLogin, setShowLogin] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSetup()
  }, [])

  const checkSetup = async () => {
    try {
      const response = await fetch('/api/setup/check')
      const data = await response.json()
      setIsInitialized(data.initialized)
      
      // If system is not initialized, show registration form
      if (!data.initialized) {
        setShowLogin(false)
      }
    } catch (error) {
      console.error('Setup check failed:', error)
      setIsInitialized(false)
      setShowLogin(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner h-8 w-8"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Budget Tracker
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Professional budget tracking and transaction management
          </p>
        </div>
        
        {showLogin ? (
          <div>
            <SignInForm />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Create one here
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <RegisterForm 
              onSwitchToLogin={() => setShowLogin(true)}
              isFirstUser={!isInitialized}
            />
            {isInitialized && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}