const { values, each, sortBy, map, every, reverse, shuffle, size } = require('lodash');
const CreateGameUser = require('../../game-user');
const { logger } = require('../../utils');

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
  _calculateFinalGroup() {
    const shuffledRankList = shuffle(this.resultRankList);
    const group = [];
    for (let index = 0; index < shuffledRankList.length; index += 2) {
      group.push({
        group: Math.ceil(index + 1),
        competitor1: shuffledRankList[index].userId,
        competitor2: shuffledRankList[index + 1].userId,
      });
    }
    this.finalGroup = group;
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
      this._calculateResultRank();
      this.status.result = true;
    }
  },
  getResultRankList() {
    return this.resultRankList;
  },
  getFinalGroup() {
    return this.finalGroup;
  },
};

module.exports = GameUsersProto;
