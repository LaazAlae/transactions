'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SetupForm } from './SetupForm'
import { SignInForm } from './SignInForm'

export function SetupCheck() {
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkSetup()
  }, [])

  const checkSetup = async () => {
    try {
      const response = await fetch('/api/setup/check')
      const data = await response.json()
      setIsInitialized(data.initialized)
    } catch (error) {
      console.error('Setup check failed:', error)
      setIsInitialized(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner h-8 w-8"></div>
          <p className="text-gray-600">Checking system status...</p>
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
        
        {isInitialized === false ? (
          <div>
            <SetupForm onSuccess={() => router.push('/dashboard')} />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setIsInitialized(true)}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in instead
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <SignInForm />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Need to set up the system?{' '}
                <button
                  onClick={() => setIsInitialized(false)}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Create admin account
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}