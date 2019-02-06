!function (e) {
  var r = {};

  function n(t) {
    if (r[t]) return r[t].exports;
    var i = r[t] = {
      i: t,
      l: !1,
      exports: {}
    };
    return e[t].call(i.exports, i, i.exports, n), i.l = !0, i.exports;
  }

  n.m = e, n.c = r, n.d = function (e, r, t) {
    n.o(e, r) || Object.defineProperty(e, r, {
      enumerable: !0,
      get: t
    });
  }, n.r = function (e) {
    "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
      value: "Module"
    }), Object.defineProperty(e, "__esModule", {
      value: !0
    });
  }, n.t = function (e, r) {
    if (1 & r && (e = n(e)), 8 & r) return e;
    if (4 & r && "object" == typeof e && e && e.__esModule) return e;
    var t = Object.create(null);
    if (n.r(t), Object.defineProperty(t, "default", {
      enumerable: !0,
      value: e
    }), 2 & r && "string" != typeof e) for (var i in e) n.d(t, i, function (r) {
      return e[r];
    }.bind(null, i));
    return t;
  }, n.n = function (e) {
    var r = e && e.__esModule ? function () {
      return e.default;
    } : function () {
      return e;
    };
    return n.d(r, "a", r), r;
  }, n.o = function (e, r) {
    return Object.prototype.hasOwnProperty.call(e, r);
  }, n.p = "", n(n.s = 0);
}([function (module, exports) {
  module.exports = function (obj) {
    obj || (obj = {});

    var __t,
        __p = "";

    with (obj) __p += '<!DOCTYPE html>\r\n<html lang="en">\r\n  <head>\r\n    <meta charset="UTF-8" />\r\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\r\n    <meta http-equiv="X-UA-Compatible" content="ie=edge" />\r\n    <link\r\n      rel="stylesheet"\r\n      href="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/css/materialize.min.css"\r\n    />\r\n    <link\r\n      href="https://fonts.googleapis.com/icon?family=Material+Icons"\r\n      rel="stylesheet"\r\n    />\r\n    <link rel="stylesheet" href="/css/style.css" type="text/css" />\r\n\r\n    <title>Node File Uploads</title>\r\n  </head>\r\n  <body>\r\n    <div class="container">\r\n      <h1 class="center-align">Gallery Builder</h1>\r\n      <h5 class="error-message">\r\n        ' + (null == (__t = "undefined" != typeof message ? message.message : "") ? "" : __t) + '\r\n      </h5>\r\n\r\n      <form action="/upload" method="POST" enctype="multipart/form-data">\r\n        <div>\r\n          <input\r\n            name="albumName"\r\n            class="input-placeholder"\r\n            type="text"\r\n            placeholder="Enter album name"\r\n          />\r\n        </div>\r\n        <div class="file-field input-field">\r\n          <div class="file-path-wrapper">\r\n            <input name="myImage" type="file" multiple />\r\n            <input\r\n              class="file-path validate input-placeholder"\r\n              type="text"\r\n              placeholder="Choose photos"\r\n            />\r\n            <p>Please make sure each photo is under 10mb</p>\r\n          </div>\r\n        </div>\r\n        <button\r\n          id="submitButton"\r\n          class="btn waves-effect waves-light"\r\n          type="submit"\r\n        >\r\n          Create gallery <i class="material-icons right">send</i>\r\n        </button>\r\n      </form>\r\n      <br />\r\n    </div>\r\n\r\n    <script\r\n      src="https://code.jquery.com/jquery-3.2.1.min.js"\r\n      integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="\r\n      crossorigin="anonymous"\r\n    ><\/script>\r\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/0.100.2/js/materialize.min.js"><\/script>\r\n  </body>\r\n</html>\r\n';
    return __p;
  };
}]);