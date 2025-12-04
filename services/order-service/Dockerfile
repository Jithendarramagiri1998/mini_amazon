FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy entire source
COPY . .

# Expose service port
EXPOSE 3006

# Start service
CMD ["node", "index.js"]
