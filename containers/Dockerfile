FROM node:14-alpine  

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# If you are building your code for production
# RUN npm ci --only=production

COPY package*.json /app

RUN npm install
# Bundle app source
COPY . .

# EXPOSE 5050
# CMD [ "node", "routecost.js" ]

