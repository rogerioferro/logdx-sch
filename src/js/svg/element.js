/**
 * @fileoverview SVG Element base class.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 * 
 * Based on goog.graphics.Element Code.
 * 
 */

goog.provide('logdx.svg.Element');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.math.Coordinate');


/**
 * Thin wrappers around the DOM element returned from
 * the different draw methods of the SVG.
 * 
 * @param {Element} element  The DOM element to wrap.
 * @param {logdx.svg.Canvas} svgCanvas  The SVG Canvas creating this element.
 * 
 * @constructor
 * @extends {goog.events.EventTarget}
 */
logdx.svg.Element = function(element, svgCanvas) {
  goog.events.EventTarget.call(this);
  this.element_ = element;
  this.svgCanvas_ = svgCanvas;

  /**
   * Specifies the translation transformation
   * @type {goog.math.Coordinate}
   * @private
   */
  this.translate_ = new goog.math.Coordinate();

  /**
   * Specifies the rotate angle transformation
   * @type {number}
   * @private
   */
  this.rotateAngle_ = 0;

  /**
   * Specifies the rotate center transformation
   * @type {goog.math.Coordinate}
   * @private
   */
  this.rotateCenter_ = new goog.math.Coordinate();
};
goog.inherits(logdx.svg.Element, goog.events.EventTarget);

/**
 * The SVG Canvas that contains this element.
 * @type {logdx.svg.Canvas?}
 * @private
 */
logdx.svg.Element.prototype.svgCanvas_ = null;

/**
 * The native browser element this class wraps.
 * @type {Element}
 * @private
 */
logdx.svg.Element.prototype.element_ = null;

/**
 * Returns the underlying object.
 * @return {Element} The underlying element.
 */
logdx.svg.Element.prototype.getElement = function() {
  return this.element_;
};

/**
 * Returns the SVG Canvas.
 * @return {logdx.svg.Canvas} The SVG canvas that created the element.
 */
logdx.svg.Element.prototype.getSvgCanvas = function() {
  return this.svgCanvas_;
};

/**
 * Set the color of the stroke.
 * @param {Object} attributes Map of name-value pairs for attributes.
 */
logdx.svg.Element.prototype.setAttributes = function(attributes) {
  this.getSvgCanvas().setElementAttributes(this.getElement(), attributes);
};

/**
 * Set the transformation of the element.
 * @param {number} x The x coordinate of the translation transform.
 * @param {number} y The y coordinate of the translation transform.
 * @param {number} angle The angle of the rotation transform.
 * @param {number} centerX The horizontal center of the rotation transform.
 * @param {number} centerY The vertical center of the rotation transform.
 */
logdx.svg.Element.prototype.setTransformation = function(x, y, angle,
    centerX, centerY) {
  this.translate_.x = x;
  this.translate_.y = y;
  this.rotateAngle_ = angle;
  this.rotateCenter_.x = centerX;
  this.rotateCenter_.y = centerY;
  this.getElement().setAttribute('transform', 'translate(' + x + ',' + y +
      ') rotate(' + angle + ' ' + centerX + ' ' + centerY + ')');
};

/**
 * @return {goog.math.Coordinate} The translation transformation applied to
 *     this element.
 */
logdx.svg.Element.prototype.getTranslation = function() {
  return this.translate_.clone();
};
