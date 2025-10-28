# Research: Discount and Quote Conversion

## Performance Goals
- **Decision**: UI interactions should be smooth, with animations and screen transitions rendering at 60 FPS. Database operations should complete within 200ms to avoid blocking the UI thread.
- **Rationale**: These are standard performance targets for a responsive mobile application.
- **Alternatives considered**: None.

## Constraints
- **Decision**: The application must be able to function offline. Data will be stored locally in the SQLite database and can be synced with a remote server in the future.
- **Rationale**: Offline capability is crucial for a business application that might be used in environments with poor or no internet connectivity.
- **Alternatives considered**: None.

## Scale/Scope
- **Decision**: The application should be able to handle up to 10,000 documents and 1,000 clients without significant performance degradation.
- **Rationale**: This is a reasonable scale for a small to medium-sized business.
- **Alternatives considered**: None.
