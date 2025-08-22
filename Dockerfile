# Railway Deployment - Fixed for Prisma
FROM node:18-alpine

WORKDIR /app

# Copy all files first
COPY . .

# Install dependencies and generate Prisma client in one step
RUN npm ci && npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]