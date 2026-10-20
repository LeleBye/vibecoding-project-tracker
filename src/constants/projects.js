import { SEED_ANCHORS, SEED_TASKS } from '../data/seedData.js';

export const PROJECTS = [
  {
    id: 'vibecoding',
    name: 'Vibecoding Tracker',
    description: 'The task tracker for vibecoders.',
    initialTasks: SEED_TASKS,
    initialAnchors: SEED_ANCHORS,
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Plan the next mobile product release.',
    initialTasks: [
      {
        id: 'mobile-seed-1',
        title: 'Define mobile navigation',
        description: 'Map the primary screens and navigation flow for the mobile app.',
        type: 'feature',
        status: 'todo',
        assignee: 'Benjamin Rosser',
        dueDate: null,
        createdDate: new Date().toISOString().slice(0, 10),
        context: '## Background\n\nPlan the first mobile release.',
        contextTool: null,
        contextUpdatedAt: null,
      },
    ],
    initialAnchors: [
      { id: 'presentation', label: 'Product brief', url: null },
      { id: 'demo', label: 'Prototype', url: null },
      { id: 'report', label: 'Release notes', url: null },
      { id: 'documentation', label: 'Mobile docs', url: null },
    ],
  },
  {
    id: 'website-refresh',
    name: 'Website Refresh',
    description: 'Coordinate the marketing website refresh.',
    initialTasks: [
      {
        id: 'website-seed-1',
        title: 'Audit current landing page',
        description: 'Capture the content and interaction changes needed for the refresh.',
        type: 'bug',
        status: 'review',
        assignee: 'Benjamin Rosser',
        dueDate: null,
        createdDate: new Date().toISOString().slice(0, 10),
        context: '## Background\n\nReview the current website before making changes.',
        contextTool: null,
        contextUpdatedAt: null,
      },
    ],
    initialAnchors: [
      { id: 'presentation', label: 'Brand direction', url: null },
      { id: 'demo', label: 'Staging site', url: null },
      { id: 'report', label: 'Analytics report', url: null },
      { id: 'documentation', label: 'Content guide', url: null },
    ],
  },
];
