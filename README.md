# blobshare
## SOFTWARES REQUIRED
<pre>
  1)NodeJS installed
  2)A MongoDB URI
</pre>
## SETUP
<pre>
  1) Download or clone the project
  2) Create a MongoDB URL using mongoDB compass or atlas
  3) In the main directory create a file called ".env" and paste the following content
  <code>
    MONGODB_URL=&lt;your mongodb URL&gt;
  </code>
  4) Open terminal in the main directory and run the following command
  <code>
    npm install
  </code>
</pre>
## STARTING THE APPLICATION
<pre>
  use the below command to start the project in the working directory
  <code>
    node index.js
  </code>
</pre>
## ABOUT THE PROJECT
<pre>
The aim of this project is to share multiple files using a web browser. It is inspired from Snapdrop.
The abstract working of this project is
  1) Identify the network of the user
  2) Identify users in the same network
  3) Use Websocket as a signaling server to connect two users
  4) Connect two users using webRTC API.
  5) Share files
</pre>
