FROM node:lts-alpine AS builder

WORKDIR /tmp

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build
RUN npm prune --production

FROM nginx:stable-alpine
COPY --from=builder /tmp/dist /usr/share/nginx/html
