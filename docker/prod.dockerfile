# Build OpenVidu Call for production
FROM node:lts-alpine3.11 as openvidu-call-build

WORKDIR /openvidu-call

ARG BRANCH_NAME=master
ARG BASE_HREF=/

RUN apk add wget unzip

# Download openvidu-call from specific branch (master by default), intall openvidu-browser and build for production
RUN wget "https://github.com/kalyandas75/kaksha/archive/${BRANCH_NAME}.zip" -O kaksha.zip
RUN unzip kaksha.zip && \
    rm kaksha.zip && \
    mv kaksha-${BRANCH_NAME}/openvidu-call-front/ . && \
    mv kaksha-${BRANCH_NAME}/openvidu-call-back/ . && \
    rm openvidu-call-front/package-lock.json && \
    rm openvidu-call-back/package-lock.json && \
    rm -rf kaksha-${BRANCH_NAME} && \
    # Install openvidu-call-front dependencies and build it for production
    npm i --prefix openvidu-call-front && \
    npm run build-prod ${BASE_HREF} --prefix openvidu-call-front && \
    rm -rf openvidu-call-front && \
    # Install openvidu-call-back dependencies and build it for production
    npm i --prefix openvidu-call-back && \
    npm run build --prefix openvidu-call-back && \
    mv openvidu-call-back/dist . && \
    rm -rf openvidu-call-back


FROM node:lts-alpine3.11

WORKDIR /opt/openvidu-call

COPY --from=openvidu-call-build /openvidu-call/dist .
# Entrypoint
COPY ./entrypoint.sh /usr/local/bin
RUN apk add curl && \
    chmod +x /usr/local/bin/entrypoint.sh && \
    npm install -g nodemon

# CMD /usr/local/bin/entrypoint.sh
CMD ["/usr/local/bin/entrypoint.sh"]
