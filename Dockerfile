FROM node:lts
COPY . /app
WORKDIR /app
RUN npm install
RUN npm install -g @angular/cli
CMD ng serve --host 0.0.0.0
