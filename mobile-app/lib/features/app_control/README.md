# App Control

Permission-aware integrations. Respect OS permissions and platform restrictions.

Suggested internal layout:
```text
app_control/
├── data/ (datasources, models, repositories)
├── domain/ (entities, repository contracts, usecases)
└── presentation/ (cubit or bloc, screens, widgets)
```
Create only layers this feature actually needs. Domain must not import Data or Flutter UI classes.
