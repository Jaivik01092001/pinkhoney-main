# Use Node.js image as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the port on which Express will listen
EXPOSE 8080

# Set the command to run the Express application
CMD ["node", "index.js"]
