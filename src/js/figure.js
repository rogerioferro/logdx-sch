/**
 * @fileoverview Schematic Figure.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */

goog.provide('logdx.sch.Figure');

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
logdx.sch.Figure = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Canvas object.
   * @type {logdx.sch.Canvas?}
   */
  this.canvas = null;

  /**
   * Group Element.
   * @type {logdx.svg.GroupElement?}
   */
  this.group = null;
  
  /**
   * Limits of Figure.
   * @type {goog.math.Rect}
   */
  this.bounds = new goog.math.Rect(0,0,0,0);

};
goog.inherits(logdx.sch.Figure, goog.ui.Component);

/**
 * Add Figure to Canvas
 * @param {logdx.sch.Canvas} canvas Canvas object.
 */
logdx.sch.Figure.prototype.setCanvas = function(canvas) {
  this.canvas = canvas;
  
  this.group = this.canvas.svg_.createGroup( this.canvas.getFigureGroup() );

  this.shape = this.canvas.svg_.drawEllipse( 0, 0, 5, 5,
    this.group);
  this.shape.setAttributes({'fill' : '#f00',
                            'stroke' : '#000',
                            'stroke-width' : 0.2
                           });

  var box = this.group.getElement().getBBox();
  this.offsetX = box.x;
  this.offsetY = box.y;
  
  this.bounds.left  = box.x;
  this.bounds.top   = box.y;
  this.bounds.width = box.width;
  this.bounds.height= box.height;

//  this.canvas.setHandle(this.bounds, 0);

  //this.moveTo(new goog.math.Coordinate(50, 50));
};

/**
 * dispose
 * @override
 */
logdx.sch.Figure.prototype.dispose = function() {
};

/**
 * Translates this figure by the given offsets.
 * @param {goog.math.Coordinate} coord The coordinate
 * to translate this figure by.
 **/
logdx.sch.Figure.prototype.translate = function(coord) {
  var translantion = this.group.getTranslation();
  var x = translantion.x + coord.x;
  var y = translantion.y + coord.y;
  this.group.setTransformation(x, y, 0, 0, 0);
  this.bounds.translate(coord);
};

/**
 *  move to coordinate
 * @param {goog.math.Coordinate} coord Position to move.
 **/
logdx.sch.Figure.prototype.moveTo = function(coord) {
  this.group.setTransformation(coord.x, coord.y, 0, 0, 0);
  this.bounds.left = coord.x + this.offsetX;
  this.bounds.top = coord.y + this.offsetY;
};

/**
 * Verify if coordinate is inside the figure.
 * @param {goog.math.Coordinate} coord Position to move.
 * @return {boolean}
 **/
logdx.sch.Figure.prototype.contains = function(coord) {
  return this.bounds.contains(coord);
};
/** 
 * @return {goog.math.Size}
 */
logdx.sch.Figure.prototype.getSize = function () {
};
