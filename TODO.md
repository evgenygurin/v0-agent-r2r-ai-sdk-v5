# Comprehensive ToDo List for Claude Code & Linear Integration

This document outlines a detailed plan for integrating Claude Code with Linear, building a Next.js application with Vercel and v0 templates, incorporating specific design styles, and establishing a robust development workflow.

## 1. Understand Claude Code & Linear Integration (Completed)

* Examined the provided GitHub repository (`evgenygurin/claude-code-connect`) and Codegen documentation (`https://docs.codegen.com/capabilities/capabilities`) to understand existing integration attempts and identify alternative methods for Linear without Cyrus.
* Formulated a backend developer's perspective on the integration, focusing on Linear webhooks, Linear GraphQL API, and the roles of Claude Code and Codegen.

## 2. Project Setup & Initialization (Vercel/v0)

### 2.1. Initialize New Next.js Project (using MCP Vercel)

1. Scaffold a new Next.js project using `npm create next-app --latest --typescript --eslint --tailwind --src-dir --app --import-alias "@/*" my-v0-linear-integration`.
2. Verify project creation and basic structure.
3. Change directory to the new project.
4. Install project dependencies (`npm install`).
5. Run the development server (`npm run dev`) to ensure it runs locally.
6. Create `.env.local` file.
7. Add basic Vercel environment variables (if any are immediately known, e.g., `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`).
8. Configure `next.config.mjs` for any specific Vercel settings (e.g., image optimization domains).

### 2.2. Vercel Deployment Setup

1. Link the project to a Vercel account/team (`vercel link`).
2. Perform an initial deployment to Vercel (`vercel deploy --prebuilt`).
3. Verify successful deployment on Vercel.
4. Configure Vercel project settings (e.g., environment variables, domains).

### 2.3. Integrate Existing Project Structure (from `v0-agent-r2r-ai-sdk-v5`)

1. Review the folder structure of the current project (`v0-agent-r2r-ai-sdk-v5`).
2. Identify core files and directories to migrate (e.g., `app/api`, `lib`, `components`).
3. Copy `app/globals.css` and `app/layout.tsx` to the new project.
4. Copy `tailwind.config.ts` and `postcss.config.mjs` from the current project to ensure consistent styling.
5. Copy `components.json` for `shadcn/ui` configuration.
6. Copy `lib/utils.ts` for utility functions.
7. Copy `lib/types/` for shared types.
8. Copy `components/ui/` for `shadcn/ui` components.
9. Install `shadcn/ui` dependencies (`npx shadcn-ui@latest init`).
10. Select appropriate options during `shadcn/ui` initialization (e.g., TypeScript, Tailwind CSS, `components.json` path).
11. Copy other relevant `lib/` directories (e.g., `lib/claude-code`, `lib/r2r`) as needed for the AI agent functionality.
12. Copy `app/api/agent/route.ts` and related API routes.
13. Adjust imports and paths in copied files to match the new project structure.
14. Resolve any initial compilation errors (`npm run build`).

### 2.4. v0 Template Integration

1. Review the provided v0 template links.
2. Select a base v0 template for the main layout (e.g., `sidebar-layout-ybLyeN1sesS`).
3. Use `v0.app` to generate the code for the selected template.
4. Integrate the generated v0 code into the new Next.js project (e.g., into `app/page.tsx` or a new component).
5. Adjust styling to match `shadcn/ui` and the desired "liquid glass" aesthetic.
6. Repeat for other relevant v0 components (e.g., `ai-chat-interface-6VLiqkGu5vw` for the chat UI).
7. Ensure all v0 components are correctly integrated and styled.

### 2.5. Styling Integration (`shadcn/ui` & "liquid glass")

1. Ensure `shadcn/ui` is correctly configured and its components are available.
2. Research "liquid glass" effect implementation with Tailwind CSS and Radix UI (which `shadcn/ui` uses).
3. Identify CSS properties and Tailwind classes for "liquid glass" (e.g., `backdrop-filter`, `blur`, `opacity`, gradients).
4. Create a custom Tailwind CSS plugin or extend `tailwind.config.ts` to include "liquid glass" styles.
5. Apply "liquid glass" styles to selected components (e.g., cards, dialogs, sidebars).
6. Ensure responsiveness and cross-browser compatibility for the "liquid glass" effect.
7. Review `https://github.com/evgenygurin/v0-new-components-shadcn-ui` for inspiration and specific implementation details for "liquid glass" with `shadcn/ui`.
8. Extract relevant CSS or component styles from `v0-new-components-shadcn-ui` and adapt them.
9. Create a dedicated `styles/liquid-glass.css` or similar file if the styles are extensive.
10. Import custom styles into `app/globals.css`.
11. Test the visual integration of `shadcn/ui` and "liquid glass" across different components.

## 3. Linear Integration (Backend)

### 3.1. Linear Webhook Endpoint Setup

1. Create a new API route in `app/api/linear-webhook/route.ts` to handle incoming Linear webhooks.
2. Define the route to accept `POST` requests.
3. Parse the incoming request body as JSON.
4. Implement basic logging for received webhooks (payload, headers).
5. Configure the Linear webhook URL in Linear settings to point to the deployed Vercel endpoint (e.g., `https://your-app.vercel.app/api/linear-webhook`).

### 3.2. Webhook Signature Verification

1. Retrieve `LINEAR_WEBHOOK_SECRET` from environment variables.
2. Implement a utility function `verifyLinearWebhookSignature(payload, signature, secret)` in `lib/linear/utils.ts`.
3. Extract the `Linear-Signature` header from the incoming request.
4. Use a cryptographic hash function (e.g., `crypto.createHmac` in Node.js) to compute the expected signature from the raw request body and the secret.
5. Compare the computed signature with the received `Linear-Signature`.
6. If signatures do not match, return a `401 Unauthorized` response and log the failure.
7. If signatures match, proceed with processing the webhook.

### 3.3. Webhook Payload Processing

1. Define TypeScript interfaces for Linear webhook payloads (e.g., `LinearWebhookPayload`, `LinearIssueEvent`, `LinearCommentEvent`).
2. Extract the `type` of the event (e.g., `Issue`, `Comment`).
3. Extract the `action` of the event (e.g., `create`, `update`, `remove`).
4. Implement a dispatcher or handler function based on the event `type` and `action`.
5. For `Issue` events: Handle `issue.create`: Extract new issue details (ID, title, description, assignee, status).
6. For `Issue` events: Handle `issue.update`: Extract updated issue details and identify changes.
7. For `Issue` events: Handle `issue.remove`: Log issue deletion.
8. For `Comment` events: Handle `comment.create`: Extract new comment details (ID, body, author, associated issue ID).
9. For `Comment` events: Handle `comment.update`: Extract updated comment details.
10. For `Comment` events: Handle `comment.remove`: Log comment deletion.

### 3.4. Linear API Client Setup

1. Install a GraphQL client library (e.g., `graphql-request` or `apollo-client` if a more complex setup is desired, but `graphql-request` is simpler for direct API calls).
2. Retrieve `LINEAR_API_KEY` from environment variables.
3. Create a `LinearGraphQLClient` class or utility in `lib/linear/client.ts`.
4. Initialize the client with the Linear GraphQL API endpoint (`https://api.linear.app/graphql`) and the `LINEAR_API_KEY` in the `Authorization` header.
5. Implement helper functions for common GraphQL operations:
    * `getIssue(issueId: string)`: Fetches full details of an issue.
    * `updateIssueStatus(issueId: string, statusId: string)`: Updates an issue's status.
    * `addComment(issueId: string, commentBody: string)`: Adds a comment to an issue.
    * `linkPullRequest(issueId: string, pullRequestUrl: string)`: Links a PR to an issue.
    * `assignIssue(issueId: string, assigneeId: string)`: Assigns an issue to a user.

### 3.5. Authentication (OAuth - if needed for advanced features)

1. If user-specific actions are required, implement Linear OAuth flow.
2. Configure `LINEAR_OAUTH_CLIENT_ID` and `LINEAR_OAUTH_CLIENT_SECRET`.
3. Create API routes for OAuth callback (`/api/auth/linear/callback`).
4. Handle token exchange and storage of access tokens.
5. Modify `LinearGraphQLClient` to use OAuth tokens when available.

### 3.6. Error Handling and Logging for Linear Integration

1. Implement centralized error handling for Linear API calls (e.g., retry mechanisms, circuit breakers).
2. Log all Linear API requests and responses (sanitizing sensitive data).
3. Set up alerts for failed webhook signature verifications or Linear API errors.
4. Implement a dead-letter queue or similar mechanism for failed webhook processing.

## 4. Claude Code (Boss Agent) Logic

### 4.1. Core Agent Service

1. Create a new service `lib/claude-agent/service.ts` to encapsulate the Claude Code logic.
2. Define an interface `IAgentService` with methods like `processLinearWebhook(payload: LinearWebhookPayload)`.
3. Initialize the Claude Code SDK within this service.
4. Configure the Claude Code SDK with `ANTHROPIC_API_KEY` from environment variables.

### 4.2. Decision Engine

1. Implement a `DecisionEngine` class or function within `lib/claude-agent/decision-engine.ts`.
2. The `DecisionEngine` will take a parsed Linear event and the current state as input.
3. It will use Claude Code to analyze the Linear issue description, comments, and event type.
4. Define a prompt for Claude Code to analyze the Linear event and suggest actions (e.g., "Issue created, assign to Codegen for implementation," "Comment added, ask for clarification").
5. Parse Claude Code's response to extract the suggested action and parameters.
6. Possible actions: `DELEGATE_TO_CODEGEN`, `UPDATE_LINEAR_STATUS`, `ADD_LINEAR_COMMENT`, `REQUEST_CLARIFICATION`, `CREATE_GITHUB_PR`.

### 4.3. Task Analysis

1. Implement `analyzeLinearIssue(issue: LinearIssue)` function.
2. Use Claude Code to extract key information from the issue description:
    * Problem statement.
    * Expected outcome.
    * Affected areas/components.
    * Severity/priority.
    * Required skills/technologies.
3. Store this analyzed information in a structured format (e.g., a `TaskContext` object).

### 4.4. Orchestration Logic

1. In `IAgentService.processLinearWebhook`, call the `DecisionEngine` to get the suggested action.
2. Implement handlers for each action:
    * **`DELEGATE_TO_CODEGEN`:**
        * Construct a detailed prompt for the Codegen agent based on the `TaskContext`.
        * Call the Codegen API (which will be implemented in the next section).
        * Update the Linear issue status to "In Progress (Codegen)".
        * Add a comment to the Linear issue indicating that Codegen is working on it.
    * **`UPDATE_LINEAR_STATUS`:**
        * Call `LinearGraphQLClient.updateIssueStatus`.
    * **`ADD_LINEAR_COMMENT`:**
        * Call `LinearGraphQLClient.addComment`.
    * **`REQUEST_CLARIFICATION`:**
        * Add a comment to the Linear issue asking for specific clarification.
        * Update the Linear issue status to "Waiting for Info".
    * **`CREATE_GITHUB_PR` (Placeholder for future integration):**
        * (This would involve GitHub API interaction to create a branch and PR).

### 4.5. State Management/Memory (Mem0 Integration - if applicable)

1. If Mem0 is used for persistent memory (as suggested in `claude-code-connect`), integrate it here.
2. Store `TaskContext` and decision history in Mem0.
3. Retrieve relevant context from Mem0 before making new decisions.

### 4.6. Error Handling and Logging for Claude Code Logic

1. Log all Claude Code prompts and responses.
2. Handle potential errors from Claude Code API calls (e.g., rate limits, invalid responses).
3. Implement fallback mechanisms if Claude Code fails to provide a clear decision.
4. Log all orchestration actions and their outcomes.

## 5. Codegen Integration

### 5.1. Codegen API Client Setup

1. Install a suitable HTTP client library (e.g., `axios` or `node-fetch`).
2. Retrieve `CODEGEN_API_KEY` and `CODEGEN_BASE_URL` from environment variables.
3. Create a `CodegenClient` class or utility in `lib/codegen/client.ts`.
4. Initialize the client with the `CODEGEN_BASE_URL` and `CODEGEN_API_KEY` in the `Authorization` header.
5. Define TypeScript interfaces for Codegen API requests and responses (e.g., `CodegenTaskRequest`, `CodegenTaskResponse`, `CodegenTaskStatus`).

### 5.2. Task Delegation to Codegen

1. Implement `delegateTask(taskContext: TaskContext)` method in `CodegenClient`.
2. This method will construct the payload for the Codegen API's task creation endpoint.
3. The payload should include:
    * A clear, concise prompt for the Codegen agent (derived from `TaskContext`).
    * Contextual information (e.g., repository URL, branch, file paths).
    * Any specific instructions or constraints.
4. Make a `POST` request to the Codegen task creation endpoint.
5. Handle the response, extracting the `taskId` for monitoring.

### 5.3. Monitoring Codegen Task Status

1. Implement `getTaskStatus(taskId: string)` method in `CodegenClient`.
2. Make a `GET` request to the Codegen task status endpoint.
3. Parse the response to get the current status (e.g., `PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`).
4. Implement a polling mechanism (e.g., using `setInterval` or a queue-based approach) in the Claude Code orchestration logic to periodically check Codegen task status.

### 5.4. Retrieving Codegen Results

1. Implement `getTaskResults(taskId: string)` method in `CodegenClient`.
2. Make a `GET` request to the Codegen task results endpoint.
3. Parse the response to retrieve the output (e.g., generated code, PR URL, test results).

### 5.5. Codegen Webhook Reception (Optional, for real-time updates)

1. If Codegen supports webhooks for task status updates, create a new API route `app/api/codegen-webhook/route.ts`.
2. Implement webhook signature verification for Codegen webhooks (similar to Linear).
3. Process Codegen webhook payloads to update the status of delegated tasks in real-time.

### 5.6. Error Handling and Logging for Codegen Integration

1. Implement centralized error handling for Codegen API calls (e.g., retry mechanisms, circuit breakers).
2. Log all Codegen API requests and responses (sanitizing sensitive data).
3. Set up alerts for failed Codegen API calls or unexpected task failures.
4. Implement a fallback strategy if Codegen fails to complete a task (e.g., escalate to a human, retry with a different prompt).

## 6. UI/Frontend Development (v0/shadcn/liquid glass)

### 6.1. Main Layout Integration

1. Integrate the chosen v0 sidebar layout template (e.g., `sidebar-layout-ybLyeN1sesS`) into `app/layout.tsx` or `app/page.tsx`.
2. Ensure the sidebar is functional and responsive.
3. Apply initial `shadcn/ui` styling to the layout components.

### 6.2. Dashboard/Monitoring View

1. Create a new page `app/dashboard/page.tsx` for the main monitoring view.
2. Design a dashboard layout using `shadcn/ui` `Card` and `Grid` components.
3. **Linear Issues Display:**
    * Create a component `components/linear-issues-table.tsx`.
    * Fetch Linear issues from a new API route (`/api/linear/issues`).
    * Display issues in a `shadcn/ui` `Table` component.
    * Implement filtering and sorting for issues.
    * Add a search input (`shadcn/ui` `Input`) to filter issues by title/description.
    * Display issue status, assignee, and last updated time.
    * Apply "liquid glass" styling to the issue cards or table rows.
4. **Codegen Task Status Display:**
    * Create a component `components/codegen-tasks-list.tsx`.
    * Fetch Codegen task statuses from a new API route (`/api/codegen/tasks`).
    * Display tasks with their status, associated Linear issue, and progress.
    * Use `shadcn/ui` `Badge` components for status indicators.
    * Implement real-time updates for task status (e.g., using SWR polling or WebSockets).
    * Apply "liquid glass" styling to the task list items.
5. **Activity Feed/Logs:**
    * Create a component `components/activity-feed.tsx`.
    * Display a chronological feed of agent activities (e.g., "Issue X assigned to Codegen," "Codegen task Y completed," "Comment added to Issue Z").
    * Use `shadcn/ui` `Card` and `ScrollArea` for the feed.
    * Apply "liquid glass" styling to the activity feed.

### 6.3. Configuration Panel

1. Create a page `app/settings/page.tsx` for agent configuration.
2. Use `shadcn/ui` `Form` components for input fields.
3. **API Key Management:**
    * Input fields for `ANTHROPIC_API_KEY`, `LINEAR_API_KEY`, `CODEGEN_API_KEY`.
    * Implement secure storage and retrieval of API keys (e.g., using Vercel Environment Variables or a backend service).
    * Add `shadcn/ui` `Button` for saving configurations.
4. **Agent Behavior Settings:**
    * Toggle switches (`shadcn/ui` `Switch`) for enabling/disabling certain agent behaviors (e.g., "Auto-delegate to Codegen," "Auto-comment on Linear").
    * Input fields for Claude Code prompts or instructions.
5. Apply "liquid glass" styling to the configuration panel elements.

### 6.4. Chat Interface (for direct interaction with Claude Code)

1. Integrate the `ai-chat-interface-6VLiqkGu5vw` v0 template.
2. Connect the chat input to the Claude Code API route (`/api/agent/route.ts`).
3. Display chat messages with user and agent roles.
4. Implement streaming responses from Claude Code.
5. Apply "liquid glass" styling to the chat bubbles and input area.

### 6.5. Styling Refinements & "Liquid Glass" Application

1. Consistently apply the "liquid glass" effect across all major UI components (sidebar, cards, tables, chat).
2. Ensure color schemes and typography are harmonious with the "liquid glass" aesthetic and `shadcn/ui` defaults.
3. Optimize CSS for performance and responsiveness.
4. Review and refine all v0 components to ensure they align with the overall design language.

### 6.6. Accessibility (A11y)

1. Ensure all UI components are keyboard navigable.
2. Add appropriate ARIA attributes for screen readers.
3. Test color contrast ratios.

## 7. Testing

### 7.1. Unit Testing (Backend Logic)

1. Set up a testing framework (e.g., Jest or Vitest, as suggested by `claude-code-connect`).
2. Write unit tests for `lib/linear/utils.ts` (e.g., `verifyLinearWebhookSignature`).
3. Write unit tests for `lib/linear/client.ts` (mocking GraphQL requests).
4. Write unit tests for `lib/claude-agent/service.ts` (mocking Claude Code SDK and Linear client).
5. Write unit tests for `lib/claude-agent/decision-engine.ts` (mocking Claude Code responses).
6. Write unit tests for `lib/codegen/client.ts` (mocking Codegen API requests).
7. Ensure high code coverage for core backend logic.

### 7.2. Unit Testing (Frontend Components)

1. Set up a testing library (e.g., React Testing Library).
2. Write unit tests for `components/linear-issues-table.tsx` (mocking data fetching).
3. Write unit tests for `components/codegen-tasks-list.tsx`.
4. Write unit tests for `components/activity-feed.tsx`.
5. Write unit tests for `app/settings/page.tsx` (testing form interactions).
6. Write unit tests for chat interface components.
7. Test component rendering, user interactions, and state updates.

### 7.3. Integration Testing (API Routes)

1. Write integration tests for `app/api/linear-webhook/route.ts` (sending mock Linear webhooks and verifying backend logic).
2. Write integration tests for `app/api/codegen-webhook/route.ts` (if implemented).
3. Write integration tests for `app/api/linear/issues` and `app/api/codegen/tasks` (verifying data retrieval).
4. Write integration tests for `app/api/agent/route.ts` (testing end-to-end Claude Code interaction).
5. Use a tool like `supertest` for API route testing.

### 7.4. End-to-End Testing (E2E)

1. Set up an E2E testing framework (e.g., Playwright or Cypress).
2. Write E2E tests for the full user flow:
    * Navigating to the dashboard.
    * Viewing Linear issues and Codegen tasks.
    * Interacting with the configuration panel.
    * Sending messages in the chat interface.
    * Simulating a Linear webhook event and observing its effect on the UI.
    * Verifying "liquid glass" styling is applied correctly.
3. Run E2E tests in a headless browser.

### 7.5. Linting and Type Checking

1. Configure ESLint with appropriate rules for TypeScript and React.
2. Run `npm run lint` as part of CI/CD.
3. Run `npm run type-check` (or `tsc --noEmit`) as part of CI/CD.

### 7.6. Performance Testing (Basic)

1. Use Lighthouse or similar tools to check page load times and performance metrics.
2. Identify and optimize slow-rendering components or API calls.

## 8. Deployment & Monitoring

### 8.1. Vercel Deployment Configuration

1. Ensure `next.config.mjs` is optimized for Vercel deployment (e.g., `output: 'standalone'` for Docker, if applicable).
2. Configure Vercel project environment variables (e.g., `ANTHROPIC_API_KEY`, `LINEAR_API_KEY`, `CODEGEN_API_KEY`, `LINEAR_WEBHOOK_SECRET`).
3. Set up Vercel aliases for production and preview environments.
4. Configure Vercel Git integration for automatic deployments on push to specific branches.
5. Define Vercel build commands and output directory.

### 8.2. Logging Strategy

1. Implement a structured logging library (e.g., `pino` or `winston`) for all backend services.
2. Ensure logs are output in a Vercel-compatible format (e.g., JSON).
3. Log all incoming requests, outgoing API calls, and significant events (e.g., webhook processing, agent decisions, task delegations).
4. Include correlation IDs in logs to trace requests across different services.
5. Configure log levels (e.g., `debug`, `info`, `warn`, `error`).

### 8.3. Error Tracking and Alerting

1. Integrate an error tracking service (e.g., Sentry, as mentioned in `claude-code-connect`).
2. Configure Sentry DSN in environment variables.
3. Capture unhandled exceptions and promise rejections.
4. Report errors with relevant context (user info, request details, stack traces).
5. Set up alerts for critical errors (e.g., Linear webhook signature failures, Claude Code API errors, Codegen task failures).

### 8.4. Performance Monitoring

1. Utilize Vercel Analytics for frontend performance metrics (Web Vitals).
2. Integrate a backend APM tool (e.g., Datadog, New Relic) if more detailed tracing and performance insights are needed for serverless functions.
3. Monitor API response times and error rates.

### 8.5. Uptime Monitoring

1. Set up external uptime monitoring for the deployed application endpoint.
2. Configure alerts for downtime.

### 8.6. Cost Monitoring

1. Monitor Vercel usage and billing to track costs.
2. Monitor Claude Code and Codegen API usage to manage expenses.

## 9. Git Workflow

### 9.1. Branching Strategy

1. Adopt a feature-branch workflow (e.g., Gitflow or GitHub Flow).
2. Create a new branch for each feature or bug fix (e.g., `feature/linear-integration`, `bugfix/webhook-signature`).
3. Ensure branches are named descriptively.
4. Regularly rebase feature branches on `main` (or `develop`) to keep them up-to-date.

### 9.2. Committing Guidelines

1. Write clear, concise, and descriptive commit messages.
2. Follow Conventional Commits specification (e.g., `feat: add Linear webhook endpoint`, `fix: correct signature verification`).
3. Ensure each commit represents a single logical change.
4. Reference Linear issues in commit messages (e.g., `feat: implement Linear webhook endpoint [LN-123]`).

### 9.3. Pull Request (PR) / Merge Request (MR) Process

1. Create PRs early and often for visibility and feedback.
2. Ensure PR descriptions are detailed, explaining the "what," "why," and "how" of the changes.
3. Include screenshots or GIFs for UI changes.
4. Link PRs to relevant Linear issues.
5. Request reviews from at least two team members.
6. Address all review comments and suggestions.
7. Ensure all CI/CD checks (linting, tests, type-checking) pass before merging.

### 9.4. Code Review Best Practices

1. Provide constructive feedback during code reviews.
2. Focus on code quality, maintainability, performance, and security.
3. Ensure adherence to project coding standards and conventions.
4. Approve PRs only after all concerns are addressed and tests pass.

### 9.5. Merging Strategy

1. Prefer squash and merge or rebase and merge to maintain a clean Git history.
2. Avoid merge commits on `main` (or `develop`) if possible.
3. Ensure `main` (or `develop`) is always deployable.

### 9.6. GitHub Actions / CI/CD Integration

1. Set up GitHub Actions (or CircleCI, as in the original project) for automated CI/CD.
2. Configure workflows for:
    * Linting and type-checking on every push.
    * Running unit and integration tests on every push.
    * Running E2E tests on PRs to `main`.
    * Automated Vercel deployments on merge to `main` (or `develop`).
    * Automated PR reviews (e.g., using Codegen's PR Review capability).
    * Automated checks auto-fixer (e.g., using Codegen's Checks Auto-fixer).

## 10. Tool Integration (`fd`, `rg`, `ast-grep`, `jq`, `yq`)

### 10.1. `fd` (find directory/file)

1. Use `fd` for quickly locating files by name or pattern (e.g., `fd .tsx components`).
2. Integrate `fd` into shell scripts for file operations.
3. Use `fd` with other tools (e.g., `fd .ts | xargs rg "interface"`).

### 10.2. `rg` (ripgrep - search file content)

1. Use `rg` for fast, recursive content searching within the codebase (e.g., `rg "LinearWebhookPayload" lib/`).
2. Utilize `rg`'s regex capabilities for complex searches.
3. Combine `rg` with `fd` for targeted content searches.
4. Use `rg` for identifying unused imports or declarations.

### 10.3. `ast-grep` (structural code search and rewrite)

1. Install `ast-grep` for advanced code analysis.
2. Use `ast-grep` to find specific code patterns (e.g., `ast-grep --lang tsx --pattern 'function $NAME($$$ARGS) { $$$BODY }'`).
3. Use `ast-grep` for refactoring tasks (e.g., changing function signatures, updating component props).
4. Integrate `ast-grep` into pre-commit hooks for enforcing code standards.

### 10.4. `jq` (JSON processor)

1. Use `jq` for parsing and manipulating JSON output from APIs or logs (e.g., `curl ... | jq '.data.issues[] | .title, .status'`).
2. Filter and transform Linear webhook payloads using `jq` for debugging.
3. Process Codegen API responses with `jq` to extract specific fields.

### 10.5. `yq` (YAML/XML/TOML processor - for configuration files)

1. Use `yq` for parsing and manipulating YAML configuration files (e.g., `.github/workflows/*.yml`, CircleCI config).
2. Automate updates to CI/CD configurations using `yq`.
3. Extract specific values from `package.json` or `tsconfig.json` (which are JSON but `yq` can handle JSON too).

### 10.6. Documentation of Tool Usage

1. Create a `DEVELOPMENT.md` file to document how to use these tools effectively within the project.
2. Include common commands and use cases for each tool.
