FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy entire source
COPY . .

# Expose service port
EXPOSE 3006

# Start service
CMD ["node", "index.js"]
