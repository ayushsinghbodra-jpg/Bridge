import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

const mockPush = (global as any).__mockPush;
const mockUseAuth = jest.fn();

jest.mock('@/hooks/useAuth', () => ({
  __esModule: true,
  default: () => mockUseAuth(),
}));


describe('Auth Feature Forms', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockUseAuth.mockReset();
  });

  describe('LoginForm', () => {
    it('should render email and password inputs and sign-in button', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        login: jest.fn<any>().mockResolvedValue({}),
        register: jest.fn<any>(),
        logout: jest.fn<any>(),
      });

      render(<LoginForm />);

      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should submit login credentials and route to /dashboard', async () => {
      const mockLogin = jest.fn<any>().mockResolvedValue({});
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        login: mockLogin,
        register: jest.fn<any>(),
        logout: jest.fn<any>(),
      });

      render(<LoginForm />);

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'alice@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'Password123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'alice@example.com',
          password: 'Password123!',
        });
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should display error message on login failure', async () => {
      const mockLogin = jest.fn<any>().mockRejectedValue(new Error('Invalid credentials'));
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        login: mockLogin,
        register: jest.fn<any>(),
        logout: jest.fn<any>(),
      });

      render(<LoginForm />);

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'bad@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'wrongpass' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Something went wrong. Try again.')).toBeInTheDocument();
      });
    });
  });

  describe('RegisterForm', () => {
    it('should validate matching passwords before submitting', async () => {
      const mockRegister = jest.fn<any>();
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        login: jest.fn<any>(),
        register: mockRegister,
        logout: jest.fn<any>(),
      });

      render(<RegisterForm />);

      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'Password123!' },
      });
      fireEvent.change(screen.getByPlaceholderText('Confirm Password'), {
        target: { value: 'MismatchPassword!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        expect(mockRegister).not.toHaveBeenCalled();
      });
    });
  });
});
