goog.provide('logdx.sch.init');

goog.require('goog.dom');
goog.require('logdx.sch.app');


/**
 * Init the App
 * @constructor
 */
logdx.sch.init = function() {
  var header = {'style': 'background:#000;height:20px'};
  var element = goog.dom.createDom('div', header);
  goog.dom.appendChild(document.body, element);

  var app = new logdx.sch.app(document.body);
};

goog.exportSymbol('logdx.sch.init', logdx.sch.init);
