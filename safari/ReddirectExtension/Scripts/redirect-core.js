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

  var REDDIT_REDIRECT_RULE_ID = 1;

  function installRedirectRule() {
    if (
      typeof chrome === "undefined" ||
      !chrome.declarativeNetRequest ||
      !chrome.declarativeNetRequest.updateDynamicRules
    ) {
      return;
    }

    var rule = {
      id: REDDIT_REDIRECT_RULE_ID,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          regexSubstitution: "https://reddit.com/r/\\1\\2\\3"
        }
      },
      condition: {
        regexFilter:
          "^https?:\\/\\/(?!www\\.|old\\.|new\\.|i\\.|m\\.|np\\.|mod\\.|api\\.|oauth\\.|out\\.|amp\\.|gateway\\.|pay\\.|accounts\\.)([^./]+)\\.reddit\\.com(\\/[^?#]*)?(\\?[^#]*)?$",
        resourceTypes: ["main_frame"]
      }
    };

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [REDDIT_REDIRECT_RULE_ID],
      addRules: [rule]
    });
  }

  // Install rule at startup so redirects happen before page scripts execute.
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.onInstalled &&
    chrome.runtime.onStartup
  ) {
    chrome.runtime.onInstalled.addListener(installRedirectRule);
    chrome.runtime.onStartup.addListener(installRedirectRule);
    installRedirectRule();
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.RedDirect = Object.assign({}, root.RedDirect, api);
})(typeof self !== "undefined" ? self : globalThis);
