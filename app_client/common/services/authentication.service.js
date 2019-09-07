(() => {
  // eslint-disable-next-line no-undef,no-use-before-define
  angular.module('trelloClone').service('authentication', authentication);

  // eslint-disable-next-line no-use-before-define
  authentication.$inject = ['$http', '$window'];
  function authentication($http, $window) {
    const saveToken = token => {
      // eslint-disable-next-line no-param-reassign
      $window.localStorage['trello-clone'] = token;
    };

    const getToken = () => {
      return $window.localStorage['trello-clone'];
    };

    const saveUserName = (userName, shortUserName) => {
      // eslint-disable-next-line no-param-reassign
      $window.localStorage['trello-clone-user-name'] = userName;
      // eslint-disable-next-line no-param-reassign
      $window.localStorage['trello-clone-short-user-name'] = shortUserName;
    };

    const getShortUserName = userName => {
      let shortName;
      if (userName.split(' ')[1]) {
        shortName =
          userName.split(' ')[0].split('')[0] +
          userName.split(' ')[1].split('')[0];
      } else if (userName.split('')[1]) {
        shortName =
          userName.split(' ')[0].split('')[0] +
          userName.split(' ')[0].split('')[1];
      } else {
        // eslint-disable-next-line prefer-destructuring
        shortName = userName.split('')[0];
      }
      shortName = shortName.toUpperCase();
      return {
        name: userName,
        shortName,
      };
    };

    const logout = () => {
      $window.localStorage.removeItem('trello-clone');
      $window.localStorage.removeItem('trello-clone-user-name');
      $window.localStorage.removeItem('trello-clone-short-user-name');
    };

    const isLoggedIn = () => {
      const token = getToken();

      if (token) {
        const payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.exp > Date.now() / 1000;
      }
      return false;
    };

    // eslint-disable-next-line consistent-return,func-names
    const currentUser = function() {
      if (isLoggedIn()) {
        const userName = $window.localStorage['trello-clone-user-name'];
        const shortUserName =
          $window.localStorage['trello-clone-short-user-name'];

        if (userName && shortUserName) {
          return {
            name: userName,
            shortName: shortUserName,
          };
        }
        const token = getToken();

        return $http
          .get(`/api/userinfo/${token}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(userData => {
            const userInfo = getShortUserName(userData.data);
            saveUserName(userInfo.name, userInfo.shortName);
            return {
              name: userInfo.name,
              shortName: userInfo.shortName,
            };
          });
      }
    };

    const registerUser = userData => {
      return $http.post(`/api/register`, userData).then(data => {
        saveToken(data.data.token);
        const userInfo = getShortUserName(data.data.name);
        saveUserName(userInfo.name, userInfo.shortName);
      });
    };

    const login = userData => {
      return $http.post(`/api/login`, userData).then(data => {
        saveToken(data.data.token);
        const userInfo = getShortUserName(data.data.name);
        saveUserName(userInfo.name, userInfo.shortName);
      });
    };

    const loginFacebook = () => {
      window.location.replace('http://localhost:3000/api/auth/facebook');
    };

    const loginGoogle = () => {
      window.location.replace('http://localhost:3000/api/auth/google');
    };

    /* let loginFacebook = () => {
      window.location.replace('https://trello-clone-mean.herokuapp.com/api/auth/facebook');
    };

    let loginGoogle = () => {
      window.location.replace('https://trello-clone-mean.herokuapp.com/api/auth/google');
    }; */

    return {
      getToken,
      getShortUserName,
      isLoggedIn,
      currentUser,
      registerUser,
      login,
      logout,
      loginFacebook,
      loginGoogle,
    };
  }
})();
