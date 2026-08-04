# Production image for the JH Mural admin app (Vite build served by nginx).
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# VITE_* values are inlined at build time. This is the URL the *browser*
# calls, so it points at the published host port, not the service name.
ARG VITE_API_BASE_URL="http://localhost:8000"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
