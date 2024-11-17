# Use a base image with Node.js
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install backend dependencies
RUN npm install

# COPY the rest of the application files
COPY . .

# Expose the port this application listens on
EXPOSE 3001

# Command to run the application
CMD ["node", "src/index.js"]