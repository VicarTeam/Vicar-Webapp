import express = require('express');
import * as helmet from 'helmet';
import cors = require('cors');
import * as mongoose from "mongoose";
import {getSession} from "./sessions";
import {initAuthRoutes} from "./api/auth";
import {initCharacterRoutes} from "./api/character";
import {initDataRoutes} from "./api/data";
import {initUserRoutes} from "./api/user";
import {Server} from "socket.io";
import { createServer } from "node:http";
import {removeSocket, setSocket} from "./sockets";

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
  socket.on('authenticate', sessionId => {
    const userId = getSession(sessionId);
    if (!userId) {
      return socket.disconnect();
    }

    setSocket(userId, socket);

    socket.on('disconnect', () => {
      removeSocket(userId);
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

app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized');
  }

  const userId = getSession(req.headers.authorization);
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }

  res.locals.userId = userId;

  next();
});

initCharacterRoutes(app);
initUserRoutes(app);

httpServer.listen(parseInt(Bun.env.PORT as string), () => {
  console.log(`Server is running on port ${Bun.env.PORT}`);
});
