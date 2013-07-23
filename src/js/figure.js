/**
 * @fileoverview Schematic Figure.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */

goog.provide('logdx.sch.figure');

goog.require('goog.math');
goog.require('goog.ui.Component');


/**
 * Figure component
 *
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper to use.
 *
 * @extends {goog.ui.Component}
 * @constructor
 */
logdx.sch.figure = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Canvas object.
   * @type {logdx.sch.canvas?}
   */
  this.canvas = null;

  /**
   * Group Element.
   * @type {goog.graphics.GroupElement?}
   */
  this.group = null;

};
goog.inherits(logdx.sch.figure, goog.ui.Component);

/**
 * Add Figure to Canvas
 * @param {logdx.sch.canvas} canvas Canvas object.
 */
logdx.sch.figure.prototype.setCanvas = function(canvas) {
  this.canvas = canvas;

  this.group = this.canvas.graphics.createGroup();
  var stroke = new goog.graphics.Stroke(0.2, '#000');

  this.rect = new goog.math.Rect(0, 0, 10, 10);
  this.shape = this.canvas.graphics.drawEllipse(
    this.rect.width / 2, this.rect.height / 2,
    this.rect.width / 2, this.rect.height / 2,
    stroke, null, this.group);

  this.moveTo(new goog.math.Coordinate(50, 50));
};

/**
 * Translates this figure by the given offsets.
 * @param {goog.math.Coordinate} coord The coordinate
 * to translate this figure by.
 **/
logdx.sch.figure.prototype.translate = function(coord) {
  var transform = this.group.getTransform();
  var x = transform.getTranslateX() + coord.x;
  var y = transform.getTranslateY() + coord.y;
  this.group.setTransformation(x, y, 0, 0, 0);
  this.rect.translate(coord);
};

/**
 *  move to coordinate
 * @param {goog.math.Coordinate} coord Position to move.
 **/
logdx.sch.figure.prototype.moveTo = function(coord) {
  this.group.setTransformation(coord.x, coord.y, 0, 0, 0);
  this.rect.left = coord.x;
  this.rect.top = coord.y;
};

/**
 * Verify if coordinate is inside the figure.
 * @param {goog.math.Coordinate} coord Position to move.
 * @return {boolean}
 **/
logdx.sch.figure.prototype.contains = function(coord) {
  return this.rect.contains(coord);
};
