JSC.prototype.DonutInit = function(options) {
  options = options || {};
  
  var config = {};

  config.fontSize = options.fontSize || 38;
  config.lineHeight = options.lineHeight || 20;
  config.colors = options.colors || null;
  config.fontColor = options.fontColor || '#000000';
  config.backgroundColor = options.backgroundColor || '#ffffff';
  config.width = options.size || 300;
  // Make same as width because the chart is square.
  config.height = config.width;
  config.selectevent = options.selectevent || 'mouseenter';
  config.selectblurevent = options.selectblurevent || 'mouseleave';
  config.onselect = options.onselect || function noop() {};
  config.onselectblur = options.onselectblur || function noop() {};
  config.title = options.title;

  this._config = config;
};
