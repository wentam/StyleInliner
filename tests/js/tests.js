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
        if (styleName != 'display') {
          return false;
        }
      }
    }
  } else {
    return false;
  }


  return true;
}

function assertComputedStylesIdenticalRecursive(assert, e1, e2, message) {
  var parentComp = getComputedStyle(e1);
  var newParentComp = getComputedStyle(e2);
  assert.ok(compareComputedStyles(parentComp,newParentComp),e1.tagName+" #"+e1.id+" "+message);

  for (var i = 0; i < e1.children.length; i++) {
    assertComputedStylesIdenticalRecursive(assert, e1.children[i], e2.children[i],message)
  }
}

function getRecursiveComputedStyle(elem) {
  var computedStyle = {computedStyle: getComputedStyle(elem)};

  var children = [];
  for (var i = 0; i < elem.children.length; i++) {
    children.push(getRecursiveComputedStyle(elem.children[i]));
  }

  computedStyle.children = children;

  return computedStyle;
}

function compareRecursiveStyles(s1, s2) {
  var result = compareComputedStyles(s1.computedStyle, s2.computedStyle);

  for (var i = 0; i < s1.children.length; i++) {
    var result2 = compareComputedStyles(s1.children[i],s2.children[i]);
  }

  return result && result2;
}

function prepTestStructure() {
  var sourceElems = document.getElementById('test_structure_p');
  var newElems = sourceElems.cloneNode(true);
  newElems.id = "test_structure";
  newElems.display = "block";
  document.body.appendChild(newElems);

  return newElems;
}

function freeTestStructure(elems) {
  document.body.removeChild(elems);
}

window.addEventListener("load", function(){
  styleInliner = new styleInliner();

  QUnit.test("inlineStylesForSingleElement(): Element should have it's styles inlined", function(assert) {
    var sourceElem = prepTestStructure();
    var new_tag = sourceElem.cloneNode(true);
    styleInliner.inlineStylesForSingleElement(sourceElem, new_tag);
    assert.ok(new_tag.style.paddingLeft == "50px", "");

    freeTestStructure(sourceElem);
  });

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
    document.body.appendChild(newElem);
    styleInliner.inlineStylesForSingleElement(sourceElem, newElem);

    var sourceComp = getComputedStyle(sourceElem);
    var newComp = getComputedStyle(newElem);
    var oldDisplay = sourceComp.getPropertyValue('display');
    sourceElem.style.display = "none";
    newElem.style.display = "none";
    var computedStylesIdentical = compareComputedStyles(sourceComp,newComp,oldDisplay);

    document.body.removeChild(newElem);
    assert.ok(computedStylesIdentical, "computed styles indentical");
  });

  QUnit.test("inlineStyles(): all elements should have their styles inlined", function(assert) {
    var sourceElems = prepTestStructure();
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: true});
    document.body.appendChild(newElems);
    assert.ok(newElems.style.paddingLeft == "50px", "DIV #test_structure");
    assert.ok(newElems.getElementsByTagName('DIV')[0].style.paddingLeft == "10px", "DIV #test_structure_subdiv");
    assert.ok(newElems.getElementsByTagName('DIV')[0].getElementsByTagName('IMG')[0].style.width == "100px", "IMG");
    document.body.removeChild(newElems);

    freeTestStructure(sourceElems);
  });

  QUnit.test("inlineStyles(): computed style should remain the same for the returned elements", function(assert) {
    // do in both copy and orig mode
    var sourceElems = prepTestStructure();
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: true});
    document.body.appendChild(newElems);
    assertComputedStylesIdenticalRecursive(assert, sourceElems,newElems,"with flags {makeCopy: true}");
    document.body.removeChild(newElems);

    var sourceElems = document.getElementById('test_structure');
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: false});
    assertComputedStylesIdenticalRecursive(assert, sourceElems,newElems,"with flags {makeCopy: false}");

    freeTestStructure(sourceElems);
  });

  QUnit.test("inlineStyles(): computed style should remain the same for the passed elements", function(assert) {
    var sourceElems = prepTestStructure();
    var beforeStyle = getRecursiveComputedStyle(sourceElems);
    styleInliner.inlineStyles(sourceElems, {makeCopy: true});
    var afterStyle = getRecursiveComputedStyle(sourceElems);
    assert.ok(compareRecursiveStyles(beforeStyle,afterStyle), "with flags {makeCopy: true}");

    var sourceElems = document.getElementById('test_structure');
    var beforeStyle = getRecursiveComputedStyle(sourceElems);
    styleInliner.inlineStyles(sourceElems, {makeCopy: false});
    var afterStyle = getRecursiveComputedStyle(sourceElems);
    assert.ok(compareRecursiveStyles(beforeStyle,afterStyle), "with flags {makeCopy: false}");

    freeTestStructure(sourceElems);
  });

  QUnit.test("inlineStyles(): makeCopy should decide if a copy is made (true) or if original elements are effected (false)", function(assert) {
    var sourceElems = prepTestStructure();
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: true});
    newElems.style.paddingLeft = "9999px";
    assert.ok(sourceElems.style.paddingLeft != "9999px","a copy should be created if flag {makeCopy:true}");

    var sourceElems = document.getElementById('test_structure');
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: false});
    newElems.style.paddingLeft = "9999px";
    assert.ok(sourceElems.style.paddingLeft == "9999px","a copy should not be created if flag {makeCopy:false}");
    newElems.style.paddingLeft = "";

    freeTestStructure(sourceElems);
  });

  QUnit.test("inlineStyles(): useParentElement should control if the parent element gets it's styles inlined or not", function(assert) {
    var sourceElems = prepTestStructure();
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: true, useParentElement: true});
    assert.ok(newElems.style.paddingLeft == "50px", "styles should be inlined with {useParentElement: true}");

    var sourceElems = document.getElementById('test_structure');
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: true, useParentElement: false});
    assert.ok(newElems.style.paddingLeft != "50px", "styles should not be inlined with {useParentElement: false}");

    freeTestStructure(sourceElems);
  });

  QUnit.test("inlineStyles(): excludeTags should prevent listed tags from having their styles inlined", function(assert) {
    var sourceElems = prepTestStructure();
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: true, excludeTags: {"IMG" : true}});
    document.body.appendChild(newElems);
    var img = newElems.getElementsByTagName('DIV')[0].getElementsByTagName('IMG')[0];

    assert.ok(img.style.width != "100px", "styles should not be inlined for tag");
    document.body.removeChild(newElems);

    freeTestStructure(sourceElems);
  });

  QUnit.test("inlineStyles(): excludeClasses should prevent elements with listed classes from having their styles inlined", function(assert) {
    var sourceElems = prepTestStructure();
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: true, excludeClasses: {"testimg" : true}});
    document.body.appendChild(newElems);
    var img = newElems.getElementsByTagName('DIV')[0].getElementsByTagName('IMG')[0];

    assert.ok(img.style.width != "100px", "styles should not be inlined for class");
    document.body.removeChild(newElems);

    freeTestStructure(sourceElems);
  });

  QUnit.test("inlineStyles(): excludeIds should prevent elements with the listed IDs from having their styles inlined", function(assert) {
    var sourceElems = prepTestStructure();
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: true, excludeIds: {"testimgid" : true}});
    document.body.appendChild(newElems);
    var img = newElems.getElementsByTagName('DIV')[0].getElementsByTagName('IMG')[0];

    assert.ok(img.style.width != "100px", "");
    document.body.removeChild(newElems);

    freeTestStructure(sourceElems);
  });

  QUnit.test("inlineStyles(): excludeStyles should prevent listed styles from being inlined", function(assert) {
    var sourceElems = prepTestStructure();
    var newElems = styleInliner.inlineStyles(sourceElems, {makeCopy: true, excludeStyles: {"width" : true}});
    document.body.appendChild(newElems);
    var img = newElems.getElementsByTagName('DIV')[0].getElementsByTagName('IMG')[0];

    assert.ok(img.style.width != "100px", "");
    document.body.removeChild(newElems);

    freeTestStructure(sourceElems);
  });
});
