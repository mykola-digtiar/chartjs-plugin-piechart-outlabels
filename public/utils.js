'use strict';

(function(global) {
  var Samples = global.Samples || (global.Samples = {});
  var Color = global.Color;

  function fallback(/* values ... */) {
    for (var i = 0; i < arguments.length; ++i) {
      var v = arguments[i];
      if (v !== undefined) {
        return v;
      }
    }
  }

  Samples.COLORS = [
    '#FF3784',
    '#36A2EB',
    '#4BC0C0',
    '#F77825',
    '#9966FF',
    '#00A8C6',
    '#379F7A',
    '#CC2738',
    '#8B628A',
    '#8FBE00',
    '#606060',
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#34495e',
    '#f1c40f',
    '#f39c12',
    '#F44336',
    '#00BCD4',
    '#CDDC39'
  ];

  Samples.LABELS = 'crow;cut;gabby;mute;soak;telephone;iron;steel;numberless;shirt;mind;knowledgeable;icy;bath;spurious;stove;chickens;knock;squealing;shelter;apologise;tire;visit;endurable;truck;curtain;lumpy;wren;spot;common;plate;view;true;stranger;last;picture;poke;sweater;chew;hesitant;thing;war;bored;faithful;undress;simplistic;numerous;talk;stale;leather'.match(/[^;]+/g);

  Samples.LABELS.forEach(function(item, i, arr) {
    arr[i] = item.trim();
  });

  // Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
  Samples.srand = function(seed) {
    this._seed = seed;
  };

  Samples.rand = function(min, max) {
    var seed = this._seed;
    min = min === undefined ? 0 : min;
    max = max === undefined ? 1 : max;
    this._seed = (seed * 9301 + 49297) % 233280;
    return min + (this._seed / 233280) * (max - min);
  };

  Samples.numbers = function(config) {
    var cfg = config || {};
    var min = fallback(cfg.min, 0);
    var max = fallback(cfg.max, 1);
    var from = fallback(cfg.from, []);
    var count = fallback(cfg.count, 8);
    var decimals = fallback(cfg.decimals, 8);
    var continuity = fallback(cfg.continuity, 1);
    var dfactor = Math.pow(10, decimals) || 0;
    var data = [];
    var i, value;

    for (i = 0; i < count; ++i) {
      value = (from[i] || 0) + this.rand(min, max);
      if (this.rand() <= continuity) {
        data.push(Math.round(dfactor * value) / dfactor);
      } else {
        data.push(null);
      }
    }

    return data;
  };

  Samples.color = function(offset) {
    var count = Samples.COLORS.length;
    var index = offset === undefined ? ~~Samples.rand(0, count) : offset;
    return Samples.COLORS[index % count];
  };

  Samples.colors = function(config) {
    var cfg = config || {};
    var color = cfg.color || Samples.color(0);
    var count = cfg.count !== undefined ? cfg.count : 8;
    var method = cfg.mode ? Color.prototype[cfg.mode] : null;
    var values = [];
    var i, f, v;

    for (i = 0; i < count; ++i) {
      f = i / count;

      if (method) {
        v = method.call(Color(color), f).rgbString();
      } else {
        v = Samples.color(i);
      }

      values.push(v);
    }

    return values;
  };

  Samples.transparentize = function(color, opacity) {
    var alpha = opacity === undefined ? 0.5 : 1 - opacity;
    return Color(color).alpha(alpha).rgbString();
  };

  // INITIALIZATION

  Samples.srand(Date.now());
}(this));
