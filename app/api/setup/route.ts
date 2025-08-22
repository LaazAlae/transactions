import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'BUYER']),
  initialBudget: z.number().min(0).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const existingUsers = await prisma.user.count()
    
    if (existingUsers > 0) {
      return NextResponse.json(
        { error: 'System already initialized' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validation = setupSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { email, password, name, role, initialBudget = 0 } = validation.data

    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          role,
        },
      })

      const budget = await tx.budget.create({
        data: {
          totalAmount: initialBudget,
        },
      })

      if (initialBudget > 0) {
        await tx.budgetAction.create({
          data: {
            type: 'ADD_FUNDS',
            amount: initialBudget,
            description: 'Initial budget setup',
            userId: user.id,
            budgetId: budget.id,
          },
        })
      }

      await tx.auditLog.create({
        data: {
          action: 'SYSTEM_SETUP',
          userId: user.id,
          details: {
            userRole: role,
            initialBudget,
          },
        },
      })

      return { user, budget }
    })

    // Auto-sign in the user after setup
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      autoSignIn: true,
    })

    return response
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Setup failed' },
      { status: 500 }
    )
  }
}