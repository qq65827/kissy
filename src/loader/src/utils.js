/**
 * @ignore
 * Utils for kissy loader
 * @author yiminghe@gmail.com
 */
(function (S) {
    var Loader = S.Loader,
        Path = S.Path,
        Env = S.Env,
        host = Env.host,
        TRUE = !0,
        FALSE = !1,
        mix = S.mix,
        startsWith = S.startsWith,
        data = Loader.Status,
        ATTACHED = data.ATTACHED,
        READY_TO_ATTACH = data.READY_TO_ATTACH,
        LOADED = data.LOADED,
        ATTACHING = data.ATTACHING,
        ERROR = data.ERROR,
        /**
         * @class KISSY.Loader.Utils
         * Utils for KISSY Loader
         * @singleton
         * @private
         */
            Utils = Loader.Utils = {},
        doc = host.document;

    // http://wiki.commonjs.org/wiki/Packages/Mappings/A
    // 如果模块名以 / 结尾，自动加 index
    function addIndexAndRemoveJsExt(s) {
        if (typeof s === 'string') {
            return addIndexAndRemoveJsExtFromName(s);
        } else {
            var ret = [],
                i = 0,
                l = s.length;
            for (; i < l; i++) {
                ret[i] = addIndexAndRemoveJsExtFromName(s[i]);
            }
            return ret;
        }
    }

    function addIndexAndRemoveJsExtFromName(name) {
        // 'x/' 'x/y/z/'
        if (name.charAt(name.length - 1) === '/') {
            name += 'index';
        }
        if (S.endsWith(name, '.js')) {
            name = name.slice(0, -3);
        }
        return name;
    }

    function pluginAlias(name) {
        var index = name.indexOf('!');
        if (index !== -1) {
            var pluginName = name.substring(0, index);
            name = name.substring(index + 1);
            S.use(pluginName, {
                sync: true,
                success: function (S, Plugin) {
                    if (Plugin.alias) {
                        //noinspection JSReferencingMutableVariableFromClosure
                        name = Plugin.alias(name, pluginName);
                    }
                }
            });
        }
        return name;
    }

    function numberify(s) {
        var c = 0;
        // convert '1.2.3.4' to 1.234
        return parseFloat(s.replace(/\./g, function () {
            return (c++ === 0) ? '.' : '';
        }));
    }

    function getIEVersion() {
        var m, v;
        if ((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) &&
            (v = (m[1] || m[2]))) {
            return numberify(v);
        }
        return undefined;
    }

    function bind(fn, context) {
        return function () {
            return fn.apply(context, arguments);
        };
    }

    var m,
        ua = (host.navigator || {}).userAgent || '';

    // https://github.com/kissyteam/kissy/issues/545
    if (((m = ua.match(/AppleWebKit\/([\d.]*)/)) || (m = ua.match(/Safari\/([\d.]*)/))) && m[1]) {
        Utils.webkit = numberify(m[1]);
    }

    mix(Utils, {

        ie: getIEVersion(),

        /**
         * get document head
         * @return {HTMLElement}
         */
        docHead: function () {
            return doc.getElementsByTagName('head')[0] || doc.documentElement;
        },

        /**
         * Get absolute path of dep module.similar to {@link KISSY.Path#resolve}
         * @param {String} moduleName current module 's name
         * @param {String|String[]} depName dependency module 's name
         * @return {String|String[]} normalized dependency module 's name
         */
        normalDepModuleName: function (moduleName, depName) {
            var i = 0, l;

            if (!depName) {
                return depName;
            }

            if (typeof depName === 'string') {
                if (startsWith(depName, '../') || startsWith(depName, './')) {
                    // x/y/z -> x/y/
                    return Path.resolve(Path.dirname(moduleName), depName);
                }

                return Path.normalize(depName);
            }

            for (l = depName.length; i < l; i++) {
                depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
            }
            return depName;
        },

        /**
         * create modules info
         * @param {String[]} modNames to be created module names
         */
        createModulesInfo: function (modNames) {
            S.each(modNames, function (m) {
                Utils.createModuleInfo(m);
            });
        },

        /**
         * create single module info
         * @param {String} modName to be created module name
         * @param {Object} [cfg] module config
         * @return {KISSY.Loader.Module}
         */
        createModuleInfo: function (modName, cfg) {
            modName = addIndexAndRemoveJsExtFromName(modName);

            var mods = Env.mods,
                module = mods[modName];

            if (module) {
                return module;
            }

            // 防止 cfg 里有 tag，构建 fullpath 需要
            mods[modName] = module = new Loader.Module(mix({
                name: modName
            }, cfg));

            return module;
        },

        /**
         * Get modules exports
         * @param {String[]} modNames module names
         * @return {Array} modules exports
         */
        getModules: function (modNames) {
            var mods = [S], module,
                unalias,
                allOk,
                m,
                runtimeMods = Env.mods;

            S.each(modNames, function (modName) {
                module = runtimeMods[modName];
                if (!module || module.getType() !== 'css') {
                    unalias = Utils.unalias(modName);
                    allOk = true;
                    for (var i = 0; allOk && i < unalias.length; i++) {
                        m = runtimeMods[unalias[i]];
                        // allow partial module (circular dependency)
                        allOk = m && m.status >= ATTACHING;
                    }
                    if (allOk) {
                        mods.push(runtimeMods[unalias[0]].exports);
                    } else {
                        mods.push(null);
                    }
                } else {
                    mods.push(undefined);
                }
            });

            return mods;
        },

        /**
         * attach modules and their dependency modules recursively
         * @param {String[]} modNames module names
         */
        attachModsRecursively: function (modNames) {
            var i,
                l = modNames.length;
            for (i = 0; i < l; i++) {
                Utils.attachModRecursively(modNames[i]);
            }
        },

        checkModsLoadRecursively: function (modNames, stack, errorList, cache) {
            // for debug. prevent circular dependency
            stack = stack || [];
            // for efficiency. avoid duplicate non-attach check
            cache = cache || {};
            var i,
                s = 1,
                l = modNames.length,
                stackDepth = stack.length;
            for (i = 0; i < l; i++) {
                if (!s) {
                    return !!s;
                }
                s = Utils.checkModLoadRecursively(modNames[i], stack, errorList, cache);
                stack.length = stackDepth;
            }
            return !!s;
        },

        checkModLoadRecursively: function (modName, stack, errorList, cache) {
            var mods = Env.mods,
                status,
                m = mods[modName];
            if (modName in cache) {
                return cache[modName];
            }
            if (!m) {
                cache[modName] = FALSE;
                return FALSE;
            }
            status = m.status;
            if (status === ERROR) {
                errorList.push(m);
                cache[modName] = FALSE;
                return FALSE;
            }
            if (status >= READY_TO_ATTACH) {
                cache[modName] = TRUE;
                return TRUE;
            }
            if (status !== LOADED) {
                cache[modName] = FALSE;
                return FALSE;
            }
            if ('@DEBUG@') {
                if (stack[modName]) {
                    S.log('find cyclic dependency between mods: ' + stack, 'warn');
                } else {
                    stack.push(modName);
                }
            }
            if (stack[modName]) {
                cache[modName] = TRUE;
                return TRUE;
            } else {
                // tracking module name
                stack[modName] = 1;
            }

            if (Utils.checkModsLoadRecursively(m.getNormalizedRequires(), stack, errorList, cache)) {
                m.status = READY_TO_ATTACH;
                cache[modName] = TRUE;
                return TRUE;
            }

            cache[modName] = FALSE;
            return FALSE;
        },

        /**
         * attach module and its dependency modules recursively
         * @param {String} modName module name
         */
        attachModRecursively: function (modName) {
            var mods = Env.mods,
                status,
                m = mods[modName];
            status = m.status;
            // attached or circular dependency
            if (status >= ATTACHING) {
                return;
            }
            m.status = ATTACHING;
            if (m.cjs) {
                // commonjs format will call require in module code again
                Utils.attachMod(m);
            } else {
                Utils.attachModsRecursively(m.getNormalizedRequires());
                Utils.attachMod(m);
            }
        },

        /**
         * Attach specified module.
         * @param {KISSY.Loader.Module} module module instance
         */
        attachMod: function (module) {
            var factory = module.factory,
                exports;

            if (typeof factory === 'function') {
                // compatible and efficiency
                // KISSY.add(function(S,undefined){})
                var require;
                if (module.requires && module.requires.length && module.cjs) {
                    require = bind(module.require, module);
                }
                // 需要解开 index，相对路径
                // 但是需要保留 alias，防止值不对应
                //noinspection JSUnresolvedFunction
                exports = factory.apply(module,
                    // KISSY.add(function(S){module.require}) lazy initialize
                    (module.cjs ? [S, require, module.exports, module] :
                        Utils.getModules(module.getRequiresWithAlias())));
                if (exports !== undefined) {
                    //noinspection JSUndefinedPropertyAssignment
                    module.exports = exports;
                }
            } else {
                //noinspection JSUndefinedPropertyAssignment
                module.exports = factory;
            }

            module.status = ATTACHED;
        },

        /**
         * Get module names as array.
         * @param {String|String[]} modNames module names array or  module names string separated by ','
         * @return {String[]}
         */
        getModNamesAsArray: function (modNames) {
            if (typeof modNames === 'string') {
                modNames = modNames.replace(/\s+/g, '').split(',');
            }
            return modNames;
        },

        /**
         * normalize module names
         * 1. add index : / => /index
         * 2. unalias : core => dom,event,ua
         * 3. relative to absolute : ./x => y/x
         * @param {String|String[]} modNames Array of module names
         *  or module names string separated by comma
         * @param {String} [refModName]
         * @return {String[]} normalized module names
         */
        normalizeModNames: function (modNames, refModName) {
            return Utils.unalias(Utils.normalizeModNamesWithAlias(modNames, refModName));
        },

        /**
         * unalias module name.
         * @param {String|String[]} names moduleNames
         * @return {String[]} unalias module names
         */
        unalias: function (names) {
            var ret = [].concat(names),
                i,
                m,
                alias,
                ok = 0,
                j;
            while (!ok) {
                ok = 1;
                for (i = ret.length - 1; i >= 0; i--) {
                    if ((m = Utils.createModuleInfo(ret[i])) && ((alias = m.getAlias()) !== undefined)) {
                        ok = 0;
                        if (typeof alias === 'string') {
                            alias = [alias];
                        }
                        for (j = alias.length - 1; j >= 0; j--) {
                            if (!alias[j]) {
                                alias.splice(j, 1);
                            }
                        }
                        ret.splice.apply(ret, [i, 1].concat(addIndexAndRemoveJsExt(alias)));
                    }
                }
            }
            return ret;
        },

        /**
         * normalize module names with alias
         * @param {String[]} modNames module names
         * @param [refModName] module to be referred if module name path is relative
         * @return {String[]} normalize module names with alias
         */
        normalizeModNamesWithAlias: function (modNames, refModName) {
            var ret = [], i, l;
            if (modNames) {
                // 1. index map
                for (i = 0, l = modNames.length; i < l; i++) {
                    // conditional loader
                    // requires:[window.localStorage?"local-storage":""]
                    if (modNames[i]) {
                        ret.push(pluginAlias(addIndexAndRemoveJsExt(modNames[i])));
                    }
                }
            }
            // 2. relative to absolute (optional)
            if (refModName) {
                ret = Utils.normalDepModuleName(refModName, ret);
            }
            return ret;
        },

        /**
         * register module with factory
         * @param {String} name module name
         * @param {Function|*} factory module's factory or exports
         * @param [config] module config, such as dependency
         */
        registerModule: function (name, factory, config) {
            name = addIndexAndRemoveJsExtFromName(name);

            var mods = Env.mods,
                module = mods[name];

            if (module && module.factory !== undefined) {
                S.log(name + ' is defined more than once', 'warn');
                return;
            }

            // 没有 use，静态载入的 add 可能执行
            Utils.createModuleInfo(name);

            module = mods[name];

            // 注意：通过 S.add(name[, factory[, config]]) 注册的代码，无论是页面中的代码，
            // 还是 js 文件里的代码，add 执行时，都意味着该模块已经 LOADED
            mix(module, {
                name: name,
                status: LOADED,
                factory: factory
            });

            mix(module, config);
        },

        /**
         * Returns hash code of a string djb2 algorithm
         * @param {String} str
         * @returns {String} hash code
         */
        getHash: function (str) {
            var hash = 5381,
                i;
            for (i = str.length; --i > -1;) {
                hash = ((hash << 5) + hash) + str.charCodeAt(i);
                /* hash * 33 + char */
            }
            return hash + '';
        },

        getRequiresFromFn: function (fn) {
            var requires = [];
            // Remove comments from the callback string,
            // look for require calls, and pull them into the dependencies,
            // but only if there are function args.
            fn.toString()
                .replace(commentRegExp, '')
                .replace(requireRegExp, function (match, dep) {
                    requires.push(getRequireVal(dep));
                });
            return requires;
        }
    });

    var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
        requireRegExp = /[^.'"]\s*require\s*\(([^)]+)\)/g;

    function getRequireVal(str) {
        var m;
        // simple string
        if (!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/))) {
            S.error('can not find required mod in require call: ' + str);
        }
        return  m[1];
    }
})(KISSY);