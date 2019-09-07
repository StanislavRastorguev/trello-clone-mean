module.exports = {
  facebook: {
    callbackURL: '/api/auth/facebook/redirect',
    clientID: '1306745982803276',
    clientSecret: '4a99e3a6dfc5c81a6994354e49bd590e',
    profileFields: ['id', 'displayName', 'photos', 'email'],
  },
  google: {
    callbackURL: '/api/auth/google/redirect',
    clientID:
      '1060656164349-rpch2ibsm97k8kkc390bbv5m419g0g4h.apps.googleusercontent.com',
    clientSecret: 'MtTaT-7ltVYhR029X4a4FfcY',
  },
};

/* module.exports = {
  facebook: {
    callbackURL: 'https://trello-clone-mean.herokuapp.com/api/auth/facebook/redirect',
    clientID: '1306745982803276',
    clientSecret: '4a99e3a6dfc5c81a6994354e49bd590e',
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  google: {
    callbackURL: 'https://trello-clone-mean.herokuapp.com/api/auth/google/redirect',
    clientID: '1060656164349-rpch2ibsm97k8kkc390bbv5m419g0g4h.apps.googleusercontent.com',
    clientSecret: 'MtTaT-7ltVYhR029X4a4FfcY'
  }
}; */
