# =========================================
# Stage 1: Build the React (Vite) Application
# =========================================

ARG NODE_VERSION=24.14.0-alpine
# Use a lightweight Node.js image for building (customizable via ARG)
FROM node:${NODE_VERSION} AS builder


# Set the working directory inside the container
WORKDIR /app


# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json package-lock.json ./


# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci


# Copy the rest of the application source code into the container
COPY . .

# Build the React.js application (outputs to /app/build)
RUN npm run build


# =========================================
# Stage 2: Serve static files with Node.js + `serve`
# =========================================
FROM node:${NODE_VERSION} AS runner


# Set the environment to production for smaller + optimized installs
ENV NODE_ENV=production


# Set the working directory inside the container
WORKDIR /app


# Copy only the production build output from the builder stage
COPY --link --from=builder /app/build ./build


# Install only the `serve` package (no global install, pinned version)
RUN --mount=type=cache,target=/root/.npm npm install serve@^14.2.6 --omit=dev


# Run the container as a non-root user for security best practices
USER node


# Expose port 8080 (the same port configured in "serve -l 8080")
EXPOSE 8080


# Run `serve` directly to serve the built app
CMD ["npx", "serve", "-s", "build", "-l", "8080"]