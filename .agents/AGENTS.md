# AI PDF Studio — Permanent Development Rules

The Workflow Engine, Workspace architecture, Viewer abstraction, Capability system, and Document Session architecture are now considered stable. From this point onward, the objective is building a professional product, not redesigning infrastructure.

## 1. Architecture Stability
Treat the current architecture as the foundation.
Do not redesign or replace:
- Workflow Engine
- Execution Planner
- Capability Registry
- Operation Registry
- Document Session architecture
- StorageService
- Workspace architecture
- Viewer abstraction
- Event Bus

Only modify them if a real production limitation is discovered while implementing an actual feature. Do not redesign based on hypothetical future possibilities.

## 2. Feature-First Development
Every remaining milestone should prioritize user-visible functionality over infrastructure.
The question should no longer be: "How can we improve the architecture?"
Instead ask: "How can we implement this feature using the existing architecture?"
If the answer requires changing the engine, explain why before making changes.

## 3. Keep the Code Human
Continue writing code that looks like it was written by a strong final-year Computer Science student.
Prefer:
- Plain JavaScript
- Clear variable names
- Small functions
- Simple control flow
- Readable files
- Easy debugging

Avoid:
- AI-looking abstractions
- Generic frameworks
- Clever patterns
- Unnecessary helper files
- Premature optimization
- Excessive DRY if it hurts readability

Production architecture. Simple implementation.

## 4. Every Feature Must Be Complete
Do not create placeholders. Do not fake functionality. Do not simulate processing.
If a feature is implemented, it should genuinely work.
If it belongs to a future milestone, expose it as: `status: "COMING_SOON"` without fake execution.

## 5. Build Production Features
Every feature should include:
- Validation
- Error handling
- Loading states
- Empty states
- Success feedback
- Proper logging
- Version creation (where applicable)
- Session update
- Workspace refresh

No half-finished implementations.

## 6. Protect Existing Features
Every new milestone must preserve existing functionality.
Before considering a milestone complete, verify:
- Upload still works
- Session restoration still works
- Viewer still works
- Existing operations still work
- Version history still works
- Workflow Engine still works

Never break previous milestones.

## 7. Maintain UI Consistency
All future pages, dialogs, side panels, toolbars, buttons, and interactions should follow the existing design language.
Avoid introducing inconsistent layouts or design patterns.
The application should feel like a single polished desktop application.

## 8. Performance Mindset
When implementing features:
- Avoid unnecessary rerenders
- Avoid duplicate database queries
- Reuse existing data when possible
- Keep operations responsive
- Process large PDFs efficiently

Optimize only when it provides real value. Do not optimize prematurely.

## 9. Code Quality Before Quantity
Before marking any milestone complete:
- Remove dead code
- Remove temporary debugging
- Remove unused imports
- Remove duplicate logic
- Keep files organized
- Keep naming consistent

Treat every milestone as production-ready.

## 10. Final Engineering Principle
Whenever multiple implementations are possible:
Choose the one that:
- requires the fewest future rewrites,
- integrates naturally into the existing architecture,
- keeps the code simple and readable,
- and provides the best user experience.

Do not choose solutions simply because they are more abstract or more generic.

## Final Acceptance Rule
From this point onward, the success of AI PDF Studio will be measured by the quality of its features, user experience, stability, and performance—not by adding more architectural layers.
The architecture is now mature enough. Every future milestone should demonstrate that maturity by adding substantial functionality without redesigning the foundation.

## Permanent Engineering Standards

### 1. Trace Before Fix
Never fix a bug by assumption. For every bug:
- Identify the exact failing layer.
- Trace the complete data flow from source to destination.
- Identify the single root cause.
- Fix the root cause only.
- Verify the complete workflow after the fix.
Do not stack multiple speculative fixes for the same issue.

### 2. Evidence-Driven Development
Every implementation or bug fix must be supported by observable evidence.
Examples: Console output, Network requests, Backend logs, Database state, File system state, API responses.
Do not claim a problem is fixed until it has been verified through actual execution.

### 3. Zero Silent Failures
Never swallow errors. Every unexpected failure must:
- produce a meaningful log,
- return an appropriate response,
- preserve application stability,
- and leave the system in a recoverable state.
Silent failures are considered bugs.

### 4. Preserve Existing Functionality
Every completed task must finish with a regression check. At minimum verify:
- Upload
- Workspace loading
- Viewer rendering
- Session restoration
- Existing operations
- Version creation
No new feature is complete if it breaks an existing feature.

### 5. Build Like a Product
Every feature should feel complete. Before marking work complete ask:
- Is it intuitive?
- Is it visually consistent?
- Does it provide feedback?
- Does it handle errors?
- Would a user understand what is happening?
Do not stop at "it works." Aim for "it feels professional."

### 6. Prefer Simple Solutions
When multiple valid implementations exist, choose the one that is:
- easier to understand,
- easier to debug,
- easier to maintain,
- and naturally fits the existing architecture.
Do not introduce additional abstractions unless they solve a real problem.

### 7. Verify Before Declaring Success
Never state "Fixed" until the feature has been executed successfully.
Instead: implement, verify, then declare complete.
Implementation alone is not completion.

### 8. Keep Every Milestone Shippable
At the end of every milestone:
- remove temporary debugging,
- remove dead code,
- clean imports,
- ensure the application builds,
- ensure the application runs without console errors,
- ensure the milestone could be demonstrated to another developer.
Every milestone should leave the repository in a production-quality state.

### 9. File Downloads in Workflow Operations
When implementing backend operations that return files to be downloaded by the client (e.g., Extract Pages), NEVER store the file buffer in the `result.data` property, as this will crash MongoDB by exceeding the 16MB document limit.
Instead, you must return it via the `downloadData` property. Always check the **"Workflow Engine Download Bypass Architecture"** Knowledge Item for the exact implementation details.
