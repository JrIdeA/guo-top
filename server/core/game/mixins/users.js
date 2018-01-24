const { values, each, sortBy, map, every, reverse } = require('lodash');
const CreateGameUser = require('../../game-user');
const { logger } = require('../../utils');

const GameUsersProto = {
  initUsers() {
    this._tokenIdMap = {};
    this._loginedUsers = {};
    this._onlineUsers = {};
    this.GameUser = CreateGameUser(this);
    this.resultRankList = [];

    this.onStatusChange.ending(() => {
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
  _calculateResultRank() {
    const rankedList = reverse(sortBy(
      map(this._loginedUsers, (user) => {
        const count = user.getCount();
        count.userId = user.id;
        return count;
      }),
      ['point', 'accuracy', 'total']
    ));
    const resultRankList = [];
    let rank = 0;
    let prev;
    let current;
    while(current = rankedList.shift()) { // eslint-disable-line
      if (!current) break;
      if (!(
        prev &&
        current.point === prev.point &&
        current.accuracy === prev.accuracy &&
        current.total === prev.total
      )) {
        rank++;
      }
      const user = this._loginedUsers[current.userId];
      user.setRank(rank);

      current.rank = rank;
      resultRankList.push(current);
    }
    this.resultRankList = resultRankList;

    logger.debug('game end and calculated rank result list', this.resultRankList);
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
    logger.debug('user online', user);
  },
  offlineUser(user) {
    delete this._onlineUsers[user.id];
    logger.debug('user offline', user);
  },
  getOnlineUserCount() {
    return Object.keys(this._onlineUsers).length;
  },
  userEndGame() {
    if (every(values(this._loginedUsers), user => user.isEnd())) {
      this._calculateResultRank();
      this.status.result = true;
    }
  },
  getResultRankList() {
    return this.resultRankList;
  },
};

module.exports = GameUsersProto;
