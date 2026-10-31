FROM node:22-alpine

WORKDIR /app

# claude code
RUN apk add --no-cache libgcc libstdc++ ripgrep git bash
ENV USE_BUILTIN_RIPGREP=0
RUN npm install -g @anthropic-ai/claude-code

COPY package*.json ./
RUN npm install

EXPOSE 3000
CMD ["npm", "run", "dev"]
