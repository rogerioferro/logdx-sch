/**
 * @fileoverview Schematic Oval Figure.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */

 goog.provide('logdx.sch.shape.Oval');

 goog.require('logdx.sch.Figure');



 /**
 * Select class
 *
 * @extends {logdx.sch.Figure}
 * @constructor
 */
logdx.sch.shape.Oval = function() {
  logdx.sch.Figure.call(this);
  
  
};
goog.inherits(logdx.sch.shape.Oval, logdx.sch.Figure);

/**
* Create shape
*
* @override
*/
logdx.sch.shape.Oval.prototype.createShape = function() {
  this.shape =this.canvas_.getSvg().drawEllipse( 0, 0, 5, 10,
    this.svgElement_);
    
  this.svgElement_.setAttributes({'fill' : '#008',
                                  'fill-opacity' : 1,
                                  'stroke' : '#000',
                                  'stroke-width' : 0.2
                                });
};