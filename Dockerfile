# ─── Etapa 1: Build de la aplicación Angular ──────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar manifiestos primero para aprovechar caché de capas
COPY package*.json ./
RUN npm install --prefer-offline

# Copiar el resto del código y compilar en modo producción
COPY . .
RUN npm run build -- --configuration=production

# ─── Etapa 2: Servidor Nginx para servir la SPA ───────────────────────────────
FROM nginx:1.27-alpine

# Eliminar configuración por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar artefactos compilados
COPY --from=builder /app/dist/challenge-frontend-app/browser /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run requiere que el puerto interno sea 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
