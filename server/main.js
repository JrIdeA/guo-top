import { WS_CLIENT_END } from '../shared/wstype';

const WebSocket = require('ws');
const http = require('ws');
// const {} = require('../shared/error');
const { WS_CLIENT_TICKET } = require('./wstype');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end();
});

const wss = new WebSocket.Server({
  server,
  verifyClient() {
    console.log('ding dong');
    return true;
  }
});

// const context = {
//   onlineUsers: {},
//   game
// };

const context = {
  users: {
    'abcdefghijklmn': 'yejiren'
  },
  onlineUsers: {},
  game: {
    status: 'idle'
  },
};

const getResponseActions = (user = {
  id: 'yejiren',
  isOnline: () => true,
  userGame: {
    count,
    qaManager,
  },
}, response = {
  error: {
    userNotOnline() {},
    gameNotStart() {},
    gameEnding() {},
    gameEndResulted() {},
    userGameTimeout() {},
    userGameAlreadyAnswered() {},
  }
}) => {
  return {
    [WS_CLIENT_TICKET](payload) {
      if (!user.isOnline()) {
        return response.error.userNotOnline();
      }
      return response.success({
        userId: user.id,
        gameStatus: game.status,
        count: user.userGame.count,
      });
    },
    [WS_CLIENT_GET_QUESTION](payload) {
      game.condStatus([
        ['idle', () => {
          response.error.gameNotStart();
        }],
        ['ending', () => {
          response.error.gameEnding();
        }],
        ['result', () => {
          response.error.gameEndResulted();
        }],
        [['prepare', 'start'], () => {
          if (user.userGame.isTimeout()) {
            response.error.gameEndResulted();
            return;
          }
          const nextQuestion = user.userGame.qaManager.getNextQuestion();
          response.success({
            id: nextQuestion.id,
            question: nextQuestion.title,
            options: nextQuestion.userGameAlreadyAnswered(),
          });
        }]
      ]);
    },
    [WS_CLIENT_SEND_ANSWER](payload) {
      game.condStatus([
        ['idle', () => {
          response.error.gameNotStart();
        }],
        ['ending', () => {
          response.error.gameEnding();
        }],
        ['result', () => {
          response.error.gameEndResulted();
        }],
        [['prepare', 'start'], () => {
          const answerResult = user.userGame.qaManager.answerQuestion();
          if (answerResult.answered) {
            response.error.userGameAlreadyAnswered();
            return;
          }
          response.success({
            questionId: answerResult.questionId,
            answerCode: answerResult.answerCode,
            correct: answerResult.correct,
          });
        }]
      ]);
    },
    [WS_CLIENT_END](payload) {
      game.condStatus([
        ['result', () => {
          response.error.gameEndResulted();
        }],
        [['prepare', 'start'], () => {
          const answerResult = user.userGame.qaManager.answerQuestion();
          if (answerResult.answered) {
            response.error.userGameAlreadyAnswered();
            return;
          }
          response.success({
            questionId: answerResult.questionId,
            answerCode: answerResult.answerCode,
            correct: answerResult.correct,
            count: user.userGame.count,
          });
        }]
      ]);
    },
  }
};

wss.on('connection', (ws) => {
  ws.on('message', function incoming(msgStr) {
    let message;
    try {
      message = JSON.parse(msgStr);      
    } catch (err) {
      ws.send('unknow message');
      return;
    }
    const { type, payload } = message;
    switch (type) {
      case 1:
        const userId = context.users[payload.token];
        // send user Error if !userId
        context.onlineUsers[payload.user] = 1;
        ws.send(JSON.stringify({
          userId,
          count: {
            total: 100,
            wrong: 1,
            correct: 99,
          },
        }));
        break;
      default: 
        ws.send('not type');
    }
    console.log('received', typeof message);
    console.log(message);
  });

  ws.on('error', function incoming(error) {
    console.error('error', error);
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
})

server.listen('8000', function() {
  console.log('Server started!');
})