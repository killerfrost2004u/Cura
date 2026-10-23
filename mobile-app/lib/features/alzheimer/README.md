# Alzheimer

Accessible daily routine and help workflows with trusted-contact permissions.

Suggested internal layout:
```text
alzheimer/
├── data/ (datasources, models, repositories)
├── domain/ (entities, repository contracts, usecases)
└── presentation/ (cubit or bloc, screens, widgets)
```
Create only layers this feature actually needs. Domain must not import Data or Flutter UI classes.
