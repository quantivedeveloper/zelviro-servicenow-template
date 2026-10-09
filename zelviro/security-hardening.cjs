// GHSA-vfj7-8cjw-p6xm has no upstream release. Apply only this reviewed
// braces 3.0.3 backport, fail on unexpected source, and exercise the attack.
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const assert = require("node:assert/strict");

const hash = (source) => createHash("sha256").update(source).digest("hex");
const guard = `
// Zelviro depth backport: validate before any recursive AST traversal.
const assertBoundedAst = (ast) => {
  const pending = [[ast, 0]];
  const seen = new Set();
  let count = 0;
  while (pending.length) {
    const [node, depth] = pending.pop();
    if (depth > 64 || ++count > 20000 || seen.has(node)) {
      throw new RangeError('Brace AST exceeds safe depth or size');
    }
    seen.add(node);
    if (node && Array.isArray(node.nodes)) {
      for (const child of node.nodes) pending.push([child, depth + 1]);
    }
  }
};
`;

const patches = {
  "parse.js": {
    sha256: "e572166565f15fa6ad9865ae49d678218e32aabfd1b3720f6d0d43d39800d310",
    apply: (source) =>
      source.replaceAll(
        "      stack.push(block);",
        "      if (stack.length >= 64) throw new RangeError('Brace pattern exceeds safe depth');\n      stack.push(block);"
      )
  },
  "compile.js": {
    sha256: "dc98f22eee3d511785d92a00758d5f0d48efed5f5813bdecc2de430c529b5c9f",
    apply: (source) =>
      source.replace(
        "const compile = (ast, options = {}) => {",
        guard +
          "\nconst compile = (ast, options = {}) => {\n  assertBoundedAst(ast);"
      )
  },
  "expand.js": {
    sha256: "41ccc196ebfa7b7781a634e721eb744e4e7bcb54cba427a7e3d6806a1b9e58f7",
    apply: (source) =>
      source.replace(
        "const expand = (ast, options = {}) => {",
        guard +
          "\nconst expand = (ast, options = {}) => {\n  assertBoundedAst(ast);"
      )
  },
  "stringify.js": {
    sha256: "379f22d77bfa1478341ccd49c5e4267464aabcbba03558bab332aac23fc6f23a",
    apply: (source) =>
      source.replace(
        "module.exports = (ast, options = {}) => {",
        guard +
          "\nmodule.exports = (ast, options = {}) => {\n  assertBoundedAst(ast);"
      )
  }
};

function harden(directory) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(directory, "package.json"))
  );
  assert.equal(manifest.name, "braces");
  assert.equal(manifest.version, "3.0.3");
  // Validate every file before changing any file. Repeated runs remain verifiable.
  const changes = Object.entries(patches).map(([name, patch]) => {
    const file = path.join(directory, "lib", name);
    const source = fs.readFileSync(file, "utf8");
    if (hash(source) === patch.sha256) return [file, patch.apply(source)];
    // Reverse the precise patch to verify already-patched bytes, not a marker.
    const original =
      name === "parse.js"
        ? source.replaceAll(
            "      if (stack.length >= 64) throw new RangeError('Brace pattern exceeds safe depth');\n",
            ""
          )
        : source
            .replace(guard + "\n", "")
            .replace("\n  assertBoundedAst(ast);", "");
    assert.equal(
      hash(original),
      patch.sha256,
      "Unexpected braces source: " + name
    );
    assert.equal(
      source,
      patch.apply(original),
      "Incomplete braces backport: " + name
    );
    return [file, source];
  });
  for (const [file, source] of changes) fs.writeFileSync(file, source);
}

function verify(directory) {
  const braces = require(directory);
  const nested = "{".repeat(4000) + "a,b" + "}".repeat(4000);
  for (const call of [
    braces,
    braces.parse,
    braces.compile,
    braces.expand,
    braces.stringify
  ]) {
    assert.throws(() => call(nested), /safe depth/);
  }
  let ast = { type: "text", value: "x" };
  for (let i = 0; i < 4000; i++) ast = { type: "root", nodes: [ast] };
  for (const call of [braces.compile, braces.expand, braces.stringify]) {
    assert.throws(() => call(ast), /safe depth/);
  }
  const cycle = { type: "root", nodes: [] };
  cycle.nodes.push(cycle);
  assert.throws(() => braces.compile(cycle), /safe depth/);
  assert.deepEqual(braces.expand("src/{fluent,server}/*.{ts,js}"), [
    "src/fluent/*.ts",
    "src/fluent/*.js",
    "src/server/*.ts",
    "src/server/*.js"
  ]);
  assert.deepEqual(braces.expand("{1..3}"), ["1", "2", "3"]);
  assert.deepEqual(braces.expand('"' + "{".repeat(100) + '"'), [
    "{".repeat(100)
  ]);
  assert.deepEqual(braces.expand("\\{literal\\}"), ["{literal}"]);
}

function hardenAll(project) {
  const lock = JSON.parse(
    fs.readFileSync(path.join(project, "package-lock.json"), "utf8")
  );
  const copies = Object.entries(lock.packages).filter(([name]) =>
    name.endsWith("node_modules/braces")
  );
  assert.ok(copies.length, "No locked braces dependency found");
  for (const [name, metadata] of copies) {
    assert.equal(
      metadata.version,
      "3.0.3",
      "Review the backport before changing braces"
    );
    const directory = path.join(project, name);
    harden(directory);
    verify(directory);
  }
}

module.exports = { harden, verify, hardenAll };
if (require.main === module) {
  hardenAll(process.cwd());
  console.log("Verified braces 3.0.3 depth backport (GHSA-vfj7-8cjw-p6xm).");
}
