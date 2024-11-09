FROM node:20-alpine
WORKDIR /app
#ENV PORT=4002
# RUN apk add --no-cache python3 make g++ cairo-dev pango-dev giflib-dev
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
CMD ["yarn","dev"]