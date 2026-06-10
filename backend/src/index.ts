import express = require('express');
import * as helmet from 'helmet';
import cors = require('cors');
import * as mongoose from "mongoose";
import {initAuthRoutes} from "./api/auth";
import {initCharacterRoutes} from "./api/character";
import {initDataRoutes} from "./api/data";
import {initUserRoutes} from "./api/user";
import {initSkillTreeRoutes} from "./api/skilltree";
import {CDN_DIR, initCdnRoutes} from "./api/cdn";
import {initAdminRoutes} from "./api/admin";
import {Server} from "socket.io";
import { createServer } from "node:http";
import {removeSocket, setSocket} from "./sockets";
import {isAuthenticated} from "./services/auth";
import {User} from "./schema";

mongoose.connect(Bun.env.MONGO_URI as string).then(() => {
  console.log('Connected to MongoDB')
});

function buildApi(): express.Express {
  const api = express();

  api.use(express.json({limit: '100mb'}));
  api.use(helmet.default({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  }));

  api.use(cors({
    origin: '*',
  }));

  initAuthRoutes(api);
  initDataRoutes(api);

  api.use('/cdn', express.static(CDN_DIR, {
    maxAge: '7d',
    immutable: true,
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
  }));

  api.use(async (req, res, next) => {
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

  initCharacterRoutes(api);
  initUserRoutes(api);
  initSkillTreeRoutes(api);
  initCdnRoutes(api);
  initAdminRoutes(api);

  return api;
}

const app = express();

app.use('/api', buildApi());
app.use('/', buildApi());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  // Hinter dem nginx /api-Proxy erreichbar (single-origin: vicar.cloud/api/socket.io).
  path: '/api/socket.io',
  cors: {
    origin: '*'
  }
});

io.on('connection', socket => {
  // FoundryVTT (VicarTT-Modul): Auth über den FVTT-Token im Handshake.
  const fvttToken = socket.handshake.auth?.fvttToken as string | undefined;
  if (fvttToken) {
    User.findOne({fvttToken}).then(user => {
      if (!user) {
        return socket.disconnect();
      }
      socket.join('fvtt:' + user.id);
      socket.emit('fvtt-authenticated');
      // Heartbeat von FVTT -> an die Web-Clients desselben Users weiterleiten.
      socket.on('fvtt-heartbeat', () => {
        io.to('web:' + user.id).emit('fvtt-heartbeat');
      });
    }).catch(() => socket.disconnect());
    return;
  }

  // Web-Frontend: Auth über JWT (wie bisher).
  socket.on('authenticate', async sessionId => {
    const user = await isAuthenticated(sessionId);
    if (!user) {
      return socket.disconnect();
    }

    setSocket(user.id, socket);
    socket.join('web:' + user.id);

    // Würfelpool-Wurf vom Web -> an die FVTT-Clients desselben Users weiterleiten.
    socket.on('fvtt-roll', data => {
      io.to('fvtt:' + user.id).emit('fvtt-roll', data);
    });

    socket.on('disconnect', () => {
      removeSocket(user.id);
    });
  });
});

httpServer.listen(6660, () => {
  console.log(`Server is running on port 6660`);
});
