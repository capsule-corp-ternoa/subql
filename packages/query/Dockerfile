# production images
FROM node:14-alpine
ENV TZ utc

ARG RELEASE_VERSION
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--", "subql-query"]

COPY . .
RUN npm install && npm run build && npm link

CMD ["-f","/app"]
