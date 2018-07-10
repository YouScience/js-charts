JSC.prototype.DonutRender = function(data) {
  this._svg.selectAll('*').remove();
  this.create(data);
};
