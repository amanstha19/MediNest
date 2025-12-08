FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend project files
COPY . .

# Expose Vite port
EXPOSE 5173

# Run frontend development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
