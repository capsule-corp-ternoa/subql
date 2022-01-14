FROM node:16-alpine
ENV TZ utc

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--", "subql-query"]

COPY . .
RUN npm install && npm run build && npm link