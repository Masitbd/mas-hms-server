FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
RUN npm install && \
    npm install cookie-parser && \
    npm run build && \
    npm cache clean --force && \
    rm -rf /root/.npm && \
    rm -rf node_modules

COPY . .
EXPOSE 3001
CMD ["npm","start"]