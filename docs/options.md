# Options

The plugin options can be changed at 3 different levels:

- globally: `Chart.defaults.global.plugins.outlabels.*`
- per chart: `options.plugins.outlabels.*`
- per dataset: `dataset.outlabels.*`

Available options:

| Name | Type | [Scriptable](#scriptable-options) | [Indexable](#indexable-options) |  Default
| ---- | ---- | :----: | :----: | ----
| `text` | `String` | Yes | Yes | `'%l %p'`
| `percentPrecision` | `Number` | - | - | `1`
| `valuePrecision` | `Number` | - | - | `3`
| `backgroundColor` | [`Style`](#style-options)/`null` | Yes | Yes | `Same as pie arc color (adaptive)`
| `borderColor` | [`Style`](#style-options)/`null` | Yes | Yes | `Same as pie arc color (adaptive)`
| `borderRadius` | `Number` | Yes | Yes | `2`
| `borderWidth` | `Number` | Yes | Yes | `2`
| `lineColor` | `String` | Yes | Yes | `Same as pie arc color (adaptive)`
| `lineWidth` | `Number` | Yes | Yes | `2`
| `stretch` | `Number` | Yes | Yes | `40`
| `color` | [`Style`](#style-options) | Yes | Yes | `white`
| [`display`](positioning.md#visibility) | `Boolean` | Yes | Yes | `true`
| `font` | `Object` | Yes | Yes | -
| `font.resizable` | `Boolean` | - | - | `true`
| `font.minSize` | `Number` | - | - | `null`
| `font.maxSize` | `Number` | - | - | `null`
| `font.family` | `String` | - | - | [`defaultFontFamily`](http://www.chartjs.org/docs/latest/general/fonts.html)
| `font.size` | `String` | - | - | [`defaultFontSize`](http://www.chartjs.org/docs/latest/general/fonts.html)
| `font.style` | `String` | - | - | [`defaultFontStyle`](http://www.chartjs.org/docs/latest/general/fonts.html)
| `font.weight` | `String` | - | - | `'normal'`
| `font.lineHeight` | `Number/String` | - | - | `1.2`
| `padding` | `Number/Object` | Yes | Yes | -
| `padding.top` | `Number` | - | - | `4`
| `padding.right` | `Number` | - | - | `4`
| `padding.bottom` | `Number` | - | - | `4`
| `padding.left` | `Number` | - | - | `4`
| [`textAlign`](formatting.md#text-alignment) | `String` | Yes | Yes | `left`

## Scriptable Options

Scriptable options also accept a function which is called for each data and that takes the unique argument `context` representing contextual information (see [option context](options.md#option-context)).

Example:

```javascript
lineColor: function(context) {
    var index = context.dataIndex;
    var value = context.dataset.data[index];
    return value < 0 ? 'red' :  // draw negative values in red
        index % 2 ? 'blue' :    // else, alternate values in blue and green
        'green';
}
```

## Option Context

The option context is used to give contextual information when resolving options. It mainly applies to [scriptable options](#scriptable-options).

The context object contains the following properties:

- `chart`: the associated chart
- `dataIndex`: index of the current data
- `dataset`: dataset at index `datasetIndex`
- `datasetIndex`: index of the current dataset
- `labels`: list of chart labels
- `percent`: the percentage of dataset value at index `datasetIndex`

## Indexable Options

Indexable options also accept an array in which each item corresponds to the element at the same index. Note that this method requires to provide as many items as data, so, in most cases, using a [function](#scriptable-options) is more appropriated.

Example:

```javascript
color: [
    'red',    // color for data at index 0
    'blue',   // color for data at index 1
    'green',  // color for data at index 2
    'black',  // color for data at index 3
    //...
]
```

## Style Options

Style options are usually inputs for [`fillStyle`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle) or [`strokeStyle`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle).

The following values are supported:

- string parsed as [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) value
- [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) object (linear or radial gradient)
- [CanvasPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) object (a repetitive image)

Examples:

```javascript
color: 'green'                  // named color
color: '#dc143c'                // HEX color
color: 'rgb(51, 170, 51)'       // RGB color (opaque)
color: 'rgba(51, 170, 51, .5)'  // RGBa color (semi-transparent)
// ...
```