# Ping Pong Experience Orchestration dashboard

This repository includes a local React renderer for a native Contentful Experience
Orchestration (XO) dashboard. It intentionally uses XO Components, a Data Assembly,
Experience Fragments, an Experience Template, and an Experience rather than creating
presentation content types.

## What is provisioned

The bootstrap script creates or updates these resources in the selected environment:

| XO resource | IDs | Purpose |
| --- | --- | --- |
| Components | `tournament-dashboard-shell`, `tournament-status`, `next-match`, `current-results`, `tournament-bracket` | Render dashboard layout and four tournament views. |
| Data Assembly | `Tournament dashboard data` | Queries one `Tournament` entry and maps it to the components' shared `tournament` Record property. |
| Experience Fragments | `tournament-status-fragment`, `next-match-fragment`, `current-results-fragment`, `tournament-bracket-fragment` | Reusable component instances, each bound to the selected tournament. |
| Experience Template | `tournament-dashboard` | Composed layout which places the Experience's `content` slot inside the dashboard shell. |
| Experience | `ping-pong-dashboard` | Places the four fragments in the template's content slot. |

The Data Assembly's GraphQL resolver uses Contentful's `_node(id: $id)` pattern. XO
passes the bound `ResourceLink` as the resolver parameter, then maps the Tournament's
`name`, `playersCursorCollection.items`, and `matchesCursorCollection.items` to the shape declared
on every display Component. Each display Component lists that Data Assembly before the
Experience is published; this is required by XO's data-assembly membership validation.

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

`REACT_APP_EXPERIENCES_PREVIEW=true` selects the standalone Experience renderer rather
than the Marketplace App UI. The renderer resolves the live Experience plan, dispatches
the registered XO component IDs to the local React components, and recursively renders
XO slots. It does not query the Tournament content separately.

## Current tournament behavior

The configured Tournament entry has 14 players and 30 generated matches. It is still a
draft, currently with seven playable first-round matches, two automatic advances, and no
scored matches. Therefore the preview must use the Preview API until the tournament is
published. XO does not allow a published Fragment to bind to an unpublished entry. The
bootstrap script detects this and leaves the bound Fragments and Experience as drafts;
the Preview API can resolve them. Once the Tournament is published, rerun the script to
publish the bound XO resources too.

The existing content model has no scheduled-start field. “Next match” means the earliest
ready match sorted by round, upper bracket before lower bracket, then match index. Add a
date/time field to `Match` only if the dashboard should represent a real-world schedule.
The `rounds` field is presently empty, so the bracket view derives its columns from each
match's `round` and `roundMatchIndex` values.

## Updating the bound tournament

Set `CONTENTFUL_TOURNAMENT_ID` to the entry ID of another Tournament and rerun the
bootstrap script. It updates the four fragments and the Experience declaratively. The
Data Assembly remains reusable because it is parameterized rather than tied to the entry.

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
