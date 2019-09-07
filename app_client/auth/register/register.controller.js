(() => {
  // eslint-disable-next-line no-undef
  angular
    .module('trelloClone')
    // eslint-disable-next-line no-use-before-define
    .controller('registerCtrl', registerCtrl);

  // eslint-disable-next-line no-use-before-define
  registerCtrl.$inject = ['authentication', '$state'];
  function registerCtrl(authentication, $state) {
    const vm = this;

    // create new user
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
  }
})();
