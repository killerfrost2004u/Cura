# Cura Flutter — Structure 

This archive contains folders and empty placeholder files only.
No screens, classes, functions, Cubits, API calls, or feature implementations have been written.

Architecture:
- `lib/core/`: shared configuration and infrastructure
- `lib/data/`: shared data layer
- `lib/domain/`: shared domain layer
- `lib/features/<feature>/`: feature-first Clean Architecture
- `assets/`: images, icons, fonts
- `test/`: future tests

Feature folders: splash, onboarding, auth, home, ai_assistant, reminders,
medication, alzheimer, memory_book, safe_navigation, adhd, focus,
mood_tracking, caregiver, notifications, profile, settings.

This is a structure scaffold, not a runnable Android app yet. To run on Android,
generate platform files from the project root with `flutter create --platforms=android .`.
