(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports !== "undefined") {
        factory();
    } else {
        var mod = {
            exports: {}
        };
        factory();
        global.arcgisWorker = mod.exports;
    }
})(this, function () {
    "use strict";

    function _asyncToGenerator(fn) {
        return function () {
            var gen = fn.apply(this, arguments);
            return new Promise(function (resolve, reject) {
                function step(key, arg) {
                    try {
                        var info = gen[key](arg);
                        var value = info.value;
                    } catch (error) {
                        reject(error);
                        return;
                    }

                    if (info.done) {
                        resolve(value);
                    } else {
                        return Promise.resolve(value).then(function (value) {
                            step("next", value);
                        }, function (err) {
                            step("throw", err);
                        });
                    }
                }

                return step("next");
            });
        };
    }

    importScripts("../fetch.js", "../polyfill.min.js");
    /**
     * Gets information about a map service.
     * @param serviceUrl URL to the map service layer.
     */

    var getServiceInfo = function () {
        var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(serviceUrl) {
            var response, json, errorJson;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return fetch(serviceUrl + "?f=json");

                        case 2:
                            response = _context.sent;
                            _context.next = 5;
                            return response.json();

                        case 5:
                            json = _context.sent;
                            errorJson = json;

                            if (!errorJson.error) {
                                _context.next = 9;
                                break;
                            }

                            throw errorJson.error;

                        case 9:
                            return _context.abrupt("return", json);

                        case 10:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        return function getServiceInfo(_x) {
            return _ref.apply(this, arguments);
        };
    }();

    var getData = function () {
        var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(layerUrl, fieldNames) {
            var sp, searchParts, key, url, response, json, err, featureSet;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            sp = {
                                f: "json",
                                outFields: fieldNames ? fieldNames.join(",") : "*",
                                returnGeometry: false,
                                where: "1=1"
                            };
                            searchParts = new Array();
                            _context2.t0 = regeneratorRuntime.keys(sp);

                        case 3:
                            if ((_context2.t1 = _context2.t0()).done) {
                                _context2.next = 10;
                                break;
                            }

                            key = _context2.t1.value;

                            if (key in sp) {
                                _context2.next = 7;
                                break;
                            }

                            return _context2.abrupt("continue", 3);

                        case 7:
                            searchParts.push(key + "=" + encodeURIComponent(sp[key]));
                            _context2.next = 3;
                            break;

                        case 10:
                            // Query the service to get all data (or the max amount of records allowed by the server).
                            url = layerUrl + "/query?" + searchParts.join("&");
                            _context2.next = 13;
                            return fetch(url);

                        case 13:
                            response = _context2.sent;
                            _context2.next = 16;
                            return response.json();

                        case 16:
                            json = _context2.sent;

                            // Sometimes "successful" HTTP requests from ArcGIS server are still errors.
                            // Throw an exception if an "error" property is present in the returned JSON.
                            err = json;

                            if (!err.error) {
                                _context2.next = 20;
                                break;
                            }

                            throw err.error;

                        case 20:
                            // Return the FeatureSet if no errors were encountered.
                            featureSet = json;
                            return _context2.abrupt("return", featureSet);

                        case 22:
                        case "end":
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        return function getData(_x2, _x3) {
            return _ref2.apply(this, arguments);
        };
    }();

    // Setup handling messages from the page.
    addEventListener("message", function () {
        var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(msgEvt) {
            var url, svcPromise, serviceInfo, fields, fieldNames, dataPromise, allPromise;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!(msgEvt.data && typeof msgEvt.data === "string")) {
                                _context3.next = 16;
                                break;
                            }

                            url = msgEvt.data;
                            // Get info about the map / feature service layer.

                            svcPromise = getServiceInfo(url);
                            _context3.next = 5;
                            return svcPromise;

                        case 5:
                            serviceInfo = _context3.sent;

                            // Create a list of fields that excludes OID and geometry.
                            fields = serviceInfo.fields.filter(function (field) {
                                return field.type !== "esriFieldTypeOID" && field.type !== "esriFieldTypeGeometry";
                            });
                            // Create an array of field names (from the filtered list).

                            fieldNames = fields.map(function (field) {
                                return field.name;
                            });
                            // Send layer info back to the page so it can create table and column headers
                            // while awaiting features.

                            postMessage({
                                fields: fields,
                                serviceInfo: serviceInfo,
                                type: "serviceInfo"
                            });
                            // Query the service to get features (up to the max amount set by the service).
                            // When the query is complete, the features will be sent to the page.
                            dataPromise = getData(url, fieldNames);

                            dataPromise.then(function (featureSet) {
                                postMessage({
                                    type: "featureSet",
                                    featureSet: featureSet
                                });
                            }, function (error) {
                                postMessage({
                                    type: "error",
                                    error: error
                                });
                            });
                            // Once all of the HTTP queries to the feature service have
                            // been completed, the worker is no longer needed and can be
                            // closed.
                            allPromise = Promise.all([svcPromise, dataPromise]);

                            allPromise.then(function (results) {
                                postMessage({
                                    type: "done",
                                    serviceInfo: results[0],
                                    featureSet: results[1]
                                });
                                close();
                            });
                            allPromise.catch(function (errors) {
                                postMessage({
                                    type: "done",
                                    errors: errors
                                });
                            });
                            _context3.next = 17;
                            break;

                        case 16:
                            throw new TypeError("Unrecognized input message.");

                        case 17:
                        case "end":
                            return _context3.stop();
                    }
                }
            }, _callee3, undefined);
        }));

        return function (_x4) {
            return _ref3.apply(this, arguments);
        };
    }());
});