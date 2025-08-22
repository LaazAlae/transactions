import { Server as ServerIO } from 'socket.io'

function getIO(): ServerIO | null {
  return (global as any).io || null
}

export function emitBudgetUpdate(budgetId: string, data: any) {
  const io = getIO()
  if (io && budgetId) {
    io.to(`budget:${budgetId}`).emit('budget-updated', data)
  }
}

export function emitTransactionUpdate(userId: string, data: any) {
  const io = getIO()
  if (io && userId) {
    io.to(`user:${userId}`).emit('transaction-updated', data)
  }
}

export function emitToAdmins(event: string, data: any) {
  const io = getIO()
  if (io && event) {
    io.to('role:ADMIN').emit(event, data)
  }
}

export function emitToAllUsers(event: string, data: any) {
  const io = getIO()
  if (io && event) {
    io.emit(event, data)
  }
}