# Adhd

Low-distraction ADHD-support experience; not diagnosis or treatment.

Suggested internal layout:
```text
adhd/
├── data/ (datasources, models, repositories)
├── domain/ (entities, repository contracts, usecases)
└── presentation/ (cubit or bloc, screens, widgets)
```
Create only layers this feature actually needs. Domain must not import Data or Flutter UI classes.
