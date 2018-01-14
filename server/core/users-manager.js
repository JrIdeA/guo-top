const CreateGameUser = require('./game-user/index');

class UsersManager {
  constructor(game) {
    this._game = game;
    this._tokenIdMap = {};
    this._loginedUsers = {};
    this._onlineUsers = {};
    this.GameUser = CreateGameUser(this);
  }
  _createUser(userId) {
    return new this.GameUser(userId);  
  }
  getUserByAuth(token) {
    const userId = this._tokenIdMap;
    if (!userId) {
      return undefined;
    }

    let user = this._loginedUsers[userId];
    if (!user) {
      user = this._createUser(userId);
    }
    this._loginedUsers[userId] = user;

    return user;
  }
  register(userId, token) {
    this._tokenIdMap[token] = userId;
  }
  online(user) {
    this._onlineUsers[user.id] = user;
  }
  offline(user) {
    delete this._onlineUsers[user.id];
  }
}