'use client'

import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface ExcelExportProps {
  transactions: Transaction[]
}

export function ExcelExport({ transactions }: ExcelExportProps) {
  const handleExport = () => {
    if (transactions.length === 0) {
      alert('No transactions to export')
      return
    }

    const exportData = transactions.map((transaction, index) => ({
      'Transaction #': index + 1,
      'Description': transaction.description,
      'Amount': transaction.amount,
      'Purchase Date': new Date(transaction.date).toLocaleDateString(),
      'Status': transaction.status,
      'User Name': transaction.user.name || transaction.user.email,
      'User Email': transaction.user.email,
      'Submitted Date': new Date(transaction.createdAt).toLocaleDateString(),
      'Submitted Time': new Date(transaction.createdAt).toLocaleTimeString(),
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    
    const colWidths = [
      { wch: 15 }, // Transaction #
      { wch: 30 }, // Description
      { wch: 12 }, // Amount
      { wch: 15 }, // Purchase Date
      { wch: 10 }, // Status
      { wch: 20 }, // User Name
      { wch: 25 }, // User Email
      { wch: 15 }, // Submitted Date
      { wch: 15 }, // Submitted Time
    ]
    ws['!cols'] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

    const summary = {
      'Total Transactions': transactions.length,
      'Pending': transactions.filter(t => t.status === 'PENDING').length,
      'Approved': transactions.filter(t => t.status === 'APPROVED').length,
      'Rejected': transactions.filter(t => t.status === 'REJECTED').length,
      'Total Amount (Approved)': transactions
        .filter(t => t.status === 'APPROVED')
        .reduce((sum, t) => sum + t.amount, 0),
      'Total Amount (All)': transactions.reduce((sum, t) => sum + t.amount, 0),
    }

    const summaryData = Object.entries(summary).map(([key, value]) => ({
      'Metric': key,
      'Value': value
    }))

    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    const fileName = `budget_transactions_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
  }

  return (
    <button
      onClick={handleExport}
      className="btn-secondary flex items-center space-x-2"
      title="Export transactions to Excel"
    >
      <Download className="h-4 w-4" />
      <span>Export</span>
    </button>
  )
}