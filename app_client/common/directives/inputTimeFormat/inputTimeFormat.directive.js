(() => {

  let input = (() => {
    //format datetime picker for Firefox
    return {
      require: '?ngModel',
      link: function(scope, elem, attr, ngModel) {
        if( !ngModel )
          return;
        if( attr.type !== 'time' )
          return;

        ngModel.$formatters.unshift(function(value) {
          return value.replace(/:00\.000$/, '')
        });
      }
    }
  });

  angular
    .module('trelloClone')
    .directive('input', input);

})();