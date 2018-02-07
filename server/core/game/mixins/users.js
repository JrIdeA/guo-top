const { values, each, sortBy, map, every, reverse, shuffle, size, get, reduce } = require('lodash');
const CreateGameUser = require('../../game-user');
const { logger } = require('../../utils');

function isSameScore(score1, score2) {
  if (!score1 || !score2) return false;
  return score1.point === score2.point;
}

const GameUsersProto = {
  initUsers() {
    this._tokenIdMap = {};
    this._loginedUsers = {};
    this._onlineUsers = {};
    this.GameUser = CreateGameUser(this);
    this.resultRankList = [];
    this.finalGroup = [];

    this.onStatusChange.ending(() => {
      if (size(this._loginedUsers) === 0) {
        this.status.result = true;
      }
      each(this._loginedUsers, (user) => {
        if (!user.isEnd()) {
          user.endGame();
        }
      });
    });
  },
  _createUser(userId) {
    return new this.GameUser(userId);
  },
  calculateResultRank() {
    const rankedList = reverse(sortBy(
      map(this._loginedUsers, (user) => {
        const score = user.getScore();
        score.userId = user.id;
        return score;
      }),
      ['point', 'total']
    ));
    const resultRankList = [];
    let rank = 0;
    let prev;
    let current;
    while(current = rankedList.shift()) { // eslint-disable-line
      if (!current) break;
      if (!isSameScore(prev, current)) {
        rank = resultRankList.length + 1;
      }
      const user = this._loginedUsers[current.userId];
      user.setRank(rank);

      current.rank = rank;
      resultRankList.push(current);
      prev = current;
    }
    return resultRankList;
  },
  calculateFinalGroup() {
    let winners;
    if (this.resultRankList.length < 16) {
      winners = this.resultRankList.map(v => v.userId);
    } else {
      const lastPlaceWinner = this.resultRankList[15];
      const samePointAsLastPlace = [];
      let index = 16;
      let current = this.resultRankList[index];
      while (current) {
        if (current.point != lastPlaceWinner.point) break;
        samePointAsLastPlace.push(current);
        current = this.resultRankList[++index];
      }
      if (samePointAsLastPlace.length) {
        index = 14;
        current = this.resultRankList[index];
        while (current) {
          if (current.point != lastPlaceWinner.point) break;
          samePointAsLastPlace.push(current);
          current = this.resultRankList[--index];
        }
        samePointAsLastPlace.push(lastPlaceWinner);
        winners = this.resultRankList.slice(0, index + 1).map(v => v.userId);
        winners.push(samePointAsLastPlace.map(v => v.userId).join(','));
      } else {
        winners = this.resultRankList.slice(0, 16).map(v => v.userId);
      }
    }

    const shuffledWinners = shuffle(winners);
    const group = [];
    for (let index = 0; index < shuffledWinners.length; index += 2) {
      group.push({
        group: Math.ceil((index / 2) + 1),
        competitor1: shuffledWinners[index],
        competitor2: shuffledWinners[index + 1],
      });
    }
    return group;
  },
  getUserByAuth(token) {
    const userId = this._tokenIdMap[token];
    if (!userId) {
      return undefined;
    }

    let user = this._loginedUsers[userId];
    if (!user) {
      user = this._createUser(userId);
    }
    this._loginedUsers[userId] = user;

    return user;
  },
  registerUser(userId, token) {
    this._tokenIdMap[token] = userId;
  },
  onlineUser(user) {
    this._onlineUsers[user.id] = user;
    logger.debug('user online', user.id);
  },
  offlineUser(user) {
    delete this._onlineUsers[user.id];
    logger.debug('user offline', user.id);
  },
  getOnlineUserCount() {
    return Object.keys(this._onlineUsers).length;
  },
  userEndGame() {
    if (every(values(this._loginedUsers), user => user.isEnd())) {
      this.resultRankList = this.calculateResultRank();
      this.finalGroup = this.calculateFinalGroup();
      this.status.result = true;

      logger.debug('game end and calculated rank result list', this.resultRankList);
    }
  },
  getResultRankList() {
    return this.resultRankList;
  },
  getFinalGroup() {
    return this.finalGroup;
  },
  getAllUsersLog() {
    return reduce(this._onlineUsers, (p, user) => {
      p[user.id] = user.getAnswerLog();
      return p;
    }, {});
  },
};

module.exports = GameUsersProto;
