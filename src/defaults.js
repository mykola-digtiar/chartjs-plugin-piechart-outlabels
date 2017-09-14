/**
 * @module Options
 */

'use strict';

export default {
	LABEL_KEY: '$outlabels',
	/**
	 * The color used to draw the background of the surrounding frame.
	 * @member {String|Array|Function|null}
	 * @default null (no background)
	 */
	backgroundColor: function(context) {
		return context.dataset.backgroundColor;
	},

	/**
	 * The color used to draw the border of the surrounding frame.
	 * @member {String|Array|Function|null}
	 * @default null (no border)
	 */
	borderColor: function(context) {
		return context.dataset.backgroundColor;
	},

	lineColor: function(context) {
		return context.dataset.backgroundColor;
	},

	/**
	 * The border radius used to add rounded corners to the surrounding frame.
	 * @member {Number|Array|Function}
	 * @default 0 (not rounded)
	 */
	borderRadius: 2,

	/**
	 * The border width of the surrounding frame.
	 * @member {Number|Array|Function}
	 * @default 0 (no border)
	 */
	borderWidth: 2,

	lineWidth: 2,

	/**
	 * The color used to draw the label text.
	 * @member {String|Array|Function}
	 * @default undefined (use Chart.defaults.global.defaultFontColor)
	 */
	color: 'white',

	/**
	 * Whether to display labels global (boolean) or per data (function)
	 * @member {Boolean|Array|Function}
	 * @default true
	 */
	display: true,

	/**
	 * The font options used to draw the label text.
	 * @member {Object|Array|Function}
	 * @prop {Boolean} font.family - defaults to Chart.defaults.global.defaultFontFamily
	 * @prop {Boolean} font.size - defaults to Chart.defaults.global.defaultFontSize
	 * @prop {Boolean} font.style - defaults to Chart.defaults.global.defaultFontStyle
	 * @prop {Boolean} font.weight - defaults to 'normal'
	 * @default Chart.defaults.global.defaultFont.*
	 */
	font: {
		family: undefined,
		size: undefined,
		style: undefined,
		weight: null,
		resizable: true
	},

	/**
	 * The line height (in pixel) to use for multi-lines labels.
	 * @member {Number|Array|Function|undefined}
	 * @default 1.2
	 */
	lineHeight: 1.2,


	/**
	 * The padding (in pixels) to apply between the text and the surrounding frame.
	 * @member {Number|Object|Array|Function}
	 * @prop {Number} padding.top - Space above the text.
	 * @prop {Number} padding.right - Space on the right of the text.
	 * @prop {Number} padding.bottom - Space below the text.
	 * @prop {Number} padding.left - Space on the left of the text.
	 * @default 4 (all values)
	 */
	padding: {
		top: 4,
		right: 4,
		bottom: 4,
		left: 4
	},

	/**
	 * Text alignment for multi-lines labels ('left'|'right'|'start'|'center'|'end').
	 * @member {String|Array|Function}
	 * @default 'start'
	 */
	textAlign: 'center',

	stretch: 40,

	text: '%l %p'
};
