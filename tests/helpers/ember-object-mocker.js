import Ember from "ember";
import { sum } from "@ember/object/computed";
import EmberObject, { computed, observer } from "@ember/object";
import { on } from "@ember/object/evented";
import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";

// MIXINS
const LogMixin = Mixin.create({
  onLogError: on("logError", function() {}),

  onLogObserver: observer("logObserve", function() {}),

  actions: {
    handleFilterEntry() {}
  }
});

const AdditionMixin = Mixin.create({
  getAddition() {
    return this.addition;
  }
});

const RatioMixin = Mixin.create({
  getRatio() {
    return this.ratio;
  }
});

const DifferenceMixin = Mixin.create({
  onLogError: "",

  getDifference() {
    return this.difference;
  }
});

// Super base class
const SuperBase = EmberObject.extend(LogMixin, AdditionMixin, {
  superBaseProp: 1,

  number1: 2,
  number2: 3,

  product: observer("number1", "number2", function() {
    return this.number1 * this.number2;
  }),

  addition: sum("number1", "number2"),

  getProduct() {
    return this.product;
  },

  getAddition() {
    this._super(...arguments);
    return this.addition;
  }
});

// Base class
const Base = SuperBase.extend(RatioMixin, {
  baseProp: 4,

  ratio: computed("number1", "number2", function() {
    return this.number1 / this.number2;
  })
});

const mockEmberObject = Base.extend(DifferenceMixin, {
  value: "",
  filterProp: 5,
  product: "",
  maps: service(),

  ratio1: computed("number1", "number2", function() {
    return this.number1 / this.number2;
  }),

  difference: observer("number1", "number2", function() {
    return this.number1 - this.number2;
  }),

  init() {
    this._super(...arguments);
  },

  getAddition() {
    return this.difference + 2;
  },

  actions: {
    handleFilterEntry() {}
  }
});

const mockEmberObjectParsedMeta = {
  computedProperties: ["ratio1"],
  observedProperties: ["number1", "number2"],
  observerProperties: {
    difference: ["number1", "number2"]
  },
  offProperties: {
    onLogError: ["logError"]
  },
  overriddenActions: ["handleFilterEntry"],
  overriddenProperties: ["onLogError", "product", "init", "getAddition"],
  ownProperties: [
    "onLogError",
    "getDifference",
    "value",
    "filterProp",
    "product",
    "maps",
    "ratio1",
    "difference",
    "init",
    "getAddition"
  ],
  type: "EmberObject",
  unobservedProperties: {
    product: ["number1", "number2"]
  }
};

const mockEmberObjectMeta = Ember.meta(mockEmberObject.proto());

export { mockEmberObject, mockEmberObjectMeta, mockEmberObjectParsedMeta };
