(() => {

  angular
    .module('trelloClone')
    .service('authentication', authentication);

  authentication.$inject = ['$http', '$window'];
  function authentication($http, $window) {

    let saveToken = (token) => {
      $window.localStorage['trello-clone'] = token;
    };

    let getToken = () => {
      return $window.localStorage['trello-clone'];
    };

    let saveUserName = (userName, shortUserName) => {
      $window.localStorage['trello-clone-user-name'] = userName;
      $window.localStorage['trello-clone-short-user-name'] = shortUserName;
    };

    let getShortUserName = (userName) => {
      let shortName;
      if (userName.split(' ')[1]) {
        shortName = userName.split(' ')[0].split('')[0] + userName.split(' ')[1].split('')[0];
      } else if (userName.split('')[1]) {
        shortName = userName.split(' ')[0].split('')[0] + userName.split(' ')[0].split('')[1];
      } else {
        shortName = userName.split('')[0];
      }
      shortName = shortName.toUpperCase();
      return {
        name: userName,
        shortName
      };
    };

    let logout = () => {
      $window.localStorage.removeItem('trello-clone');
      $window.localStorage.removeItem('trello-clone-user-name');
      $window.localStorage.removeItem('trello-clone-short-user-name');
    };

    let isLoggedIn = () => {
      let token = getToken();

      if (token) {
        let payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    };

    let currentUser = function() {
      if (isLoggedIn()) {
        let userName = $window.localStorage['trello-clone-user-name'],
          shortUserName = $window.localStorage['trello-clone-short-user-name'];

        if (userName && shortUserName) {
          return {
            name: userName,
            shortName: shortUserName
          };
        } else {
          let token = getToken();

          return $http.get(`/api/userinfo/${token}`, {
            headers: {
              Authorization: 'Bearer ' + token
            }
          })
            .then((userData) => {
              let userInfo = getShortUserName(userData.data);
              saveUserName(userInfo.name, userInfo.shortName);
              return {
                name: userInfo.name,
                shortName:userInfo.shortName
              }
            })
        }
      }
    };

    let registerUser = (userData) => {
      return $http.post(`/api/register`, userData)
        .then((data) => {
          saveToken(data.data.token);
          let userInfo = getShortUserName(data.data.name);
          saveUserName(userInfo.name, userInfo.shortName);
        })
    };

    let login = (userData) => {
      return $http.post(`/api/login`, userData)
        .then((data) => {
          saveToken(data.data.token);
          let userInfo = getShortUserName(data.data.name);
          saveUserName(userInfo.name, userInfo.shortName);
        })
    };

    let loginFacebook = () => {
      window.location.replace('http://localhost:3000/api/auth/facebook');
    };

    let loginGoogle = () => {
      window.location.replace('http://localhost:3000/api/auth/google');
    };

    /*let loginFacebook = () => {
      window.location.replace('https://trello-clone-mean.herokuapp.com/api/auth/facebook');
    };

    let loginGoogle = () => {
      window.location.replace('https://trello-clone-mean.herokuapp.com/api/auth/google');
    };*/

    return {
      getToken,
      getShortUserName,
      isLoggedIn,
      currentUser,
      registerUser,
      login,
      logout,
      loginFacebook,
      loginGoogle
    }

  }

})();