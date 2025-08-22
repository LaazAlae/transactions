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
      include: { budget: true, user: true }
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

    if (transaction.budget.totalAmount.lt(transaction.amount)) {
      return NextResponse.json(
        { error: 'Insufficient budget' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
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

      const updatedBudget = await tx.budget.update({
        where: { id: transaction.budgetId },
        data: {
          totalAmount: {
            decrement: transaction.amount
          }
        }
      })

      await tx.auditLog.create({
        data: {
          action: 'TRANSACTION_APPROVED',
          userId: session.user.id,
          details: {
            transactionId: id,
            amount: transaction.amount,
            approvedBy: session.user.email,
          }
        }
      })

      return { transaction: updatedTransaction, budget: updatedBudget }
    })

    emitTransactionUpdate(transaction.userId, {
      type: 'TRANSACTION_APPROVED',
      transaction: result.transaction
    })

    emitBudgetUpdate(transaction.budgetId, {
      type: 'TRANSACTION_APPROVED',
      transaction: result.transaction,
      budget: result.budget
    })

    return NextResponse.json(result.transaction)
  } catch (error) {
    console.error('Approve transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to approve transaction' },
      { status: 500 }
    )
  }
}