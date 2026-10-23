# Memory Book

User-managed memories and media with consent and deletion controls.

Suggested internal layout:
```text
memory_book/
├── data/ (datasources, models, repositories)
├── domain/ (entities, repository contracts, usecases)
└── presentation/ (cubit or bloc, screens, widgets)
```
Create only layers this feature actually needs. Domain must not import Data or Flutter UI classes.
