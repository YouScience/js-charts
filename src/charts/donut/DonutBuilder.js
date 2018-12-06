import d3 from 'd3';
import utils from '../../utils/index.js';

const { debounce } = utils;

const jsClass = '.jsc-slice';

const HIGHLIGTH_TYPES = {
  NONE: 'none',
  INCREASE_SIZE: 'increase_size',
  ADD_BORDER: 'add_border'
};

const defaultTooltipStyle = {
  'background': 'lightsteelblue',
  'border': '0px',
  'border-radius': '0.75em',
  'display': 'inline-block',
  'padding': '0.5em',
  'pointer-events': 'none',
  'position': 'absolute',
  'text-align': 'center',
  'z-index': 2
};

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

    this.title = options.title;
    this.labels = options.labels;
    this.tooltips = options.tooltips;

    this.outerRadiusRatio = options.outerRadiusRatio || 2.5;
    this.innerRadiusRatio = options.innerRadiusRatio || 4;
    this.activeShadow = options.activeShadow || false;
    this.padAngle = options.padAngle || 0.01;
    this.tooltipStyle = options.tooltipStyle || null;

    this.onHoverEffect = options.onHoverEffect || HIGHLIGTH_TYPES.NONE;
    this.onSelectEffect = options.onSelectEffect || HIGHLIGTH_TYPES.INCREASE_SIZE;
    this.borderOpacity = options.borderOpacity || 0.4;
    this.increaseRadiusStep = options.increaseRadiusStep || 7;

    this.selectevent = options.selectevent || 'mouseenter';
    this.selectblurevent = options.selectblurevent || 'mouseleave';
    this.onselect = options.onselect || (() => {});
    this.onselectblur = options.onselectblur || (() => {});
  }

  onMouseEnterHandler(slice) {
    this.unhighlightInactiveSlices();
    this.highlightSlice(slice, this.onHoverEffect);
  }

  onSelectHandler(slice, _data, index) {
    this.selectSlice(slice, index);
    this.onselect.call(this.svg, this.findActiveSlice());
  }

  onSelectBlurHandler(_slice, _data, index) {
    this.unhighlightInactiveSlices();
    this.onselectblur.call(this.svg, this.findSlice(index));
  }

  selectSliceByName(sliceName) {
    const sliceData = this.findSliceByName(sliceName);
    if (!sliceData) return;

    const slice = d3.select(`${jsClass}--${sliceData.index}`);
    this.selectSlice(slice.node(), sliceData.index);
  }

  selectSlice(slice, index) {
    this.markSliceAsSelected(index);

    this.unhighlightSlices();
    this.highlightSlice(slice, this.onSelectEffect);
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

  markSliceAsSelected(sliceIndex) {
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

  findSliceByName(sliceName) {
    let result = null;

    this.slicestore.forEach((slice) => {
      if (slice.data.name === sliceName) {
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
      .attr('width', '100%')
      .attr('height', '100%')
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

    if (this.onHoverEffect === HIGHLIGTH_TYPES.ADD_BORDER ||
        this.onSelectEffect === HIGHLIGTH_TYPES.ADD_BORDER) {

      const borderArc = d3.svg.arc()
        .outerRadius(self.outerRadius + this.increaseRadiusStep)
        .innerRadius(self.outerRadius + 1)
        .padAngle(self.padAngle);

      const borderPath = svg.selectAll('path.outer-arc')
        .data(pie(data))
        .enter()
        .append('path')
        .attr({
          class: 'outer-arc',
          d: borderArc,
          fill: function(d, i) {
            return color(d.data.name);
          },
          opacity: 0
        });

      borderPath.attr('class', function(_, i) {
        return `u-clickable jsc-slice-border jsc-slice--${i}`
      })
    }

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
        self.onMouseEnterHandler.apply(self, [this]);
      }, 100))
      .on(self.selectevent, debounce(function() {
        self.onSelectHandler.apply(self, [this, ...arguments]);
      }, 100))
      .on(self.selectblurevent, debounce(function() {
        self.onSelectBlurHandler.apply(self, [this, ...arguments])
      }, 100));

    if (self.tooltips) {
      const div = d3.select(self.target).append('div');

      if (self.tooltipStyle) {
        div.attr('class', self.tooltipStyle)
      } else {
        div.style(defaultTooltipStyle);
      }

      path.on('mouseover', function(d) {
        div.transition()
          .duration(200)
          .style('opacity', 1);

        div.html(d.data.contentTooltip)
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 30) + 'px');
      })
      .on('mouseout', function(d) {
        div.transition()
          .duration(500)
          .style('opacity', 0);
      })
    }

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

  highlightSlice(slice, highlightEffect) {
    switch(highlightEffect) {
      case HIGHLIGTH_TYPES.ADD_BORDER:
        this.addBorderToSlice(slice);
        break;
      case HIGHLIGTH_TYPES.INCREASE_SIZE:
        this.increaseSliceSize(slice)
        break;
    }
  }

  addBorderToSlice(slice) {
    let sliceClass = d3.select(slice).attr('class');
    d3.select(this.borderClassSelector(sliceClass)).attr('opacity', this.borderOpacity);
  }

  increaseSliceSize(slice) {
    let widerArc =  d3.svg.arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius + this.increaseRadiusStep)
      .padAngle(this.padAngle);
    d3.select(slice).transition().attr('d', widerArc);
  }

  // Reset a group of slices to the default arc width
  unhighligh(slices) {
    let defaultArc = d3.svg.arc()
      .innerRadius(this.innerRadius)
      .outerRadius(this.outerRadius)
      .padAngle(this.padAngle);

    slices.transition().attr('d', defaultArc);
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
