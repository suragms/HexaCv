# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS client-builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile || npm install
COPY . .
RUN npm run build

# --- Stage 2: Final Image ---
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile || npm install --prod
COPY --from=client-builder /app/dist ./dist
COPY --from=client-builder /app/server ./server
COPY --from=client-builder /app/shared ./shared

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
