# Lambda lab — source

React + Cloudscape source for the interactive "Create function" lab
embedded at `/courses/aws-foundations/labs/lambda`. See
`apps/web/labs/README.md` for how labs are built, embedded and added.

## Why isolated / embedded via iframe

See `apps/web/labs/ec2/README.md` — same reasoning (RTL Hebrew dark theme
vs. the real, light/LTR Cloudscape AWS console look), same `<iframe>`
embedding.

## Rebuilding

```sh
cd apps/web/labs/lambda
bun install
bun run build
```

This bundles `client/index.jsx` with Bun's native bundler and writes
`bundle.js` + `bundle.css` into `apps/web/public/labs/lambda/`, next to the
committed `index.html` shell.

## What's simulated vs. real

- Runtimes, the existing execution role and the console's starter code
  and "hello-world" test event are static data in `client/data.js`.
- "Create function" doesn't call any backend. `client/mockCreateFunction.js`
  validates the function name with the real console's rules and returns a
  fake ARN, execution role and (optionally) function URL.
- **The function code really runs.** `client/runtime.js` loads the
  student's `index.mjs` into a Web Worker in their browser and calls the
  exported `handler(event, context)`. It reports the result the way the
  real console does: status, response, `console.log` output, START / END /
  REPORT log lines, duration, billed duration, memory, and Init Duration on
  a cold start (the first run after creating or deploying). Errors come
  back with real Lambda error types (`Runtime.UserCodeSyntaxError`,
  `Runtime.HandlerNotFound`, `Runtime.ImportModuleError`, ...), and the
  configured timeout is enforced by terminating the worker
  (`Sandbox.Timedout`).
- Because the code runs in the browser, only the Node.js runtimes can be
  chosen (the others are shown disabled), and code can't `import`
  packages such as the AWS SDK.
- Like the real console, **Test runs the last deployed code**. Editing
  without choosing Deploy shows "Changes not deployed", and a test then
  warns that it ran the previous version.

## How this lab differs from EC2/S3/VPC

The real "Create function" page has no summary panel, so this lab doesn't
use the two-column `launch-grid` layout: the form ends with Cancel /
Create function buttons, like the real console. The function page keeps
both tabs (Code, Configuration) mounted and only hides the inactive one,
so unsaved code and test results survive switching tabs. The code editor
is a small textarea-based component (`sections/CodeEditor.jsx`) rather
than Cloudscape's `CodeEditor`, which needs the Ace editor as an extra
dependency.

The guided walkthrough has one step list per screen (`create` and
`function` in `client/tutorialSteps.js`); each opens the first time its
screen is shown.

## Flow

1. **Create function** — author from scratch, function name, runtime,
   architecture, execution role, and an optional function URL.
2. **Function page** — function overview (diagram, ARN, URL), the Code tab
   (code editor, Deploy, Test, test event JSON, execution results with
   logs), and the Configuration tab (edit memory and timeout, execution
   role).
