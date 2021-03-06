function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/delegate-children.js']) {
  _$jscoverage['/delegate-children.js'] = {};
  _$jscoverage['/delegate-children.js'].lineData = [];
  _$jscoverage['/delegate-children.js'].lineData[6] = 0;
  _$jscoverage['/delegate-children.js'].lineData[7] = 0;
  _$jscoverage['/delegate-children.js'].lineData[9] = 0;
  _$jscoverage['/delegate-children.js'].lineData[10] = 0;
  _$jscoverage['/delegate-children.js'].lineData[12] = 0;
  _$jscoverage['/delegate-children.js'].lineData[13] = 0;
  _$jscoverage['/delegate-children.js'].lineData[14] = 0;
  _$jscoverage['/delegate-children.js'].lineData[16] = 0;
  _$jscoverage['/delegate-children.js'].lineData[20] = 0;
  _$jscoverage['/delegate-children.js'].lineData[21] = 0;
  _$jscoverage['/delegate-children.js'].lineData[22] = 0;
  _$jscoverage['/delegate-children.js'].lineData[24] = 0;
  _$jscoverage['/delegate-children.js'].lineData[25] = 0;
  _$jscoverage['/delegate-children.js'].lineData[34] = 0;
  _$jscoverage['/delegate-children.js'].lineData[35] = 0;
  _$jscoverage['/delegate-children.js'].lineData[36] = 0;
  _$jscoverage['/delegate-children.js'].lineData[38] = 0;
  _$jscoverage['/delegate-children.js'].lineData[41] = 0;
  _$jscoverage['/delegate-children.js'].lineData[43] = 0;
  _$jscoverage['/delegate-children.js'].lineData[44] = 0;
  _$jscoverage['/delegate-children.js'].lineData[45] = 0;
  _$jscoverage['/delegate-children.js'].lineData[48] = 0;
  _$jscoverage['/delegate-children.js'].lineData[50] = 0;
  _$jscoverage['/delegate-children.js'].lineData[51] = 0;
  _$jscoverage['/delegate-children.js'].lineData[53] = 0;
  _$jscoverage['/delegate-children.js'].lineData[54] = 0;
  _$jscoverage['/delegate-children.js'].lineData[56] = 0;
  _$jscoverage['/delegate-children.js'].lineData[57] = 0;
  _$jscoverage['/delegate-children.js'].lineData[59] = 0;
  _$jscoverage['/delegate-children.js'].lineData[60] = 0;
  _$jscoverage['/delegate-children.js'].lineData[62] = 0;
  _$jscoverage['/delegate-children.js'].lineData[63] = 0;
  _$jscoverage['/delegate-children.js'].lineData[65] = 0;
  _$jscoverage['/delegate-children.js'].lineData[66] = 0;
  _$jscoverage['/delegate-children.js'].lineData[68] = 0;
  _$jscoverage['/delegate-children.js'].lineData[75] = 0;
  _$jscoverage['/delegate-children.js'].lineData[80] = 0;
  _$jscoverage['/delegate-children.js'].lineData[82] = 0;
  _$jscoverage['/delegate-children.js'].lineData[93] = 0;
  _$jscoverage['/delegate-children.js'].lineData[97] = 0;
}
if (! _$jscoverage['/delegate-children.js'].functionData) {
  _$jscoverage['/delegate-children.js'].functionData = [];
  _$jscoverage['/delegate-children.js'].functionData[0] = 0;
  _$jscoverage['/delegate-children.js'].functionData[1] = 0;
  _$jscoverage['/delegate-children.js'].functionData[2] = 0;
  _$jscoverage['/delegate-children.js'].functionData[3] = 0;
  _$jscoverage['/delegate-children.js'].functionData[4] = 0;
  _$jscoverage['/delegate-children.js'].functionData[5] = 0;
  _$jscoverage['/delegate-children.js'].functionData[6] = 0;
}
if (! _$jscoverage['/delegate-children.js'].branchData) {
  _$jscoverage['/delegate-children.js'].branchData = {};
  _$jscoverage['/delegate-children.js'].branchData['13'] = [];
  _$jscoverage['/delegate-children.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['21'] = [];
  _$jscoverage['/delegate-children.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['24'] = [];
  _$jscoverage['/delegate-children.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['43'] = [];
  _$jscoverage['/delegate-children.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/delegate-children.js'].branchData['45'] = [];
  _$jscoverage['/delegate-children.js'].branchData['45'][1] = new BranchData();
}
_$jscoverage['/delegate-children.js'].branchData['45'][1].init(76, 35, 'control && !control.get(\'disabled\')');
function visit5_45_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['43'][1].init(17, 21, '!this.get(\'disabled\')');
function visit4_43_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['24'][1].init(86, 2, 'el');
function visit3_24_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['21'][1].init(13, 17, 'e.target === this');
function visit2_21_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].branchData['13'][1].init(13, 17, 'e.target === this');
function visit1_13_1(result) {
  _$jscoverage['/delegate-children.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/delegate-children.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/delegate-children.js'].functionData[0]++;
  _$jscoverage['/delegate-children.js'].lineData[7]++;
  var Manager = require('component/manager');
  _$jscoverage['/delegate-children.js'].lineData[9]++;
  var BaseGesture = require('event/gesture/base');
  _$jscoverage['/delegate-children.js'].lineData[10]++;
  var TapGesture = require('event/gesture/tap');
  _$jscoverage['/delegate-children.js'].lineData[12]++;
  function onRenderChild(e) {
    _$jscoverage['/delegate-children.js'].functionData[1]++;
    _$jscoverage['/delegate-children.js'].lineData[13]++;
    if (visit1_13_1(e.target === this)) {
      _$jscoverage['/delegate-children.js'].lineData[14]++;
      var child = e.component, el = child.$el;
      _$jscoverage['/delegate-children.js'].lineData[16]++;
      el.addClass(this.__childClsTag);
    }
  }
  _$jscoverage['/delegate-children.js'].lineData[20]++;
  function onRemoveChild(e) {
    _$jscoverage['/delegate-children.js'].functionData[2]++;
    _$jscoverage['/delegate-children.js'].lineData[21]++;
    if (visit2_21_1(e.target === this)) {
      _$jscoverage['/delegate-children.js'].lineData[22]++;
      var child = e.component, el = child.$el;
      _$jscoverage['/delegate-children.js'].lineData[24]++;
      if (visit3_24_1(el)) {
        _$jscoverage['/delegate-children.js'].lineData[25]++;
        el.removeClass(this.__childClsTag);
      }
    }
  }
  _$jscoverage['/delegate-children.js'].lineData[34]++;
  function DelegateChildren() {
    _$jscoverage['/delegate-children.js'].functionData[3]++;
    _$jscoverage['/delegate-children.js'].lineData[35]++;
    var self = this;
    _$jscoverage['/delegate-children.js'].lineData[36]++;
    self.__childClsTag = S.guid('ks-component-child');
    _$jscoverage['/delegate-children.js'].lineData[38]++;
    self.on('afterRenderChild', onRenderChild, self).on('afterRemoveChild', onRemoveChild, self);
  }
  _$jscoverage['/delegate-children.js'].lineData[41]++;
  S.augment(DelegateChildren, {
  handleChildrenEvents: function(e) {
  _$jscoverage['/delegate-children.js'].functionData[4]++;
  _$jscoverage['/delegate-children.js'].lineData[43]++;
  if (visit4_43_1(!this.get('disabled'))) {
    _$jscoverage['/delegate-children.js'].lineData[44]++;
    var control = this.getOwnerControl(e);
    _$jscoverage['/delegate-children.js'].lineData[45]++;
    if (visit5_45_1(control && !control.get('disabled'))) {
      _$jscoverage['/delegate-children.js'].lineData[48]++;
      switch (e.type) {
        case BaseGesture.START:
          _$jscoverage['/delegate-children.js'].lineData[50]++;
          control.handleMouseDown(e);
          _$jscoverage['/delegate-children.js'].lineData[51]++;
          break;
        case BaseGesture.END:
          _$jscoverage['/delegate-children.js'].lineData[53]++;
          control.handleMouseUp(e);
          _$jscoverage['/delegate-children.js'].lineData[54]++;
          break;
        case TapGesture.TAP:
          _$jscoverage['/delegate-children.js'].lineData[56]++;
          control.handleClick(e);
          _$jscoverage['/delegate-children.js'].lineData[57]++;
          break;
        case 'mouseenter':
          _$jscoverage['/delegate-children.js'].lineData[59]++;
          control.handleMouseEnter(e);
          _$jscoverage['/delegate-children.js'].lineData[60]++;
          break;
        case 'mouseleave':
          _$jscoverage['/delegate-children.js'].lineData[62]++;
          control.handleMouseLeave(e);
          _$jscoverage['/delegate-children.js'].lineData[63]++;
          break;
        case 'contextmenu':
          _$jscoverage['/delegate-children.js'].lineData[65]++;
          control.handleContextMenu(e);
          _$jscoverage['/delegate-children.js'].lineData[66]++;
          break;
        default:
          _$jscoverage['/delegate-children.js'].lineData[68]++;
          S.error(e.type + ' unhandled!');
      }
    }
  }
}, 
  __bindUI: function() {
  _$jscoverage['/delegate-children.js'].functionData[5]++;
  _$jscoverage['/delegate-children.js'].lineData[75]++;
  var self = this, events = BaseGesture.START + ' ' + BaseGesture.END + ' ' + TapGesture.TAP;
  _$jscoverage['/delegate-children.js'].lineData[80]++;
  events += ' mouseenter mouseleave contextmenu';
  _$jscoverage['/delegate-children.js'].lineData[82]++;
  self.$el.delegate(events, '.' + self.__childClsTag, self.handleChildrenEvents, self);
}, 
  getOwnerControl: function(e) {
  _$jscoverage['/delegate-children.js'].functionData[6]++;
  _$jscoverage['/delegate-children.js'].lineData[93]++;
  return Manager.getComponent(e.currentTarget.id);
}});
  _$jscoverage['/delegate-children.js'].lineData[97]++;
  return DelegateChildren;
});
