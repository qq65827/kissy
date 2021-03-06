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
if (! _$jscoverage['/dd/draggable.js']) {
  _$jscoverage['/dd/draggable.js'] = {};
  _$jscoverage['/dd/draggable.js'].lineData = [];
  _$jscoverage['/dd/draggable.js'].lineData[6] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[7] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[13] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[21] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[22] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[23] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[24] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[29] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[30] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[33] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[34] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[37] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[38] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[46] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[48] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[49] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[50] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[214] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[216] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[220] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[223] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[224] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[225] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[227] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[232] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[236] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[238] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[243] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[248] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[250] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[255] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[260] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[262] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[263] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[265] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[269] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[272] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[274] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[275] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[276] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[277] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[279] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[281] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[285] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[286] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[287] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[289] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[293] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[295] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[297] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[298] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[299] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[313] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[314] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[321] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[322] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[325] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[326] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[331] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[332] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[336] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[337] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[346] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[350] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[355] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[356] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[359] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[364] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[374] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[376] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[377] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[378] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[380] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[381] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[382] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[386] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[389] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[392] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[393] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[396] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[400] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[401] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[404] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[406] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[415] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[416] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[421] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[423] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[426] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[429] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[431] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[433] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[434] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[439] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[444] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[446] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[458] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[459] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[462] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[469] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[470] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[472] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[476] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[485] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[508] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[509] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[511] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[554] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[555] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[556] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[558] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[559] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[560] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[563] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[564] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[566] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[567] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[569] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[571] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[572] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[733] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[735] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[736] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[739] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[740] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[745] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[746] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[747] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[750] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[751] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[761] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[762] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[768] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[769] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[772] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[773] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[774] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[777] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].functionData) {
  _$jscoverage['/dd/draggable.js'].functionData = [];
  _$jscoverage['/dd/draggable.js'].functionData[0] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[1] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[2] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[3] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[4] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[5] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[6] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[7] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[8] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[9] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[10] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[11] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[12] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[13] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[14] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[15] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[16] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[17] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[18] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[19] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[20] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[21] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[22] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[23] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[24] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[25] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[26] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[27] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[28] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[29] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[30] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[31] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[32] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].branchData) {
  _$jscoverage['/dd/draggable.js'].branchData = {};
  _$jscoverage['/dd/draggable.js'].branchData['23'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['223'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['224'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['238'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['250'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['262'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['274'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['274'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['286'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['286'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['297'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['313'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['321'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['325'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['355'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['376'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['392'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['392'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['400'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['400'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['404'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['415'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['415'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['421'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['508'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['508'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['555'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['555'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['559'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['559'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['563'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['563'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['566'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['739'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['739'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['750'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['750'][1] = new BranchData();
}
_$jscoverage['/dd/draggable.js'].branchData['750'][1].init(305, 19, 'doc.body.setCapture');
function visit81_750_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['750'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['739'][1].init(259, 23, 'doc.body.releaseCapture');
function visit80_739_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['739'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['566'][1].init(338, 10, 'v.nodeType');
function visit79_566_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['563'][1].init(202, 21, 'typeof v === \'string\'');
function visit78_563_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['563'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['559'][1].init(29, 23, 'typeof v === \'function\'');
function visit77_559_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['559'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['555'][1].init(62, 10, '!vs.length');
function visit76_555_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['555'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['508'][1].init(25, 20, '!(v instanceof Node)');
function visit75_508_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['508'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['421'][1].init(17, 7, 'e || {}');
function visit74_421_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['415'][1].init(17, 17, 'this._isValidDrag');
function visit73_415_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['415'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['404'][1].init(1527, 11, 'def && move');
function visit72_404_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['400'][1].init(1424, 32, 'self.get(\'preventDefaultOnMove\')');
function visit71_400_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['400'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['392'][1].init(1230, 40, 'self.fire(\'drag\', customEvent) === false');
function visit70_392_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['392'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['376'][1].init(677, 4, 'move');
function visit69_376_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['355'][1].init(149, 25, 'e.gestureType === \'touch\'');
function visit68_355_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['325'][1].init(1069, 15, 'self._allowMove');
function visit67_325_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['321'][1].init(973, 25, 'e.gestureType === \'mouse\'');
function visit66_321_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['313'][1].init(683, 16, 'self.get(\'halt\')');
function visit65_313_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['297'][1].init(83, 2, 'ie');
function visit64_297_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['286'][2].init(79, 13, 'e.which !== 1');
function visit63_286_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['286'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['286'][1].init(46, 46, 'self.get(\'primaryButtonOnly\') && e.which !== 1');
function visit62_286_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['274'][2].init(51, 16, 'handler[0] === t');
function visit61_274_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['274'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['274'][1].init(51, 39, 'handler[0] === t || handler.contains(t)');
function visit60_274_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['262'][1].init(91, 4, 'node');
function visit59_262_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['250'][1].init(94, 4, 'node');
function visit58_250_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['238'][1].init(94, 4, 'node');
function visit57_238_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['224'][1].init(21, 22, '!self._checkHandler(t)');
function visit56_224_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['223'][1].init(77, 28, 'self._checkDragStartValid(e)');
function visit55_223_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['23'][1].init(17, 17, 'this._isValidDrag');
function visit54_23_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/draggable.js'].functionData[0]++;
  _$jscoverage['/dd/draggable.js'].lineData[7]++;
  var Node = require('node'), BaseGesture = require('event/gesture/base'), DDM = require('./ddm'), Base = require('base'), DragGesture = require('event/gesture/drag');
  _$jscoverage['/dd/draggable.js'].lineData[13]++;
  var UA = require('ua'), $ = Node.all, $doc = $(document), each = S.each, ie = UA.ie, PREFIX_CLS = DDM.PREFIX_CLS, doc = S.Env.host.document;
  _$jscoverage['/dd/draggable.js'].lineData[21]++;
  function checkValid(fn) {
    _$jscoverage['/dd/draggable.js'].functionData[1]++;
    _$jscoverage['/dd/draggable.js'].lineData[22]++;
    return function() {
  _$jscoverage['/dd/draggable.js'].functionData[2]++;
  _$jscoverage['/dd/draggable.js'].lineData[23]++;
  if (visit54_23_1(this._isValidDrag)) {
    _$jscoverage['/dd/draggable.js'].lineData[24]++;
    fn.apply(this, arguments);
  }
};
  }
  _$jscoverage['/dd/draggable.js'].lineData[29]++;
  var onDragStart = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[3]++;
  _$jscoverage['/dd/draggable.js'].lineData[30]++;
  this._start(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[33]++;
  var onDrag = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[4]++;
  _$jscoverage['/dd/draggable.js'].lineData[34]++;
  this._move(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[37]++;
  var onDragEnd = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[5]++;
  _$jscoverage['/dd/draggable.js'].lineData[38]++;
  this._end(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[46]++;
  var Draggable = Base.extend({
  initializer: function() {
  _$jscoverage['/dd/draggable.js'].functionData[6]++;
  _$jscoverage['/dd/draggable.js'].lineData[48]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[49]++;
  self.addTarget(DDM);
  _$jscoverage['/dd/draggable.js'].lineData[50]++;
  self._allowMove = self.get('move');
}, 
  _onSetNode: function(n) {
  _$jscoverage['/dd/draggable.js'].functionData[7]++;
  _$jscoverage['/dd/draggable.js'].lineData[214]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[216]++;
  self.setInternal('dragNode', n);
}, 
  onGestureStart: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[8]++;
  _$jscoverage['/dd/draggable.js'].lineData[220]++;
  var self = this, t = e.target;
  _$jscoverage['/dd/draggable.js'].lineData[223]++;
  if (visit55_223_1(self._checkDragStartValid(e))) {
    _$jscoverage['/dd/draggable.js'].lineData[224]++;
    if (visit56_224_1(!self._checkHandler(t))) {
      _$jscoverage['/dd/draggable.js'].lineData[225]++;
      return;
    }
    _$jscoverage['/dd/draggable.js'].lineData[227]++;
    self._prepare(e);
  }
}, 
  getEventTargetEl: function() {
  _$jscoverage['/dd/draggable.js'].functionData[9]++;
  _$jscoverage['/dd/draggable.js'].lineData[232]++;
  return this.get('node');
}, 
  start: function() {
  _$jscoverage['/dd/draggable.js'].functionData[10]++;
  _$jscoverage['/dd/draggable.js'].lineData[236]++;
  var self = this, node = self.getEventTargetEl();
  _$jscoverage['/dd/draggable.js'].lineData[238]++;
  if (visit57_238_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[243]++;
    node.on(DragGesture.DRAG_START, onDragStart, self).on(DragGesture.DRAG, onDrag, self).on(DragGesture.DRAG_END, onDragEnd, self).on(BaseGesture.START, onGestureStart, self).on(['dragstart', DragGesture.DRAGGING], preventDefault);
  }
}, 
  stop: function() {
  _$jscoverage['/dd/draggable.js'].functionData[11]++;
  _$jscoverage['/dd/draggable.js'].lineData[248]++;
  var self = this, node = self.getEventTargetEl();
  _$jscoverage['/dd/draggable.js'].lineData[250]++;
  if (visit58_250_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[255]++;
    node.detach(DragGesture.DRAG_START, onDragStart, self).detach(DragGesture.DRAG, onDrag, self).detach(DragGesture.DRAG_END, onDragEnd, self).detach(BaseGesture.START, onGestureStart, self).detach(['dragstart', DragGesture.DRAGGING], preventDefault);
  }
}, 
  _onSetDisabled: function(d) {
  _$jscoverage['/dd/draggable.js'].functionData[12]++;
  _$jscoverage['/dd/draggable.js'].lineData[260]++;
  var self = this, node = self.get('dragNode');
  _$jscoverage['/dd/draggable.js'].lineData[262]++;
  if (visit59_262_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[263]++;
    node[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
  }
  _$jscoverage['/dd/draggable.js'].lineData[265]++;
  self[d ? 'stop' : 'start']();
}, 
  _checkHandler: function(t) {
  _$jscoverage['/dd/draggable.js'].functionData[13]++;
  _$jscoverage['/dd/draggable.js'].lineData[269]++;
  var self = this, handlers = self.get('handlers'), ret = 0;
  _$jscoverage['/dd/draggable.js'].lineData[272]++;
  each(handlers, function(handler) {
  _$jscoverage['/dd/draggable.js'].functionData[14]++;
  _$jscoverage['/dd/draggable.js'].lineData[274]++;
  if (visit60_274_1(visit61_274_2(handler[0] === t) || handler.contains(t))) {
    _$jscoverage['/dd/draggable.js'].lineData[275]++;
    ret = 1;
    _$jscoverage['/dd/draggable.js'].lineData[276]++;
    self.setInternal('activeHandler', handler);
    _$jscoverage['/dd/draggable.js'].lineData[277]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[279]++;
  return undefined;
});
  _$jscoverage['/dd/draggable.js'].lineData[281]++;
  return ret;
}, 
  _checkDragStartValid: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[15]++;
  _$jscoverage['/dd/draggable.js'].lineData[285]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[286]++;
  if (visit62_286_1(self.get('primaryButtonOnly') && visit63_286_2(e.which !== 1))) {
    _$jscoverage['/dd/draggable.js'].lineData[287]++;
    return 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[289]++;
  return 1;
}, 
  _prepare: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[16]++;
  _$jscoverage['/dd/draggable.js'].lineData[293]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[295]++;
  self._isValidDrag = 1;
  _$jscoverage['/dd/draggable.js'].lineData[297]++;
  if (visit64_297_1(ie)) {
    _$jscoverage['/dd/draggable.js'].lineData[298]++;
    fixIEMouseDown();
    _$jscoverage['/dd/draggable.js'].lineData[299]++;
    $doc.on(BaseGesture.END, {
  fn: fixIEMouseUp, 
  once: true});
  }
  _$jscoverage['/dd/draggable.js'].lineData[313]++;
  if (visit65_313_1(self.get('halt'))) {
    _$jscoverage['/dd/draggable.js'].lineData[314]++;
    e.stopPropagation();
  }
  _$jscoverage['/dd/draggable.js'].lineData[321]++;
  if (visit66_321_1(e.gestureType === 'mouse')) {
    _$jscoverage['/dd/draggable.js'].lineData[322]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[325]++;
  if (visit67_325_1(self._allowMove)) {
    _$jscoverage['/dd/draggable.js'].lineData[326]++;
    self.setInternal('startNodePos', self.get('node').offset());
  }
}, 
  _start: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[17]++;
  _$jscoverage['/dd/draggable.js'].lineData[331]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[332]++;
  self.mousePos = {
  left: e.pageX, 
  top: e.pageY};
  _$jscoverage['/dd/draggable.js'].lineData[336]++;
  DDM.start(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[337]++;
  self.fire('dragstart', {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY});
  _$jscoverage['/dd/draggable.js'].lineData[346]++;
  self.get('dragNode').addClass(PREFIX_CLS + 'dragging');
}, 
  _move: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[18]++;
  _$jscoverage['/dd/draggable.js'].lineData[350]++;
  var self = this, pageX = e.pageX, pageY = e.pageY;
  _$jscoverage['/dd/draggable.js'].lineData[355]++;
  if (visit68_355_1(e.gestureType === 'touch')) {
    _$jscoverage['/dd/draggable.js'].lineData[356]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[359]++;
  self.mousePos = {
  left: pageX, 
  top: pageY};
  _$jscoverage['/dd/draggable.js'].lineData[364]++;
  var customEvent = {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY};
  _$jscoverage['/dd/draggable.js'].lineData[374]++;
  var move = self._allowMove;
  _$jscoverage['/dd/draggable.js'].lineData[376]++;
  if (visit69_376_1(move)) {
    _$jscoverage['/dd/draggable.js'].lineData[377]++;
    var startNodePos = self.get('startNodePos');
    _$jscoverage['/dd/draggable.js'].lineData[378]++;
    var left = startNodePos.left + e.deltaX, top = startNodePos.top + e.deltaY;
    _$jscoverage['/dd/draggable.js'].lineData[380]++;
    customEvent.left = left;
    _$jscoverage['/dd/draggable.js'].lineData[381]++;
    customEvent.top = top;
    _$jscoverage['/dd/draggable.js'].lineData[382]++;
    self.setInternal('actualPos', {
  left: left, 
  top: top});
    _$jscoverage['/dd/draggable.js'].lineData[386]++;
    self.fire('dragalign', customEvent);
  }
  _$jscoverage['/dd/draggable.js'].lineData[389]++;
  var def = 1;
  _$jscoverage['/dd/draggable.js'].lineData[392]++;
  if (visit70_392_1(self.fire('drag', customEvent) === false)) {
    _$jscoverage['/dd/draggable.js'].lineData[393]++;
    def = 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[396]++;
  DDM.move(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[400]++;
  if (visit71_400_1(self.get('preventDefaultOnMove'))) {
    _$jscoverage['/dd/draggable.js'].lineData[401]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[404]++;
  if (visit72_404_1(def && move)) {
    _$jscoverage['/dd/draggable.js'].lineData[406]++;
    self.get('node').offset(self.get('actualPos'));
  }
}, 
  stopDrag: function() {
  _$jscoverage['/dd/draggable.js'].functionData[19]++;
  _$jscoverage['/dd/draggable.js'].lineData[415]++;
  if (visit73_415_1(this._isValidDrag)) {
    _$jscoverage['/dd/draggable.js'].lineData[416]++;
    this._end();
  }
}, 
  _end: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[20]++;
  _$jscoverage['/dd/draggable.js'].lineData[421]++;
  e = visit74_421_1(e || {});
  _$jscoverage['/dd/draggable.js'].lineData[423]++;
  var self = this, activeDrop;
  _$jscoverage['/dd/draggable.js'].lineData[426]++;
  self._isValidDrag = 0;
  _$jscoverage['/dd/draggable.js'].lineData[429]++;
  self.get('node').removeClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[431]++;
  self.get('dragNode').removeClass(PREFIX_CLS + 'dragging');
  _$jscoverage['/dd/draggable.js'].lineData[433]++;
  if ((activeDrop = DDM.get('activeDrop'))) {
    _$jscoverage['/dd/draggable.js'].lineData[434]++;
    self.fire('dragdrophit', {
  drag: self, 
  drop: activeDrop});
  } else {
    _$jscoverage['/dd/draggable.js'].lineData[439]++;
    self.fire('dragdropmiss', {
  drag: self});
  }
  _$jscoverage['/dd/draggable.js'].lineData[444]++;
  DDM.end(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[446]++;
  self.fire('dragend', {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY});
}, 
  _handleOut: function() {
  _$jscoverage['/dd/draggable.js'].functionData[21]++;
  _$jscoverage['/dd/draggable.js'].lineData[458]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[459]++;
  self.get('node').removeClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[462]++;
  self.fire('dragexit', {
  drag: self, 
  drop: DDM.get('activeDrop')});
}, 
  _handleEnter: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[22]++;
  _$jscoverage['/dd/draggable.js'].lineData[469]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[470]++;
  self.get('node').addClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[472]++;
  self.fire('dragenter', e);
}, 
  _handleOver: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[23]++;
  _$jscoverage['/dd/draggable.js'].lineData[476]++;
  this.fire('dragover', e);
}, 
  destructor: function() {
  _$jscoverage['/dd/draggable.js'].functionData[24]++;
  _$jscoverage['/dd/draggable.js'].lineData[485]++;
  this.stop();
}}, {
  name: 'Draggable', 
  ATTRS: {
  node: {
  setter: function(v) {
  _$jscoverage['/dd/draggable.js'].functionData[25]++;
  _$jscoverage['/dd/draggable.js'].lineData[508]++;
  if (visit75_508_1(!(v instanceof Node))) {
    _$jscoverage['/dd/draggable.js'].lineData[509]++;
    return $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[511]++;
  return undefined;
}}, 
  dragNode: {}, 
  shim: {
  value: false}, 
  handlers: {
  value: [], 
  getter: function(vs) {
  _$jscoverage['/dd/draggable.js'].functionData[26]++;
  _$jscoverage['/dd/draggable.js'].lineData[554]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[555]++;
  if (visit76_555_1(!vs.length)) {
    _$jscoverage['/dd/draggable.js'].lineData[556]++;
    vs[0] = self.get('node');
  }
  _$jscoverage['/dd/draggable.js'].lineData[558]++;
  each(vs, function(v, i) {
  _$jscoverage['/dd/draggable.js'].functionData[27]++;
  _$jscoverage['/dd/draggable.js'].lineData[559]++;
  if (visit77_559_1(typeof v === 'function')) {
    _$jscoverage['/dd/draggable.js'].lineData[560]++;
    v = v.call(self);
  }
  _$jscoverage['/dd/draggable.js'].lineData[563]++;
  if (visit78_563_1(typeof v === 'string')) {
    _$jscoverage['/dd/draggable.js'].lineData[564]++;
    v = self.get('node').one(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[566]++;
  if (visit79_566_1(v.nodeType)) {
    _$jscoverage['/dd/draggable.js'].lineData[567]++;
    v = $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[569]++;
  vs[i] = v;
});
  _$jscoverage['/dd/draggable.js'].lineData[571]++;
  self.setInternal('handlers', vs);
  _$jscoverage['/dd/draggable.js'].lineData[572]++;
  return vs;
}}, 
  activeHandler: {}, 
  mode: {
  value: 'point'}, 
  disabled: {
  value: false}, 
  move: {
  value: false}, 
  primaryButtonOnly: {
  value: true}, 
  halt: {
  value: true}, 
  groups: {
  value: true}, 
  startNodePos: {}, 
  actualPos: {}, 
  preventDefaultOnMove: {
  value: true}}, 
  inheritedStatics: {
  DropMode: {
  POINT: 'point', 
  INTERSECT: 'intersect', 
  STRICT: 'strict'}}});
  _$jscoverage['/dd/draggable.js'].lineData[733]++;
  var _ieSelectBack;
  _$jscoverage['/dd/draggable.js'].lineData[735]++;
  function fixIEMouseUp() {
    _$jscoverage['/dd/draggable.js'].functionData[28]++;
    _$jscoverage['/dd/draggable.js'].lineData[736]++;
    doc.body.onselectstart = _ieSelectBack;
    _$jscoverage['/dd/draggable.js'].lineData[739]++;
    if (visit80_739_1(doc.body.releaseCapture)) {
      _$jscoverage['/dd/draggable.js'].lineData[740]++;
      doc.body.releaseCapture();
    }
  }
  _$jscoverage['/dd/draggable.js'].lineData[745]++;
  function fixIEMouseDown() {
    _$jscoverage['/dd/draggable.js'].functionData[29]++;
    _$jscoverage['/dd/draggable.js'].lineData[746]++;
    _ieSelectBack = doc.body.onselectstart;
    _$jscoverage['/dd/draggable.js'].lineData[747]++;
    doc.body.onselectstart = fixIESelect;
    _$jscoverage['/dd/draggable.js'].lineData[750]++;
    if (visit81_750_1(doc.body.setCapture)) {
      _$jscoverage['/dd/draggable.js'].lineData[751]++;
      doc.body.setCapture();
    }
  }
  _$jscoverage['/dd/draggable.js'].lineData[761]++;
  function preventDefault(e) {
    _$jscoverage['/dd/draggable.js'].functionData[30]++;
    _$jscoverage['/dd/draggable.js'].lineData[762]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[768]++;
  function fixIESelect() {
    _$jscoverage['/dd/draggable.js'].functionData[31]++;
    _$jscoverage['/dd/draggable.js'].lineData[769]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[772]++;
  function onGestureStart(e) {
    _$jscoverage['/dd/draggable.js'].functionData[32]++;
    _$jscoverage['/dd/draggable.js'].lineData[773]++;
    this._isValidDrag = 0;
    _$jscoverage['/dd/draggable.js'].lineData[774]++;
    this.onGestureStart(e);
  }
  _$jscoverage['/dd/draggable.js'].lineData[777]++;
  return Draggable;
});
