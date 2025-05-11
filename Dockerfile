# Use official Bun image
FROM oven/bun:1.1.0

# Set working directory
WORKDIR /app

# Install dependencies
COPY bun.lock package.json ./
RUN bun install

# Copy source files
COPY . .

# Optional: build if you're using TypeScript and have a build script
# RUN bun run build

# Set the user and port
USER bun
EXPOSE 4000

# Adjust this to your actual start script from package.json
CMD ["bun", "run", "be:start"]

