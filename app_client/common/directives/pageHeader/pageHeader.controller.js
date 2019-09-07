(() => {
  // eslint-disable-next-line no-undef,no-use-before-define
  angular.module('trelloClone').controller('pageHeaderCtrl', pageHeaderCtrl);

  // eslint-disable-next-line no-use-before-define
  pageHeaderCtrl.$inject = ['authentication', '$state', '$scope'];
  function pageHeaderCtrl(authentication, $state, $scope) {
    const vm = this;

    // get information from loginModal.controller, for check user if user logged in
    $scope.$on('loginModalEvent', (event, data) => {
      if (data === 'user logged in') {
        vm.checkUser();
      }
    });

    // get information from home.controller, for update information if token date expired
    $scope.$on('userAuth', (event, data) => {
      if (data === 'token expired') {
        vm.checkUser();
      }
    });

    // logout user
    vm.logout = () => {
      // send request to authentication.service, logout function and redirect to home page
      authentication.logout();
      vm.isLoggedIn = false;
      $state.go('home');
    };

    // check user information
    (vm.checkUser = () => {
      // send request to authentication.service, isLoggedIn function, for get json web token info
      vm.isLoggedIn = authentication.isLoggedIn();

      if (vm.isLoggedIn) {
        // send request to authentication.service, currentUser function, for get user info
        vm.currentUser = authentication.currentUser();

        if (!vm.currentUser.name || !vm.currentUser.shortName) {
          authentication
            .currentUser()
            .then(userInfo => {
              vm.currentUser = userInfo;
            })
            .catch(() => {
              authentication.logout();
              vm.isLoggedIn = false;
            });
        }
      } else {
        authentication.logout();
        vm.isLoggedIn = false;
      }
    })();
  }
})();
