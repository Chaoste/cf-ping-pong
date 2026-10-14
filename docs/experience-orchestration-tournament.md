# Ping Pong Experience Orchestration dashboard

This repository includes a local React renderer for a native Contentful Experience
Orchestration (XO) dashboard. It intentionally uses XO Components, a Data Assembly,
Experience Fragments, an Experience Template, and an Experience rather than creating
presentation content types.

## What is provisioned

The dashboard uses these resources in the selected environment. The bootstrap script
registers the component contracts and preserves the UI-authored bindings:

| XO resource          | IDs                                                                                                            | Purpose                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Components           | `tournament-dashboard-shell`, `tournament-status`, `next-match`, `current-results`, `tournament-bracket`       | Render dashboard layout and four tournament views.                                                 |
| Data Assemblies      | One `Default` assembly per display component                                                                   | Queries and maps only the Match fields that its component uses.                                     |
| Experience Fragments | `tournament-status-fragment`, `next-match-fragment`, `current-results-fragment`, `tournament-bracket-fragment` | Reusable component instances, each bound to its component-specific Data Assembly.                  |
| Experience Template  | `tournament-dashboard`                                                                                         | Composed layout which places the Experience's `content` slot inside the dashboard shell.           |
| Experience           | `ping-pong-dashboard`                                                                                          | Places the four fragments in the template's content slot.                                          |

Each display component owns a UI-authored Data Assembly that uses a `matchCursorCollection`
resolver and returns a single top-level `matches` collection. The collection's records are
flat: linked player names are mapped to `player1Name` and `player2Name`. The assemblies do
not use `_node`, nested records, or nested collections, which are API-only shapes that the
Component Editor cannot reliably hydrate or display.

The dashboard headings intentionally use the neutral label `Tournament`. A name property
would require a second data source and would otherwise be an unbound content property.
Removing it keeps every declared property backed by a UI-compatible mapping.

### Component contracts and bindings

The Contentful component schema is deliberately narrower than the shared TypeScript helper.
Only fields read by the component are declared and returned. In the Component Editor, author
each matching query by choosing **Match** as the data source, keeping its UI-provided locked
`limit: 100` parameter, and mapping the listed fields from the collection into `matches`.

| Component | `matches` record fields |
| --- | --- |
| Tournament status | `winner`, `player1Name` ← `Player 1 → Name`, `player2Name` ← `Player 2 → Name` |
| Next match | `matchNumber`, `isUpperBracket`, `round`, `roundMatchIndex`, `winner`, `player1Name` ← `Player 1 → Name`, `player1ProfilePictureUrl` ← `Player 1 → Profile Picture → URL`, `player2Name` ← `Player 2 → Name`, `player2ProfilePictureUrl` ← `Player 2 → Profile Picture → URL` |
| Current results | `matchNumber`, `resultSet1`, `resultSet2`, `resultSet3`, `completedAt`, `winner`, `player1Name` ← `Player 1 → Name`, `player2Name` ← `Player 2 → Name` |
| Tournament bracket | `matchNumber`, `isUpperBracket`, `round`, `roundMatchIndex`, `resultSet1`, `resultSet2`, `resultSet3`, `winner`, `player1Name` ← `Player 1 → Name`, `player1ProfilePictureUrl` ← `Player 1 → Profile Picture → URL`, `player2Name` ← `Player 2 → Name`, `player2ProfilePictureUrl` ← `Player 2 → Profile Picture → URL` |

The bootstrap script registers these contracts and deliberately preserves existing Data
Assembly links and fragment bindings. It does not overwrite UI-authored bindings with a
legacy Management API payload.

## Local setup

1. Copy `.env.example` to the ignored `.env.local` file.
2. Set `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ENVIRONMENT_ID`, and
   `CONTENTFUL_CMA_TOKEN` for provisioning. These variables are not prefixed with
   `REACT_APP_`, so Create React App does not send the management token to the browser.
3. Set the `REACT_APP_CONTENTFUL_*` values. For a draft tournament, set
   `REACT_APP_CONTENTFUL_USE_PREVIEW=true` and provide both the Delivery and Preview
   tokens. The local renderer uses the Contentful Experience Delivery API through
   `@contentful/experiences-client`.
4. Export the values when running the bootstrap script, then start the app:

   ```sh
   set -a
   source .env.local
   set +a
   npm run bootstrap:experience-orchestration
   npm start
   ```

The dashboard activates only when the URL includes an `experience_id` or the
`preview_session_id` that Contentful supplies. All other URLs continue to render the
Marketplace App UI. The renderer resolves the live Experience plan, dispatches the
registered XO component IDs to the local React components, and recursively renders XO
slots. It does not query the Tournament content separately.

When Contentful opens the renderer with a `preview_session_id`, it uses the Experiences
SDK's Live Preview client: it fetches the Preview Session snapshot, subscribes to that
session over WebSocket, and resolves every update into the rendered plan. This is the
live-preview integration used by the Experience, Component, and Template editors; it
is not the legacy entry-preview integration. Local and hosted Contentful preview
environments should point to `/?experience_id=ping-pong-dashboard`.

## Hosted preview

Vercel detects this Create React App project and deploys `npm run build` without an
additional runtime configuration file. Configure the following Vercel environment
variables for the dashboard deployment, then redeploy whenever one changes:

```sh
REACT_APP_CONTENTFUL_SPACE_ID=nxkmoddzhouk
REACT_APP_CONTENTFUL_ENVIRONMENT_ID=cf-tournament-2026-10-15
REACT_APP_CONTENTFUL_DELIVERY_TOKEN=<delivery token>
REACT_APP_CONTENTFUL_PREVIEW_TOKEN=<preview token>
REACT_APP_CONTENTFUL_USE_PREVIEW=true
REACT_APP_CONTENTFUL_EXPERIENCE_ID=ping-pong-dashboard
```

Create Preview Environments at space level for both the local and hosted URLs. Scope
each configuration to the Experience's template, `tournament-dashboard`; do not use
the `tournament` content type or an entry target. The Contentful UI calls this an
Experience target, while the Management API represents it as `Template`:

```json
{
  "url": "https://<deployment>/?experience_id=ping-pong-dashboard",
  "entityType": "Template",
  "entityId": "tournament-dashboard",
  "enabled": true
}
```

Contentful adds Preview Session parameters when opening Experience, Component, or
Template Editor; the Live Preview client consumes those parameters automatically.
For a cloned environment, configure a separate Preview Environment with an
`environment_id` query parameter. It overrides the deployment's default without
changing the production configuration:

```text
https://<deployment>/?environment_id=cf-tournament-demo-2026-10-14
```

## Current tournament behavior

The configured Tournament entry has 14 players and 30 generated matches. It is still a
draft, currently with seven playable first-round matches, two skipped matches with an
automatic advance, and no scored matches. Therefore the preview must use the Preview API
until the tournament is published. XO does not allow a published Fragment to bind to an
unpublished entry. The bootstrap script detects this and leaves the bound Fragments and
Experience as drafts; the Preview API can resolve them. Once the Tournament is published,
rerun the script to publish the bound XO resources too.

The existing content model has no scheduled-start field. The dashboard lists all ready
matches, ordered by round, upper bracket before lower bracket, then match index. It can
therefore show an available later-round pairing if an earlier match is waiting for players.
The `completedAt` field is written when a contested match is marked complete, and results
are sorted newest first. Automatic advances are labelled as skipped rather than as `TBD`.
The `rounds` field is presently empty, so the bracket view derives its columns from each
match's `round` and `roundMatchIndex` values.

## Updating the tournament data source

The current UI-authored assemblies query Match entries from this environment. If this space
later hosts multiple tournaments, re-author each component's Query in the Component Editor
with the appropriate Match filter before using the dashboard for another tournament. Keep the
same top-level `matches` collection and field subsets from the table above.

## Security

Keep the management token only in the ignored `.env.local` file and never give it a
`REACT_APP_` prefix. Delivery and Preview tokens are intentionally available to the
local browser build, so scope and rotate them according to your normal Contentful token
policy. Rotate any token that has been shared in a chat or other non-secret channel.

## Primary sources

- [Experience Orchestration SDK and bootstrap fixture](https://github.com/contentful/experiences)
- [Experience SDK setup](https://www.contentful.com/developers/docs/experiences/set-up-experiences-sdk/)
- [Custom component registration](https://www.contentful.com/developers/docs/experiences/register-custom-components/)
- [Contentful Management API XO entities](https://github.com/contentful/contentful-management.js/tree/master/lib/entities)

XO entity APIs are feature-gated/alpha APIs. Verify the target environment exposes the
`components`, `experience_templates`, `data_assemblies`, `experience_fragments`, and
`experiences` endpoints before adopting this pattern in another space.
