# StyleInliner
Inlines all css styles

## caveats
* Styles defined for an element type in css (img {style:value}) will not be inlined due to the way this library excludes default styles.
* document.body must exist before creating styleInliner object

## tests
[Click here to run tests](https://wentam.github.io/StyleInliner/tests/)
