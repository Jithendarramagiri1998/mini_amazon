FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy service code
COPY . .

# Expose service port
EXPOSE 3004

# Start the service
CMD ["node", "index.js"]
