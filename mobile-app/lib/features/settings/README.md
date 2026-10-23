# Settings

Language, accessibility, privacy and mode preferences.

Suggested internal layout:
```text
settings/
├── data/ (datasources, models, repositories)
├── domain/ (entities, repository contracts, usecases)
└── presentation/ (cubit or bloc, screens, widgets)
```
Create only layers this feature actually needs. Domain must not import Data or Flutter UI classes.
