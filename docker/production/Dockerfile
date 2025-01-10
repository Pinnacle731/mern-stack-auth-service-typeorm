# Use the official Node.js 22.12.0 Alpine image as the base image for the build stage
FROM node:22.12.0-alpine as builder

# Set the working directory inside the container
WORKDIR /my-auth-service

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies using npm in a clean and deterministic way (ci = clean install)
RUN npm ci

# Copy the rest of the application files into the container
COPY . .

# Build the application (e.g., TypeScript compilation, bundling, etc.)
RUN npm run build

# Use a separate lightweight Node.js 22.12.0 Alpine image for the production stage
FROM node:22.12.0-alpine as production

# Set the working directory inside the container
WORKDIR /my-auth-service

# Set the Node.js environment to "production" for performance optimizations
ENV NODE_ENV=production

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install production-only dependencies, ignoring scripts to avoid unnecessary steps
RUN npm ci --ignore-scripts

# Copy the built files from the "builder" stage to the current working directory
COPY --from=builder /my-auth-service/dist ./

# Expose the application port (5500) to allow external access
EXPOSE 5500

# Specify the command to run the application when the container starts
CMD [ "node", "src/server.js" ]
