# Medication

User-managed medication reminders; do not provide dose recommendations.

Suggested internal layout:
```text
medication/
├── data/ (datasources, models, repositories)
├── domain/ (entities, repository contracts, usecases)
└── presentation/ (cubit or bloc, screens, widgets)
```
Create only layers this feature actually needs. Domain must not import Data or Flutter UI classes.
