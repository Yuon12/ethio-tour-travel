# Use lightweight Node.js image
FROM node:18-alpine

WORKDIR /app

# Install dependencies first (leverages Docker cache)
COPY package*.json /app/
RUN npm install

# Copy project files
COPY . /app/

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server accessible from outside container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]