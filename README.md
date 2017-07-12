# js-charts

js-charts is a YouScience JavaScript library that allows developers to easily add charts to web apps.

## Dependencies

js-charts depends on D3.js, compatible with versions between 3.3.x and 3.5.x.

## Install

Include `./jsc.js` of this project.

## API

Charts are instantiated using the `JSC` constructor which accepts one argument `options` (object). Options are described below.

| Name         | Description               |
|--------------|---------------------------|
| `type`       | (string) Chart type.      |
| `target`     | (string) Target selector. |

```javascript
var chart = new JSC({
  type: 'donut',
  target: '#chart'
});
```

The above code will create a chart object and its API methods are described below.

| Method       | Description                                                                                       |
|--------------|---------------------------------------------------------------------------------------------------|
| `.create(a)` | Creates the SVG element and appends it to the target element. Takes one argument, `data` (array). |
| `.render(a)` | Destroys and creates the chart element. Takes one argument, `data` (array).                       |

## Chart Types

There is presently only one chart type, the Donut chart type.

### Donut

A doughnut chart (or "donut" chart) is essentially a pie chart with the center area removed. Use a Donut chart to express data in a way that does not focus of its size.

#### Data Format

Donut chart data items have two key-value pairs, `name` (string) and `percent` (number).

```javascript
[
  {
    name: 'IE',
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
]
```

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
    name: 'IE',
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
