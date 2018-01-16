const CreateGameUser = require('../../game-user');

const GameUsersProto = {
  initUsers() {
    this._tokenIdMap = {};
    this._loginedUsers = {};
    this._onlineUsers = {};
    this.GameUser = CreateGameUser(this);
  },
  _createUser(userId) {
    return new this.GameUser(userId);
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
  },
  offlineUser(user) {
    delete this._onlineUsers[user.id];
  },
  getOnlineUserCount() {
    return this._onlineUsers.length;
  },
};

module.exports = GameUsersProto;
