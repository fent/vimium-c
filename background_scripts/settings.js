// Generated by CoffeeScript 1.8.0
(function() {
  var Settings, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : window;

  root.Settings = Settings = {
    get: function(key) {
      if (key in localStorage) {
        return JSON.parse(localStorage[key]);
      } else {
        return this.defaults[key];
      }
    },
    set: function(key, value) {
      if (value === this.defaults[key]) {
        return this.clear(key);
      } else {
        var jsonValue = JSON.stringify(value);
        localStorage[key] = jsonValue;
        return; // Sync.set(key, jsonValue);
      }
    },
    clear: function(key) {
      if (this.has(key)) {
        delete localStorage[key];
      }
      return; // Sync.clear(key);
    },
    has: function(key) {
      return key in localStorage;
    },
    postUpdateHooks: {
      keyMappings: function(value) {
        root.Commands.clearKeyMappingsAndSetDefaults();
        root.Commands.parseCustomKeyMappings(value);
        return root.refreshCompletionKeysAfterMappingSave();
      },
      searchEngines: function(value) {
        return root.Settings.parseSearchEngines(value);
      },
      exclusionRules: function(value) {
        return root.Exclusions.postUpdateHook(value);
      }
    },
    performPostUpdateHook: function(key, value) {
      if (this.postUpdateHooks[key]) {
        return this.postUpdateHooks[key](value);
      }
    },
    searchEnginesMap: null,
    parseSearchEngines: function(searchEnginesText) {
      var a, val, split_pairs, _i, _j, _len, key;
      var titles = {}, map = { ":": titles };
      a = searchEnginesText.replace(/\\\n/g, '').split('\n');
      for (_i = 0, _len = a.length; _i < _len; _i++) {
        val = a[_i].trim();
        if (val.length == 0 || val[0] === '#') continue;
        val = val.split(/[ \t]*:[ \t]*(.+)/, 4);
        if (val.length !== 3 || val[0].length == 0 || val[1].length == 0) continue;
        split_pairs = val[0].split(/[ \t]*\|[ \t\|]*/);
        val = val[1];
        for (_j = 0; _j < split_pairs.length; _j++) {
          key = split_pairs[_j].split(/[ \t]*=[ \t]*(.+)/);
          if (!key[0]) continue;
          key[0] = key[0];
          key[1] = key[1] || key[0];
          map[key[0]] = val;
          titles[key[0]] = key[1];
        }
      }
      return this.searchEnginesMap = map;
    },
    getSearchEngines: function() {
      if (! this.searchEnginesMap) {
        this.parseSearchEngines(this.get("searchEngines") || "");
      }
      return this.searchEnginesMap;
    },
    defaults: {
      scrollStepSize: 100,
      keyMappings: "# Insert your prefered key mappings here.",
      linkHintCharacters: "asdqwerzxcv",
      linkHintNumbers: "1234567890",
      filterLinkHints: false,
      hideHud: false,
      regexFindMode: false,
      userDefinedLinkHintCss: "div > .vimiumHintMarker {\n/* linkhint boxes */\nbackground: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#FFF785),\n  color-stop(100%,#FFC542));\nborder: 1px solid #E3BE23;\n}\n\ndiv > .vimiumHintMarker span {\n/* linkhint text */\ncolor: black;\nfont-weight: bold;\nfont-size: 12px;\n}\n\ndiv > .vimiumHintMarker > .matchingCharacter {\n}",
      exclusionRules: [
        {
          pattern: "http*://mail.google.com/*",
          passKeys: ""
        }
      ],
      previousPatterns: "prev,previous,back,<,\u2190,\xab,\u226a,<<",
      nextPatterns: "next,more,>,\u2192,\xbb,\u226b,>>",
      searchUrl: "http://www.baidu.com/s?ie=utf-8&wd=%s",
      searchEngines: "w = Wikipedia (en-US):\\\n  http://www.wikipedia.org/w/index.php?title=Special:Search&search=%s",
      newTabUrl: "chrome-search://local-ntp/local-ntp.html",
      settingsVersion: Utils.getCurrentVersion()
    }
  };

  if (Utils.compareVersions("1.42", Settings.get("settingsVersion")) !== -1) {
    Settings.set("scrollStepSize", parseFloat(Settings.get("scrollStepSize")));
  }

  Settings.set("settingsVersion", Utils.getCurrentVersion());

}).call(this);
