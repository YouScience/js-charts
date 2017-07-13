var noop = function() {};

function JSC(options) {
  this._target = options.target;

  switch (options.type) {
    case 'donut':
      this.DonutInit(options);
      this.create = this.DonutCreate;
      this.render = this.DonutRender;
      break;
    default:
      this.create = noop;
      this.render = noop;
  }
}

// utils

// https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};
