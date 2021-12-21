FROM node:17.2-alpine
RUN apk update && apk add git

ENV NODE_ENV=development
ENV LOG_TIMESTAMP=true

COPY ["./package.json", "./package-lock.json*", "./npm-shrinkwrap.json*", "/workspace/"]
RUN npm install -g nodemon 
#RUN npm install 

# Create the user
# Switching to a non-root user, please refer to https://aka.ms/vscode-docker-python-user-rights
ARG USERNAME="node"
ARG USERGROUP="node"

WORKDIR /workspace
RUN chown -R $USERNAME:$USERGROUP /workspace/
RUN chmod -R 775 /workspace

#COPY . .
#EXPOSE 3000
CMD [ "sleep", "infinity" ]
