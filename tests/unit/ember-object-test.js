import QUnit from "qunit";
import Application from "@ember/application";
import * as dyfactorUtil from "ember-es6-class-codemod-dyfactor/test-support/ember-object";
import {
  mockEmberObjectMeta,
  mockEmberObjectParsedMeta
} from "../helpers/ember-object-mocker";

QUnit.module("ember-object", {});

QUnit.test("Returns correct type if match found", function(assert) {
  const obj = new Application();
  assert.equal(
    dyfactorUtil.getType(obj),
    "Application",
    "Type 'Application' returned"
  );
});

QUnit.test("Returns EmberObject if match not found", function(assert) {
  const obj = new Date();
  assert.equal(
    dyfactorUtil.getType(obj),
    "EmberObject",
    "Type 'EmberObject' returned whne match not found"
  );
});

QUnit.test("Parse meta object - valid case", function(assert) {
  assert.deepEqual(
    dyfactorUtil.parseMeta(mockEmberObjectMeta),
    mockEmberObjectParsedMeta,
    "Default meta object parsed"
  );
});

QUnit.test("Parse meta object - invalid cases", function(assert) {
  assert.deepEqual(dyfactorUtil.parseMeta(null), {}, "NULL meta object parsed");
  assert.deepEqual(
    dyfactorUtil.parseMeta(),
    {},
    "Undefined meta object parsed"
  );
  assert.deepEqual(
    dyfactorUtil.parseMeta({ test: "" }),
    {},
    "Invalid meta object parsed"
  );
});

QUnit.test("Pares the listeners list", function(assert) {
  const listeners = dyfactorUtil.parseListeners([1, 2, 3, 4, 5, 6, 7, 8]);
  assert.equal(
    listeners.length,
    2,
    "listeners are split into chunk of length 2"
  );
  assert.equal(listeners[1].length, 4, "listeners have elements of length 4");
});
