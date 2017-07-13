# js-charts

js-charts is a YouScience JavaScript library that allows developers to easily add charts to web apps.

## Getting Started

Install package dependencies.

```
npm install
```

Build the project. Output distribution file path is `./dist/jsc.js`.

```
npm run build
```

Run unit tests.

```
npm test
```

## External Dependencies

Running js-charts on your site requires D3.js 3.3.x.

## Usage

Charts are instantiated using the `JSC` constructor which accepts one argument `options` (object). Options are described below.

| Name         | Description               |
|--------------|---------------------------|
| `type`       | (string) Chart type.      |
| `target`     | (string) Target selector. |

### Basic Example

```javascript
// Instantiate a chart object.
var chart = new JSC({
  type: 'donut',
  target: '#chart',

  ... chart options ...

});

// Create the chart with data.
chart.create([ ... ]);
```

## API

| Method       | Description                                                                                                                    |
|--------------|--------------------------------------------------------------------------------------------------------------------------------|
| `.create(a)` | Creates the SVG element and appends it to the target element. Takes one argument, [`data`](#user-content-data-format) (array). |
| `.render(a)` | Destroys and creates the chart element. Takes one argument, [`data`](#user-content-data-format) (array).                       |

## Chart Types

There is presently only one chart type, the Donut chart type.

### Donut

A doughnut chart (or "donut" chart) is essentially a pie chart with the center area removed. Use a Donut chart to express data in a way that does not focus of its size.

#### Chart Options

| Name               | Description                                         |
|--------------------|-----------------------------------------------------|
| `backgroundColor`  | (string) Hex color to use for SVG background color. |
| `colors`           | (array) Array of hex colors for slices.             |
| `fontColor`        | (string) Hex color to use for label font color.     |
| `fontSize`         | (number) Text font size in pixels.                  |
| `lineHeight`       | (number) Text line height in pixels.                |
| `size`             | (number) Size of chart to render in pixels.         |

#### Data Format

Donut chart data items have two key-value pairs, `name` (string) and `percent` (number).

```javascript
[
  {
    name: 'Internet Explorer',
    percent: 40
  },
  ...
]
```

#### CSS Selectors

| Selector              | Description                                                              |
|-----------------------|--------------------------------------------------------------------------|
| `.jsc-donut`          | SVG element.                                                             |
| `.jsc-slice`          | All slice areas.                                                         |
| `.jsc-slice--{index}` | Slice area by its corresponding data point's index in the data series.   |
| `.jsc-text`           | All text elements.                                                       |
| `.jsc-text--{index}`  | Text elements by its corresponding data point's index in the data series.|
| `.jsc-text--name`     | Text element for data point name.                                        |
| `.jsc-text--percent`  | Text element for data point percent.                                     |

#### Full Example

```html
<div id="chart"></div>

<script>
var chart = new JSC({
  type: 'donut',
  target: '#chart'
});

chart.create([
  {
    name: 'Internet Explorer',
    percent: 40
  },
  {
    name: 'Chrome',
    percent: 30
  },
  {
    name: 'Safari',
    percent: 15
  },
  {
    name: 'Firefox',
    percent: 9
  },
  {
    name: 'Others',
    percent: 6
  }
]);
</script>
```
