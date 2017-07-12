;(function(module) {
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return module;
    });
  } else {
    window.JSC = module.JSC;
  }
}({
  JSC: function(d3) {
    var noop = function() {};

    return function() {

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

      JSC.prototype.DonutInit = function(options) {
        options = options || {};
        
        var config = {};

        config.fontSize = options.fontSize || '23px';
        config.lineHeight = options.lineHeight || 15;
        config.slicePadding = options.slicePadding || .05;
        config.colors = options.colors || null;
        config.width = options.size || 300;
        // Make same as width because the chart is square.
        config.height = config.width;

        this._config = config;
      };

      JSC.prototype.DonutRender = function(data) {
        this._svg.selectAll('*').remove();
        this.create(data);
      };

      JSC.prototype.DonutCreate = function(data) {
        var _self = this;

        this._data = data || [];

        var pie = d3.layout.pie()
          .value(function(d) {
            return d.percent;
          })
          .sort(null)
          .padAngle(this._config.slicePadding);

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
            'font-size': this._config.fontSize
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
            'font-size': this._config.fontSize
          });

        path.attr('fill', function(d, i) {
            return color(i);
          })
          .attr('class', function(d, i) {
            return 'jsc-slice jsc-slice--' + i;
          })
          .attr('stroke', function(d, i) {
            return i == 0 ? this.getAttribute('fill') : 'none';
          })
          .attr('stroke-width', function(d, i) {
            return i == 0 ? '6' : '';
          })
          .on('mouseenter', function(d, i) {
            svg.selectAll('.jsc-text')
              .attr('visibility', 'hidden');

            svg.selectAll('.jsc-slice')
              .attr('stroke', 'none');

            d3.select(this)
              .attr('stroke', function() {
                return this.getAttribute('fill');
              })
              .attr('stroke-width', 6);

            svg.selectAll('.jsc-text--' + i)
              .attr('visibility', 'visible');
          });
      };

      return JSC;
    }()
  }(d3)
}));
