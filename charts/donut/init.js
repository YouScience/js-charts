JSC.prototype.DonutInit = function(options) {
  options = options || {};
  
  var config = {};

  config.fontSize = options.fontSize || 23;
  config.lineHeight = options.lineHeight || 15;
  config.colors = options.colors || null;
  config.borderColor = options.borderColor || '#ffffff';
  config.width = options.size || 300;
  // Make same as width because the chart is square.
  config.height = config.width;

  this._config = config;
};
