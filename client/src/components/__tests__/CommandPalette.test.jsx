import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CommandPalette from '../common/CommandPalette';

// Mock the stores
jest.mock('../../store/authStore', () => ({
  __esModule: true,
  default: () => ({
    isAuthenticated: true,
    user: { _id: '123', username: 'testuser' }
  })
}));

jest.mock('../../store/useNoteStore', () => ({
  __esModule: true,
  default: () => ({
    createNote: jest.fn()
  })
}));

jest.mock('../../store/useBugTraceStore', () => ({
  __esModule: true,
  default: () => ({
    createProject: jest.fn(),
    createIssueInCurrentProject: jest.fn()
  })
}));

jest.mock('../../store/useAchievifyStore', () => ({
  __esModule: true,
  default: () => ({
    createGoal: jest.fn()
  })
}));

jest.mock('../../store/useTeamSyncStore', () => ({
  __esModule: true,
  default: () => ({
    createTeam: jest.fn()
  })
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('CommandPalette', () => {
  test('opens with keyboard shortcut', () => {
    renderWithRouter(<CommandPalette />);
    
    // Simulate Cmd+K
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    // Should show the command palette
    expect(screen.getByPlaceholderText('Search commands, navigate, or create...')).toBeInTheDocument();
  });

  test('shows navigation commands', () => {
    renderWithRouter(<CommandPalette />);
    
    // Open the palette
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    // Should show navigation options
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Go to ThinkTrek')).toBeInTheDocument();
  });

  test('shows create commands', () => {
    renderWithRouter(<CommandPalette />);
    
    // Open the palette
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    // Should show create options
    expect(screen.getByText('Create New Note')).toBeInTheDocument();
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByText('Create New Goal')).toBeInTheDocument();
  });
}); 