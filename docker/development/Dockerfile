# Use the official Node.js image as our base
FROM node:22.12.0

# blow given process to run when docker build

# Set the working directory inside the container
WORKDIR /auth-service/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of our app's source code into the container
COPY . .

# Expose the port the app will run on
EXPOSE 5502

# env
ENV MONGODB_USERNAME=parthdangroshiya13
ENV MONGODB_PASSWORD=cxxWyaLlXS6MNF39
ENV MONGODB_DB=mern-pizza-app
ENV MONGODB_HOST=mongocluster


# The command to run our app
# cmd command run when docker run
CMD ["npm", "run", "dev"]
