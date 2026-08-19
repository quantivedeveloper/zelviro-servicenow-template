# Zelviro ServiceNow development starter

This credential-free GitHub template gives Zelviro a governed source-control
and ServiceNow SDK runner foundation before a target application is selected.

## First-time setup

1. Create a private repository from this template.
2. Create a protected GitHub environment named `servicenow-nonprod`.
3. Add these environment secrets for the separate ServiceNow SDK deployment
   identity:
   - `SN_SDK_INSTANCE_URL`
   - `SN_SDK_OAUTH_CLIENT_ID`
   - `SN_SDK_OAUTH_CLIENT_SECRET`
4. In Zelviro, enter the new `owner/repository`, keep base branch `main`, and
   verify the starter repository.
5. Create a fine-grained token restricted to this repository with Actions
   read/write, Commit statuses read, Contents read/write, Pull requests
   read/write, and Metadata read.

Zelviro later writes one bounded preparation manifest. The workflow imports an
existing ServiceNow application or initializes a newly approved scoped
application into an isolated `zelviro-app/*` branch. No target application,
customer identity, OAuth client, or secret is included in this template.

Do not install the placeholder `x_zelviro_template` project. It exists only so
Zelviro can verify the repository contract before the first application is
selected.
