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

  selecthandler(d, i, svg) {
    this.parentElement.insertBefore(this, this.parentElement.firstChild);

    svg.selectAll('.jsc-slice')
      .attr('stroke-width', 5)
      .attr('stroke', this.backgroundColor);

    d3.select(this)
      .attr('stroke-width', 4)
      .attr('stroke', () => this.getAttribute('fill'))

    if (!this.title) {
      svg.selectAll('.jsc-text')
        .attr('visibility', 'hidden');

      svg.selectAll(`.jsc-text--${i}`)
        .attr('visibility', 'visible');
    }

    this.selectSlice(i);

    this.onselect.call(svg, this.findSlice(i));
  }

  selectblurhandler(d, i, svg) {
    this.onselectblur.call(svg, this.findSlice(i));
  }

  fontPx(value) {
    if ('number' != typeof value) {
      throw new Error('Invalid fontSize value');
    }

    return `value${px}`;
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
    data = data.sort((a, b) => (a.percent < b.percent));

    const pie = d3.layout.pie()
      .value((d) => d.percent)
      .sort(null);

    const outerRadius = this.width / 3;
    const innerRadius = this.width / 2.3;

    const color = this.colors ? d3.scale.ordinal().range(this.colors) : d3.scale.category20();

    const arc = d3.svg.arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius);

    const svg = d3.select(this._target)
      .append('svg')
      .attr({
        width: this.labels ? this.width * 2.3 : this.width,
        height: this.height,
        class: 'jsc-svg-container jsc-donut',
        style: 'background-color: ' + this.backgroundColor
      })
      .append('g')
      .attr({
        transform: 'translate(' + ( this.labels ? ( this.width / 2 ) * 2.3 : this.width / 2 ) + ',' + this.height / 2 + ')'
      });

    const path = svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr({
        d: arc,
        fill: (d, i) => color(d.data.name),
      });

    const legend = svg.selectAll('.legend')
      .data(color.domain())
      .enter();

    if (this.title) {
      legend.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', (this.lineHeight * -1) + 30)
        .attr('class', (d, i) => `jsc-text jsc-text--title jsc-text--${i}`)
        .attr('visibility', (d, i) => (i == 0 ? 'visible' : 'hidden'))
        .text((d) => this.title)
        .style({
          fill: this.fontColor,
          'font-size': this.fontPx(this.fontSize)
        });
    } else {
      legend.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', (this.lineHeight * -1) + 10)
        .attr('class', (d, i) => `jsc-text jsc-text--name jsc-text--${i}`)
        .attr('visibility', (d, i) => (i == 0 ? 'visible' : 'hidden'))
        .text((d) => d)
        .style({
          fill: this.fontColor,
          'font-size': this.fontPx(this.fontSize)
        });

      legend.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', this.lineHeight + 10)
        .attr('class', (d, i) => `jsc-text jsc-text--percent jsc-text--${i}`)
        .attr('visibility', (d, i) => (i == 0 ? 'visible' : 'hidden'))
        .text((d, i) => data[i].percent + '%')
        .style({
          fill: this.fontColor,
          'font-size': this.fontPx(this.fontSize)
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

        return 'jsc-slice jsc-slice--' + i;
      })
      .attr('stroke', (d, i) => (i == 0 ? this.getAttribute('fill') : this.backgroundColor))
      .attr('stroke-width', (d, i) => (i == 0 ? 4  : 5))
      .on(this.selectevent, debounce(this.selecthandler, 100))
      .on(this.selectblurevent, debounce(this.selectblurhandler, 100));

    if (this.labels) {
      const labels = svg.append('svg:g')
        .attr('class', 'labels');

      const text = labels.selectAll('text')
        .data(pie(data), (d) => d.data.name);

      text.enter()
        .append('text')
        .attr('class', (d, i) => `jsc-label jsc-label--${i}`)
        .attr('dy', '.35em')
        .text((d) => d.data.name)
        .on(this.selectevent, debounce((d, i) => {
          const slice = svg.select(`.jsc-slice--${i}`);

          this.selecthandler.apply(slice[0][0], [d, i], svg);
        }, 100))
        .on(this.selectblurevent, debounce((d, i) => {
          const slice = svg.select(`.jsc-slice--${i}`);

          this.selectblurhandler.apply(slice[0][0], [d, i], svg);
        }, 100));

      text.attr('transform', (d) => {
          const pos = arc.centroid(d);
          pos[0] = innerRadius * (this.midAngle(d) < Math.PI ? 1 : -1);

          return `translate(${pos})`;
        })
        .attr('text-anchor', (d) => {
          return this.midAngle(d) < Math.PI ? 'start':'end';
        });

      const lines = svg.append('g')
        .attr('class', 'lines');

      const polyline = lines.selectAll('polyline')
        .data(pie(data), (d) => d.data.name);

      polyline.enter()
        .append('polyline');

      polyline.attr('points', (d) => {
          const pos = arc.centroid(d);
          pos[0] = innerRadius * 0.95 * (this.midAngle(d) < Math.PI ? 1 : -1);

          return [ arc.centroid(d), arc.centroid(d), pos ];
        })
        .attr('class', (d, i) => `jsc-label-line jsc-label-line--${i}`)
        .attr('stroke-width', '1')
        .attr('fill', 'none')
        .attr('stroke', (d, i) => color(i));
    }

    return {
      svg: () => svg,
      data: () => data,
      slices: () => slicestore,
    };
  };
}

module.exports = DonutBuilder;
