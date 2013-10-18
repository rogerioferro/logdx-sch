
goog.provide('logdx.Transform');
goog.require('goog.math.Vec2');

/**
 * Transform Object.
 *
 * @param {number} x The x coordinate of origin.
 * @param {number} y The y coordinate of origin.
 * @param {number} rot The rotation angle.
 * @constructor
 */
logdx.Transform = function(x, y, rot) {
  this.origin = new goog.math.Vec2(x, y);
  this.axes   = this.computeAxes(rot);
};

logdx.Transform.prototype.transform = function(pt) {
  var x = { x:this.axes.x.x*pt.x, y:this.axes.x.y*pt.x };
  var y = { x:this.axes.y.x*pt.y, y:this.axes.y.y*pt.y };
  return new goog.math.Vec2(this.origin.x + x.x + y.x, this.origin.y + x.y + y.y);
};

logdx.Transform.prototype.inverseTransform = function(pt) {
  pt = goog.math.Vec2.difference(pt, this.origin);
  return new goog.math.Vec2(goog.math.Vec2.dot(this.axes.x, pt),
							goog.math.Vec2.dot(this.axes.y, pt));
};

logdx.Transform.prototype.computeAxes = function(angle) {
  angle   = angle / 180.0 * Math.PI;
  var sin = Math.sin(angle);
  var cos = Math.cos(angle);
  return {
	x: new goog.math.Vec2( cos, sin),
	y: new goog.math.Vec2(-sin, cos)
  };
};
