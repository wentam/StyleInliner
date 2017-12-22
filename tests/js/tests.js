var styleInliner;
var tags =
["A","ABBR","ADDRESS","AREA","ARTICLE","ASIDE","AUDIO","B","BASE","BDI","BDO","BLOCKQUOTE","BODY",
"BR","BUTTON","CANVAS","CAPTION","CENTER","CITE","CODE","COL","COLGROUP","COMMAND","DATALIST",
"DD","DEL","DETAILS","DFN","DIV","DL","DT","EM","EMBED","FIELDSET","FIGCAPTION","FIGURE","FONT",
"FOOTER","FORM","H1","H2","H3","H4","H5","H6","HEAD","HEADER","HGROUP","HR","HTML","I","IFRAME",
"IMG","INPUT","INS","KBD","KEYGEN","LABEL","LEGEND","LI","LINK","MAP","MARK","MATH","MENU","META",
"METER","NAV","NOBR","NOSCRIPT","OBJECT","OL","OPTION","OPTGROUP","OUTPUT","P","PARAM","PRE",
"PROGRESS","Q","RP","RT","RUBY","S","SAMP","SCRIPT","SECTION","SELECT","SMALL","SOURCE","SPAN",
"STRONG","STYLE","SUB","SUMMARY","SUP","SVG","TABLE","TBODY","TD","TEXTAREA","TFOOT","TH","THEAD",
"TIME","TITLE","TR","TRACK","U","UL","VAR","VIDEO","WBR"];

function compareComputedStyles(com1,com2,displayOverride) {
    if (com1.length == com2.length) {
    for(var i = 0; i < com1.length; i++)  {
      var styleName = com1[i];
      if (com1[styleName] != com2[styleName]) {
        if (displayOverride && styleName == 'display') {
          if (displayOverride != com2[styleName]) {
            return false;
          }
        } else {
          return false;
        }
      }
    }
  } else {
    return false;
  }

  return true;
}

window.addEventListener("load", function(){
  styleInliner = new styleInliner();

  QUnit.test("inlineStylesForSingleElement(): Un-attached elements should get no default styles inlined", function(assert) {
    for (var i = 0; i < tags.length; i++) {
      var tag = document.createElement(tags[i]);
      var new_tag = tag.cloneNode(true);
      styleInliner.inlineStylesForSingleElement(tag, new_tag);
      assert.equal(new_tag.style.cssText, "", tags[i]);
    }
  });

  QUnit.test("inlineStylesForSingleElement(): body-attached elements should get no default styles inlined", function(assert) {
    for (var i = 0; i < tags.length; i++) {
      var tag = document.createElement(tags[i]);
      document.body.appendChild(tag);
      var new_tag = tag.cloneNode(true);
      styleInliner.inlineStylesForSingleElement(tag, new_tag);
      assert.equal(new_tag.style.cssText, "", tags[i]);
      document.body.removeChild(tag);
    }
  });

  QUnit.test("inlineStylesForSingleElement(): Source element style string shouldn't be affected", function(assert) {
    var source = document.createElement("DIV");
    document.body.appendChild(source);
    source.style.left = "5px";
    var sourceStyleString = source.style.cssText;

    var new_tag = source.cloneNode(true);
    styleInliner.inlineStylesForSingleElement(source, new_tag);

    assert.equal(source.style.cssText, sourceStyleString, "style strings");
  });

  QUnit.test("inlineStylesForSingleElement(): computed style should be indentical for the new element", function(assert) {
    var sourceElem = document.getElementById('computed_test');
    var newElem = sourceElem.cloneNode(true);
    styleInliner.inlineStylesForSingleElement(sourceElem, newElem);

    var sourceComp = getComputedStyle(sourceElem);
    var newComp = getComputedStyle(newElem);
    var oldDisplay = sourceComp.getPropertyValue('display');
    sourceElem.style.display = "none";
    var computedStylesIdentical = compareComputedStyles(sourceComp,newComp,oldDisplay);

    assert.ok(computedStylesIdentical, "computed styles indentical");
  });
});
