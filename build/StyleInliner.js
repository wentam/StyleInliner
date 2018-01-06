var StyleInliner;

(function(){
  // internal stuff
  var defaultStyle = {};
  var computeDefaultStyleByTagName = function(tagName) {
    var defaultStyle = {};
    var element = document.createElement(tagName);

    var computedStyleAttached = getComputedStyle(document.body.appendChild(element));
    var display = computedStyleAttached.getPropertyValue('display');
    element.style.display = "none";
    for (var i = 0; i < computedStyleAttached.length; i++) {
      defaultStyle[computedStyleAttached[i]] = computedStyleAttached[computedStyleAttached[i]];
    }

    defaultStyle['display'] = display;

    document.body.removeChild(element);
    return defaultStyle;
  }

  recursivelyInline = function(inliner, sourceElement, targetElement, flags) {
    if (flags.recursion == null) {flags.recursion = false}

    // is this element excluded by user args?
    var excludeThisElement = false;

    for (var i2 = 0; i2 < sourceElement.classList.length; i2++) {
      if (flags.excludeClasses[sourceElement.classList[i2]] == true) {
        excludeThisElement = true;
      }
    }

    if (flags.excludeIds[sourceElement.id] == true) {excludeThisElement = true;}
    if (flags.excludeTags[sourceElement.tagName] == true) {excludeThisElement = true;}
    if (flags.useParentElement == false && flags.recursion == false) {excludeThisElement = true;}

    // inline the passed element
    if (!excludeThisElement) {
      inliner.inlineStylesForSingleElement(sourceElement, targetElement, flags.excludeStyles);
    }

    // inline child elements
    var childElements = sourceElement.children;
    var targetChildElements = targetElement.children;
    for (var i = 0; i < childElements.length; i++) {
      flags.recursion = true;
      recursivelyInline(inliner, childElements[i],targetChildElements[i], flags);
    }

    return targetElement;
  }

  // new StyleInliner(): initializes the inliner. A fair bit of work is done here so it's best to only create the object once.
  //
  // Params:
  // <none>
  //
  // Return value:
  // A new StyleInliner object

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

  StyleInliner = function() {
    if (document.body == null) {
      throw "document.body must exist before creating StyleInliner";
      return;
    }

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
  StyleInliner.prototype.inlineStylesForSingleElement = function(element, target, excludeStyles) {
    if (excludeStyles == null) {excludeStyles = {}}
    var computedStyle = getComputedStyle(element);
    var display = computedStyle.getPropertyValue("display");
    var returnDisplay = element.style.display;
    element.style.display = "none";
    if (defaultStyle[element.tagName] == null) {
      defaultStyle[element.tagName] = computeDefaultStyleByTagName(element.tagName);
    }
    for (var i = 0; i < computedStyle.length; i++) {
      var styleName = computedStyle[i];

      // exclude user-excluded styles
      if (excludeStyles[styleName] == null ||
          excludeStyles[styleName] != true) {
          // exclude default styles
          if (defaultStyle[element.tagName][styleName] !== computedStyle[styleName]) {
            target.style[styleName] = computedStyle[styleName];
          }

          if (styleName == "display" && defaultStyle[element.tagName]['display'] !== display) {
            target.style['display'] = display;
          } else if (styleName == "display") {
            target.style['display'] = "";
          }
        }
      }

      element.style.display = returnDisplay;
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
  StyleInliner.prototype.inlineStyles = function(element, flags) {
    var me = this;

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

    return recursivelyInline(me, element, targetElement, flags);
  }
}());
