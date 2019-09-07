(() => {
  const config = ($stateProvider, $urlRouterProvider, $locationProvider) => {
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/home/home.view.html',
        controller: 'homeCtrl',
        controllerAs: 'vm',
      })
      .state('register', {
        url: '/register',
        templateUrl: '/auth/register/register.view.html',
        controller: 'registerCtrl',
        controllerAs: 'vm',
      })
      .state('login', {
        url: '/login',
        templateUrl: '/auth/login/login.view.html',
        controller: 'loginCtrl',
        controllerAs: 'vm',
      });
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false,
    });
  };

  // eslint-disable-next-line no-undef
  angular
    .module('trelloClone', [
      'ui.router',
      'dndLists',
      'ui.utils',
      'angular-click-outside',
      'btford.socket-io',
    ])
    .config([
      '$stateProvider',
      '$urlRouterProvider',
      '$locationProvider',
      config,
    ]);
})();
