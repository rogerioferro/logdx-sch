goog.provide('logdx.sch.App');

goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.math');
goog.require('goog.style');
goog.require('goog.ui.Button');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.SplitPane');
goog.require('logdx.sch.Canvas');
goog.require('logdx.sch.Canvas.EventType');
goog.require('logdx.sch.shape.Oval');
goog.require('logdx.sch.paper');
goog.require('logdx.sch.sheet.orientation');
goog.require('logdx.sch.sheet.size');
goog.require('logdx.sch.toolbar');
goog.require('logdx.sch.toolpan');
goog.require('logdx.sch.toolselect');



/**
 * App Constructor.
 *
 * @param {Element} parent element.
 *
 * @constructor
 */
logdx.sch.App = function(parent) {

  /** @type {goog.math.Size} */
  this.ppi = this.getMonitorPpi();
  //this.ppi = new goog.math.Size(110.27,110.27);

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
   * @type {logdx.sch.Canvas}
   */
  this.canvas = new logdx.sch.Canvas(this.ppi);
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
    //console.log('resize windows...');
  };
  goog.events.listen(vsm, goog.events.EventType.RESIZE, content_resize);
  content_resize();

  this.canvas.listen(logdx.sch.Canvas.EventType.ZOOM, function(e) {
    this.toolbar.updateZoom(e.target.getZoom());
  },false, this);

  this.canvas.fitToScreen();

  //this.canvas.setTool(new logdx.sch.toolselect());
  this.canvas.setTool(new logdx.sch.toolpan(),
    goog.events.BrowserEvent.MouseButton.MIDDLE);

	
  this.setTool(logdx.sch.App.Tools.POINTER);
  
  /**
   * Event handler for this object.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eh_ = new goog.events.EventHandler(this);
  this.eh_.listen(document, goog.events.EventType.KEYDOWN, this.onKeyDown_);
  this.eh_.listen(document, goog.events.EventType.KEYUP, this.onKeyUp_);
	
//----------------------------------------------------
//Only for test purpose
  var fig1 = new logdx.sch.shape.Oval();
  var fig2 = new logdx.sch.shape.Oval();

  fig1.moveTo(new goog.math.Coordinate(20, 50));
  
  fig2.moveTo(new goog.math.Coordinate(100, 100));
  fig2.rotate(45);

  fig1.addToCanvas(this.canvas);
  fig1.select();
  fig2.addToCanvas(this.canvas);
  fig2.select();
  
  var i = 9;
  while(--i){
    var f = new logdx.sch.shape.Oval();
    f.moveTo(new goog.math.Coordinate(100, 50));
    f.rotate(45 * i + 15);
    f.addToCanvas(this.canvas);
    f.select();
  }
  
  //fig1.remove();
  //fig1.addToCanvas(this.canvas);
//----------------------------------------------------
  


  //console.log('x:'+this.dpi.width+';y:'+this.dpi.height);
};


/**
 * Enum for tools types
 * @enum {number}
 */
logdx.sch.App.Tools = {
  POINTER   : 0,
  PAN       : 1,
  ZOOM_IN   : 2,
  ZOOM_OUT  : 3
};


/**
 * Set current Tool.
 * @param {logdx.sch.App.Tools} tool Tool to set.
 */
logdx.sch.App.prototype.setTool = function(tool) {
  if (this.tool == tool) return;
  var tools = logdx.sch.App.Tools;
  switch (tool) {
    case tools.POINTER:
      //console.log('POINTER');
      this.canvas.setTool(new logdx.sch.toolselect());
      break;
    case tools.PAN:
      //console.log('PAN');
      this.canvas.setTool(new logdx.sch.toolpan(true));
      break;
  }
  this.tool_ = tool;
  this.toolbar.updateTool();
};

/**
 * Get current Tool.
 */
logdx.sch.App.prototype.getTool = function() {
  return this.tool_;
};


/**
 * Fired when key goes down.
 * @param {goog.events.Event} event The key event.
 * @private
 */
logdx.sch.App.prototype.onKeyDown_ = function(event) {
  if (!this.keyControl_){
    var keyCodes = goog.events.KeyCodes;
    switch (event.keyCode) {
      case keyCodes.ESC:
        this.setTool(logdx.sch.App.Tools.POINTER);
        break;
      case keyCodes.SPACE:
        this.oldTool_ = this.tool_;
        this.setTool(logdx.sch.App.Tools.PAN);
        break;
    }
  }
  this.keyControl_ = true;
};
/**
 * Fired when key goes up.
 * @param {goog.events.Event} event The key event.
 * @private
 */
logdx.sch.App.prototype.onKeyUp_ = function(event) {
  this.keyControl_ = false;
  var keyCodes = goog.events.KeyCodes;
  switch (event.keyCode) {
    case keyCodes.SPACE:
      this.setTool(this.oldTool_);
      break;
  }
};

/**
 * Setup Dialog.
 */
logdx.sch.App.prototype.setupDialog = function() {

  var hp = goog.dom.createDom('p');
  var hlabel = goog.dom.createDom('label', {'for': 'hppi'});
  goog.dom.setTextContent(hlabel, 'Horizontal PPI:');
  var hinput = goog.dom.createDom('input',
              {'name' : 'ppi', 'id': 'hppi',
               'type' : 'number',
               'size': 5,
               'min' : 0,
               'max' : 1000});
  goog.dom.appendChild(hp, hlabel);
  goog.dom.appendChild(hp, hinput);

  var vp = goog.dom.createDom('p');
  var vlabel = goog.dom.createDom('label', {'for': 'vppi'});
  goog.dom.setTextContent(vlabel, 'Vertical PPI:');
  var vinput = goog.dom.createDom('input',
              {'name' : 'ppi', 'id': 'vppi',
               'type' : 'number',
               'size': 5,
               'min' : 0,
               'max' : 1000});
  goog.dom.appendChild(vp, vlabel);
  goog.dom.appendChild(vp, vinput);

  var div = goog.dom.createDom('div');
  goog.dom.appendChild(div, hp);
  goog.dom.appendChild(div, vp);

  var button = new goog.ui.Button('Detect PPI');

  var dlg = new goog.ui.Dialog();
  goog.dom.appendChild(dlg.getContentElement(), div);
  dlg.addChild(button, true);
  dlg.setTitle('Setup');
  dlg.setButtonSet(goog.ui.Dialog.ButtonSet.OK_CANCEL);
  dlg.setVisible(true);

  hinput.value = this.ppi.width;
  vinput.value = this.ppi.height;

  button.listen(goog.ui.Component.EventType.ACTION, function(e) {
    var size = this.getMonitorPpi();
    hinput.value = size.width;
    vinput.value = size.height;
  },false, this);


  goog.events.listen(dlg, goog.ui.Dialog.EventType.SELECT, function(e) {
    if (e.key == 'ok') {
      var hppi = parseInt(hinput.value, 10);
      var vppi = parseInt(vinput.value, 10);
      if (goog.math.isFiniteNumber(hppi) && goog.math.isFiniteNumber(vppi)) {
        this.ppi.width = hppi;
        this.ppi.height = vppi;
        this.canvas.setPpi(this.ppi);
      }
    }
    dlg.dispose();
  },false, this);
};

/**
 * Get Monitor PPI.
 * @return {goog.math.Size}
 */
logdx.sch.App.prototype.getMonitorPpi = function() {
  var header = {'style': 'position:absolute;width:1000in; height:1000in;'};
  var element = goog.dom.createDom('div', header);
  goog.dom.appendChild(document.body, element);
  /** @type {goog.math.Size} */
  var size = goog.style.getSize(element);
  size.width /= 1000;
  size.height /= 1000;
  goog.dom.removeNode(element);
  return size;
};
