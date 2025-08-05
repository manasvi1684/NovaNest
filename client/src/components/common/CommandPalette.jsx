import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useNoteStore from '../../store/useNoteStore';
import useBugTraceStore from '../../store/useBugTraceStore';
import useAchievifyStore from '../../store/useAchievifyStore';
import useTeamSyncStore from '../../store/useTeamSyncStore';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { createNote } = useNoteStore();
  const { createProject, createIssueInCurrentProject } = useBugTraceStore();
  const { createGoal } = useAchievifyStore();
  const { createTeam } = useTeamSyncStore();

  // Keyboard shortcut to open command palette
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = async (command) => {
    switch (command.action) {
      case 'navigate':
        navigate(command.path);
        setOpen(false);
        break;
      case 'create-note':
        try {
          await createNote({
            title: command.title || 'New Note',
            content: command.content || '',
            tags: command.tags || []
          });
          navigate('/thinktrek');
        } catch (error) {
          console.error('Error creating note:', error);
        }
        setOpen(false);
        break;
      case 'create-project':
        try {
          await createProject({
            name: command.projectName || 'New Project',
            description: command.description || ''
          });
          navigate('/bugtrace');
        } catch (error) {
          console.error('Error creating project:', error);
        }
        setOpen(false);
        break;
      case 'create-goal':
        try {
          await createGoal({
            title: command.title || 'New Goal',
            description: command.description || '',
            category: command.category || 'other'
          });
          navigate('/achievify');
        } catch (error) {
          console.error('Error creating goal:', error);
        }
        setOpen(false);
        break;
      case 'create-team':
        try {
          await createTeam({
            name: command.teamName || 'New Team',
            description: command.description || ''
          });
          navigate('/teamsync');
        } catch (error) {
          console.error('Error creating team:', error);
        }
        setOpen(false);
        break;
      default:
        break;
    }
  };

  const commands = [
    // Navigation
    {
      id: 'home',
      name: 'Go to Home',
      keywords: 'home dashboard main',
      action: 'navigate',
      path: '/',
      icon: '🏠'
    },
    {
      id: 'dashboard',
      name: 'Go to Dashboard',
      keywords: 'dashboard overview profile',
      action: 'navigate',
      path: '/dashboard',
      icon: '📊',
      auth: true
    },
    {
      id: 'thinktrek',
      name: 'Go to ThinkTrek',
      keywords: 'notes journal thoughts markdown',
      action: 'navigate',
      path: '/thinktrek',
      icon: '📝',
      auth: true
    },
    {
      id: 'bugtrace',
      name: 'Go to BugTrace',
      keywords: 'bugs issues projects tracking',
      action: 'navigate',
      path: '/bugtrace',
      icon: '🐛',
      auth: true
    },
    {
      id: 'achievify',
      name: 'Go to Achievify',
      keywords: 'goals achievements xp gamification',
      action: 'navigate',
      path: '/achievify',
      icon: '🏆',
      auth: true
    },
    {
      id: 'analytics',
      name: 'Go to Analytics',
      keywords: 'analytics charts stats insights',
      action: 'navigate',
      path: '/analytics',
      icon: '📈',
      auth: true
    },
    {
      id: 'teamsync',
      name: 'Go to TeamSync',
      keywords: 'team collaboration shared goals',
      action: 'navigate',
      path: '/teamsync',
      icon: '👥',
      auth: true
    },
    // Quick Create Actions
    {
      id: 'create-note',
      name: 'Create New Note',
      keywords: 'new note journal thought',
      action: 'create-note',
      title: 'New Note',
      content: '',
      icon: '✏️',
      auth: true
    },
    {
      id: 'create-project',
      name: 'Create New Project',
      keywords: 'new project bugtrace',
      action: 'create-project',
      projectName: 'New Project',
      description: '',
      icon: '📁',
      auth: true
    },
    {
      id: 'create-goal',
      name: 'Create New Goal',
      keywords: 'new goal achievement',
      action: 'create-goal',
      title: 'New Goal',
      description: '',
      icon: '🎯',
      auth: true
    },
    {
      id: 'create-team',
      name: 'Create New Team',
      keywords: 'new team collaboration',
      action: 'create-team',
      teamName: 'New Team',
      description: '',
      icon: '👥',
      auth: true
    }
  ].filter(cmd => !cmd.auth || isAuthenticated);

  return (
    <>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div className="w-full max-w-2xl mx-4">
          <Command className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center border-b border-gray-200 px-4 py-3">
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Search commands, navigate, or create..."
                className="flex-1 outline-none text-gray-900 placeholder-gray-500"
              />
              <kbd className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                ⌘K
              </kbd>
            </div>
            <Command.List className="max-h-96 overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-gray-500">
                No results found.
              </Command.Empty>
              {commands.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.name}
                  onSelect={() => runCommand(command)}
                  className="flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3 text-lg">{command.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{command.name}</div>
                    {command.keywords && (
                      <div className="text-xs text-gray-500">{command.keywords}</div>
                    )}
                  </div>
                  {command.action === 'navigate' && (
                    <span className="text-xs text-gray-400">Navigate</span>
                  )}
                  {command.action.startsWith('create') && (
                    <span className="text-xs text-gray-400">Create</span>
                  )}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      </Command.Dialog>
    </>
  );
};

export default CommandPalette; 