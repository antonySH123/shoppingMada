FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG REACT_API_URL
ARG REACT_API_CATEGORY_URL
ENV REACT_API_URL=${REACT_API_URL}
ENV REACT_API_CATEGORY_URL=${REACT_API_CATEGORY_URL}
RUN test -n "$REACT_API_URL" \
    && test -n "$REACT_API_CATEGORY_URL" \
    && npm run build

FROM nginx:stable-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80