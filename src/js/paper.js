goog.provide('logdx.sch.paper');
goog.provide('logdx.sch.sheet.orientation');
goog.provide('logdx.sch.sheet.size');

/**
 *
 * @param {logdx.sch.sheet.size} size Paper size.
 * @param {logdx.sch.sheet.orientation} orientation Paper orientation.
 * @param {number=} opt_width If size == CUSTOM needs width.
 * @param {number=} opt_height If size == CUSTOM needs height.
 *
 * @constructor
 */
logdx.sch.paper = function(size, orientation, opt_width, opt_height) {
  this.setSize(size, opt_width, opt_height);
  this.setOrientation(orientation);
};
/**
 * @param {logdx.sch.sheet.size} size Paper size.
 * @param {number=} opt_width If size == CUSTOM needs width.
 * @param {number=} opt_height If size == CUSTOM needs height.
 */
logdx.sch.paper.prototype.setSize = function(size, opt_width, opt_height) {
  /** @type {logdx.sch.sheet.size} */
  this.size = size;
  /** @type {number} */
  this.width = logdx.sch.sheet.def_size[this.size].width || opt_width;
  /** @type {number} */
  this.height = logdx.sch.sheet.def_size[this.size].height || opt_height;
};
/**
 * @param {logdx.sch.sheet.orientation} orientation Paper orientation.
 */
logdx.sch.paper.prototype.setOrientation = function(orientation) {
  /** @type {logdx.sch.sheet.orientation} */
  this.orientation_ = orientation;
};

/**
 * Return calculated width of paper in mm.
 * @return {number}
 */
logdx.sch.paper.prototype.getWidth = function() {
  return (this.orientation_ == logdx.sch.sheet.orientation.PORTRAIT ?
    this.width : this.height);
};
/**
 * Return calculated height of paper in mm.
 * @return {number}
 */
logdx.sch.paper.prototype.getHeight = function() {
  return (this.orientation_ == logdx.sch.sheet.orientation.PORTRAIT ?
    this.height : this.width);
};

/**
 * Enum for sheet orientation
 * @enum {number}
 */
logdx.sch.sheet.orientation = { LANDSCAPE: 0, PORTRAIT: 1};

/**
 * Enum for sheet size
 * @enum {string}
 */
logdx.sch.sheet.size = {
  A0: 'a0',
  A1: 'a1',
  A2: 'a2',
  A3: 'a3',
  A4: 'a4',
  A5: 'a5',
  A6: 'a6',
  A7: 'a7',
  A8: 'a8',
  A9: 'a9',
  A10: 'a10',
  CUSTOM: 'custom'
};

/** @typedef {{title: string, width: number, height: number}} */
logdx.sch.sheet.def_size_type;

/**
 * Defined Paper sizes
 * width and height are in "mm"
 * @type {Object.<logdx.sch.sheet.size,logdx.sch.sheet.def_size_type>}
 */
logdx.sch.sheet.def_size = {
  'a0' : { title: 'A0(84,1cm x  118,9cm)',
          width: 841, height: 1189},
  'a1' : { title: 'A1(59,4cm x  84,1cm)',
          width: 594, height: 841},
  'a2' : { title: 'A2(42,0cm x  59,4cm)',
          width: 420, height: 594},
  'a3' : { title: 'A3(29,7cm x  42,0cm)',
          width: 297, height: 420},
  'a4' : { title: 'A4(21,0cm x  29,7cm)',
          width: 210, height: 297},
  'a5' : { title: 'A5(14,8cm x  21,0cm)',
          width: 148, height: 210},
  'a6' : { title: 'A6(10,5cm x  14,8cm)',
          width: 105, height: 148},
  'a7' : { title: 'A7(7,4cm x  10,5cm)',
          width: 74, height: 105},
  'a8' : { title: 'A8(5,2cm x  7,4cm)',
          width: 52, height: 74},
  'a9' : { title: 'A9(3,7cm x  5,2cm)',
          width: 37, height: 52},
  'a10' : { title: 'A10(2,6cm x  3,7cm)',
           width: 26, height: 37},
  'custom' : { title: 'Custom Size' }
};
