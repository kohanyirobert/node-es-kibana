FROM node:13.7.0
USER node
ENV NODE_ENV production
WORKDIR /home/node
COPY package.json .
COPY index.js .
RUN npm install
ENTRYPOINT ["tail", "-f", "/dev/null"]
