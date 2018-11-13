const { transform } = require("babel-core");
const { AbstractDynamicPlugin } = require("dyfactor");
const fs = require("fs");
const path = require("path");

/**
 * Checks if passed path is JS file
 *
 * @param path file path
 */
function jsFilesOnly(filePath) {
  return (
    filePath.charAt(filePath.length - 1) !== "/" &&
    filePath.substring(filePath.length - 3) === ".js" &&
    filePath.substring(filePath.length - 8) !== "-test.js"
  );
}

/**
 * Add instrumentation to the Ember object's init method
 *
 * Uses Ember meta to collect the data about object being initialized.
 * Returns babel parser plugin to modify the default export to named export
 *
 * @param babel
 * @param filePath
 */
function instrumentInit(babel, filePath) {
  const { types: t } = babel;
  let ident;
  let visited = false;

  return {
    name: "instrument-init",
    visitor: {
      Program: {
        enter(p) {
          visited = false;
          ident = p.scope.generateUidIdentifier("refactor");
        },
        exit(p) {
          if (visited) {
            const body = p.node.body;
            p.node.body = body.concat(t.exportDefaultDeclaration(ident));
          }
        }
      },
      ExportDefaultDeclaration(p) {
        const declaration = p.node.declaration;
        if (declaration.type === "FunctionDeclaration") {
          return;
        }
        const declarator = t.variableDeclarator(ident, declaration);
        const vars = [t.variableDeclaration("const", [declarator])];

        const dyBaseVar = t.variableDeclarator(
          t.identifier("__dyfactor_base_path__"),
          t.stringLiteral(filePath)
        );
        vars.push(
          t.exportNamedDeclaration(
            t.variableDeclaration("const", [dyBaseVar]),
            []
          )
        );

        p.replaceWithMultiple(vars);
        visited = true;
      }
    }
  };
}

/**
 * Plugin entry point
 */
class EmberES6ClassDyfactorPlugin extends AbstractDynamicPlugin {
  instrument() {
    this.inputs.filter(jsFilesOnly).forEach(input => {
      const code = fs.readFileSync(input, "utf8");
      const content = transform(code, {
        plugins: [
          babel => instrumentInit.call(null, babel, path.resolve(input))
        ]
      });

      fs.writeFileSync(input, content.code);
    });
  }

  modify() {
    // Add modification code here
    // Empty since the plugin only extracts data
  }
}

module.exports.default = EmberES6ClassDyfactorPlugin;
module.exports.instrumentInit = instrumentInit;
