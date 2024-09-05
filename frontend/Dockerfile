FROM node:17.9.1-alpine3.15 as build-stage

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./
RUN npm i yarn
RUN yarn
COPY . .

ARG VUE_APP_API_URL
ENV VUE_APP_API_URL=${VUE_APP_API_URL}

RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./nginx-default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]