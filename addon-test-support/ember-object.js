import require from "require";
import Ember from "ember";

/* global requirejs */
const DYFACTOR_BASE_PATH = "__dyfactor_base_path__";

window.__dyfactor_telemetry = {};

function extract() {
  const entries = requirejs.entries;
  Object.keys(entries).forEach(modulePath => {
    const entry = entries[modulePath];
    const state = entry ? entry.state : "";
    if (state === "new") {
      const module = require(modulePath);
      if (
        module &&
        module.default &&
        module.default.proto &&
        module[DYFACTOR_BASE_PATH]
      ) {
        const defaultProto = module.default.proto();
        const dyBasePath = module[DYFACTOR_BASE_PATH];
        window.__dyfactor_telemetry[dyBasePath] = parseMeta(
          Ember.meta(defaultProto)
        );
      }
    }
  });
}

/**
 * Compares the object with types of Ember objects
 *
 * @param {Object} object
 */
function getType(object) {
  const types = [
    "Application",
    "Controller",
    "Route",
    "Component",
    "Service",
    "Router",
    "Engine"
  ];
  return (
    types.find(type => Ember[type] && object instanceof Ember[type]) ||
    "EmberObject"
  );
}

/**
 * Parses ember meta data object and collects the runtime information in the following format
 *
 * {
 *  computedProperties: []:String,
 *  observedProperties: []:String,
 *  observerProperties: []:String,
 *  offProperties: []:String,
 *  overriddenProperties: []:String,
 *  ownProperties: []:String,
 *  type: String,
 *  unobservedProperties: []:String
 * }
 *
 * @param {Object} meta
 */
function parseMeta(meta = {}) {
  if (!meta || !meta.source) {
    return {};
  }
  const { source } = meta;
  const type = getType(source);

  const ownProperties = Object.keys(source).filter(
    key => !["_super", "init"].includes(key)
  );

  const observedProperties = Object.keys(meta._watching || {});

  const overriddenProperties = ownProperties.filter(key =>
    isOverridden(meta.parent, key)
  );

  const computedProperties = [];
  meta.forEachDescriptors((name, desc) => {
    if (desc.enumerable && ownProperties.includes(name)) {
      computedProperties.push(name);
    }
  });

  const { offProperties, unobservedProperties } = ownProperties.reduce(
    ({ offProperties, unobservedProperties }, key) => {
      const type = getListenerType(meta.parent, key);
      if (type === "event") {
        offProperties.push(key);
      } else if (type === "observer") {
        unobservedProperties.push(key);
      }
      return { offProperties, unobservedProperties };
    },
    {
      offProperties: [],
      unobservedProperties: []
    }
  );

  const observerProperties = observedProperties.reduce((acc, oProp) => {
    const listener = meta.matchingListeners(`${oProp}:change`)[1];
    acc[listener] = [].concat(acc[listener] || [], [oProp]);
    return acc;
  }, {});

  return {
    computedProperties,
    observedProperties,
    observerProperties,
    offProperties,
    overriddenProperties,
    ownProperties,
    type,
    unobservedProperties
  };
}

/**
 * Parses the ember meta with passed key
 *
 * @param {Ember.meta} map
 * @param {String} key
 */
function getListenerType(map, key) {
  while (map) {
    const [event] =
      parseListeners(map._listeners).find(([, , method]) => method === key) ||
      [];
    if (event) {
      return event.indexOf(":") === -1 ? "event" : "observer";
    }
    map = map.parent;
  }
}

/**
 * Returns true if key is observed in parent
 *
 * @param {Ember.meta} map
 * @param {String} key
 */
function isObservedInParent(map, key) {
  while (map) {
    const isObserved = parseListeners(map._listeners).some(
      ([event, , method]) => method === key && event.indexOf(":") !== -1
    );
    if (isObserved) {
      return true;
    }
    map = map.parent;
  }
  return false;
}

/**
 * Returns true if key is listening to an event in parent
 *
 * @param {Ember.meta} map
 * @param {String} key
 */
function isEventListenerInParent(map, key) {
  while (map) {
    const isObserved = parseListeners(map._listeners).some(
      ([event, , method]) => method === key && event.indexOf(":") === -1
    );
    if (isObserved) {
      return true;
    }
    map = map.parent;
  }
  return false;
}

/**
 * Parse the listeners to a group of array of 4 elements
 *
 * @param {Array} listeners
 * @param {int} size
 */
function parseListeners(listeners = [], size = 4) {
  var result = [];
  const input = listeners.slice(0);
  while (input.length) {
    result.push(input.splice(0, size));
  }
  return result;
}

/**
 * Checks if passed key is overriding any value from the parent objects
 *
 * @param {Object} map
 * @param {String} key
 */
function isOverridden(map, key) {
  while (map) {
    const value = map.peekValues ? map.peekValues(key) : undefined;
    if (value !== undefined || (map.source && key in map.source)) {
      return true;
    }
    map = map.parent;
  }
  return false;
}

export {
  extract,
  getType,
  parseMeta,
  isOverridden,
  parseListeners,
  getListenerType,
  isObservedInParent,
  isEventListenerInParent
};
