import d3 from 'd3';
import utils from '../../utils/index.js';

const { debounce } = utils;

const jsClass = '.jsc-slice';

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
    this.highlightOnHover = options.highlightOnHover || false;
    this.selectevent = options.selectevent || 'mouseenter';
    this.selectblurevent = options.selectblurevent || 'mouseleave';
    this.onselect = options.onselect || (() => {});
    this.onselectblur = options.onselectblur || (() => {});
    this.title = options.title;
    this.labels = options.labels;
    this.outerRadiusRatio = 2.5//options.outerRadiusRatio || 3;
    this.innerRadiusRatio = 4//options.innerRadiusRatio || 2.5;
    this.activeShadow = options.activeShadow || false;
    this.padAngle = 0.01//options.padAngle || 0.08;
    this.withBorder = false;
  }

  onMouseEnterHandler(slice) {
    this.unhighlightInactiveSlices();
    this.highlightSlice(slice, this.hoverStrokeWidth, false);
  }

  onSelectHandler(slice, _data, index) {
    this.selectSlice(index);

    this.unhighlightSlices();
    this.highlightSlice(slice, this.initialStrokeWidth);

    this.onselect.call(this.svg, this.findActiveSlice());
  }

  onSelectBlurHandler(_slice, _data, index) {
    this.unhighlightInactiveSlices();

    this.onselectblur.call(this.svg, this.findSlice(index));
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
    this.slicestore.forEach((slice) => {
      slice.selected = ( slice.index === sliceIndex );
    });
  }

  findSlice(sliceIndex) {
    let result = null;

    this.slicestore.forEach((slice) => {
      if ( slice.index === sliceIndex ) {
        result = slice
      }
    });

    return result;
  }

  findActiveSlice() {
    let result = null;

    this.slicestore.forEach((slice) => {
      if (slice.selected) {
        result = slice
      }
    });

    return result;
  }

  getColors(data) {
    return data.map(datum => datum.color);
  }

  create(data = []) {
    const self = this;

    data = data.sort((a, b) => (a.percent < b.percent));
    const colors = self.colors ? self.colors : self.getColors(data);

    const pie = d3.layout.pie()
      .value(function(d) {
        return d.percent;
      })
      .sort(null);

    self.outerRadius = self.width / self.outerRadiusRatio;
    self.innerRadius = self.width / self.innerRadiusRatio;

    const color = colors ? d3.scale.ordinal().range(colors) : d3.scale.category20();

    const arc = d3.svg.arc()
      .outerRadius(self.outerRadius)
      .innerRadius(self.innerRadius)
      .padAngle(self.padAngle);

    const svg = d3.select(self.target)
      .append('svg')
      .attr("width", '100%')
      .attr("height", '100%')
      .attr('viewBox', (-self.width / 2) + ' ' + (-self.height / 2) + ' ' + self.width + ' ' + self.height)
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr({
        class: 'jsc-svg-container jsc-donut',
        style: 'background-color: ' + self.backgroundColor
      })
      .append('g')

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

    const arc2 = d3.svg.arc()
      .outerRadius(self.outerRadius + 7)
      .innerRadius(self.outerRadius + 1)
      .padAngle(self.padAngle);

    const borderPath = svg.selectAll('path.outer-arc')
      .data(pie(data))
      .enter()
      .append('path')
      .attr({
        class: 'outer-arc',
        d: arc2,
        fill: function(d, i) {
          return color(d.data.name);
        },
        opacity: 0
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

    self.slicestore = slicestore;
    self.svg = svg;

    borderPath.attr('class', function(_, i) {
      return `u-clickable jsc-slice-border jsc-slice--${i}`
    })

    path
      .attr('class', function(_, i) {
        slicestore.push({
          index: i,
          selected: ( 0 == i ),
          data: data[i],
          fill: color(i),
        });

        return `u-clickable jsc-slice jsc-slice--${i}`;
      })
      .on('mouseenter', debounce(function() {
        if (self.highlightOnHover) {
          self.onMouseEnterHandler.apply(self, [this]);
        }
      }, 100))
      .on(self.selectevent, debounce(function() {
        self.onSelectHandler.apply(self, [this, ...arguments]);
      }, 100))
      .on(self.selectblurevent, debounce(function() {
        self.onSelectBlurHandler.apply(self, [this, ...arguments])
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
        .on(self.selectevent, debounce(function(data, index) {
          const [[slice]] = svg.select(`.jsc-slice--${index}`);

          self.onSelectHandler.apply(self, [slice, data, index]);
        }, 100))
        .on(self.selectblurevent, debounce(function(data, index) {
          const [[slice]] = svg.select(`.jsc-slice--${index}`);

          self.onSelectBlurHandler.apply(self, [slice, data, index]);
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

  slices() {
    return this.svg.selectAll(jsClass);
  }

  borderSlices() {
    return this.svg.selectAll('.jsc-slice-border')
  }

  inactiveSlices() {
    return this.inactive(this.slices())
  }

  inactiveBorderSlices() {
    return this.inactive(this.borderSlices());
  }

  unhighlightSlices() {
    this.unhighligh(this.slices());
    this.borderSlices().attr('opacity', 0);
  }

  unhighlightInactiveSlices() {
    this.unhighligh(this.inactiveSlices());
    this.inactiveBorderSlices().attr('opacity', 0);
  }

  highlightSlice(slice, strokeWidth) {
    if (this.withBorder) {
      let sliceClass = d3.select(slice).attr('class');
      d3.select(this.borderClassSelector(sliceClass)).attr('opacity', 0.4);
    }
    else {
      let widerArc =  d3.svg.arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius * 1.08)
      .padAngle(this.padAngle);
      d3.select(slice).transition().attr('d', widerArc);
    }
  }

  // Reset a group of slices to the default arc width
  unhighligh(slices) {
    if (this.withBorder) {
    }
    else {
      let defaultArc = d3.svg.arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius)
      .padAngle(this.padAngle);

      slices.transition().attr('d', defaultArc);
    }
  }

  inactive(slices) {
    const activeSlice = this.findActiveSlice();

    return slices.filter(({ data: { name }}) => name !== activeSlice.data.name);
  }

  borderClassSelector(sliceClass) {
    let borderClass = sliceClass.replace('jsc-slice', 'jsc-slice-border');
    borderClass = borderClass.replace(/ /g, '.');

    return '.' + borderClass;
  }

}

export default DonutBuilder;
