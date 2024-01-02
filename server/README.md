# Backend

This is a backend node server for traine responsible for time management and sending, as well as players position validation and saving.

It mainly uses a socket.io server.


To make your own version CORS origin SERVER in serverOptions.ts needs to be changed to "*" for any server or a dedicated address

To install it, you need to clone this repo and run:

npm install


To build the bundled file run:

npm run bundle


Then finally you can run it with:

npm run start
