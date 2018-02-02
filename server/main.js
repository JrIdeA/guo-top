const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser');
const { logger } = require('./core/utils');
const config = require('../config');
const {
  WS_CLIENT_TICKET,
  WS_CLIENT_GET_QUESTION,
  WS_CLIENT_SEND_ANSWER,
  WS_CLIENT_END,
} = require('../shared/wstype');
const createWsReponse = require('./core/response');
const Game = require('./core/game');

process.on('uncaughtException', (e) => {
  logger.error('process uncaughtException', e);
});

const app = express();

const questionsData = JSON.parse(fs.readFileSync(path.join(
  __dirname, '../data/questions/index.json'
)));
const game = new Game(config.game, questionsData);

const userTokenData = JSON.parse(fs.readFileSync(path.join(
  __dirname, '../data/token/token.json'
)));
userTokenData.forEach(({ token, name }) => {
  game.registerUser(name, token);
});

app.use(cookieParser());
app.use((req, res, next) => {
  if (req.query.u) {
    res.cookie('gtt', req.query.u);
  }
  next();
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/static/home.html'));
});
app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/static/game.html'));
});
app.get('/rank', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/static/rank.html'));
});
app.get('/api/game', (req, res) => {
  const status = game.getStatus();
  res.send({
    status,
    readyTime: game.getReadyTime(),
    startTime: game.getStartTime(),
    stadiumLink: game.isStatusAfter('ready') ? '/game' : undefined,
  });
});
app.get('/api/result', (req, res) => {
  const status = game.getStatus();
  res.send({
    status,
  });
});
app.use(express.static(path.join(__dirname, '../client/static')));

const server = http.createServer(app);

const wss = new WebSocket.Server({
  server,
  verifyClient() {
    console.log('ding dong');
    return true;
  },
});

wss.on('connection', (ws) => {
  const response = createWsReponse(ws);
  if (game.status.idle) {
    response.error.gameInIdle();
  } else {
    response.send.gameInfo({
      status: game.getStatus(),
      time: {
        start: game.getStartTime(),
      },
    });
  }

  let user;
  const actions = {
    [WS_CLIENT_TICKET]({
      token,
    }) {
      game.condStatus([
        ['idle', () => {
          response.error.gameInIdle();
        }],
        [
          ['ready', 'start', 'ending', 'result'],
          () => {
            user = game.getUserByAuth(token);
            if (!user) {
              return response.error.userNotRegister();
            }
            user.online();
            const status = game.getStatus();
            const extendData = {};
            if (status === 'ready') {
              extendData.leftStartTime = game.getLeftStartTime();
            } if (status === 'start') {
              user.giveupCurrentQuizIfNotAnswer();
              extendData.leftPlaytime = user.getLeftPlaytime();
            }
            return response.send.welcome(Object.assign(extendData, {
              userId: user.id,
              status: game.getStatus(),
              startTime: game.getStartTime(),
              playtimeSeconds: game.getPlaytimeSeconds(),
              onlineUserCount: game.getOnlineUserCount(),
              score: user.getResult(),
            }));
          },
        ],
      ]);
    },
    [WS_CLIENT_GET_QUESTION]({
      time: clientTime,
    }) {
      game.condStatus([
        ['idle', () => {
          response.error.gameInIdle();
        }],
        ['ready', () => {
          const startTime = game.getStartTime();
          const leftStartTime = game.getLeftStartTime();

          response.error.gameNotStart({
            startTime,
            leftStartTime,
            status: game.getStatus(),
            playtimeSeconds: game.getPlaytimeSeconds(),
          });
        }],
        [['start'], () => {
          if (user.isTimeout()) {
            user.endGame(clientTime);
            response.error.gameEnding({
              score: user.getResult(),
            });
            return;
          }
          const nextQuiz = user.getNextQuiz();
          if (!nextQuiz) {
            response.send.answeredAll();
            user.endGame(clientTime);
            return;
          }
          response.send.question(nextQuiz);
        }],
        ['ending', () => {
          response.error.gameEnding({
            score: user.getResult(),
          });
        }],
        ['result', () => {
          response.send.gameResult(user.getResult());
        }],
      ]);
    },
    [WS_CLIENT_SEND_ANSWER]({
      questionId, answerCode,
      time: answerClientTime,
    }) {
      game.condStatus([
        ['idle', () => {
          response.error.gameInIdle();
        }],
        ['ending', () => {
          response.error.gameEnding({
            score: user.getResult(),
          });
        }],
        ['result', () => {
          response.send.gameResult(user.getResult());
        }],
        [['start'], () => {
          const answerResult = user.answerQuiz(
            questionId,
            answerCode,
            answerClientTime,
          );
          if (answerResult.answered) {
            response.error.userGameAlreadyAnswered();
            return;
          }
          response.send.answer({
            questionId: answerResult.questionId,
            answerCode: answerResult.answerCode,
            correct: answerResult.correct,
            score: user.getResult(),
          });
        }],
      ]);
    },
    [WS_CLIENT_END]({
      time,
    }) {
      game.condStatus([
        ['idle', () => {
          response.error.gameInIdle();
        }],
        ['result', () => {
          response.send.gameResult(user.getResult());
        }],
        [['start'], () => {
          user.endGame(time);
        }],
      ]);
    },
  };

  game.onStatusChange.result(() => {
    if (user) {
      response.send.gameResult(user.getResult());
    }
  });

  ws.on('message', (msgStr) => {
    logger.debug('get message', msgStr);

    let message;
    try {
      message = JSON.parse(msgStr);
    } catch (err) {
      logger.debug('parse message error', msgStr);
      return response.error.badRequest();
    }
    const { type, payload } = message;
    const action = actions[type];
    if (!action) {
      logger.debug('not response action, type is', type);
      return response.error.badRequest();
    }

    action(payload);
  });
  ws.on('error', () => {
    if (user) {
      user.offline();
    }
  });
  ws.on('headers', (...args) => {
    console.log('on headers', args);
  });
  ws.on('listening', (...args) => {
    console.log('on listening', args);
  });
});

wss.on('error', (err) => {
  console.error('wss error', err);
});

server.listen(config.port, () => {
  console.log('Server started!');
});
