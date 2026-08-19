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
