import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Users from '../Users';

jest.mock('../../config', () => ({
  __esModule: true,
  default: 'http://localhost:3000'
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock environment variables
jest.mock('../Users', () => {
  const originalModule = jest.requireActual('../Users');
  return {
    __esModule: true,
    default: (props) => {
      const API_URL = process.env.VITE_API_URL;
      return originalModule.default({ ...props, API_URL });
    },
  };
});

describe('Users Component', () => {
  const mockUsers = [
    { id: 1, username: 'user1' },
    { id: 2, username: 'user2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.getItem.mockReturnValue('fake-token');
  });

  const renderUsers = () => {
    return render(
      <BrowserRouter>
        <Users />
      </BrowserRouter>
    );
  };

  test('renders users list', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
    });
  });

  test('shows loading state', () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    renderUsers();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  test('shows error message on fetch error', async () => {
    const errorMessage = 'Error al obtener usuarios';
    global.fetch.mockRejectedValueOnce(new Error(errorMessage));

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('opens add user dialog', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Agregar Usuario' }));

    expect(screen.getByRole('heading', { name: 'Agregar Usuario' })).toBeInTheDocument();
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  test('adds new user successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Open add user dialog
    fireEvent.click(screen.getByText('Agregar Usuario'));

    // Fill in the form
    await userEvent.type(screen.getByLabelText('Usuario'), 'newuser');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');

    // Submit the form
    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/register',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'newuser', password: 'password123' }),
        })
      );
    });
  });

  test('deletes user successfully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    renderUsers();

    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Click delete button for first user (find DeleteIcon and click its closest button)
    const deleteIcons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteIcons[0].closest('button'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/usuarios/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
}); 