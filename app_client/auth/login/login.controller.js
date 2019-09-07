(() => {
  // eslint-disable-next-line no-undef
  angular
    .module('trelloClone')
    // eslint-disable-next-line no-use-before-define
    .controller('loginCtrl', loginCtrl);

  // eslint-disable-next-line no-use-before-define
  loginCtrl.$inject = [
    'authentication',
    '$state',
    'messageFactory',
    '$location',
    '$window',
  ];
  function loginCtrl(
    authentication,
    $state,
    messageFactory,
    $location,
    $window
  ) {
    const vm = this;

    vm.alertMessage = messageFactory.message;

    vm.clearMessage = () => {
      // eslint-disable-next-line no-param-reassign
      messageFactory.message = '';
      vm.alertMessage = '';
    };

    // user authentication
    vm.login = (userEmail, userPassword) => {
      if (!userEmail || !userPassword) {
        vm.loginError = 'Все поля обязательны для заполнения.';
        return;
      }
      const userData = {
        email: userEmail,
        password: userPassword,
      };

      // send request to authentication.service, login function
      authentication
        .login(userData)
        .then(() => {
          vm.loginError = '';
          // redirect to main page
          $state.go('home');
        })
        .catch(err => {
          if (err.data.message === 'Incorrect username.') {
            vm.loginError = 'Не верный логин.';
          } else if (err.data.message === 'Incorrect password.') {
            vm.loginError = 'Не верный логин или пароль.';
          } else {
            vm.loginError = 'Не удалось войти в учётную запись.';
          }
        });
    };

    // function for get json web token and user name from url, after user authentication with social networks
    vm.params = $location.search();
    if (vm.params.token) {
      // save jwt in local storage
      // eslint-disable-next-line no-param-reassign
      $window.localStorage['trello-clone'] = vm.params.token;
      const userInfo = authentication.getShortUserName(vm.params.name);
      // save user information in local storage
      // eslint-disable-next-line no-param-reassign
      $window.localStorage['trello-clone-user-name'] = userInfo.name;
      // eslint-disable-next-line no-param-reassign
      $window.localStorage['trello-clone-short-user-name'] = userInfo.shortName;
      $state.go('home');
      // delete jwt and name from url if something gone wrong
      $location.search('token', null);
      $location.search('name', null);
    }

    // send request to authentication.service, loginFacebook and loginGoogle functions
    vm.loginFacebook = () => {
      authentication.loginFacebook();
    };

    vm.loginGoogle = () => {
      authentication.loginGoogle();
    };
  }
})();
