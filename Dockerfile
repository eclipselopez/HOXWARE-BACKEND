# Build project stage
FROM node:latest as build
WORKDIR /build
COPY package*.json ./
RUN npm install
COPY . ./
RUN npm run build
COPY . /build/

## BASE
FROM node:latest
WORKDIR /opt/api/
COPY . /opt/api/
COPY --from=build /build/node_modules /opt/api/node_modules
CMD ["npm", "start"]
EXPOSE 5001/tcp