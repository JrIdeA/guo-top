const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
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

const express = require('express');
const app = express();

const questionsData = JSON.parse(fs.readFileSync(path.join(
  __dirname, '../data/questions/index.json'
)));
const game = new Game(config.game, questionsData);
game.registerUser('yejiren', 'yejiren'); // test
game.registerUser('wangmeiling', 'wangmeiling');

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
              extendData.leftTime = game.getLeftStartTime();
              extendData.startTime = game.getStartTime();
            } else if (status === 'start') {
              user.giveupCurrentQuizIfNotAnswer();
              extendData.leftPlaytimeSeconds = user.getLeftPlaytimeSeconds();
            }
            return response.send.welcome(Object.assign(extendData, {
              userId: user.id,
              gameStatus: game.getStatus(),
              playtimeSeconds: game.getPlaytimeSeconds(),
              onlineUser: game.getOnlineUserCount(),
              count: user.getResult(),
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
          const leftTime = game.getLeftStartTime();
          const startTime = game.getStartTime();

          response.error.gameNotStart({
            leftTime,
            startTime,
            gameStatus: game.getStatus(),
            playtimeSeconds: game.getPlaytimeSeconds(),
          });
        }],
        [['start'], () => {
          if (user.isTimeout()) {
            response.error.gameEndResulted();
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
          response.error.gameEnding();
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
          response.error.gameEnding();
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
            count: user.getCount(),
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
