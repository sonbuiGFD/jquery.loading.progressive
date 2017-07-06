;(function($, window, undefined) {
  var pluginName = 'load-progressive',
    checkPoint;

/**
 * Returns the width of the client's viewport
 * @return integer client-width
 */
  function getClientWidth () {
    return Math.max(document.documentElement.clientWidth, window.innerWidth, $(window).width())
  }
/**
 * Check if element is currently visible
 * @param  object DOMElement
 * @return boolean
 */
  function inView(el) {
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 ||
        rect.left >= 0 ||
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight || $(window).height())
    );
  }

/**
 * Load image and add loaded-class.
 * @param  object DOMElement
 * @param  object defaults
 * @return void function
 */
  function loadImage(el, options) {
    setTimeout(function() {
      var img = new Image();
      img.onload = function() {
        $(el).removeClass('progressive--not-loaded')
        .addClass('progressive--is-loaded');
        el.src = this.src;
        options.onLoad(el);
      }
      // Load minified version sm
      if (getClientWidth() < options.breakPointSM && $(el).data('progressiveSm')) {
        $(el).addClass('progressive--loaded-sm');
        img.src = $(el).data('progressiveSm');
        return;
      }
      img.src = $(el).data('progressive');
    }, options.delay);
  }

/**
 * Load image list.
 * @param  object List DOMElement
 * @param  object defaults
 * @return void function
 */
  function render(nodes, options, that) {
    nodes.each(function (index, elem) {
      if (inView(elem) && $(elem).hasClass('progressive--not-loaded')) {
        loadImage(elem, options);
      }
    });
    if(!nodes.length){
      options.onComplete();
      that.destroy();
    }
  }

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, this.element.data(), options);
    this.init();
    $(window).on('DOMContentLoaded load resize.progressive scroll.progressive', this.check.bind(this));
  }

  Plugin.prototype = {
    init: function() {
      this.nodes = this.element.find(this.options.nodeClass);
      render(this.nodes, this.options, this);
    },
    check: function () {
      var that = this;
      if (checkPoint) {
        return;
      }
      clearTimeout(checkPoint);
      checkPoint = setTimeout(function () {
        that.init()
        checkPoint = null
      }, that.options.throttle);
    },
    destroy: function() {
      $(window).off('resize.progressive scroll.progressive');
      $.removeData(this.element[0], pluginName);
    }
  };

  $.fn[pluginName] = function(options, params) {
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Plugin(this, options));
      } else if (instance[options]) {
        instance[options](params);
      }
    });
  };

  $.fn[pluginName].defaults = {
    nodeClass: '.progressive__img.progressive--not-loaded',
    throttle: 300,
    delay: 100,
    onLoad: function() {
      $(window).resize();
    },
    onComplete: function () {
      $(window).resize();
    },
    breakPointSM: 767
  };

  $(function() {
    $('[data-' + pluginName + ']')[pluginName]();
  });

}(jQuery, window));
