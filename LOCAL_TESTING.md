# Local Testing Guide

## Prerequisites Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
You need PostgreSQL running locally. Options:

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database
createdb budget_tracker
```

**Option B: Docker PostgreSQL**
```bash
docker run --name budget-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=budget_tracker -p 5432:5432 -d postgres:15
```

### 3. Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/budget_tracker"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-characters-long"
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_EMAIL="mailto:your-email@domain.com"
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
```

### 4. Generate VAPID Keys for Push Notifications
```bash
npx web-push generate-vapid-keys
```
Copy the keys to your `.env.local` file.

### 5. Database Migration
```bash
npx prisma db push
```

## Running the Application

### Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Testing Checklist

### 1. Initial Setup Testing
- [ ] App loads without errors
- [ ] First-time setup screen appears
- [ ] Can create Admin account
- [ ] Can create Buyer account
- [ ] Initial budget setup works

### 2. Authentication Testing
- [ ] Admin login works
- [ ] Buyer login works
- [ ] Session persistence (refresh page)
- [ ] Logout functionality
- [ ] Role-based redirects

### 3. Admin Features Testing
- [ ] Dashboard loads with budget overview
- [ ] Can add funds to budget
- [ ] Can view all transactions
- [ ] Can approve pending transactions
- [ ] Can reject pending transactions
- [ ] Real-time updates work
- [ ] Excel export downloads correctly

### 4. Buyer Features Testing
- [ ] Dashboard shows user-specific data
- [ ] Can submit new transactions
- [ ] Form validation works
- [ ] Real-time budget updates
- [ ] Only sees own transactions
- [ ] Transaction status updates

### 5. Real-time Features Testing
Open multiple browser windows (one admin, one buyer):
- [ ] Budget updates instantly across windows
- [ ] New transactions appear for admin immediately
- [ ] Transaction approvals update buyer view
- [ ] Pending calculations are accurate

### 6. PWA Testing
- [ ] App works offline
- [ ] Install prompt appears
- [ ] Service worker registers
- [ ] Manifest.json loads
- [ ] Icons display correctly

### 7. Push Notifications Testing
- [ ] Notification permission request
- [ ] Subscription saves to database
- [ ] Admin receives new transaction notifications
- [ ] Buyer receives approval/rejection notifications

### 8. Security Testing
- [ ] Cannot access admin routes as buyer
- [ ] Cannot access other user's data
- [ ] API endpoints require authentication
- [ ] Password is hashed in database
- [ ] Audit logs are created

### 9. Data Integrity Testing
- [ ] Budget calculations are accurate
- [ ] Pending amounts calculated correctly
- [ ] Transaction amounts use proper decimals
- [ ] Excel export contains correct data

## Database Inspection

### View Data with Prisma Studio
```bash
npx prisma studio
```
Opens at: http://localhost:5555

### Check Database Directly
```bash
psql -d budget_tracker -c "SELECT * FROM users;"
psql -d budget_tracker -c "SELECT * FROM budgets;"
psql -d budget_tracker -c "SELECT * FROM transactions;"
```

## Debugging Common Issues

### Database Connection Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql
# or for Docker
docker ps | grep postgres

# Reset database
npx prisma db push --force-reset
```

### Environment Variable Issues
```bash
# Check if variables are loaded
npm run dev
# Look for "Environment variables loaded" in console
```

### Build Issues
```bash
# Check TypeScript compilation
npm run build

# Check for linting errors
npm run lint
```

### Socket.IO Issues
- Check browser console for WebSocket connection errors
- Verify both admin and buyer can connect
- Test real-time updates between windows

## Performance Testing

### Lighthouse Testing
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run PWA audit
4. Should score 90+ in all categories

### Network Testing
1. Open DevTools Network tab
2. Test with slow 3G simulation
3. Verify app loads quickly
4. Check service worker caching

## Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Build completes without errors: `npm run build`
- [ ] TypeScript compiles without errors
- [ ] No console errors in browser
- [ ] PWA score is 90+ in Lighthouse
- [ ] Database migrations work: `npx prisma db push`
- [ ] Environment variables are properly set
- [ ] SECURITY.txt is in .gitignore
- [ ] README.md is updated

## Sample Test Data

### Create Test Admin
```json
{
  "email": "admin@test.com",
  "password": "password123",
  "name": "Test Admin",
  "role": "ADMIN",
  "initialBudget": 10000
}
```

### Create Test Buyer
```json
{
  "email": "buyer@test.com",
  "password": "password123",
  "name": "Test Buyer",
  "role": "BUYER"
}
```

### Test Transaction
```json
{
  "amount": 150.99,
  "description": "Office desk and chair",
  "date": "2024-01-15"
}
```

## Ready for Deployment

Once all tests pass locally:

1. Commit changes: `git add . && git commit -m "Initial budget tracker implementation"`
2. Push to GitHub: `git push origin main`
3. Connect repository to Railway
4. Set environment variables in Railway
5. Deploy automatically