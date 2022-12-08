"use strict";

import { toPadding, resolve } from "chart.js/helpers";
import positioners from "./positioners.js";
import { textSize, parseFont } from "./custom-helpers";
import customDefaults from "./custom-defaults.js";

var PLUGIN_KEY = customDefaults.PLUGIN_KEY;

function collides(rect, otherRect) {
  return (
    rect.x < otherRect.x + otherRect.width &&
    rect.x + rect.width > otherRect.x &&
    rect.y < otherRect.y + otherRect.height &&
    rect.y + rect.height > otherRect.y
  );
}

export default {
  OutLabel: function (chart, index, ctx, config, context) {
    // Check whether the label should be displayed
    if (!resolve([config.display, true], context, index)) {
      throw new Error("Label display property is set to false.");
    }

    // Init text
    var value = context.dataset.data[index];
    var label = context.labels[index];
    var text = resolve([config.text, customDefaults.text], context, index);
    /* Replace label marker */
    text = text.replace(/%l/gi, label);

    /* Replace value marker with possible precision value */
    (text.match(/%v\.?(\d*)/gi) || [])
      .map(function (val) {
        var prec = val.replace(/%v\./gi, "");
        if (prec.length) {
          return +prec;
        }
        return config.valuePrecision || customDefaults.valuePrecision;
      })
      .forEach(function (val) {
        text = text.replace(/%v\.?(\d*)/i, value.toFixed(val));
      });

    /* Replace percent marker with possible precision value */
    (text.match(/%p\.?(\d*)/gi) || [])
      .map(function (val) {
        var prec = val.replace(/%p\./gi, "");
        if (prec.length) {
          return +prec;
        }
        return config.percentPrecision || customDefaults.percentPrecision;
      })
      .forEach(function (val) {
        text = text.replace(
          /%p\.?(\d*)/i,
          (context.percent * 100).toFixed(val) + "%"
        );
      });

    // Count lines
    var lines = text.match(/[^\r\n]+/g) || [];

    // Remove unnecessary spaces
    for (var i = 0; i < lines.length; ++i) {
      lines[i] = lines[i].trim();
    }

    /* ===================== CONSTRUCTOR ==================== */
    this.init = function (text, lines) {
      // If everything ok -> begin initializing
      this.encodedText = config.text;
      this.text = text;
      this.lines = lines;
      this.label = label;
      this.value = value;
      this.ctx = ctx;

      // Init style
      this.style = {
        backgroundColor: resolve(
          [config.backgroundColor, customDefaults.backgroundColor, "black"],
          context,
          index
        ),
        borderColor: resolve(
          [config.borderColor, customDefaults.borderColor, "black"],
          context,
          index
        ),
        borderRadius: resolve([config.borderRadius, 0], context, index),
        borderWidth: resolve([config.borderWidth, 0], context, index),
        lineWidth: resolve([config.lineWidth, 2], context, index),
        lineColor: resolve(
          [config.lineColor, customDefaults.lineColor, "black"],
          context,
          index
        ),
        color: resolve([config.color, "white"], context, index),
        font: parseFont(
          resolve([config.font, { resizable: true }]),
          ctx.canvas.style.height.slice(0, -2)
        ),
        padding: toPadding(resolve([config.padding, 0], context, index)),
        textAlign: resolve([config.textAlign, "left"], context, index),
      };

      this.stretch = resolve(
        [config.stretch, customDefaults.stretch],
        context,
        index
      );
      this.horizontalStrechPad = resolve(
        [config.horizontalStrechPad, customDefaults.horizontalStrechPad],
        context,
        index
      );
      this.size = textSize(ctx, this.lines, this.style.font);

      this.offsetStep = this.size.width / 20;
      this.offset = {
        x: 0,
        y: 0,
      };
    };

    this.init(text, lines);

    /* COMPUTING RECTS PART */
    this.computeLabelRect = function () {
      var width =
        this.textRect.width +
        2 * this.style.borderWidth +
        this.style.padding.left +
        this.style.padding.right;
      var height =
        this.textRect.height +
        2 * this.style.borderWidth +
        this.style.padding.top +
        this.style.padding.bottom;

      var x = this.textRect.x - this.style.borderWidth;
      var y = this.textRect.y - this.style.borderWidth;

      return {
        x: x,
        y: y,
        width: width,
        height: height,
        isLeft: this.textRect.isLeft,
        isTop: this.textRect.isTop,
      };
    };

    this.computeTextRect = function () {
      const isLeft = this.center.x - this.center.anchor.x < 0;
      const isTop = this.center.y - this.center.anchor.y < 0;
      const shift = isLeft
        ? -(this.horizontalStrechPad + this.size.width)
        : this.horizontalStrechPad;
      return {
        x: this.center.x - this.style.padding.left + shift,
        y: this.center.y - this.size.height / 2,
        width: this.size.width,
        height: this.size.height,
        isLeft,
        isTop,
      };
    };

    /* ======================= DRAWING ======================= */
    // Draw label text
    this.drawText = function () {
      var align = this.style.textAlign;
      var font = this.style.font;
      var lh = font.lineHeight;
      var color = this.style.color;
      var ilen = this.lines.length;
      var x, y, idx;

      if (!ilen || !color) {
        return;
      }

      x = this.textRect.x;
      y = this.textRect.y + lh / 2;

      if (align === "center") {
        x += this.textRect.width / 2;
      } else if (align === "end" || align === "right") {
        x += this.textRect.width;
      }

      this.ctx.font = this.style.font.string;
      this.ctx.fillStyle = color;
      this.ctx.textAlign = align;
      this.ctx.textBaseline = "middle";

      for (idx = 0; idx < ilen; ++idx) {
        this.ctx.fillText(
          this.lines[idx],
          Math.round(x) + this.style.padding.left,
          Math.round(y),
          Math.round(this.textRect.width)
        );
        y += lh;
      }
    };

    this.ccw = function (A, B, C) {
      return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    };

    this.intersects = function (A, B, C, D) {
      return (
        this.ccw(A, C, D) !== this.ccw(B, C, D) &&
        this.ccw(A, B, C) !== this.ccw(A, B, D)
      );
    };

    this.drawLine = function () {
      if (!this.lines.length) {
        return;
      }
      this.ctx.save();

      this.ctx.strokeStyle = this.style.lineColor;
      this.ctx.lineWidth = this.style.lineWidth;
      this.ctx.lineJoin = "miter";
      this.ctx.beginPath();
      this.ctx.moveTo(this.center.anchor.x, this.center.anchor.y);
      this.ctx.lineTo(this.center.copy.x, this.center.copy.y);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(this.center.copy.x, this.center.copy.y);
      const xOffset = this.textRect.width + this.style.padding.width;
      const intersect = this.intersects(
        this.textRect,
        {
          x: this.textRect.x + this.textRect.width,
          y: this.textRect.y + this.textRect.height,
        },
        this.center.copy,
        {
          x: this.textRect.x,
          y: this.textRect.y + this.textRect.height / 2,
        }
      );
      this.ctx.lineTo(
        this.textRect.x + (intersect ? xOffset : 0),
        this.textRect.y + this.textRect.height / 2
      );
      this.ctx.stroke();
      this.ctx.restore();
    };

    this.draw = function () {
      if (chart.getDataVisibility(index)) {
        this.drawText();
        this.drawLine();
      }
    };

    // eslint-disable-next-line max-statements
    this.update = function (view, elements, max) {
      this.center = positioners.center(view, this.stretch);

      let valid = false;
      let steps = 30;

      while (!valid && steps > 0) {
        this.textRect = this.computeTextRect();
        this.labelRect = this.computeLabelRect();

        valid = true;

        for (var e = 0; e < max; ++e) {
          var element = elements[e][PLUGIN_KEY];
          if (!element || !chart.getDataVisibility(index)) {
            continue;
          }

          if (collides(this.labelRect, element.labelRect)) {
            valid = false;
            break;
          }
        }

        if (!valid) {
          this.center = positioners.moveFromAnchor(this.center, 5);
        }

        steps--;
      }
    };
  },
};
