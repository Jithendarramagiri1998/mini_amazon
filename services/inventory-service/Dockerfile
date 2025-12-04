FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy service code
COPY . .

# Expose service port
EXPOSE 3004

# Start the service
CMD ["node", "index.js"]
