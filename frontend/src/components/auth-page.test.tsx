
// frontend/src/components/auth-page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppProvider } from './app-context';
import { MemoryRouter } from 'react-router-dom';
import { AuthPage } from './auth-page';

describe('AuthPage', () => {
  it('should render the main welcome title', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <AuthPage />
        </AppProvider>
      </MemoryRouter>
    );

    // Busca el título principal (puede estar partido en varios nodos)
    const heading = document.querySelector('h1');
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toMatch(/Work/i);
    expect(heading?.textContent).toMatch(/Codile/i);

    // Verifica que el subtítulo también esté presente
    const description = screen.getByText(/La plataforma de intercambio de trabajos y servicios/i);
    expect(description).toBeInTheDocument();
  });

  it('should render login and register tabs', () => {
    render(
      <MemoryRouter>
        <AppProvider>
          <AuthPage />
        </AppProvider>
      </MemoryRouter>
    );

    const loginTab = screen.getByRole('tab', { name: /iniciar sesión/i });
    const registerTab = screen.getByRole('tab', { name: /registrarse/i });

    expect(loginTab).toBeInTheDocument();
    expect(registerTab).toBeInTheDocument();
  });

  it('should match the AuthPage snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <AppProvider>
          <AuthPage />
        </AppProvider>
      </MemoryRouter>
    );
    // Los IDs de Radix UI (radix-:rN:) dependen de cuántos renders previos
    // haya; se normalizan para que el snapshot sea determinista.
    const html = container.innerHTML.replace(/radix-:[a-z0-9]+:/g, 'radix-id');
    expect(html).toMatchSnapshot();
  });
});
