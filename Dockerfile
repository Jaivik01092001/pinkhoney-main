# Use Node.js image as the base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production
RUN npm install tailwindcss

# Copy the rest of the application code
COPY . .


# Build the Next.js application
RUN npm run build

# Expose the port on which Next.js will listen (e.g., 3000)
EXPOSE 8080

# Set the command to run the Next.js application
CMD ["npm", "start"]

# CMD ["npm", "run", "start"]