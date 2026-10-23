# Ai Assistant

AI chat and proposed actions. Use a secure backend proxy; never ship provider secrets in Flutter.

Suggested internal layout:
```text
ai_assistant/
├── data/ (datasources, models, repositories)
├── domain/ (entities, repository contracts, usecases)
└── presentation/ (cubit or bloc, screens, widgets)
```
Create only layers this feature actually needs. Domain must not import Data or Flutter UI classes.
