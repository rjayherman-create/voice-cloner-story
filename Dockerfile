FROM node:18-alpine

WORKDIR /app

# Copy root and frontend package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install root & frontend dependencies
RUN npm install
RUN cd frontend && npm install --include=dev

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build React frontend
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

CMD ["npm", "start"]
