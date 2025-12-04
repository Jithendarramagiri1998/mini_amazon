# build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package definitions
COPY package*.json ./

# ❗ IMPORTANT: install ALL deps (dev + prod)
RUN npm install

# Copy full source
COPY . .

# Build React app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL:-/api}
RUN npm run build

# production stage
FROM nginx:stable-alpine

# Copy build output to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Use custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
