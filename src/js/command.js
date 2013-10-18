/**
 * @fileoverview Schematic Command.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */
goog.provide('logdx.sch.Command');


goog.require('goog.math');
goog.require('goog.Disposable');




/**
 * Command object
 *
 * @extends {goog.Disposable}
 * @constructor
 */
logdx.sch.Command = function() {
  goog.Disposable.call(this);
  
  
};
goog.inherits(logdx.sch.Command, goog.Disposable);
