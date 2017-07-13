JSC.prototype.DonutCreate = function(data) {
  var _self = this;

  this._data = data || [];

  var pie = d3.layout.pie()
    .value(function(d) {
      return d.percent;
    })
    .sort(null);

  var outerRadius = this._config.width / 3;
  var innerRadius = this._config.width / 2.3;

  var color = this._config.colors ? d3.scale.ordinal()
    .range(this._config.colors) : d3.scale.category20();

  var arc = d3.svg.arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius);

  var svg = this._svg = d3.select(this._target)
    .append('svg')
    .attr({
      width: this._config.width,
      height: this._config.height,
      class: 'svg-container'
    })
    .append('g')
    .attr({
      transform: 'translate(' + this._config.width / 2 + ',' + this._config.height / 2 + ')'
    });

  var path = svg.selectAll('path')
    .data(pie(this._data))
    .enter()
    .append('path')
    .attr({
      d: arc,
      fill: function(d, i) {
        return color(d.data.name);
      }
    });

  var legend = svg.selectAll('.legend')
    .data(color.domain())
    .enter();

  legend.append('text')
    .attr('text-anchor', 'middle')
    .attr('y', this._config.lineHeight * -1)
    .attr('class', function(d, i) {
      return 'jsc-text jsc-text--' + i;
    })
    .attr('visibility', function(d, i) {
      return i == 0 ? 'visible' : 'hidden';
    })
    .text(function(d) {
      return d;
    })
    .style({
      fill: '#929DAF',
      'font-size': fontPx(this._config.fontSize)
    });

  legend.append('text')
    .attr('text-anchor', 'middle')
    .attr('y', this._config.lineHeight)
    .attr('class', function(d, i) {
      return 'jsc-text jsc-text--' + i;
    })
    .attr('visibility', function(d, i) {
      return i == 0 ? 'visible' : 'hidden';
    })
    .text(function(d, i) {
      return _self._data[i].percent + '%';
    })
    .style({
      fill: '#929DAF',
      'font-size': fontPx(this._config.fontSize)
    });

  path.attr('fill', function(d, i) {
      return color(i);
    })
    .attr('class', function(d, i) {
      return 'jsc-slice jsc-slice--' + i;
    })
    .attr('stroke', function(d, i) {
      return i == 0 ? this.getAttribute('fill') : this._config.borderColor;
    })
    .attr('stroke-width', 4)
    .on('mouseenter', function(d, i) {
      this.parentElement.insertBefore(this, this.parentElement.firstChild)
      
      svg.selectAll('.jsc-text')
        .attr('visibility', 'hidden');

      svg.selectAll('.jsc-slice')
        .attr('stroke', this._config.borderColor);

      d3.select(this)
        .attr('stroke', function() {
          return this.getAttribute('fill');
        })

      svg.selectAll('.jsc-text--' + i)
        .attr('visibility', 'visible');
    });

  function fontPx(value) {
    if ('number' != typeof value) {
      throw new Error('Invalid fontSize value');
    }

    return value + 'px';
  }

  return svg;
};
