import express = require('express');
import * as helmet from 'helmet';
import cors = require('cors');
import * as mongoose from "mongoose";
import {initAuthRoutes} from "./api/auth";
import {initCharacterRoutes} from "./api/character";
import {initDataRoutes} from "./api/data";
import {initUserRoutes} from "./api/user";
import {Server} from "socket.io";
import { createServer } from "node:http";
import {removeSocket, setSocket} from "./sockets";
import {isAuthenticated} from "./services/auth";

mongoose.connect(Bun.env.MONGO_URI as string).then(() => {
  console.log('Connected to MongoDB')
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
  }
});

io.on('connection', socket => {
  socket.on('authenticate', async sessionId => {
    const user = await isAuthenticated(sessionId);
    if (!user) {
      return socket.disconnect();
    }

    setSocket(user.id, socket);

    socket.on('disconnect', () => {
      removeSocket(user.id);
    });
  });
});

app.use(express.json({limit: '100mb'}));
app.use(helmet.default());

app.use(cors({
  origin: '*',
}));

initAuthRoutes(app);
initDataRoutes(app);

app.use(async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized');
  }

  const sessionId = req.headers.authorization.replace('Bearer ', '');
  const user = await isAuthenticated(sessionId);
  if (!user) {
    return res.status(401).send('Unauthorized');
  }

  res.locals.user = user;
  res.locals.userId = user.id;

  next();
});

initCharacterRoutes(app);
initUserRoutes(app);

httpServer.listen(6660, () => {
  console.log(`Server is running on port 6660`);
});
