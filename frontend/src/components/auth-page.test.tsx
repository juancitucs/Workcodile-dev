
// frontend/src/components/auth-page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppProvider } from './app-context';
import { AuthPage } from './auth-page';

describe('AuthPage', () => {
  it('should render the main welcome title', () => {
    render(
      <AppProvider>
        <AuthPage />
      </AppProvider>
    );

    // Busca el título principal
    const titleElement = screen.getByText(/Work/i, { selector: 'h1' });
    const subtitleElement = screen.getByText(/Codile/i, { selector: 'h1' });

    // Verifica que el título esté en el documento
    expect(titleElement).toBeInTheDocument();
    expect(subtitleElement).toBeInTheDocument();

    // Verifica que el subtítulo también esté presente
    const description = screen.getByText(/La plataforma de intercambio de trabajos y servicios/i);
    expect(description).toBeInTheDocument();
  });

  it('should render login and register tabs', () => {
    render(
      <AppProvider>
        <AuthPage />
      </AppProvider>
    );

    const loginTab = screen.getByRole('tab', { name: /iniciar sesión/i });
    const registerTab = screen.getByRole('tab', { name: /registrarse/i });

    expect(loginTab).toBeInTheDocument();
    expect(registerTab).toBeInTheDocument();
  });
});
