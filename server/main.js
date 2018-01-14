const WebSocket = require('ws');
const http = require('http');
const config = require('../config');
const {
  WS_CLIENT_TICKET,
  WS_CLIENT_GET_QUESTION,
  WS_CLIENT_SEND_ANSWER,
  // WS_CLIENT_END,
} = require('../shared/wstype');
const createWsReponse = require('./core/response');
const Game = require('./core/game');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end();
});

const wss = new WebSocket.Server({
  server,
  verifyClient() {
    console.log('ding dong');
    return true;
  },
});

// start scheduler
const game = new Game(config.game);

wss.on('connection', (ws) => {
  const response = createWsReponse(ws);
  if (game.status.idle) {
    response.error.gameInIdle();
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
          ['ready', 'prepare', 'start', 'ending'],
          () => {
            user = game.getUserByAuth(token);
            console.log('user', user);
            if (!user) {
              return response.error.userNotRegister();
            }
            return response.send.welcome({
              userId: user.id,
              gameStatus: game.getStatus(),
              count: user.getCount(),
            });
          },
        ],
        ['result', () => {
          response.error.gameEndResulted();
        }],
      ]);
    },
    [WS_CLIENT_GET_QUESTION]() {
      game.condStatus([
        ['idle', () => {
          response.error.gameInIdle();
        }],
        ['ready', () => {
          response.error.gameNotStart();
        }],
        [['prepare', 'start'], () => {
          if (user.isTimeout()) {
            response.error.gameEndResulted();
            return;
          }
          const nextQuiz = user.getNextQuiz();
          response.send.question(nextQuiz);
        }],
        ['ending', () => {
          response.error.gameEnding();
        }],
        ['result', () => {
          response.error.gameEndResulted();
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
          response.error.gameEndResulted();
        }],
        [['prepare', 'start'], () => {
          const answerResult = user.answerQuestion(
            questionId,
            answerCode,
            answerClientTime,
          );
          if (answerResult.answered) {
            response.error.userGameAlreadyAnswered();
            return;
          }
          response.success({
            questionId: answerResult.questionId,
            answerCode: answerResult.answerCode,
            correct: answerResult.correct,
            count: user.getCount(),
          });
        }],
      ]);
    },
    // [WS_CLIENT_END](payload) {
    //   game.condStatus([
    //     ['result', () => {
    //       response.error.gameEndResulted();
    //     }],
    //     [['prepare', 'start'], ( = {
    //       endTime: 0,
    //     }, type) => {
    //       user.qaManager.end();
    //       if (type === 'prepare') {
    //         // log exception
    //       }
    //     }]
    //   ]);
    // },
  };
  ws.on('message', (msgStr) => {
    console.log('get message: ', msgStr);

    let message;
    try {
      message = JSON.parse(msgStr);
    } catch (err) {
      return response.error.badRequest();
    }
    const { type, payload } = message;
    const action = actions[type];
    if (!action) {
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
