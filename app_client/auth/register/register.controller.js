(() => {

  angular
    .module('trelloClone')
    .controller('registerCtrl', registerCtrl);

  registerCtrl.$inject = ['authentication', '$state'];
  function registerCtrl(authentication, $state) {
    let vm = this;

    //create new user
    vm.createAccount = (userName, userEmail, userPassword) => {

      //check user information
      if (!userName || !userEmail || !userPassword) {
        vm.registerError = "Все поля обязательны для заполнения.";
        return;
      }
      let userDataForSave = {
        name: userName,
        email: userEmail,
        password: userPassword
      };

      //send request to authentication.service, registerUser function
      authentication.registerUser(userDataForSave)
        .then(() => {
          vm.registerError = '';
          $state.go('home');
        })
        .catch((err) => {
          if (err.data.message === 'Email already used') {
            vm.registerError = "Данный email уже используется.";
          } else {
            vm.registerError = "Не удалось создать учётную запись.";
          }
        })
    };

  }

})();