// src/components/Home components/tests/Main.test.jsx
import { render } from '@testing-library/react';
import { Main, StartQuizSection } from '../Main';

test('demo button called', () => {
  render(
    <Main>
      <StartQuizSection />
    </Main>
  );
});