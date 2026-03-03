(function () {
  "use strict";

  if (!self.RedDirect || typeof self.RedDirect.computeRedirectUrl !== "function") {
    return;
  }

  var targetUrl = self.RedDirect.computeRedirectUrl(window.location.href);
  if (targetUrl && targetUrl !== window.location.href) {
    window.location.replace(targetUrl);
  }
})();
