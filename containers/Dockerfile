FROM node:14-alpine  

# Create app directory
RUN mkdir -p /app
WORKDIR /app


# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

# If you are building your code for production
# RUN npm ci --only=production


COPY package*.json /app

RUN npm install
RUN npm install nodemon -g
COPY . .
# Bundle app source
#COPY . .

# EXPOSE 5050
# CMD [ "node", "routecost.js" ]

