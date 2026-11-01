FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# claude code 
RUN apk add --no-cache libgcc libstdc++ ripgrep git bash
ENV USE_BUILTIN_RIPGREP=0

RUN npm install -g @anthropic-ai/claude-code

EXPOSE 5173
CMD ["sh", "-c", "npm install && npm run dev -- --host 0.0.0.0"]
