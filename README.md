## Contentful Ping Pong

https://github.com/Chaoste/cf-ping-pong/assets/9327071/994460ea-a098-4d4f-afbc-55abcdeb9a16

## Experience Orchestration preview

The local dashboard is a native Experience Orchestration composition: four custom
components are each bound to a UI-authored, component-specific Match Data Assembly.
Reusable Experience Fragments compose them into the `ping-pong-dashboard` Experience.

Copy `.env.example` to the ignored `.env.local`, add credentials, then provision
the XO entities and start the local preview:

```sh
set -a
source .env.local
set +a
npm run bootstrap:experience-orchestration
npm start
```

See [the setup guide](docs/experience-orchestration-tournament.md) for the
architecture, current tournament assumptions, and operational notes.

### Potential improvements

- Better way to insert results
- Allow optional second final
- Render results seperately
