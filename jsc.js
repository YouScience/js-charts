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
