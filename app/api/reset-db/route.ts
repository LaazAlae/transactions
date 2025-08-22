import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }

    // Delete all data in order due to foreign key constraints
    await prisma.pushSubscription.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.budgetAction.deleteMany()
    await prisma.transaction.deleteMany()
    await prisma.budget.deleteMany()
    await prisma.user.deleteMany()

    return NextResponse.json({ 
      message: 'Database reset successfully. You can now set up the system again.' 
    })
  } catch (error) {
    console.error('Database reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset database' },
      { status: 500 }
    )
  }
}