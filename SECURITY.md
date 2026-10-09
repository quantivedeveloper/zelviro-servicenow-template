# Security

- Use this repository only with an approved non-production ServiceNow instance.
- Keep the repository private after creating it from the template.
- Store SDK deployment credentials only in the protected
  `servicenow-nonprod` GitHub environment.
- Never commit OAuth secrets, access tokens, passwords, instance exports, or
  business data.
- Keep generated application branches protected and preserve the pinned
  workflow actions and ServiceNow SDK version.
- The ServiceNow SDK is a build-time dependency only. Do not expose its local
  development server to untrusted networks or use this repository as a web
  application runtime.

## Reviewed dependency policy

Use Node.js 22 LTS, `npm ci --ignore-scripts`, then
`node zelviro/security-hardening.cjs` before SDK initialization, transformation,
build or install. Dependencies remain pinned to the reviewed lockfile. The
application preparation workflow reuses that SDK and lockfile rather than
fetching an unlocked ephemeral SDK installation.

Published dependency patches are pinned in `package.json` overrides while the
validated ServiceNow SDK remains 4.9.2. `braces` 3.0.3 has no upstream fix for
[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
The included backport checks original source SHA-256 values, limits parser/AST
depth to 64, rejects cyclic/oversized ASTs, and exercises deeply nested patterns
and ordinary glob/range behavior. It fails on unrecognized or altered library
source. The upstream advisory remains visible; it is not dismissed or renamed.
Remove the backport only after adopting and verifying an upstream fixed release.
