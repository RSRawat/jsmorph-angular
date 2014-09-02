# jsMorph Angular
jQuery like animation methods for angular elements using jsMorph animation framework.

This repo is for distribution on `bower`.

## Install

Install with `bower`:

```shell
bower install jsmorph-angular
```

Add a `<script>` to your `index.html`:

```html
<script src="/bower_components/jsMorph/jsMorph.js"></script>
<script src="/bower_components/angular/angular.js"></script>
<script src="/bower_components/jsMorph-angular/jsMorph-angular.js"></script>
```

Use inside code:

```javascript
angular.element(element).show();
angular.element(element).animate({
    width: '200px',
    height: '400px'
});
```