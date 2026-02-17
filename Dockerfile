FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy backend
COPY backend ./backend

# Copy frontend build
COPY frontend/dist ./frontend/dist

# Expose port
EXPOSE 5001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Start server
CMD ["npm", "start"]
