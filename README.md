# Budget Tracker - Professional Budget Management System

A secure, real-time budget tracking and transaction management system built with Next.js, designed for businesses to manage employee spending with admin approval workflows.

## Features

### Core Functionality
- **Role-Based Access Control**: Admin and Buyer roles with distinct permissions
- **Real-Time Updates**: WebSocket-powered live budget and transaction updates
- **Transaction Management**: Submit, approve, reject, and track all transactions
- **Budget Oversight**: Real-time budget calculations with pending transaction preview
- **Excel Export**: Generate comprehensive transaction reports
- **PWA Support**: Works offline with app-like experience on mobile devices

### Security Features
- Military-grade security implementation
- bcrypt password hashing with audit logging
- Session-based authentication with JWT tokens
- SQL injection prevention with Prisma ORM
- XSS and CSRF protection
- Comprehensive audit trail

### Admin Features
- Approve/reject pending transactions
- Add funds to budget
- View all user transactions
- Real-time dashboard updates
- Export transaction data to Excel

### Buyer Features
- Submit purchase transactions
- View personal transaction history
- Real-time budget availability
- Push notifications for transaction updates

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Real-time**: Socket.IO
- **PWA**: next-pwa with service workers
- **Notifications**: Web Push API with VAPID
- **Deployment**: Railway (100% free tier compatible)

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Railway account (for deployment)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd budget-tracker
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/budget_tracker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_EMAIL="mailto:your-email@domain.com"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
```

3. **Generate VAPID keys for push notifications**
```bash
npx web-push generate-vapid-keys
```

4. **Set up database**
```bash
npx prisma db push
```

5. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` to set up your first admin account.

## Railway Deployment

### Automatic Deployment
1. Push your code to GitHub
2. Connect your repository to Railway
3. Set environment variables in Railway dashboard
4. Deploy automatically on every push

### Environment Variables for Railway
Set these in your Railway project:
- `DATABASE_URL` (provided by Railway PostgreSQL)
- `NEXTAUTH_URL` (your Railway domain)
- `NEXTAUTH_SECRET`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

## Usage

### First-Time Setup
1. Open the application
2. Create the first admin account
3. Set initial budget (optional)
4. Add buyer accounts as needed

### Admin Workflow
1. Monitor dashboard for pending transactions
2. Review transaction details
3. Approve or reject transactions
4. Add funds when budget runs low
5. Export transaction reports

### Buyer Workflow
1. Submit new transaction with amount, description, and date
2. Monitor transaction status in real-time
3. View budget availability
4. Receive notifications for transaction updates

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/setup` - Initial system setup

### Budget Management
- `GET /api/budget` - Get current budget status
- `POST /api/budget` - Add funds (Admin only)

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create new transaction
- `POST /api/transactions/[id]/approve` - Approve transaction (Admin only)
- `POST /api/transactions/[id]/reject` - Reject transaction (Admin only)

### Notifications
- `POST /api/notifications/subscribe` - Subscribe to push notifications

## Real-Time Features

The application uses WebSocket connections for real-time updates:
- Budget changes update instantly for all users
- Transaction status changes notify relevant users
- Pending transaction calculations update in real-time
- Admin notifications for new transactions

## Security

This application implements military-grade security measures:
- Password hashing with bcrypt (12 salt rounds)
- JWT-based session management
- SQL injection prevention
- XSS and CSRF protection
- Audit logging for all actions
- Role-based access control
- Secure WebSocket connections

See `SECURITY.txt` for complete security documentation.

## PWA Features

- Offline capability with service worker
- App-like installation on mobile devices
- Push notifications for transaction updates
- Fast loading with intelligent caching
- Responsive design for all screen sizes

## Development

### Project Structure
```
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Main application pages
│   └── globals.css        # Global styles
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── prisma/               # Database schema
├── public/               # Static assets
└── types/                # TypeScript definitions
```

### Database Schema
- **Users**: Authentication and role management
- **Budget**: Current budget state
- **Transactions**: Purchase transactions with approval workflow
- **BudgetActions**: Budget modification history
- **AuditLogs**: Complete audit trail
- **PushSubscriptions**: Push notification endpoints

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include error logs and environment details