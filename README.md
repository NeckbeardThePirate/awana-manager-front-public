# Awana Clubber Manager Frontend

This is the frontend for the Awana clubber manager project, a React application for managing children's ministry progress tracking.

## Testing

This project includes a comprehensive testing setup to ensure data integrity and prevent deployment issues:

### Running Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

### Test Coverage

The testing suite includes:

- **Unit Tests**: API functions and utility functions
- **Data Transformation Tests**: Critical data processing logic that ensures data integrity
- **Integration Tests**: Component behavior and data flow
- **Mock API**: MSW (Mock Service Worker) for reliable API testing

### Data Integrity Focus

The tests specifically focus on preventing data issues by testing:

- API response handling
- Data transformation logic
- Progress calculations
- Error handling for network failures
- State management edge cases

### CI/CD

Tests run automatically on:
- Push to main/master branches
- Pull requests
- Before deployment

## Deployment

In order to deploy it on Cloudflare, follow their deployment guide (link needed)

### Environment Variables

Variables needed:

