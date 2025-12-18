# Playwright Test Prompt Catalog

This catalog contains AI prompts for generating different types of tests using Claude and the Playwright MCP Server.

## Table of Contents

1. [API Tests](#api-tests)
2. [UI Tests](#ui-tests)
3. [Performance Tests](#performance-tests)
4. [Storybook Tests](#storybook-tests)
5. [Web Component Tests](#web-component-tests)

---

## API Tests

### Prompt: Generate REST API Test

```
Create a Playwright API test for the following endpoint:

Endpoint: [ENDPOINT_URL]
Method: [GET/POST/PUT/DELETE]
Description: [WHAT_THE_ENDPOINT_DOES]

The test should:
- Send a [METHOD] request to [ENDPOINT]
- Validate response status is [EXPECTED_STATUS]
- Verify response contains required fields: [FIELD_1, FIELD_2, ...]
- Assert response data types match schema
- Include error handling for [ERROR_SCENARIOS]

Use the ApiHelper class from @/helpers/api
```

### Prompt: Generate GraphQL API Test

```
Create a Playwright GraphQL API test for:

Query/Mutation: [QUERY_NAME]
Description: [WHAT_IT_DOES]

GraphQL Query:
[PASTE_GRAPHQL_QUERY]

The test should:
- Execute the GraphQL query/mutation
- Validate response structure
- Check for errors in response
- Verify returned data matches expected schema
- Test with variables: [VARIABLES]
```

### Prompt: Generate API Authentication Test

```
Create an API authentication test that:

- Tests login endpoint: [LOGIN_ENDPOINT]
- Uses credentials from environment variables
- Validates JWT/session token is returned
- Stores authentication state for subsequent requests
- Tests authenticated endpoint: [PROTECTED_ENDPOINT]
- Verifies 401 response for invalid credentials
```

---

## UI Tests

### Prompt: Generate Login Test

```
Create a Playwright UI test for user login flow:

Login Page URL: [LOGIN_URL]
Elements:
- Email field: [EMAIL_SELECTOR]
- Password field: [PASSWORD_SELECTOR]
- Submit button: [SUBMIT_SELECTOR]

The test should:
- Navigate to login page
- Fill in credentials
- Submit form
- Verify successful login (check for [SUCCESS_INDICATOR])
- Use login helper from @/helpers/auth
```

### Prompt: Generate Form Validation Test

```
Create a UI test for form validation:

Form: [FORM_NAME]
Fields to test:
- [FIELD_1]: [VALIDATION_RULES]
- [FIELD_2]: [VALIDATION_RULES]

The test should:
- Test each field's validation rules
- Verify error messages appear for invalid input
- Ensure form submission is blocked when invalid
- Verify successful submission with valid data
- Use FormComponent from @/components/form-component
```

### Prompt: Generate E2E User Flow Test

```
Create an end-to-end test for the following user flow:

Flow: [FLOW_NAME]
Steps:
1. [STEP_1_DESCRIPTION]
2. [STEP_2_DESCRIPTION]
3. [STEP_3_DESCRIPTION]
...

The test should:
- Complete all steps in sequence
- Verify state after each step
- Take screenshots at key points
- Handle loading states and transitions
- Verify final outcome: [EXPECTED_RESULT]
```

### Prompt: Generate Accessibility Test

```
Create an accessibility test for [PAGE/COMPONENT]:

The test should:
- Check for ARIA labels and roles
- Verify keyboard navigation works
- Test with screen reader selectors
- Validate color contrast (if applicable)
- Check for alt text on images
- Ensure focus management is correct
```

---

## Performance Tests

### Prompt: Generate Page Load Performance Test

```
Create a performance test for page load metrics:

Page URL: [PAGE_URL]
Performance thresholds:
- Load time: < [TIME_MS]ms
- First Contentful Paint: < [TIME_MS]ms
- Largest Contentful Paint: < [TIME_MS]ms

The test should:
- Measure all Web Vitals metrics
- Use measurePageLoad helper from @/helpers/performance
- Log detailed metrics
- Assert metrics meet thresholds
- Generate performance report
```

### Prompt: Generate API Response Time Test

```
Create a performance test for API response time:

Endpoint: [ENDPOINT_URL]
Expected response time: < [TIME_MS]ms
Load simulation: [NUMBER] concurrent requests

The test should:
- Measure single request response time
- Test under concurrent load
- Calculate average, min, max response times
- Identify slow endpoints
- Assert response times meet SLA
```

### Prompt: Generate Network Performance Test

```
Create a test to measure network performance:

Page: [PAGE_URL]

The test should:
- Monitor all network requests
- Measure total payload size
- Identify largest resources
- Check for unnecessary requests
- Verify resource caching
- Assert total page weight < [SIZE]KB
```

---

## Storybook Tests

### Prompt: Generate Storybook Component Test

```
Create a Playwright test for Storybook component:

Component: [COMPONENT_NAME]
Story: [STORY_NAME]
Storybook URL: http://localhost:6006

The test should:
- Navigate to the specific story
- Test component in different states: [STATE_1, STATE_2, ...]
- Verify component renders correctly
- Test user interactions
- Capture visual regression screenshots
```

### Prompt: Generate Storybook Interaction Test

```
Create an interaction test for Storybook:

Component: [COMPONENT_NAME]
Interactions to test:
- [INTERACTION_1]
- [INTERACTION_2]

The test should:
- Use Storybook's play function
- Simulate user interactions
- Verify component state changes
- Check for expected DOM updates
- Validate accessibility
```

---

## Web Component Tests

### Prompt: Generate Component Unit Test

```
Create a component unit test for:

Component: [COMPONENT_NAME]
Component ID: [DATA_TESTID]

The test should:
- Test component renders
- Verify props affect rendering
- Test event handlers
- Check component state updates
- Validate component output
- Use component testing mode
```

### Prompt: Generate Component Integration Test

```
Create a component integration test:

Components:
- [PARENT_COMPONENT]
- [CHILD_COMPONENT_1]
- [CHILD_COMPONENT_2]

The test should:
- Test components work together
- Verify data flows between components
- Test parent-child communication
- Validate integrated behavior
- Check for side effects
```

---

## Advanced Prompts

### Prompt: Generate Data-Driven Test

```
Create a data-driven test using test.describe.parallel:

Test scenario: [SCENARIO_NAME]
Test data:
[DATA_SET_1]
[DATA_SET_2]
[DATA_SET_3]

The test should:
- Run in parallel for each data set
- Use test fixtures for data
- Validate results for each case
- Report results per data set
```

### Prompt: Generate Visual Regression Test

```
Create a visual regression test:

Pages/Components to test:
- [PAGE_1]
- [COMPONENT_1]

The test should:
- Capture screenshots
- Compare against baseline
- Highlight visual differences
- Test across different viewports
- Generate visual diff report
```

### Prompt: Generate Mock/Stub Test

```
Create a test using API mocking:

API endpoint to mock: [ENDPOINT]
Mock response: [MOCK_DATA]

The test should:
- Intercept API requests
- Return mock data
- Verify UI handles mocked response
- Test error scenarios with mocked errors
- Validate request parameters
```

---

## How to Use This Catalog

1. **Choose a prompt** that matches your testing needs
2. **Replace placeholders** (in [BRACKETS]) with your specific values
3. **Provide the prompt to Claude** via the MCP server
4. **Review and customize** the generated test
5. **Run and iterate** until tests pass

## Tips for Better AI-Generated Tests

- Be specific about selectors and element locations
- Provide example data when applicable
- Mention edge cases and error scenarios
- Specify timeout and retry requirements
- Include accessibility requirements
- Reference existing helpers and components
