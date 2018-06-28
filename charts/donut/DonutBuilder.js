const d3 = require('d3');
const { debounce } = require('../../utils');

class DonutBuilder {
  constructor(options = {}) {
    this.target = options.target;
    this.fontSize = options.fontSize || 38;
    this.lineHeight = options.lineHeight || 20;
    this.colors = options.colors || null;
    this.fontColor = options.fontColor || '#000000';
    this.backgroundColor = options.backgroundColor || '#FFFFFF';
    this.width = options.size || 300;
    this.height = options.size || 300;
    this.selectevent = options.selectevent || 'mouseenter';
    this.selectblurevent = options.selectblurevent || 'mouseleave';
    this.onselect = options.onselect || (() => {});
    this.onselectblur = options.onselectblur || (() => {});
    this.title = options.title;
    this.labels = options.labels;
  }

  selecthandler(self, svg, d, i) {
    this.parentElement.insertBefore(this, this.parentElement.firstChild);

    svg.selectAll('.jsc-slice')
      .attr('stroke-width', 5)
      .attr('stroke', self.backgroundColor);

    d3.select(this)
      .attr('stroke-width', 4)
      .attr('stroke', function() {
        return this.getAttribute('fill');
      });

    if (!self.title) {
      svg.selectAll('.jsc-text')
        .attr('visibility', 'hidden');

      svg.selectAll(`.jsc-text--${i}`)
        .attr('visibility', 'visible');
    }

    self.selectSlice(i);

    self.onselect.call(svg, self.findSlice(i));
  }

  selectblurhandler(self, svg, d, i) {
    self.onselectblur.call(svg, self.findSlice(i));
  }

  fontPx(value) {
    if ('number' != typeof value) {
      throw new Error('Invalid fontSize value');
    }

    return `${value}px`;
  }

  midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

  selectSlice(sliceIndex) {
    slicestore.forEach((slice, index) => {
      slice.selected = ( slice.index === sliceIndex );
    });
  }

  findSlice(sliceIndex) {
    let result = null;

    slicestore.forEach((slice, index) => {
      if ( slice.index === sliceIndex ) {
        result = slice
      }
    });

    return result;
  }

  create(data = []) {
    const self = this;

    data = data.sort((a, b) => (a.percent < b.percent));

    const pie = d3.layout.pie()
      .value(function(d) {
        return d.percent;
      })
      .sort(null);

    const outerRadius = self.width / 3;
    const innerRadius = self.width / 2.3;

    const color = self.colors ? d3.scale.ordinal().range(self.colors) : d3.scale.category20();

    const arc = d3.svg.arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius);

    const svg = d3.select(self.target)
      .append('svg')
      .attr({
        width: (self.labels ? self.width * 2.3 : self.width),
        height: self.height,
        class: 'jsc-svg-container jsc-donut',
        style: 'background-color: ' + self.backgroundColor
      })
      .append('g')
      .attr({
        transform: 'translate(' + ( self.labels ? ( self.width / 2 ) * 2.3 : self.width / 2 ) + ',' + self.height / 2 + ')'
      });

    const path = svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr({
        d: arc,
        fill: function(d, i) {
          return color(d.data.name);
        },
      });

    const legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter();

    if (self.title) {
      legend.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', (self.lineHeight * -1) + 30)
        .attr('class', function(d, i) {
          return `jsc-text jsc-text--title jsc-text--${i}`;
        })
        .attr('visibility', function(d, i) {
          return i == 0 ? 'visible' : 'hidden';
        })
        .text(function(d) {
          return self.title;
        })
        .style({
          fill: self.fontColor,
          'font-size': self.fontPx(self.fontSize)
        });
    } else {
      legend.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', (self.lineHeight * -1) + 10)
        .attr('class', function(d, i) {
          return `jsc-text jsc-text--name jsc-text--${i}`;
        })
        .attr('visibility', function(d, i) {
          return (i == 0 ? 'visible' : 'hidden');
        })
        .text(function(d) {
          return d;
        })
        .style({
          fill: self.fontColor,
          'font-size': self.fontPx(self.fontSize)
        });

      legend.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', self.lineHeight + 10)
        .attr('class', function(d, i) {
          return `jsc-text jsc-text--percent jsc-text--${i}`;
        })
        .attr('visibility', function(d, i) {
          return i == 0 ? 'visible' : 'hidden';
        })
        .text(function(d, i) {
          data[i].percent + '%';
        })
        .style({
          fill: self.fontColor,
          'font-size': self.fontPx(self.fontSize)
        });
    }

    let slicestore = [];
    let colorstore = {};

    path.attr('fill', function(d, i) {
        const fill = color(i);
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

        return `jsc-slice jsc-slice--${i}`;
      })
      .attr('stroke', function(d, i) {
        return i == 0 ? this.getAttribute('fill') : self.backgroundColor;
      })
      .attr('stroke-width', function(d, i) {
        return i == 0 ? 4  : 5;
      })
      .on(self.selectevent, debounce(function() {
        self.selecthandler.apply(this, [self, svg, ...arguments]);
      }, 100))
      .on(self.selectblurevent, debounce(function() {
        self.selectblurhandler.apply(this, [self, svg, ...arguments]);
      }, 100));

    if (self.labels) {
      const labels = svg.append('svg:g')
        .attr('class', 'labels');

      const text = labels.selectAll('text')
        .data(pie(data), function(d) {
          return d.data.name;
        });

      text.enter()
        .append('text')
        .attr('class', function(d, i) {
          return `jsc-label jsc-label--${i}`;
        })
        .attr('dy', '.35em')
        .text(function(d) {
          return d.data.name;
        })
        .on(self.selectevent, debounce(function(d, i) {
          const slice = svg.select(`.jsc-slice--${i}`);

          self.selecthandler.apply(slice[0][0], [d, i], svg);
        }, 100))
        .on(self.selectblurevent, debounce(function(d, i) {
          const slice = svg.select(`.jsc-slice--${i}`);

          self.selectblurhandler.apply(slice[0][0], [d, i], svg);
        }, 100));

      text.attr('transform', function(d) {
          const pos = arc.centroid(d);
          pos[0] = innerRadius * (self.midAngle(d) < Math.PI ? 1 : -1);

          return `translate(${pos})`;
        })
        .attr('text-anchor', function(d) {
          return self.midAngle(d) < Math.PI ? 'start':'end';
        });

      const lines = svg.append('g')
        .attr('class', 'lines');

      const polyline = lines.selectAll('polyline')
        .data(pie(data), function(d) {
          return d.data.name;
        });

      polyline.enter()
        .append('polyline');

      polyline.attr('points', function(d) {
          const pos = arc.centroid(d);
          pos[0] = innerRadius * 0.95 * (self.midAngle(d) < Math.PI ? 1 : -1);

          return [ arc.centroid(d), arc.centroid(d), pos ];
        })
        .attr('class', function(d, i) {
          return `jsc-label-line jsc-label-line--${i}`;
        })
        .attr('stroke-width', '1')
        .attr('fill', 'none')
        .attr('stroke', function(d, i) {
          return color(i);
        });
    }

    return {
      svg: () => svg,
      data: () => data,
      slices: () => slicestore,
    };
  };
}

module.exports = DonutBuilder;
