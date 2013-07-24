/**
 * @fileoverview SVG base class.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 * 
 * Based on goog.graphics.SvgGraphics Code.
 * 
 */
 
goog.provide('logdx.svg.Canvas');
 
goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.ui.Component');
goog.require('logdx.svg.EllipseElement');
goog.require('logdx.svg.GroupElement');
goog.require('logdx.svg.RectElement');


/**
 * Svg component
 *
 * @param {number|string} width The width in pixels or percent.
 * @param {number|string} height The height in pixels or percent.
 * @param {?number=} opt_coordWidth Optional coordinate system width - if
 *     omitted or null, defaults to same as width.
 * @param {?number=} opt_coordHeight Optional coordinate system height - if
 *     omitted or null, defaults to same as height.
 * @param {goog.dom.DomHelper=} opt_domHelper The DOM helper object for the
 *     document we want to render in.
 *
 * @extends {goog.ui.Component}
 * @constructor
 */
logdx.svg.Canvas = function(width, height,
                     opt_coordWidth, opt_coordHeight,
                     opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Width of svg in pixels or percentage points.
   * @type {number|string}
   * @protected
   */
  this.width = width;

  /**
   * Height of svg in pixels or precentage points.
   * @type {number|string}
   * @protected
   */
  this.height = height;

  /**
   * Width of coordinate system in units.
   * @type {?number}
   * @protected
   */
  this.coordWidth = opt_coordWidth || null;

  /**
   * Height of coordinate system in units.
   * @type {?number}
   * @protected
   */
  this.coordHeight = opt_coordHeight || null;
};
goog.inherits(logdx.svg.Canvas, goog.ui.Component);

/**
 * The SVG namespace URN
 * @private
 * @type {string}
 */
logdx.svg.Canvas.SVG_NS_ = 'http://www.w3.org/2000/svg';

/**
 * Svg element for definitions for other elements, e.g. linear gradients.
 * @type {Element}
 * @private
 */
logdx.svg.Canvas.prototype.defsElement_;

/**
 * The root level group element.
 * @type {logdx.svg.GroupElement?}
 * @protected
 */
logdx.svg.Canvas.prototype.canvasElement = null;

/**
 * Left coordinate of the view box
 * @type {number}
 * @protected
 */
logdx.svg.Canvas.prototype.coordLeft = 0;

/**
 * Top coordinate of the view box
 * @type {number}
 * @protected
 */
logdx.svg.Canvas.prototype.coordTop = 0;

/**
 * Creates an SVG element. Used internally and by different SVG classes.
 * @param {string} tagName The type of element to create.
 * @param {Object=} opt_attributes Map of name-value pairs for attributes.
 * @return {Element} The created element.
 * @private
 */
logdx.svg.Canvas.prototype.createSvgElement_ = function(tagName, opt_attributes) {
  var element = this.dom_.getDocument().createElementNS(
      logdx.svg.Canvas.SVG_NS_, tagName);

  if (opt_attributes) {
    this.setElementAttributes(element, opt_attributes);
  }

  return element;
};

/**
 * Sets properties to an SVG element. Used internally and by different
 * SVG elements.
 * @param {Element} element The svg element.
 * @param {Object} attributes Map of name-value pairs for attributes.
 */
logdx.svg.Canvas.prototype.setElementAttributes = function(element, attributes) {
  for (var key in attributes) {
    element.setAttribute(key, attributes[key]);
  }
};

/**
 * Appends an element.
 *
 * @param {logdx.svg.Element} element The element wrapper.
 * @param {logdx.svg.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 * @private
 */
logdx.svg.Canvas.prototype.append_ = function(element, opt_group) {
  var parent = opt_group || this.canvasElement;
  parent.getElement().appendChild(element.getElement());
};

/**
 * Creates the DOM representation of the graphics area.
 * @override
 */
logdx.svg.Canvas.prototype.createDom = function() {
  // Set up the standard attributes.
  var attributes = {
    'width': this.width,
    'height': this.height,
    'overflow': 'hidden'
  };

  var svgElement = this.createSvgElement_('svg', attributes);

  var groupElement = this.createSvgElement_('g');

  this.defsElement_ = this.createSvgElement_('defs');
  this.canvasElement = new logdx.svg.GroupElement(groupElement, this);

  svgElement.appendChild(this.defsElement_);
  svgElement.appendChild(groupElement);

  // Use the svgElement as the root element.
  this.setElementInternal(svgElement);

  // Set up the coordinate system.
  this.setViewBox_();
};

/**
 * Changes the coordinate system position.
 * @param {number} left The coordinate system left bound.
 * @param {number} top The coordinate system top bound.
 */
logdx.svg.Canvas.prototype.setCoordOrigin = function(left, top) {
  this.coordLeft = left;
  this.coordTop = top;

  this.setViewBox_();
};

/**
 * Changes the coordinate size.
 * @param {number} coordWidth The coordinate width.
 * @param {number} coordHeight The coordinate height.
 */
logdx.svg.Canvas.prototype.setCoordSize = function(coordWidth,
    coordHeight) {
  this.coordWidth = coordWidth;
  this.coordHeight = coordHeight;

  this.setViewBox_();
};

/**
 * @return {string} The view box string.
 * @private
 */
logdx.svg.Canvas.prototype.getViewBox_ = function() {
  return this.coordLeft + ' ' + this.coordTop + ' ' +
      (this.coordWidth ? this.coordWidth + ' ' + this.coordHeight : '');
};

/**
 * Sets up the view box.
 * @private
 */
logdx.svg.Canvas.prototype.setViewBox_ = function() {
  if (this.coordWidth || this.coordLeft || this.coordTop) {
    var element = this.getElement();
    element.setAttribute('preserveAspectRatio', 'none');
    element.setAttribute('viewBox', this.getViewBox_());
  }
};

/**
 * Change the size of the canvas.
 * @param {number} pixelWidth The width in pixels.
 * @param {number} pixelHeight The height in pixels.
 */
logdx.svg.Canvas.prototype.setSize = function(pixelWidth, pixelHeight) {
  goog.style.setSize(this.getElement(), pixelWidth, pixelHeight);
};

/**
 * Remove all drawing elements from the graphics.
 */
logdx.svg.Canvas.prototype.clear = function() {
  this.canvasElement.clear();
  goog.dom.removeChildren(this.defsElement_);
  //this.defs_ = {};
};

/**
 * Remove a single drawing element from the surface.  The default implementation
 * assumes a DOM based drawing surface.
 * @param {logdx.svg.Element} element The element to remove.
 */
logdx.svg.Canvas.prototype.removeElement = function(element) {
  goog.dom.removeNode(element.getElement());
};

/**
 * Draw an ellipse.
 *
 * @param {number} cx Center X coordinate.
 * @param {number} cy Center Y coordinate.
 * @param {number} rx Radius length for the x-axis.
 * @param {number} ry Radius length for the y-axis.
 * @param {logdx.svg.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {logdx.svg.EllipseElement} The newly created element.
 */
logdx.svg.Canvas.prototype.drawEllipse = function(cx, cy, rx, ry, opt_group) {
  var element = this.createSvgElement_('ellipse',
      {'cx': cx, 'cy': cy, 'rx': rx, 'ry': ry});
  var wrapper = new logdx.svg.EllipseElement(element, this);
  this.append_(wrapper, opt_group);
  return wrapper;
};

/**
 * Draw a rectangle.
 *
 * @param {number} x X coordinate (left).
 * @param {number} y Y coordinate (top).
 * @param {number} width Width of rectangle.
 * @param {number} height Height of rectangle.
 * @param {logdx.svg.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {logdx.svg.RectElement} The newly created element.
 */
logdx.svg.Canvas.prototype.drawRect = function(x, y, width, height, opt_group) {
  var element = this.createSvgElement_('rect',
      {'x': x, 'y': y, 'width': width, 'height': height});
  var wrapper = new logdx.svg.RectElement(element, this);
  this.append_(wrapper, opt_group);
  return wrapper;
};

/**
 * Create an empty group of drawing elements.
 *
 * @param {logdx.svg.GroupElement=} opt_group The group wrapper element
 *     to append to. If not specified, appends to the main canvas.
 *
 * @return {logdx.svg.GroupElement} The newly created group.
 */
logdx.svg.Canvas.prototype.createGroup = function(opt_group) {
  var element = this.createSvgElement_('g');
  var parent = opt_group || this.canvasElement;
  parent.getElement().appendChild(element);
  return new logdx.svg.GroupElement(element, this);
};
