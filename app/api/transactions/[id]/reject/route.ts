import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emitBudgetUpdate, emitTransactionUpdate } from '@/lib/socket'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedAt: new Date(),
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
          action: 'TRANSACTION_REJECTED',
          userId: session.user.id,
          details: {
            transactionId: id,
            amount: transaction.amount,
            rejectedBy: session.user.email,
          }
        }
      })

      return updatedTransaction
    })

    emitTransactionUpdate(transaction.userId, {
      type: 'TRANSACTION_REJECTED',
      transaction: result
    })

    emitBudgetUpdate(transaction.budgetId, {
      type: 'TRANSACTION_REJECTED',
      transaction: result
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Reject transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to reject transaction' },
      { status: 500 }
    )
  }
}