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
      width: this._config.title ? this._config.width * 2.3 : this._config.width,
      height: this._config.height,
      class: 'jsc-svg-container jsc-donut',
      style: 'background-color: ' + _self._config.backgroundColor
    })
    .append('g')
    .attr({
      transform: 'translate(' + ( this._config.title ? ( this._config.width / 2 ) * 2.3 : this._config.width / 2 ) + ',' + this._config.height / 2 + ')'
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

  var slicestore = [];
  var colorstore = {};

  path.attr('fill', function(d, i) {
      var fill = color(i);
      colorstore[i] = fill;
      return fill;
    })
    .attr('class', function(d, i) {
      slicestore.push({
        index: i,
        selected: ( 0 == i ),
        data: data[i],
        fill: colorstore[i]
      });

      return 'jsc-slice jsc-slice--' + i;
    })
    .attr('stroke', function(d, i) {
      return i == 0 ? this.getAttribute('fill') : _self._config.backgroundColor;
    })
    .attr('stroke-width', function(d, i) {
      return i == 0 ? 4  : 5;
    })
    .on(this._config.selectevent, debounce(selecthandler, 100))
    .on(this._config.selectblurevent, debounce(selectblurhandler, 100));

  function selecthandler(d, i) {
    this.parentElement.insertBefore(this, this.parentElement.firstChild);

    svg.selectAll('.jsc-slice')
      .attr('stroke-width', 5)
      .attr('stroke', _self._config.backgroundColor);

    d3.select(this)
      .attr('stroke-width', 4)
      .attr('stroke', function() {
        return this.getAttribute('fill');
      })
    
    if (!_self._config.title) {
      svg.selectAll('.jsc-text')
        .attr('visibility', 'hidden');

      svg.selectAll('.jsc-text--' + i)
        .attr('visibility', 'visible');
    }

    selectSlice(i);

    _self._config.onselect.call(svg, findSlice(i));
  }

  function selectblurhandler(d, i) {
    _self._config.onselectblur.call(svg, findSlice(i));
  }

  if (this._config.title) {
    var labels = svg.append('svg:g')
      .attr('class', 'labels');

    var text = labels.selectAll('text')
      .data(pie(this._data), function(d) { return d.data.name; });

    text.enter()
      .append('text')
      .attr('class', function(d, i) {
        return 'jsc-label jsc-label--' + i;
      })
      .attr('dy', '.35em')
      .text(function(d) {
        return d.data.name;
      })
      .on(this._config.selectevent, debounce(function(d, i) {
        var slice = svg.select('.jsc-slice--' + i);

        selecthandler.apply(slice[0][0], [d, i]);
      }, 100))
      .on(this._config.selectblurevent, debounce(function(d, i) {
        var slice = svg.select('.jsc-slice--' + i);

        selectblurhandler.apply(slice[0][0], [d, i]);
      }, 100));

    text.attr('transform', function(d) {
        var pos = arc.centroid(d);
        pos[0] = innerRadius * (midAngle(d) < Math.PI ? 1 : -1);
        return 'translate('+ pos +')';
      })
      .attr('text-anchor', function(d) {
        return midAngle(d) < Math.PI ? 'start':'end';
      });

    var lines = svg.append('g')
      .attr('class', 'lines');

    var polyline = lines.selectAll('polyline')
      .data(pie(this._data), function(d) { return d.data.name; });
    
    polyline.enter()
      .append('polyline');

    polyline.attr('points', function(d) {
        var pos = arc.centroid(d);
        pos[0] = innerRadius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        return [ arc.centroid(d), arc.centroid(d), pos ];    
      })
      .attr('style', 'stroke-width: 2px; fill: none;')
      .attr('stroke', function(d, i) {
        return color(i);
      });
  }

  function fontPx(value) {
    if ('number' != typeof value) {
      throw new Error('Invalid fontSize value');
    }

    return value + 'px';
  }
  
  function midAngle(d){
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
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
