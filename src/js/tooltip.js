/**
 * @fileoverview Tooltip.
 *
 * @author rogerioferro@gmail.com (Rogério Ferro do Nascimento)
 */
goog.provide('logdx.sch.tooltip');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.style');
goog.require('goog.ui.Component');
goog.require('goog.positioning.AnchoredPosition');


/**
 * Tooltip component
 *
 * @param {goog.ui.Component} component Component to display tooltip for.
 * @param {string=} opt_text Message to show.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper to use.
 *
 * @extends {goog.ui.Component}
 * @constructor
 */
logdx.sch.tooltip = function(component, opt_text, opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);

  /**
   * Componet this widget is attached to.
   * @type {goog.ui.Component}
   * @private
   */
  this.component_ = component;
  
  this.component_.listen(goog.ui.Component.EventType.HIGHLIGHT,
    this.onHighlight_, false, this);
  this.component_.listen(goog.ui.Component.EventType.UNHIGHLIGHT,
    this.onUnhighlight_, false, this);
  
  this.text_ = opt_text || '';
};
goog.inherits(logdx.sch.tooltip, goog.ui.Component);


/**
 * Delay in milliseconds since the last Highlight before the
 * tooltip is displayed for an component.
 *
 * @type {number}
 * @private
 */
logdx.sch.tooltip.prototype.showDelayMs_ = 500;


/**
 * Timer for when to show.
 *
 * @type {number|undefined}
 * @protected
 */
logdx.sch.tooltip.prototype.showTimer;


/**
 * Delay in milliseconds before tooltips are hidden.
 *
 * @type {number}
 * @private
 */
logdx.sch.tooltip.prototype.hideDelayMs_ = 800;


/**
 * Timer for when to hide.
 *
 * @type {number|undefined}
 * @protected
 */
logdx.sch.tooltip.prototype.hideTimer;

/**
 * Sets whether the tooltip should be visible.
 *
 * @param {boolean} visible Desired visibility state.
 */
logdx.sch.tooltip.prototype.setVisible = function(visible) {
  if(!this.getElement()){
    var elem = goog.dom.getElementByClass(goog.getCssName('log-tooltip'));
    if(elem){
      this.decorateInternal(elem);
    }else{
      this.render();
    }
  }
  if(visible) {
    this.setText(this.text_);
    this.setPosition();
    goog.style.setElementShown(this.getElement(), true);
  }
  var isVisible = goog.style.isElementShown(this.getElement());
  if(!visible && isVisible){
    goog.style.setElementShown(this.getElement(), false);
  }
};

/**
 * Sets Position of the tooltip.
 *
 */
logdx.sch.tooltip.prototype.setPosition = function() {
  var anchor_elem = this.component_.getElement();
  var elem = this.getElement();
  var anchor_size = goog.style.getSize(anchor_elem);
  var size = goog.style.getSize(elem); 
  goog.style.setPosition(this.arrow_elem_,size.width/2);
  var pos = new goog.positioning.AnchoredPosition(anchor_elem,
    goog.positioning.Corner.BOTTOM_LEFT);  
  pos.reposition(elem, goog.positioning.Corner.TOP_LEFT,
      new goog.math.Box(7, 0, 0, anchor_size.width/2 - size.width/2));
 }

/**
 * Creates an initial DOM representation for the component.
 */
logdx.sch.tooltip.prototype.createDom = function() {
  /** Create element.*/
  var elem = goog.dom.createDom(
      'div',{ 'class' : goog.getCssName('log-tooltip'),
              'style': 'display:none;',
              'role':'tooltip', 'aria-live': 'polite'});  
  var label = goog.dom.createDom(
      'div',{ 'class' : goog.getCssName('log-tooltip-text')});  

  var arrow = goog.dom.createDom('div',
      {'class':goog.getCssName('log-tooltip-arrow')});
  var back = goog.dom.createDom('div',
      {'class':goog.getCssName('log-tooltip-arrow-back')});
  var front = goog.dom.createDom('div',
      {'class':goog.getCssName('log-tooltip-arrow-front')});

  goog.dom.appendChild(arrow, back);
  goog.dom.appendChild(arrow, front);

  goog.dom.appendChild(elem, label);
  goog.dom.appendChild(elem, arrow);

  /** decorate it.*/
  this.decorateInternal(elem);
};


/**
 * Decorates an existing HTML DIV element as a Canvas.
 *
 * @param {Element} element The DIV element to decorate.
 */
logdx.sch.tooltip.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);
  var elem = this.getElement();
  elem.tabIndex = 0;
  
  this.lb_elem_ = goog.dom.getElementByClass(
    goog.getCssName('log-tooltip-text'), elem);

  this.arrow_elem_ = goog.dom.getElementByClass(
    goog.getCssName('log-tooltip-arrow'), elem);
};

/** @override */
logdx.sch.tooltip.prototype.disposeInternal = function() {
  this.component_.unlisten(goog.ui.Component.EventType.HIGHLIGHT,
    this.onHighlight_, false, this);
  this.component_.unlisten(goog.ui.Component.EventType.UNHIGHLIGHT,
    this.onUnhighlight_, false, this);
  goog.base(this, 'disposeInternal');
};


/**
 * Gets the current label text.
 *
 * @return {string} The current text set into the label, or empty string if
 *     none set.
 */
logdx.sch.tooltip.prototype.getText = function() {
  if (!this.lb_elem_) {
    return '';
  }
  return goog.dom.getTextContent(this.lb_elem_);
};
/**
 * Sets the current label text. Has no effect if component is not rendered.
 *
 * @param {string} text The text to set as the label.
 */
logdx.sch.tooltip.prototype.setText = function(text) {
  if (this.lb_elem_) {
    goog.dom.setTextContent(this.lb_elem_, text);
  }
};

/**
 * Called by timer from mouse over handler. Shows tooltip if cursor is still
 * over the same element.
 *
 */
logdx.sch.tooltip.prototype.maybeShow = function() {
  this.setVisible(true);
  this.showTimer = undefined;
};


/**
 * Helper method, starts timer that calls maybeShow. Parameters are passed to
 * the maybeShow method.
 *
 * @protected
 */
logdx.sch.tooltip.prototype.startShowTimer = function() {
  if (!this.showTimer) {
    this.showTimer = goog.Timer.callOnce(
        goog.bind(this.maybeShow, this), this.showDelayMs_);
  }
};


/**
 * Helper method called to clear the show timer.
 *
 * @protected
 */
logdx.sch.tooltip.prototype.clearShowTimer = function() {
  if (this.showTimer) {
    goog.Timer.clear(this.showTimer);
    this.showTimer = undefined;
  }
};


/**
 * Called by timer from mouse out handler. Hides tooltip if cursor is still
 * outside element and tooltip, or if a child of tooltip has the focus.
 */
logdx.sch.tooltip.prototype.maybeHide = function() {
  this.hideTimer = undefined;
  var text = this.getText();
  if( text == this.text_){
    this.setVisible(false);
  }
};

/**
 * Helper method called to start the close timer.
 * @protected
 */
logdx.sch.tooltip.prototype.startHideTimer = function() {
  if(!this.getElement()){
    return;
  }
  var isVisible = goog.style.isElementShown(this.getElement());
  if(isVisible && !this.hideTimer) {
    this.hideTimer = goog.Timer.callOnce(
        goog.bind(this.maybeHide, this), this.hideDelayMs_);
  }
};


/**
 * Helper method called to clear the close timer.
 * @protected
 */
logdx.sch.tooltip.prototype.clearHideTimer = function() {
  if(this.hideTimer) {
    goog.Timer.clear(this.hideTimer);
    this.hideTimer = undefined;
  }
};

/**
 * Handles component Highlight.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.tooltip.prototype.onHighlight_ = function(event) {
  this.clearHideTimer();
  this.startShowTimer();
};
/**
 * Handles component Unhighlight.
 * @param {goog.events.Event} event
 * @private
 */
logdx.sch.tooltip.prototype.onUnhighlight_ = function(event) {
  this.clearShowTimer();
  this.startHideTimer();
};
