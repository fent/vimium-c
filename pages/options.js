// Generated by CoffeeScript 1.8.0
(function() {
  var $, CheckBoxOption, ExclusionRulesOption, NonEmptyTextOption, NumberOption, Option, TextOption, activateHelpDialog, bgSettings, enableSaveButton, maintainLinkHintsView, restoreToDefaults, saveOptions, toggleAdvancedOptions,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  $ = function(id) {
    return document.getElementById(id);
  };

  bgSettings = chrome.extension.getBackgroundPage().Settings;

  Option = (function() {
    Option.all = [];

    function Option(field, enableSaveButton) {
      this.field = field;
      this.element = $(this.field);
      this.element.addEventListener("change", enableSaveButton);
      this.fetch();
      Option.all.push(this);
    }

    Option.prototype.fetch = function() {
      this.populateElement(this.previous = bgSettings.get(this.field));
      return this.previous;
    };

    Option.prototype.save = function() {
      var value = this.readValueFromElement();
      if (!this.areEqual(value, this.previous)) {
        bgSettings.set(this.field, this.previous = value);
        return bgSettings.performPostUpdateHook(this.field, value);
      }
    };

    Option.prototype.areEqual = function(a, b) {
      return a === b;
    };

    Option.prototype.restoreToDefault = function() {
      bgSettings.clear(this.field);
      return this.fetch();
    };

    return Option;

  })();

  NumberOption = (function(_super) {
    __extends(NumberOption, _super);

    function NumberOption() {
      return NumberOption.__super__.constructor.apply(this, arguments);
    }

    NumberOption.prototype.populateElement = function(value) {
      return this.element.value = value;
    };

    NumberOption.prototype.readValueFromElement = function() {
      return parseFloat(this.element.value);
    };

    return NumberOption;

  })(Option);

  TextOption = (function(_super) {
    __extends(TextOption, _super);

    function TextOption() {
      return TextOption.__super__.constructor.apply(this, arguments);
    }

    TextOption.prototype.populateElement = function(value) {
      return this.element.value = value.replace(/\n /g, '\n\xa0');
    };

    TextOption.prototype.readValueFromElement = function() {
      return this.element.value.trim().replace(/\xa0/g, ' ');
    };

    return TextOption;

  })(Option);

  NonEmptyTextOption = (function(_super) {
    __extends(NonEmptyTextOption, _super);

    function NonEmptyTextOption() {
      return NonEmptyTextOption.__super__.constructor.apply(this, arguments);
    }

    NonEmptyTextOption.prototype.populateElement = function(value) {
      return this.element.value = value.replace(/\n /g, '\n\xa0');
    };

    NonEmptyTextOption.prototype.readValueFromElement = function() {
      var value = this.element.value.trim().replace(/\xa0/g, ' ');
      if (value) {
        return value;
      } else {
        return this.restoreToDefault();
      }
    };

    return NonEmptyTextOption;

  })(Option);

  CheckBoxOption = (function(_super) {
    __extends(CheckBoxOption, _super);

    function CheckBoxOption() {
      return CheckBoxOption.__super__.constructor.apply(this, arguments);
    }

    CheckBoxOption.prototype.populateElement = function(value) {
      return this.element.checked = value;
    };

    CheckBoxOption.prototype.readValueFromElement = function() {
      return this.element.checked;
    };

    return CheckBoxOption;

  })(Option);

  ExclusionRulesOption = (function(_super) {
    __extends(ExclusionRulesOption, _super);

    function ExclusionRulesOption() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      ExclusionRulesOption.__super__.constructor.apply(this, args);
      $("exclusionAddButton").addEventListener("click", (function(_this) {
        return function(event) {
          var exclusionScrollBox;
          _this.appendRule({
            pattern: "",
            passKeys: ""
          });
          _this.maintainExclusionMargin();
          _this.element.children[_this.element.children.length - 1].children[0].children[0].focus();
          exclusionScrollBox = $("exclusionScrollBox");
          return exclusionScrollBox.scrollTop = exclusionScrollBox.scrollHeight;
        };
      })(this));
    }

    ExclusionRulesOption.prototype.populateElement = function(rules) {
      var rule, _i, _len;
      while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
      }
      for (_i = 0, _len = rules.length; _i < _len; _i++) {
        rule = rules[_i];
        this.appendRule(rule);
      }
      return this.maintainExclusionMargin();
    };

    ExclusionRulesOption.prototype.appendRule = function(rule) {
      var content, element, event, field, remove, row, _i, _j, _len, _len1, _ref, _ref1;
      content = document.querySelector('#exclusionRuleTemplate').content;
      row = document.importNode(content, true);
      _ref = ["pattern", "passKeys"];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        element = row.querySelector("." + field);
        element.value = rule[field];
        _ref1 = ["keyup", "change"];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          event = _ref1[_j];
          element.addEventListener(event, enableSaveButton);
        }
      }
      remove = row.querySelector(".exclusionRemoveButton");
      remove.addEventListener("click", (function(_this) {
        return function(event) {
          row = event.target.parentNode.parentNode;
          row.parentNode.removeChild(row);
          enableSaveButton();
          return _this.maintainExclusionMargin();
        };
      })(this));
      return this.element.appendChild(row);
    };

    ExclusionRulesOption.prototype.readValueFromElement = function() {
      var element, passKeys, pattern, rules;
      rules = (function() {
        var _i, _len, _ref, _results;
        _ref = this.element.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          element = _ref[_i];
          pattern = element.children[0].firstChild.value.trim();
          passKeys = element.children[1].firstChild.value.trim();
          _results.push({
            pattern: pattern,
            passKeys: passKeys
          });
        }
        return _results;
      }).call(this);
      return rules.filter(function(rule) {
        return rule.pattern;
      });
    };

    ExclusionRulesOption.prototype.areEqual = function(a, b) {
      var flatten;
      flatten = function(rule) {
        if (rule && rule.pattern) {
          return rule.pattern + "\n" + rule.passKeys;
        } else {
          return "";
        }
      };
      return a.map(flatten).join("\n") === b.map(flatten).join("\n");
    };

    ExclusionRulesOption.prototype.maintainExclusionMargin = function() {
      var element, margin, scrollBox, _i, _len, _ref, _results;
      scrollBox = $("exclusionScrollBox");
      margin = scrollBox.clientHeight < scrollBox.scrollHeight ? "16px" : "0px";
      _ref = scrollBox.getElementsByClassName("exclusionRemoveButton");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        element = _ref[_i];
        _results.push(element.style["margin-right"] = margin);
      }
      return _results;
    };

    return ExclusionRulesOption;

  })(Option);

  enableSaveButton = function() {
    return $("saveOptions").removeAttribute("disabled");
  };

  saveOptions = function() {
    Option.all.map(function(option) {
      return option.save();
    });
    return $("saveOptions").disabled = true;
  };

  restoreToDefaults = function() {
    if (!confirm("Are you sure you want to permanently return all of Vimium's settings to their defaults?")) {
      return;
    }
    Option.all.map(function(option) {
      return option.restoreToDefault();
    });
    maintainLinkHintsView();
    return $("saveOptions").disabled = true;
  };

  maintainLinkHintsView = function() {
    var hide, show;
    hide = function(el) {
      return el.parentNode.parentNode.style.display = "none";
    };
    show = function(el) {
      return el.parentNode.parentNode.style.display = "table-row";
    };
    if ($("filterLinkHints").checked) {
      hide($("linkHintCharacters"));
      return show($("linkHintNumbers"));
    } else {
      show($("linkHintCharacters"));
      return hide($("linkHintNumbers"));
    }
  };

  toggleAdvancedOptions = (function(advancedMode) {
    return function(event) {
      if (advancedMode) {
        $("advancedOptions").style.display = "none";
        $("advancedOptionsLink").innerHTML = "Show advanced options&hellip;";
      } else {
        $("advancedOptions").style.display = "table-row-group";
        $("advancedOptionsLink").innerHTML = "Hide advanced options";
      }
      advancedMode = !advancedMode;
      return event.preventDefault();
    };
  })(false);

  activateHelpDialog = function() {
    return showHelpDialog(chrome.extension.getBackgroundPage().helpDialogHtml(true, true, "Command Listing"), frameId);
  };

  document.addEventListener("DOMContentLoaded", function() {
    var name, type, _ref;
    _ref = {
      exclusionRules: ExclusionRulesOption,
      filterLinkHints: CheckBoxOption,
      hideHud: CheckBoxOption,
      keyMappings: TextOption,
      linkHintCharacters: NonEmptyTextOption,
      linkHintNumbers: NonEmptyTextOption,
      newTabUrl: NonEmptyTextOption,
      nextPatterns: NonEmptyTextOption,
      previousPatterns: NonEmptyTextOption,
      regexFindMode: CheckBoxOption,
      scrollStepSize: NumberOption,
      searchEngines: TextOption,
      searchUrl: NonEmptyTextOption,
      userDefinedLinkHintCss: TextOption
    };
    for (name in _ref) {
      type = _ref[name];
      new type(name, enableSaveButton);
    }
    $("saveOptions").addEventListener("click", saveOptions);
    $("restoreSettings").addEventListener("click", restoreToDefaults);
    $("advancedOptionsLink").addEventListener("click", toggleAdvancedOptions);
    $("showCommands").addEventListener("click", activateHelpDialog);
    $("filterLinkHints").addEventListener("click", maintainLinkHintsView);
    maintainLinkHintsView();
    return window.onbeforeunload = function() {
      if (!$("saveOptions").disabled) {
        return "You have unsaved changes to options.";
      }
    };
  });

}).call(this);
