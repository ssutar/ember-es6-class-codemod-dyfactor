ember-es6-class-codemod-dyfactor
==============================================================================

The ember-es6-class-codemod-dyfactor is a dyfactor plugin to extract the data about ember objects like Routes, Components, Controllers etc.

It is written with ember es6 codemods as primary use case but can be extended to be used for multiple use cases. 

Installation
------------------------------------------------------------------------------

```
yarn add ember-es6-class-codemod-dyfactor --dev
```
or
```
ember install ember-es6-class-codemod-dyfactor
```

Usage
------------------------------------------------------------------------------

After installation, a little configuration is needed:

1. In your `test-helper.js` import the `extract` utility from the `ember-es6-class-codemod-dyfactor`
```
import { extract } from "ember-es6-class-codemod-dyfactor/test-support/ember-object";
```
2. Call the extract utility before your tests are run.
```
// ... Other imports
import { extract } from "ember-es6-class-codemod-dyfactor/test-support/ember-object";
import { start } from "ember-qunit";

// ..... Other test helper code, setting up application, preloading assets etc

extract();
start();

```
3. Initialize the dyfactor using `yarn dyfactor init`, configure the navigation in `.dyfactor.json` to visit the tests page
4. Run the plugin - using 
```
yarn dyfactor run template ember-object path/to/files --level extract
```

Runtime Data
------------------------------------------------------------------------------

The plugin extracts the runtime data and dumps into `dyfactor-telemetry.json` indexed with `absolute file path`. Following is the example runtime data:

```
{
  "data": [
    {
      "/home/user/workspace/ember-app/app/components/list-filter.js": {
        "computedProperties": ['computedProp1', ...],
        "observedProperties": ['observedProp1', ...],
        "observerProperties": {
          "observerProp1": ["prop1", "prop2", ...]
        },
        "offProperties": {
          "offProp": ["prop3", ...]
        },
        "overriddenActions": ["overriddenAction1", ...],
        "overriddenProperties": ["overriddenProp1"],
        "ownProperties": ["prop1", ...],
        "type": "Component|Route|Controller|EmberObject",
        "unobservedProperties": {
          "unobservedProp1": ["prop1", ...]
        }
      }
    }
  ]
}
```
Contributing
------------------------------------------------------------------------------

### Installation

* `git clone <repository-url>`
* `cd ember-es6-class-codemod-dyfactor`
* `yarn install`

### Linting

* `yarn lint:hbs`
* `yarn lint:js`
* `yarn lint:js --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
