export const mockIncident = {
  type: 'system_outage',
  severity: 'high',
  description: 'Test system outage',
  affectedUsers: ['user1', 'user2'],
  affectedServices: ['auth', 'payments'],
  reporter: 'test-user'
};

export const mockTeam = {
  name: 'Technical Response Team',
  oncall: [
    {
      id: 'tech1',
      name: 'Tech Support 1',
      role: 'System Engineer',
      phone: '+1234567890'
    }
  ],
  escalation: [
    {
      level: 1,
      role: 'System Engineer',
      timeout: 15
    },
    {
      level: 2,
      role: 'Senior DevOps',
      timeout: 30
    }
  ]
};
