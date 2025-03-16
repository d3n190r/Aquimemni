# Testing

## Testing Types  

| **Testing Type**           | **Brief Description**                                                                 | **Example**                                                                                                                                                                                                                     |
|----------------------------|---------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Unit Testing**            | Tests individual components/functions in isolation.                                   | ```javascript<br>test('adds 1 + 2 to equal 3', () => {<br>  expect(sum(1, 2)).toBe(3);<br>});<br>```                                                                                                                          |
| **Integration Testing**     | Verifies interactions between components/modules.                                     | ```html javascript<br>test('GET /api/users returns 200', async () => {<br>  const res = await request(app).get('/api/users');<br>  expect(res.statusCode).toBe(200);<br>});<br>```                                                 |
| **End-to-End (E2E)**        | Simulates real user workflows (e.g., login, checkout).                                | ```javascript<br>it('logs in successfully', () => {<br>  cy.visit('/login');<br>  cy.get('#email').type('user@test.com');<br>  cy.get('#password').type('pass123');<br>  cy.get('button').click();<br>  cy.url().should('include', '/dashboard');<br>});<br>``` |
| **API Testing**             | Validates REST/GraphQL endpoints.                                                     | ```python<br>def test_create_user():<br>  response = requests.post('/api/users', json={'name': 'John'})<br>  assert response.status_code == 201<br>```                                                                         |
| **Performance Testing**     | Ensures the app handles traffic spikes.                                               | ```javascript<br>import http from 'k6/http';<br>export default function () {<br>  http.get('https://api.example.com/users');<br>});<br>```                                                                                     |
| **Security Testing**        | Identifies vulnerabilities (e.g., XSS, SQL injection).                                | - Input validation tests.<br>- Dependency scanning with `npm audit` or `snyk`.                                                                                                                                                 |
| **Visual Regression Testing** | Catches unintended UI changes.                                                       | - Use **Percy** to compare screenshots of UI components before/after code changes.                                                                                                                                             |
| **Accessibility (a11y)**    | Ensures usability for people with disabilities.                                       | ```javascript<br>test('has no a11y violations', async () => {<br>  const { container } = render(<Login />);<br>  const results = await axe(container);<br>  expect(results).toHaveNoViolations();<br>});<br>```                |

---

## Recommended Tools

- **Unit/Integration**: Jest, pytest, Mocha  
- **E2E**: Cypress, Playwright  
- **API**: Postman, Supertest  
- **Performance**: k6, Locust  
- **Security**: OWASP ZAP, Snyk  
- **Visual Regression**: Percy, Chromatic  
- **Accessibility**: axe-core, Lighthouse  

## Workflow Tips

1. **Automate Tests**: Integrate with CI/CD pipelines (e.g., GitHub Actions).  
2. **Prioritize Critical Paths**: Focus on login, payment flows, and core features.  
3. **Use Mocks**: Simulate APIs/services with tools like MSW.  
4. **Monitor Coverage**: Aim for 70-80% unit test coverage.  

## Test coding approach

### 🛠️ Test-First Development (TDD): Red → Green → Refactor

1. **Red**: Write a failing test for the desired feature.
2. **Green**: Write minimal code to pass the test.
3. **Refactor**: Optimize code while keeping tests green.

### ✅ Benefits

- Improves code design
- Acts as documentation
- Reduces bugs in critical paths
