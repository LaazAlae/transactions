import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { emitBudgetUpdate, emitToAdmins } from '@/lib/socket'

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1).max(500),
  date: z.string().datetime(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const where: any = {}
    
    if (session.user.role === 'BUYER') {
      where.userId = session.user.id
    } else if (userId && session.user.role === 'ADMIN') {
      where.userId = userId
    }

    if (status) {
      where.status = status
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = createTransactionSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { amount, description, date } = validation.data

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
      const transaction = await tx.transaction.create({
        data: {
          amount,
          description,
          date: new Date(date),
          userId: session.user.id,
          budgetId: budget.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      })

      await tx.auditLog.create({
        data: {
          action: 'TRANSACTION_CREATED',
          userId: session.user.id,
          details: {
            transactionId: transaction.id,
            amount,
            description,
          }
        }
      })

      return transaction
    })

    emitToAdmins('new-transaction', result)
    emitBudgetUpdate(budget.id, { type: 'PENDING_TRANSACTION_ADDED', transaction: result })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}