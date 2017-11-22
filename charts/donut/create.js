JSC.prototype.DonutCreate = function(data) {
  var _self = this;

  data = data.sort(function(a, b) {
    return a.percent < b.percent;
  });

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
      class: 'jsc-svg-container jsc-donut',
      style: 'background-color: ' + _self._config.backgroundColor
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

  if (this._config.title) {
    legend.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', (this._config.lineHeight * -1) + 30)
      .attr('class', function(d, i) {
        return 'jsc-text jsc-text--title jsc-text--' + i;
      })
      .attr('visibility', function(d, i) {
        return i == 0 ? 'visible' : 'hidden';
      })
      .text(function(d) {
        return _self._config.title;
      })
      .style({
        fill: this._config.fontColor,
        'font-size': fontPx(this._config.fontSize)
      });
  } else {
    legend.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', (this._config.lineHeight * -1) + 10)
      .attr('class', function(d, i) {
        return 'jsc-text jsc-text--name jsc-text--' + i;
      })
      .attr('visibility', function(d, i) {
        return i == 0 ? 'visible' : 'hidden';
      })
      .text(function(d) {
        return d;
      })
      .style({
        fill: this._config.fontColor,
        'font-size': fontPx(this._config.fontSize)
      });

    legend.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', this._config.lineHeight + 10)
      .attr('class', function(d, i) {
        return 'jsc-text jsc-text--percent jsc-text--' + i;
      })
      .attr('visibility', function(d, i) {
        return i == 0 ? 'visible' : 'hidden';
      })
      .text(function(d, i) {
        return _self._data[i].percent + '%';
      })
      .style({
        fill: this._config.fontColor,
        'font-size': fontPx(this._config.fontSize)
      });
  }

  var colorstore = {};

  path.attr('fill', function(d, i) {
      var fill = color(i);

      colorstore[i] = fill;

      return fill;
    })
    .attr('class', function(d, i) {
      return 'jsc-slice jsc-slice--' + i;
    })
    .attr('stroke', function(d, i) {
      return i == 0 ? this.getAttribute('fill') : _self._config.backgroundColor;
    })
    .attr('stroke-width', function(d, i) {
      return i == 0 ? 4  : 5;
    })
    .on(this._config.selectevent, debounce(function(d, i) {
      this.parentElement.insertBefore(this, this.parentElement.firstChild);
      
      svg.selectAll('.jsc-text')
        .attr('visibility', 'hidden');

      svg.selectAll('.jsc-slice')
        .attr('stroke-width', 5)
        .attr('stroke', _self._config.backgroundColor);

      d3.select(this)
        .attr('stroke-width', 4)
        .attr('stroke', function() {
          return this.getAttribute('fill');
        })

      svg.selectAll('.jsc-text--' + i)
        .attr('visibility', 'visible');

      selectSlice(i);
      
      _self._config.onselect.call(svg, findSlice(i));
    }, 100));


  var labelGroup = svg.append('svg:g')
    .attr('class', 'label-group');

  var sliceLabel = labelGroup.selectAll('text')
    .data(pie(this._data));

  var slicestore = [];

  sliceLabel.enter().append('svg:text')
    .attr('class', 'arc-label')
    .attr('transform', function(d) {return 'translate(' + arc.centroid(d) + ')'; })
    .attr('text-anchor', 'middle')
    .attr('fill-opacity', '0.0')
    .text(function(d, i) {
      var rect = this.getBoundingClientRect();

      slicestore.push({
        index: i,
        selected: ( 0 == i ),
        data: data[i],
        coords: { x: rect.x, y: rect.y },
        side: {
          left: rect.x < _self._config.width / 2,
          right: rect.x >= _self._config.width / 2
        },
        fill: colorstore[i]
      });

      return '-';
    });

  sliceLabel.data(pie(this._data));

  function fontPx(value) {
    if ('number' != typeof value) {
      throw new Error('Invalid fontSize value');
    }

    return value + 'px';
  }

  function selectSlice(sliceIndex) {
    slicestore.forEach(function(slice, index) {
      slice.selected = ( slice.index === sliceIndex );
    });
  }

  function findSlice(sliceIndex) {
    var result = null;

    slicestore.forEach(function(slice, index) {
      if ( slice.index === sliceIndex ) {
        result = slice
      }
    });

    return result;
  }

  return {
    svg: function() {
      return svg;
    },
    data: function() {
      return data;
    },
    slices: function() {
      return slicestore;
    }
  };
};
