goog.provide('logdx.sch.app');

goog.require('goog.dom');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.SplitPane');

goog.require('goog.events.EventType');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.Button');

goog.require('logdx.sch.canvas');
goog.require('logdx.sch.canvas.EventType');
goog.require('logdx.sch.paper');
goog.require('logdx.sch.sheet.orientation');
goog.require('logdx.sch.sheet.size');
goog.require('logdx.sch.toolbar');

goog.require('logdx.sch.toolselect');
goog.require('logdx.sch.toolpan');


/**
 * App Constructor.
 *
 * @param {Element} parent element.
 *
 * @constructor
 */
logdx.sch.app = function(parent) {

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
   * @type {logdx.sch.canvas}
   */
  this.canvas = new logdx.sch.canvas(this.ppi);
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
  
  this.canvas.listen(logdx.sch.canvas.EventType.ZOOM, function(e){
    this.toolbar.updateZoom(e.target.getZoom());
  },false,this);
  
  this.canvas.setTool(new logdx.sch.toolselect());
  this.canvas.setTool(new logdx.sch.toolpan(),
    goog.events.BrowserEvent.MouseButton.MIDDLE);
  
  //console.log('x:'+this.dpi.width+';y:'+this.dpi.height);
  
};

/**
 * Setup Dialog.
 */
logdx.sch.app.prototype.setupDialog = function() {
  
  var hp = goog.dom.createDom('p');
  var hlabel =  goog.dom.createDom('label',{'for':'hppi'});
  goog.dom.setTextContent(hlabel,'Horizontal PPI:');
  var hinput = goog.dom.createDom('input',
              {'name' : 'ppi','id':'hppi',
               'type' : 'number',
               'size': 5,
               'min' : 0,
               'max' : 1000});
  goog.dom.appendChild(hp,hlabel);
  goog.dom.appendChild(hp,hinput);
  
  var vp = goog.dom.createDom('p');
  var vlabel =  goog.dom.createDom('label',{'for':'vppi'});
  goog.dom.setTextContent(vlabel,'Vertical PPI:');
  var vinput = goog.dom.createDom('input',
              {'name' : 'ppi','id':'vppi',
               'type' : 'number',
               'size': 5,
               'min' : 0,
               'max' : 1000});
  goog.dom.appendChild(vp,vlabel);
  goog.dom.appendChild(vp,vinput);

  var div = goog.dom.createDom('div');
  goog.dom.appendChild(div,hp);
  goog.dom.appendChild(div,vp);
  
  var button = new goog.ui.Button('Detect PPI');
    
  var dlg = new goog.ui.Dialog();
  goog.dom.appendChild(dlg.getContentElement(),div);
  dlg.addChild(button,true);
  dlg.setTitle('Setup');
  dlg.setButtonSet(goog.ui.Dialog.ButtonSet.OK_CANCEL);
  dlg.setVisible(true);

  hinput.value = this.ppi.width;
  vinput.value = this.ppi.height;

  button.listen(goog.ui.Component.EventType.ACTION, function(e) {
    var size = this.getMonitorPpi();
    hinput.value = size.width;
    vinput.value = size.height;
  },false,this);


  goog.events.listen(dlg, goog.ui.Dialog.EventType.SELECT, function(e) {
    if( e.key == 'ok') {
      var hppi = parseInt(hinput.value);
      var vppi = parseInt(vinput.value);
      if(goog.math.isFiniteNumber(hppi) && goog.math.isFiniteNumber(vppi)) {
        this.ppi.width = hppi;
        this.ppi.height = vppi;
        this.canvas.setPpi(this.ppi);
      }
    }
    dlg.dispose();
  },false,this);
};

/**
 * Get Monitor PPI.
 * @return {goog.math.Size}
 */
logdx.sch.app.prototype.getMonitorPpi = function() {
  var header = {'style': 'position:absolute;width:1000in; height:1000in;'};
  var element = goog.dom.createDom('div', header);
  goog.dom.appendChild(document.body, element);
  /** @type {goog.math.Size} */
  var size = goog.style.getSize(element);
  size.width /= 1000;
  size.height /= 1000;
  goog.dom.removeNode(element);
  return size;
}
