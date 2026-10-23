# Caregiver

Caregiver views require explicit consent and server-side authorization.

Suggested internal layout:
```text
caregiver/
├── data/ (datasources, models, repositories)
├── domain/ (entities, repository contracts, usecases)
└── presentation/ (cubit or bloc, screens, widgets)
```
Create only layers this feature actually needs. Domain must not import Data or Flutter UI classes.
