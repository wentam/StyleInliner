var styleInliner;

(function(){
  // internal stuff
  var defaultStyle = {};
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

  var precomputeTags =
  ["A","ABBR","ADDRESS","AREA","ARTICLE","ASIDE","AUDIO","B","BASE","BDI","BDO","BLOCKQUOTE","BODY",
  "BR","BUTTON","CANVAS","CAPTION","CENTER","CITE","CODE","COL","COLGROUP","COMMAND","DATALIST",
  "DD","DEL","DETAILS","DFN","DIV","DL","DT","EM","EMBED","FIELDSET","FIGCAPTION","FIGURE","FONT",
  "FOOTER","FORM","H1","H2","H3","H4","H5","H6","HEAD","HEADER","HGROUP","HR","HTML","I","IFRAME",
  "IMG","INPUT","INS","KBD","KEYGEN","LABEL","LEGEND","LI","LINK","MAP","MARK","MATH","MENU","META",
  "METER","NAV","NOBR","NOSCRIPT","OBJECT","OL","OPTION","OPTGROUP","OUTPUT","P","PARAM","PRE",
  "PROGRESS","Q","RP","RT","RUBY","S","SAMP","SCRIPT","SECTION","SELECT","SMALL","SOURCE","SPAN",
  "STRONG","STYLE","SUB","SUMMARY","SUP","SVG","TABLE","TBODY","TD","TEXTAREA","TFOOT","TH","THEAD",
  "TIME","TITLE","TR","TRACK","U","UL","VAR","VIDEO","WBR"];

  styleInliner = function() {
    for (var i = 0; i < precomputeTags.length; i++) {
      defaultStyle[precomputeTags[i]] = computeDefaultStyleByTagName(precomputeTags[i]);
    }
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
    if (excludeStyles == null) {excludeStyles = {}}

    var computedStyle = getComputedStyle(element);
    if (defaultStyle[element.tagName] == null) {
      defaultStyle[element.tagName] = computeDefaultStyleByTagName(element.tagName);
    }
    for (var i = 0; i < computedStyle.length; i++) {
      var styleName = computedStyle[i];

      // exclude user-excluded styles
      if (excludeStyles[styleName.toUpperCase()] == null ||
          excludeStyles[styleName.toUpperCase()] != true) {
          // exclude default styles
          if (defaultStyle[element.tagName][styleName] !== computedStyle[styleName]) {
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
  //     excludeTags: A map of tags to ignore when inlining styles. Format: {"TAG1":true,"TAG2":true}. Tags must be uppercase. Does not affect parent element.
  //     excludeClasses: A map of specific classes whose elements will be ignored when inlining styles. Format: {"class1":true,"class2":true}. Does not affect parent element.
  //     excludeIds: A map of specific ids whose elements will be ignored when inlining styles. Format: {"id1":true,"id1":true}. Does not affect parent element.
  //     excludeStyles: A map of styles to ignore. Format: {"STYLE1":true,"STYLE2":true}. Must be uppercase.
  //
  // Return value:
  // The element with inlined styles. Will be a copy of the input element if makeCopy is true;
  styleInliner.prototype.inlineStyles = function(element, flags) {
    var me = this;

    // explicitly define all flags
    if (flags == null) {flags = {};}
    if (flags.makeCopy == null) {flags.makeCopy = false;}
    if (flags.useParentElement == null) {flags.useParentElement = true;}
    if (flags.excludeTags == null) {flags.excludeTags = {};}
    if (flags.excludeClasses == null) {flags.excludeClasses = {};}
    if (flags.excludeIds == null) {flags.excludeIds = {};}
    if (flags.excludeStyles == null) {flags.excludeStyles = {};}

    // Throw errors on parameter combinations that would otherwise lead to undefined behavior
    if (element.nodeType !== Node.ELEMENT_NODE) {
      throw new TypeError("Invalid element passed");
      return;
    }

    // figure out where we're putting our styles
    var targetElement;
    if (flags.makeCopy) {
      targetElement = element.cloneNode(true);
    } else {
      targetElement = element;
    }

    // inline parent element?
    if (flags.useParentElement == true) {
      me.inlineStylesForSingleElement(element, targetElement, flags.excludeStyles);
    }

    // inline child elements
    var childElements = element.children;
    var targetChildElements = targetElement.children;
    for (var i = 0; i < childElements.length; i++) {
      // is this element excluded by the function caller?
      var excludeThisElement = false;
      for (var i2 = 0; i2 < childElements[i].classList.length; i2++) {
        if (flags.excludeClasses[childElements[i].classList[i2]] == true) {
          excludeThisElement = true;
        }
      }

      if (flags.excludeIds[childElements[i].id] == true) {
        excludeThisElement = true;
      }

      if (flags.excludeTags[childElements[i].tagName] == true) {
        excludeThisElement = true;
      }

      if (!excludeThisElement) {
        // inline styles for this element
        me.inlineStylesForSingleElement(childElements[i], targetChildElements[i], flags.excludeStyles);
      }
    }
    return targetElement;
  }
}());
