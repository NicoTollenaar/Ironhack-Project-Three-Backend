require("dotenv").config({ path: "./../.env" });
const cors = require("cors");
const express = require("express");
const app = express();
const server = require('http').createServer(app);
const morgan = require("morgan");
require("./db/connectDatabase");
const PORT = process.env.PORT || 4001;

const { WebSocketServer }  = require("ws");

app.use(
  cors({
    credentials: true,
    origin:
    process.env.ORIGIN || "http://localhost:3000",
    allowheaders: ["Origin, X-Requested-With, Content-Type, Accept", "Authorization" ],
  })
  );
  
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Origin", process.env.ORIGIN || "http://localhost:3000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Credentials", true);
    next();
  });
  
  app.use(morgan("dev"));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.text());
  app.use(express.static("./public"));
  
  const authRoutes = require("./routes/authRoutes.js");
  app.use(
    "/", 
    authRoutes
    );
    
    const accountRoutes = require("./routes/accountRoutes");
    app.use(
      "/",
      accountRoutes);
      
      // const serverSideEventRoutes = require("./routes/serverSideEventRoutes");
      // app.use("/", serverSideEventRoutes);
      
      const wss = new WebSocketServer({ server });
      
      server.listen(PORT, (err) => {
        console.log(
          `Express server running, listening on PORT ${PORT} ...`
          );
          if (err) { 
            console.log("ERROR IN EXPRESS SERVER");
            throw err;
          }
        });
        
        module.exports = wss;

        require("./scripts/WebsocketEventListener");
        
        




