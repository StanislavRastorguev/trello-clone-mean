(() => {
  const input = () => {
    // format datetime picker for Firefox
    return {
      require: '?ngModel',
      link(scope, elem, attr, ngModel) {
        if (!ngModel) return;
        if (attr.type !== 'time') return;

        // eslint-disable-next-line func-names
        ngModel.$formatters.unshift(function(value) {
          return value.replace(/:00\.000$/, '');
        });
      },
    };
  };

  // eslint-disable-next-line no-undef
  angular.module('trelloClone').directive('input', input);
})();
