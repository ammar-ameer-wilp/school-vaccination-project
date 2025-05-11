From node:18

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm","start"]