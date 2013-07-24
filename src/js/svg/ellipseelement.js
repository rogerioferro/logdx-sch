/**
 * @fileoverview SVG Ellipse Element class.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 * 
 * Based on goog.graphics.SvgEllipseElement Code.
 * 
 */

goog.provide('logdx.svg.EllipseElement');

goog.require('logdx.svg.Element');



/**
 * SVG Ellipse Element.
 * @param {Element} element The DOM element to wrap.
 * @param {logdx.svg.Canvas} svgCanvas The SVG creating this element.
 * @constructor
 * @extends {logdx.svg.Element}
 */
logdx.svg.EllipseElement = function(element, svgCanvas) {
  logdx.svg.Element.call(this, element, svgCanvas);
};
goog.inherits(logdx.svg.EllipseElement, logdx.svg.Element);

/**
 * Update the center point of the ellipse.
 * @param {number} cx Center X coordinate.
 * @param {number} cy Center Y coordinate.
 */
logdx.svg.EllipseElement.prototype.setCenter = function(cx, cy) {
  this.getSvgCanvas().setElementAttributes(this.getElement(),
      {'cx': cx, 'cy': cy});
};


/**
 * Update the radius of the ellipse.
 * @param {number} rx Radius length for the x-axis.
 * @param {number} ry Radius length for the y-axis.
 */
logdx.svg.EllipseElement.prototype.setRadius = function(rx, ry) {
  this.getSvgCanvas().setElementAttributes(this.getElement(),
      {'rx': rx, 'ry': ry});
};
