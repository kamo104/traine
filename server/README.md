# Backend

This is a backend node server for traine responsible for time management and sending, as well as players position validation and saving.

It mainly uses a socket.io server.


To make your own version CORS origin "traine..." in back_server.ts need to be changed to "*" for any server or a dedicated address

To install it, you need to clone this repo and run:

npm run install


This project uses typescript so first it needs compilation via command:

tsc


Then to tidy everything up it uses webpack bundling:

npm run bundle


Then finally you can run it with:

node ./server_bundle/back_server.js