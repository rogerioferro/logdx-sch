/**
 * @fileoverview SVG Group Element base class.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 * 
 * Based on goog.graphics.SvgGroupElement Code.
 * 
 */

goog.provide('logdx.svg.GroupElement');

goog.require('logdx.svg.Element');


/**
 * SVG Group Element.
 * @param {Element} element The DOM element to wrap.
 * @param {logdx.svg.Canvas} svgCanvas The SVG creating this element.
 * @constructor
 * @extends {logdx.svg.Element}
 */
logdx.svg.GroupElement = function(element, svgCanvas) {
  logdx.svg.Element.call(this, element, svgCanvas);
};
goog.inherits(logdx.svg.GroupElement, logdx.svg.Element);


/**
 * Remove all drawing elements from the group.
 */
logdx.svg.GroupElement.prototype.clear = function() {
  goog.dom.removeChildren(this.getElement());
};


/**
 * Set the size of the group element.
 * @param {number|string} width The width of the group element.
 * @param {number|string} height The height of the group element.
 */
logdx.svg.GroupElement.prototype.setSize = function(width, height) {
  this.getSvgCanvas().setElementAttributes(this.getElement(),
      {'width': width, 'height': height});
};
