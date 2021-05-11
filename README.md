# socketio-messaging-react
A copy of socket.io's private messaging example, in react instead of vue

## General info

This is a copy of [socket.io's private messaging example](https://socket.io/get-started/private-messaging-part-1/), but with the frontend part written in React instead of Vue, so if you find it annoying to follow the tutorial while deciphering Vue code, this might be helpful.

The server part is exactly the same as the original, and I tried to keep the client side as close to the "official" code as possible, while keeping in mind React's way of doing thigs (updating the state immutably, etc.), so you should be able to follow original instructions, and just focus on learning the socket.io framework itself.

## Installation

After cloning the project, first select the correct branch for the current part of the tutorial (for example for part 1) : 

```
cd ../socketio-messaging-react 
git checkout private-messaging-react-part-1
```
Then, to run the frontend:
```
cd front
npm install
npm start
```
The app will run on [localhost:3000](http://localhost:3000). Then start the server:

```
cd back
npm install
npm start
```
You should see `server listening at http://localhost:3030` printed in the console.

After that, you are good to follow the [original guide](https://socket.io/get-started/private-messaging-part-1/).
