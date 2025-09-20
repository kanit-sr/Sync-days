// Demo configuration for testing without Firebase setup
export const DEMO_MODE = false; // Set to true to enable demo mode

export const DEMO_GROUPS = [
  {
    id: 'demo-group-1',
    name: 'Family Group',
    members: ['demo-user-1', 'demo-user-2'],
    createdAt: new Date(),
    createdBy: 'demo-user-1'
  },
  {
    id: 'demo-group-2',
    name: 'Work Team',
    members: ['demo-user-1', 'demo-user-3'],
    createdAt: new Date(),
    createdBy: 'demo-user-3'
  }
];

export const DEMO_DAYS = {
  '2024-01-15': {
    'demo-user-1': {
      status: 'free',
      appointments: [
        {
          title: 'Morning Workout',
          description: 'Gym session',
          startTime: new Date('2024-01-15T07:00:00'),
          endTime: new Date('2024-01-15T08:00:00'),
          allDay: false,
          createdAt: new Date()
        }
      ]
    },
    'demo-user-2': {
      status: 'busy',
      appointments: []
    }
  }
};
