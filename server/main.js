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
global.game = game;

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
app.get('/result', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/static/rank.html'));
});
app.get('/monitor', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/static/monitor.html'));
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
  const rankList = game.getResultRankList();
  const finalGroup = game.getFinalGroup();
  res.send({
    status,
    rankList,
    finalGroup,
  });
});
app.get('/api/monitor', (req, res) => {
  const status = game.getStatus();
  const rankList = game.calculateResultRank();
  const leftDeadTime = game.getLeftDeadTime();
  res.send({
    status,
    rankList,
    leftDeadTime,
  });
});
app.use(express.static(path.join(__dirname, '../client/static')));

const server = http.createServer(app);

const onResultResponsers = [];
game.onStatusChange.result(() => {
  onResultResponsers.forEach(fn => fn());
});

const wss = new WebSocket.Server({
  server,
  verifyClient() {
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
  const responseGameEnding = () => {
    response.send.gameEnding({
      score: user.getScore(),
    });
  };
  const responseGameResult = () => {
    response.send.gameResult(user.getResult());
  };
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
              if (user.isEnd()) {
                responseGameEnding();
                return undefined;
              }
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
          if (
            user.isTimeout() ||
            user.isEnd()
          ) {
            user.endGame(clientTime);
            if (!game.status.result) {
              responseGameEnding();
            }
            return;
          }
          const nextQuiz = user.getNextQuiz(clientTime);
          if (!nextQuiz) {
            response.send.answeredAll({
              score: user.getScore(),
            });
            user.endGame(clientTime);
            return;
          }
          response.send.question(nextQuiz);
        }],
        ['ending', () => {
          responseGameEnding();
        }],
        ['result', () => {
          responseGameResult();
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
          responseGameEnding();
        }],
        ['result', () => {
          responseGameResult();
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
          responseGameResult();
        }],
        [['start'], () => {
          user.endGame(time);
          if (!game.status.result) {
            responseGameEnding();
          }
        }],
      ]);
    },
  };
  onResultResponsers.push(() => {
    if (user) {
      responseGameResult();
    }
  });

  ws.on('message', (msgStr) => {
    if (msgStr === 'hb') {
      ws.send('hb');
      return undefined;
    }
    logger.debug('get message', user && user.id, msgStr);

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
});
wss.on('error', (err) => {
  logger.error('wss error', err);
});

game.onStatusChange.result(() => {
  if (config.resultLogPath) {
    const logs = game.getAllUsersLog();
    fs.writeFile(config.resultLogPath, JSON.stringify(logs, null, 2), (err) => {
      if (err) {
        logger.error('save result log error', err);
      }
    });
  }
});

server.listen(config.port, () => {
  logger.log(`Server started at ${config.port}`);
});
