# Stage 1: Build the Angular app
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/jwt-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080 for Railway
EXPOSE 8080

# Replace API_URL_PLACEHOLDER with actual API_URL and start nginx
CMD ["/bin/sh", "-c", "echo 'Replacing API_URL_PLACEHOLDER with' \"${API_URL:-http://localhost:8080}\" && find /usr/share/nginx/html -type f \\( -name '*.js' -o -name '*.mjs' \\) -exec sed -i \"s|API_URL_PLACEHOLDER|${API_URL:-http://localhost:8080}|g\" {} \\; && echo 'Starting nginx on port 8080...' && nginx -g 'daemon off;'"]
