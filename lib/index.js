import { transform } from "babel-core";
import { AbstractDynamicPlugin } from "dyfactor";
import * as fs from "fs";

/**
 * Checks if passed path is JS file
 *
 * @param path file path
 */
function jsFilesOnly(path) {
  return (
    path.charAt(path.length - 1) !== "/" &&
    path.substring(path.length - 3) === ".js"
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
export function instrumentInit(babel, filePath) {
  const { types: t } = babel;
  let ident;

  return {
    name: "instrument-init",
    visitor: {
      Program: {
        enter(p) {
          ident = p.scope.generateUidIdentifier("refactor");
        },
        exit(p) {
          const body = p.node.body;
          p.node.body = body.concat(t.exportDefaultDeclaration(ident));
        }
      },

      ExportDefaultDeclaration(p) {
        const declaration = p.node.declaration;
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
      }
    }
  };
}

/**
 * Plugin entry point
 */
export default class extends AbstractDynamicPlugin {
  instrument() {
    this.inputs.filter(jsFilesOnly).forEach(input => {
      const code = fs.readFileSync(input, "utf8");
      const content = transform(code, {
        plugins: [babel => instrumentInit.call(null, babel, input)]
      });

      fs.writeFileSync(input, content.code);
    });
  }

  modify() {
    // Add modification code here
    // Empty since the plugin only extracts data
  }
}
