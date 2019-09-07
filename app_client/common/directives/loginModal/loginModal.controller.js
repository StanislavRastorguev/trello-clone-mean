(() => {
  // eslint-disable-next-line no-undef,no-use-before-define
  angular.module('trelloClone').controller('loginModalCtrl', loginModalCtrl);

  // eslint-disable-next-line no-use-before-define
  loginModalCtrl.$inject = ['authentication', '$state', '$scope'];
  function loginModalCtrl(authentication, $state, $scope) {
    const vm = this;

    // user authentication in modal window
    vm.login = (userEmail, userPassword) => {
      // check user information
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
          vm.loginModal = !vm.loginModal;

          // send information to pageHeader.controller, for check user
          $scope.$emit('loginModalEvent', 'user logged in');
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

    // create new user in modal window
    vm.createAccount = (userName, userEmail, userPassword) => {
      // check user information
      if (!userName || !userEmail || !userPassword) {
        vm.registerError = 'Все поля обязательны для заполнения.';
        return;
      }
      const userDataForSave = {
        name: userName,
        email: userEmail,
        password: userPassword,
      };

      // send request to authentication.service, registerUser function
      authentication
        .registerUser(userDataForSave)
        .then(() => {
          vm.registerError = '';
          vm.loginModal = !vm.loginModal;

          // send information to pageHeader.controller, for check user
          $scope.$emit('loginModalEvent', 'user logged in');
          $state.go('home');
        })
        .catch(err => {
          if (err.data.message === 'Email already used') {
            vm.registerError = 'Данный email уже используется.';
          } else {
            vm.registerError = 'Не удалось создать учётную запись.';
          }
        });
    };

    // send request to authentication.service, loginFacebook and loginGoogle functions
    vm.loginFacebook = () => {
      authentication.loginFacebook();
    };

    vm.loginGoogle = () => {
      authentication.loginGoogle();
    };
  }
})();
