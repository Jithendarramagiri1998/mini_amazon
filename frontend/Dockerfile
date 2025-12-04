# build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package definitions
COPY package*.json ./

# FIX: npm install instead of npm ci
RUN npm install --production

# Copy all project files
COPY . .

# Environment variable for API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL:-/api}

# Build React app
RUN npm run build

# production stage
FROM nginx:stable-alpine

# Copy compiled React build into NGINX HTML folder
COPY --from=build /app/build /usr/share/nginx/html

# Use custom nginx config (optional but recommended)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
