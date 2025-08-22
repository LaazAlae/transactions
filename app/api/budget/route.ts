import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { emitBudgetUpdate } from '@/lib/socket'

const addFundsSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const budget = await prisma.budget.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!budget) {
      return NextResponse.json(
        { error: 'No budget found' },
        { status: 404 }
      )
    }

    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        budgetId: budget.id,
        status: 'PENDING'
      },
      select: {
        amount: true,
        userId: true,
      }
    })

    const totalPending = pendingTransactions.reduce(
      (sum, t) => sum + Number(t.amount), 
      0
    )

    const userPending = session.user.role === 'BUYER' 
      ? pendingTransactions
          .filter(t => t.userId === session.user.id)
          .reduce((sum, t) => sum + Number(t.amount), 0)
      : 0

    return NextResponse.json({
      ...budget,
      totalAmount: Number(budget.totalAmount),
      totalPending,
      userPending,
      availableAmount: Number(budget.totalAmount) - totalPending
    })
  } catch (error) {
    console.error('Get budget error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budget' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = addFundsSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { amount, description = 'Funds added by admin' } = validation.data

    const budget = await prisma.budget.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!budget) {
      return NextResponse.json(
        { error: 'No budget found' },
        { status: 404 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedBudget = await tx.budget.update({
        where: { id: budget.id },
        data: {
          totalAmount: {
            increment: amount
          }
        }
      })

      await tx.budgetAction.create({
        data: {
          type: 'ADD_FUNDS',
          amount,
          description,
          userId: session.user.id,
          budgetId: budget.id,
        }
      })

      await tx.auditLog.create({
        data: {
          action: 'FUNDS_ADDED',
          userId: session.user.id,
          details: {
            amount,
            description,
            addedBy: session.user.email,
          }
        }
      })

      return updatedBudget
    })

    emitBudgetUpdate(budget.id, {
      type: 'FUNDS_ADDED',
      budget: {
        ...result,
        totalAmount: Number(result.totalAmount)
      },
      amount
    })

    return NextResponse.json({
      ...result,
      totalAmount: Number(result.totalAmount)
    })
  } catch (error) {
    console.error('Add funds error:', error)
    return NextResponse.json(
      { error: 'Failed to add funds' },
      { status: 500 }
    )
  }
}