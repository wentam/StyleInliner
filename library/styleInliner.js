var styleInliner;

(function(){

  // -- internal
  var computeDefaultStyleByTagName = function(tagName) {
    var defaultStyle = {};
    var element = document.body.appendChild(document.createElement(tagName));
    var computedStyle = getComputedStyle(element);
    for (var i = 0; i < computedStyle.length; i++) {
      defaultStyle[computedStyle[i]] = computedStyle[computedStyle[i]];
    }
    document.body.removeChild(element);
    return defaultStyle;
  }



  // new styleInliner(): initializes the inliner. A fair bit of work is done here so it's best to only create the object once.
  //
  // Params:
  // <none>
  //
  // Return value:
  // A new styleInliner object
  styleInliner = function() {

  }

  // inlineStylesForSingleElement(element, target): inlines the styles for a single element, and not it's children
  //
  // Params:
  // element: The element that computed styles will be taken from
  // targetElement:  The element to have the inlined styles assigned (can be the same element)
  // excludeStyles (optional): A map of styles to ignore. Format: {"style1":true,"style2":true}
  //
  // Return value:
  // the element with inlined styles (same object as target)
  styleInliner.prototype.inlineStylesForSingleElement = function(element, target, excludeStyles) {
    var computedStyle = getComputedStyle(element);
    var defaultStyle = computeDefaultStyleByTagName(element.tagName);
    for (var i = 0; i < computedStyle.length; i++) {
      var styleName = computedStyle[i];

      // exclude user-excluded styles
      if (excludeStyles == null ||
        excludeStyles[styleName.toUpperCase()] == null ||
        excludeStyles[styleName.toUpperCase()] != true) {
          // exclude default styles
          if (defaultStyle[styleName] !== computedStyle[styleName]) {
            target.style[styleName] = computedStyle[styleName];
          }
        }
      }
    }

  // inlineStyles(element, makeCopy): inlines all styles applied to elements in doc
  //
  // Params:
  // element: The element that will have it's children's styles inlined.
  // flags: A map of options. All are optional.
  //   Valid flags:
  //     makeCopy (Default false): If true, will create a copy with inlined styles rather than inlining directly into the object passed.
  //     useParentElement (Default true): If true, will inline the styles for the top-level element and it's children. If false, will only do children.
  //     excludeTags: A map of tags to ignore when inlining styles. Format: {"tag1":true,"tag2":true}
  //     excludeElements: A map of specific elements to ignore when inlining styles. Format: {elem1:true,elem2:true}
  //     excludeStyles: A map of styles to ignore. Format: {"STYLE1":true,"STYLE2":true}. Must be uppercase.
  //
  // Return value:
  // the doc with inlined styles.
  styleInliner.prototype.inlineStyles = function(element, flags) {
    var me = this;

    if (element.nodeType !== Node.ELEMENT_NODE) {
      throw new TypeError("Invalid element passed");
    }

    // figure out where we're putting our styles
    var targetElement;
    if (flags && flags.makeCopy) {
      targetElement = element.cloneNode(true);
    } else {
      targetElement = element;
    }

    // inline parent element?
    if (flags && flags.useParentElement != false) {
      me.inlineStylesForSingleElement(element,targetElement, flags.excludeStyles);
    }

    // inline child elements
    var childElements = element.children;
    var targetChildElements = targetElement.children;
    for (var i = 0; i < childElements.length; i++) {
      me.inlineStylesForSingleElement(childElements[i],targetChildElements[i], flags ? flags.excludeStyles : null);
    }
    return targetElement;
  }

}());
