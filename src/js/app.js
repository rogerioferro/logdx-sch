goog.provide('logdx.sch.app');

goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.SplitPane');
goog.require('logdx.sch.canvas');
goog.require('logdx.sch.paper');
goog.require('logdx.sch.sheet.orientation');
goog.require('logdx.sch.sheet.size');
goog.require('logdx.sch.toolbar');



/**
 * App Constructor.
 *
 * @param {Element} parent element.
 *
 * @constructor
 */
logdx.sch.app = function(parent) {
  this.toolbar = new logdx.sch.toolbar(parent, this);

  /**
   * The paper properties.
   * @type {logdx.sch.paper}
   */
  this.paper = new logdx.sch.paper(logdx.sch.sheet.size.A3,
    logdx.sch.sheet.orientation.LANDSCAPE);

  /**
   * Library object.
   * @type {goog.ui.Component}
   */
  this.library = new goog.ui.Component();
  /**
   * Canvas object.
   * @type {logdx.sch.canvas}
   */
  this.canvas = new logdx.sch.canvas();
  this.canvas.setSheetSize(new goog.math.Size(
      this.paper.getWidth(), this.paper.getHeight()));

  var content = new goog.ui.SplitPane(this.library, this.canvas,
    goog.ui.SplitPane.Orientation.HORIZONTAL);

  content.setInitialSize(100);
  content.setHandleSize(5);
  content.render(parent);

  var vsm = new goog.dom.ViewportSizeMonitor();
  var content_resize = function() {
    var size = vsm.getSize();
    var pos = goog.style.getClientPosition(content.getElement());
    size.height -= pos.y;
    size.width -= pos.x;
    content.setSize(size);
  };
  goog.events.listen(vsm, goog.events.EventType.RESIZE, content_resize);
  content_resize();
  
  this.canvas.listen(logdx.sch.canvas.EventType.ZOOM, function(e){
    this.toolbar.updateZoom(e.target.getZoom());
  },false,this);

};
