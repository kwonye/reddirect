(function (root) {
  "use strict";

  var RESERVED_HOSTS = Object.freeze([
    "www",
    "old",
    "new",
    "i",
    "m",
    "np",
    "mod",
    "api",
    "oauth",
    "out",
    "amp",
    "gateway",
    "pay",
    "accounts"
  ]);

  var RESERVED_SET = new Set(RESERVED_HOSTS);

  function computeRedirectUrl(inputUrl) {
    var url;

    try {
      url = new URL(inputUrl);
    } catch (error) {
      return null;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    var hostname = url.hostname.toLowerCase();
    var labels = hostname.split(".");

    if (labels.length !== 3) {
      return null;
    }

    if (labels[1] !== "reddit" || labels[2] !== "com") {
      return null;
    }

    var subreddit = labels[0];
    if (!subreddit || RESERVED_SET.has(subreddit)) {
      return null;
    }

    var pathname = url.pathname && url.pathname.length > 0 ? url.pathname : "/";
    if (pathname.charAt(0) !== "/") {
      pathname = "/" + pathname;
    }

    return "https://reddit.com/r/" + subreddit + pathname + url.search + url.hash;
  }

  var api = {
    RESERVED_HOSTS: RESERVED_HOSTS,
    computeRedirectUrl: computeRedirectUrl
  };

  // Catch top-level navigations before content scripts can run (e.g. server redirects).
  if (
    typeof chrome !== "undefined" &&
    chrome.webNavigation &&
    chrome.webNavigation.onBeforeNavigate &&
    chrome.tabs &&
    chrome.tabs.update
  ) {
    chrome.webNavigation.onBeforeNavigate.addListener(
      function (details) {
        if (!details || details.frameId !== 0 || !details.url) {
          return;
        }

        var targetUrl = computeRedirectUrl(details.url);
        if (!targetUrl || targetUrl === details.url) {
          return;
        }

        chrome.tabs.update(details.tabId, { url: targetUrl });
      },
      {
        url: [{ hostSuffix: "reddit.com" }]
      }
    );
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.RedDirect = Object.assign({}, root.RedDirect, api);
})(typeof self !== "undefined" ? self : globalThis);
