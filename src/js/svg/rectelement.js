/**
 * @fileoverview SVG Rectangle Element class.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 * 
 * Based on goog.graphics.SvgRectElement Code.
 * 
 */

goog.provide('logdx.svg.RectElement');

goog.require('logdx.svg.Element');


/**
 * SVG Rectangle Element.
 * @param {Element} element The DOM element to wrap.
 * @param {logdx.svg.Canvas} svgCanvas The SVG creating this element.
 * @constructor
 * @extends {logdx.svg.Element}
 */
logdx.svg.RectElement = function(element, svgCanvas) {
  logdx.svg.Element.call(this, element, svgCanvas);
};
goog.inherits(logdx.svg.RectElement, logdx.svg.Element);

/**
 * Update the position of the rectangle.
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 */
logdx.svg.RectElement.prototype.setPosition = function(x, y) {
  this.getSvgCanvas().setElementAttributes(this.getElement(),
      {'x': x, 'y': y});
};

/**
 * Update the size of the rectangle.
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 */
logdx.svg.RectElement.prototype.setSize = function(width, height) {
  this.getSvgCanvas().setElementAttributes(this.getElement(),
      {'width': width, 'height': height});
};
