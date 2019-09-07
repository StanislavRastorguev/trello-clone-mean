(() => {
  const pageHeader = () => {
    return {
      restrict: 'EA',
      templateUrl: '/common/directives/pageHeader/pageHeader.template.html',
      controller: 'pageHeaderCtrl as phvm',
    };
  };

  // eslint-disable-next-line no-undef
  angular.module('trelloClone').directive('pageHeader', pageHeader);
})();
