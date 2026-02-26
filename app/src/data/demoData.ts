import type {
  WorkerStatus,
  EmploymentType,
  IssueType,
  IssueSeverity,
  IssueStatus,
  TaskType,
} from '@/lib/database.types'

// Demo organization ID
export const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001'

// Demo Regions
export const DEMO_REGIONS = [
  {
    id: 'region-north-west',
    name: 'North West',
    code: 'NW',
    description: 'Covers Manchester, Liverpool, and surrounding areas',
  },
  {
    id: 'region-south-east',
    name: 'South East',
    code: 'SE',
    description: 'Covers London, Kent, Surrey, and Sussex',
  },
  {
    id: 'region-midlands',
    name: 'Midlands',
    code: 'MID',
    description: 'Covers Birmingham, Nottingham, and Leicester',
  },
  {
    id: 'region-london',
    name: 'London',
    code: 'LON',
    description: 'Greater London area',
  },
]

// Demo Teams
export const DEMO_TEAMS = [
  // North West teams
  { id: 'team-electrical-nw', name: 'Electrical - NW', regionId: 'region-north-west', code: 'ELEC-NW' },
  { id: 'team-mechanical-nw', name: 'Mechanical - NW', regionId: 'region-north-west', code: 'MECH-NW' },
  { id: 'team-hvac-nw', name: 'HVAC - NW', regionId: 'region-north-west', code: 'HVAC-NW' },
  // South East teams
  { id: 'team-electrical-se', name: 'Electrical - SE', regionId: 'region-south-east', code: 'ELEC-SE' },
  { id: 'team-mechanical-se', name: 'Mechanical - SE', regionId: 'region-south-east', code: 'MECH-SE' },
  { id: 'team-plumbing-se', name: 'Plumbing - SE', regionId: 'region-south-east', code: 'PLMB-SE' },
  // Midlands teams
  { id: 'team-electrical-mid', name: 'Electrical - Midlands', regionId: 'region-midlands', code: 'ELEC-MID' },
  { id: 'team-mechanical-mid', name: 'Mechanical - Midlands', regionId: 'region-midlands', code: 'MECH-MID' },
  { id: 'team-fire-mid', name: 'Fire Systems - Midlands', regionId: 'region-midlands', code: 'FIRE-MID' },
  // London teams
  { id: 'team-electrical-lon', name: 'Electrical - London', regionId: 'region-london', code: 'ELEC-LON' },
  { id: 'team-mechanical-lon', name: 'Mechanical - London', regionId: 'region-london', code: 'MECH-LON' },
  { id: 'team-bms-lon', name: 'BMS - London', regionId: 'region-london', code: 'BMS-LON' },
]

// Demo Workers (45 workers)
export const DEMO_WORKERS: Array<{
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  jobTitle: string
  trade: string
  status: WorkerStatus
  employmentType: EmploymentType
  startDate: string
  teamId: string
  regionId: string
  riskScore: number
  riskLevel: string
  cscsCardType?: string
  cscsExpiryDate?: string
}> = [
  // North West - Electrical
  { id: 'worker-james-cooper', firstName: 'James', lastName: 'Cooper', email: 'james.cooper@northfield-me.com', phone: '+44 7700 900001', jobTitle: 'Electrician', trade: 'Electrical', status: 'active', employmentType: 'full_time', startDate: '2023-06-15', teamId: 'team-electrical-nw', regionId: 'region-north-west', riskScore: 15, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2028-06-15' },
  { id: 'worker-sarah-jones', firstName: 'Sarah', lastName: 'Jones', email: 'sarah.jones@northfield-me.com', phone: '+44 7700 900002', jobTitle: 'Apprentice Electrician', trade: 'Electrical', status: 'onboarding', employmentType: 'apprentice', startDate: '2024-09-01', teamId: 'team-electrical-nw', regionId: 'region-north-west', riskScore: 35, riskLevel: 'medium', cscsCardType: 'Green Trainee', cscsExpiryDate: '2027-09-01' },
  { id: 'worker-michael-smith', firstName: 'Michael', lastName: 'Smith', email: 'michael.smith@northfield-me.com', phone: '+44 7700 900003', jobTitle: 'Senior Electrician', trade: 'Electrical', status: 'active', employmentType: 'full_time', startDate: '2019-03-20', teamId: 'team-electrical-nw', regionId: 'region-north-west', riskScore: 8, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2027-03-20' },
  { id: 'worker-david-wilson', firstName: 'David', lastName: 'Wilson', email: 'david.wilson@northfield-me.com', phone: '+44 7700 900004', jobTitle: 'Electrician', trade: 'Electrical', status: 'probation', employmentType: 'full_time', startDate: '2024-10-15', teamId: 'team-electrical-nw', regionId: 'region-north-west', riskScore: 45, riskLevel: 'medium', cscsCardType: 'Blue', cscsExpiryDate: '2029-10-15' },

  // North West - Mechanical
  { id: 'worker-john-taylor', firstName: 'John', lastName: 'Taylor', email: 'john.taylor@northfield-me.com', phone: '+44 7700 900005', jobTitle: 'Mechanical Engineer', trade: 'Mechanical', status: 'active', employmentType: 'full_time', startDate: '2020-07-10', teamId: 'team-mechanical-nw', regionId: 'region-north-west', riskScore: 12, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2026-07-10' },
  { id: 'worker-emma-brown', firstName: 'Emma', lastName: 'Brown', email: 'emma.brown@northfield-me.com', phone: '+44 7700 900006', jobTitle: 'Pipefitter', trade: 'Mechanical', status: 'active', employmentType: 'full_time', startDate: '2021-02-28', teamId: 'team-mechanical-nw', regionId: 'region-north-west', riskScore: 55, riskLevel: 'high', cscsCardType: 'Blue', cscsExpiryDate: '2026-02-28' },
  { id: 'worker-robert-davies', firstName: 'Robert', lastName: 'Davies', email: 'robert.davies@northfield-me.com', phone: '+44 7700 900007', jobTitle: 'Apprentice Pipefitter', trade: 'Mechanical', status: 'onboarding', employmentType: 'apprentice', startDate: '2024-08-05', teamId: 'team-mechanical-nw', regionId: 'region-north-west', riskScore: 40, riskLevel: 'medium' },

  // North West - HVAC
  { id: 'worker-thomas-evans', firstName: 'Thomas', lastName: 'Evans', email: 'thomas.evans@northfield-me.com', phone: '+44 7700 900008', jobTitle: 'HVAC Engineer', trade: 'HVAC', status: 'active', employmentType: 'full_time', startDate: '2018-11-12', teamId: 'team-hvac-nw', regionId: 'region-north-west', riskScore: 5, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2025-11-12' },
  { id: 'worker-william-roberts', firstName: 'William', lastName: 'Roberts', email: 'william.roberts@northfield-me.com', phone: '+44 7700 900009', jobTitle: 'HVAC Technician', trade: 'HVAC', status: 'active', employmentType: 'full_time', startDate: '2022-04-18', teamId: 'team-hvac-nw', regionId: 'region-north-west', riskScore: 22, riskLevel: 'low', cscsCardType: 'Blue', cscsExpiryDate: '2027-04-18' },
  { id: 'worker-alex-murphy', firstName: 'Alex', lastName: 'Murphy', email: 'alex.murphy@northfield-me.com', phone: '+44 7700 900010', jobTitle: 'HVAC Apprentice', trade: 'HVAC', status: 'onboarding', employmentType: 'apprentice', startDate: '2024-09-15', teamId: 'team-hvac-nw', regionId: 'region-north-west', riskScore: 38, riskLevel: 'medium' },

  // South East - Electrical
  { id: 'worker-oliver-wright', firstName: 'Oliver', lastName: 'Wright', email: 'oliver.wright@northfield-me.com', phone: '+44 7700 900011', jobTitle: 'Lead Electrician', trade: 'Electrical', status: 'active', employmentType: 'full_time', startDate: '2017-09-05', teamId: 'team-electrical-se', regionId: 'region-south-east', riskScore: 3, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2027-09-05' },
  { id: 'worker-harry-walker', firstName: 'Harry', lastName: 'Walker', email: 'harry.walker@northfield-me.com', phone: '+44 7700 900012', jobTitle: 'Electrician', trade: 'Electrical', status: 'active', employmentType: 'full_time', startDate: '2021-06-22', teamId: 'team-electrical-se', regionId: 'region-south-east', riskScore: 18, riskLevel: 'low', cscsCardType: 'Blue', cscsExpiryDate: '2026-06-22' },
  { id: 'worker-jack-hall', firstName: 'Jack', lastName: 'Hall', email: 'jack.hall@northfield-me.com', phone: '+44 7700 900013', jobTitle: 'Electrician', trade: 'Electrical', status: 'suspended', employmentType: 'full_time', startDate: '2020-01-14', teamId: 'team-electrical-se', regionId: 'region-south-east', riskScore: 85, riskLevel: 'critical', cscsCardType: 'Blue', cscsExpiryDate: '2025-01-14' },
  { id: 'worker-george-allen', firstName: 'George', lastName: 'Allen', email: 'george.allen@northfield-me.com', phone: '+44 7700 900014', jobTitle: 'Apprentice Electrician', trade: 'Electrical', status: 'onboarding', employmentType: 'apprentice', startDate: '2024-07-22', teamId: 'team-electrical-se', regionId: 'region-south-east', riskScore: 42, riskLevel: 'medium' },

  // South East - Mechanical
  { id: 'worker-charlie-young', firstName: 'Charlie', lastName: 'Young', email: 'charlie.young@northfield-me.com', phone: '+44 7700 900015', jobTitle: 'Mechanical Fitter', trade: 'Mechanical', status: 'active', employmentType: 'full_time', startDate: '2019-08-30', teamId: 'team-mechanical-se', regionId: 'region-south-east', riskScore: 10, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2026-08-30' },
  { id: 'worker-jacob-king', firstName: 'Jacob', lastName: 'King', email: 'jacob.king@northfield-me.com', phone: '+44 7700 900016', jobTitle: 'Mechanical Engineer', trade: 'Mechanical', status: 'active', employmentType: 'contract', startDate: '2023-03-10', teamId: 'team-mechanical-se', regionId: 'region-south-east', riskScore: 28, riskLevel: 'medium', cscsCardType: 'Blue', cscsExpiryDate: '2028-03-10' },
  { id: 'worker-noah-scott', firstName: 'Noah', lastName: 'Scott', email: 'noah.scott@northfield-me.com', phone: '+44 7700 900017', jobTitle: 'Pipefitter', trade: 'Mechanical', status: 'probation', employmentType: 'full_time', startDate: '2024-11-01', teamId: 'team-mechanical-se', regionId: 'region-south-east', riskScore: 52, riskLevel: 'high' },

  // South East - Plumbing
  { id: 'worker-leo-green', firstName: 'Leo', lastName: 'Green', email: 'leo.green@northfield-me.com', phone: '+44 7700 900018', jobTitle: 'Plumber', trade: 'Plumbing', status: 'active', employmentType: 'full_time', startDate: '2020-05-17', teamId: 'team-plumbing-se', regionId: 'region-south-east', riskScore: 14, riskLevel: 'low', cscsCardType: 'Blue', cscsExpiryDate: '2025-05-17' },
  { id: 'worker-oscar-adams', firstName: 'Oscar', lastName: 'Adams', email: 'oscar.adams@northfield-me.com', phone: '+44 7700 900019', jobTitle: 'Senior Plumber', trade: 'Plumbing', status: 'active', employmentType: 'full_time', startDate: '2016-02-08', teamId: 'team-plumbing-se', regionId: 'region-south-east', riskScore: 6, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2026-02-08' },
  { id: 'worker-archie-baker', firstName: 'Archie', lastName: 'Baker', email: 'archie.baker@northfield-me.com', phone: '+44 7700 900020', jobTitle: 'Apprentice Plumber', trade: 'Plumbing', status: 'onboarding', employmentType: 'apprentice', startDate: '2024-09-08', teamId: 'team-plumbing-se', regionId: 'region-south-east', riskScore: 33, riskLevel: 'medium' },

  // Midlands - Electrical
  { id: 'worker-henry-nelson', firstName: 'Henry', lastName: 'Nelson', email: 'henry.nelson@northfield-me.com', phone: '+44 7700 900021', jobTitle: 'Electrician', trade: 'Electrical', status: 'active', employmentType: 'full_time', startDate: '2021-11-25', teamId: 'team-electrical-mid', regionId: 'region-midlands', riskScore: 20, riskLevel: 'low', cscsCardType: 'Blue', cscsExpiryDate: '2026-11-25' },
  { id: 'worker-alfie-carter', firstName: 'Alfie', lastName: 'Carter', email: 'alfie.carter@northfield-me.com', phone: '+44 7700 900022', jobTitle: 'Lead Electrician', trade: 'Electrical', status: 'active', employmentType: 'full_time', startDate: '2018-04-12', teamId: 'team-electrical-mid', regionId: 'region-midlands', riskScore: 9, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2025-04-12' },
  { id: 'worker-freddie-mitchell', firstName: 'Freddie', lastName: 'Mitchell', email: 'freddie.mitchell@northfield-me.com', phone: '+44 7700 900023', jobTitle: 'Electrician', trade: 'Electrical', status: 'active', employmentType: 'full_time', startDate: '2022-07-03', teamId: 'team-electrical-mid', regionId: 'region-midlands', riskScore: 65, riskLevel: 'high', cscsCardType: 'Blue', cscsExpiryDate: '2027-07-03' },

  // Midlands - Mechanical
  { id: 'worker-arthur-perez', firstName: 'Arthur', lastName: 'Perez', email: 'arthur.perez@northfield-me.com', phone: '+44 7700 900024', jobTitle: 'Mechanical Engineer', trade: 'Mechanical', status: 'active', employmentType: 'full_time', startDate: '2019-10-21', teamId: 'team-mechanical-mid', regionId: 'region-midlands', riskScore: 11, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2026-10-21' },
  { id: 'worker-edward-roberts', firstName: 'Edward', lastName: 'Roberts', email: 'edward.roberts@northfield-me.com', phone: '+44 7700 900025', jobTitle: 'Pipefitter', trade: 'Mechanical', status: 'active', employmentType: 'full_time', startDate: '2020-12-09', teamId: 'team-mechanical-mid', regionId: 'region-midlands', riskScore: 25, riskLevel: 'medium', cscsCardType: 'Blue', cscsExpiryDate: '2025-12-09' },
  { id: 'worker-isaac-turner', firstName: 'Isaac', lastName: 'Turner', email: 'isaac.turner@northfield-me.com', phone: '+44 7700 900026', jobTitle: 'Apprentice Fitter', trade: 'Mechanical', status: 'onboarding', employmentType: 'apprentice', startDate: '2024-08-19', teamId: 'team-mechanical-mid', regionId: 'region-midlands', riskScore: 48, riskLevel: 'medium' },

  // Midlands - Fire Systems
  { id: 'worker-max-phillips', firstName: 'Max', lastName: 'Phillips', email: 'max.phillips@northfield-me.com', phone: '+44 7700 900027', jobTitle: 'Fire Systems Engineer', trade: 'Fire Systems', status: 'active', employmentType: 'full_time', startDate: '2017-06-28', teamId: 'team-fire-mid', regionId: 'region-midlands', riskScore: 4, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2027-06-28' },
  { id: 'worker-lucas-campbell', firstName: 'Lucas', lastName: 'Campbell', email: 'lucas.campbell@northfield-me.com', phone: '+44 7700 900028', jobTitle: 'Fire Alarm Technician', trade: 'Fire Systems', status: 'active', employmentType: 'full_time', startDate: '2021-03-15', teamId: 'team-fire-mid', regionId: 'region-midlands', riskScore: 16, riskLevel: 'low', cscsCardType: 'Blue', cscsExpiryDate: '2026-03-15' },
  { id: 'worker-ethan-parker', firstName: 'Ethan', lastName: 'Parker', email: 'ethan.parker@northfield-me.com', phone: '+44 7700 900029', jobTitle: 'Fire Systems Apprentice', trade: 'Fire Systems', status: 'onboarding', employmentType: 'apprentice', startDate: '2024-10-07', teamId: 'team-fire-mid', regionId: 'region-midlands', riskScore: 36, riskLevel: 'medium' },

  // London - Electrical
  { id: 'worker-mason-edwards', firstName: 'Mason', lastName: 'Edwards', email: 'mason.edwards@northfield-me.com', phone: '+44 7700 900030', jobTitle: 'Senior Electrician', trade: 'Electrical', status: 'active', employmentType: 'full_time', startDate: '2016-09-14', teamId: 'team-electrical-lon', regionId: 'region-london', riskScore: 7, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2026-09-14' },
  { id: 'worker-logan-collins', firstName: 'Logan', lastName: 'Collins', email: 'logan.collins@northfield-me.com', phone: '+44 7700 900031', jobTitle: 'Electrician', trade: 'Electrical', status: 'active', employmentType: 'full_time', startDate: '2020-08-05', teamId: 'team-electrical-lon', regionId: 'region-london', riskScore: 19, riskLevel: 'low', cscsCardType: 'Blue', cscsExpiryDate: '2025-08-05' },
  { id: 'worker-harrison-stewart', firstName: 'Harrison', lastName: 'Stewart', email: 'harrison.stewart@northfield-me.com', phone: '+44 7700 900032', jobTitle: 'Electrician', trade: 'Electrical', status: 'probation', employmentType: 'full_time', startDate: '2024-09-23', teamId: 'team-electrical-lon', regionId: 'region-london', riskScore: 58, riskLevel: 'high' },
  { id: 'worker-sebastian-morris', firstName: 'Sebastian', lastName: 'Morris', email: 'sebastian.morris@northfield-me.com', phone: '+44 7700 900033', jobTitle: 'Apprentice Electrician', trade: 'Electrical', status: 'onboarding', employmentType: 'apprentice', startDate: '2024-08-12', teamId: 'team-electrical-lon', regionId: 'region-london', riskScore: 44, riskLevel: 'medium' },

  // London - Mechanical
  { id: 'worker-theo-rogers', firstName: 'Theo', lastName: 'Rogers', email: 'theo.rogers@northfield-me.com', phone: '+44 7700 900034', jobTitle: 'Mechanical Engineer', trade: 'Mechanical', status: 'active', employmentType: 'full_time', startDate: '2018-12-11', teamId: 'team-mechanical-lon', regionId: 'region-london', riskScore: 13, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2025-12-11' },
  { id: 'worker-finley-cook', firstName: 'Finley', lastName: 'Cook', email: 'finley.cook@northfield-me.com', phone: '+44 7700 900035', jobTitle: 'Pipefitter', trade: 'Mechanical', status: 'active', employmentType: 'full_time', startDate: '2021-05-19', teamId: 'team-mechanical-lon', regionId: 'region-london', riskScore: 21, riskLevel: 'low', cscsCardType: 'Blue', cscsExpiryDate: '2026-05-19' },
  { id: 'worker-daniel-morgan', firstName: 'Daniel', lastName: 'Morgan', email: 'daniel.morgan@northfield-me.com', phone: '+44 7700 900036', jobTitle: 'Mechanical Fitter', trade: 'Mechanical', status: 'active', employmentType: 'contract', startDate: '2023-06-01', teamId: 'team-mechanical-lon', regionId: 'region-london', riskScore: 72, riskLevel: 'high', cscsCardType: 'Blue', cscsExpiryDate: '2028-06-01' },

  // London - BMS
  { id: 'worker-benjamin-bell', firstName: 'Benjamin', lastName: 'Bell', email: 'benjamin.bell@northfield-me.com', phone: '+44 7700 900037', jobTitle: 'BMS Engineer', trade: 'BMS', status: 'active', employmentType: 'full_time', startDate: '2019-01-28', teamId: 'team-bms-lon', regionId: 'region-london', riskScore: 8, riskLevel: 'low', cscsCardType: 'Gold', cscsExpiryDate: '2026-01-28' },
  { id: 'worker-samuel-murphy', firstName: 'Samuel', lastName: 'Murphy', email: 'samuel.murphy@northfield-me.com', phone: '+44 7700 900038', jobTitle: 'BMS Technician', trade: 'BMS', status: 'active', employmentType: 'full_time', startDate: '2022-02-14', teamId: 'team-bms-lon', regionId: 'region-london', riskScore: 17, riskLevel: 'low', cscsCardType: 'Blue', cscsExpiryDate: '2027-02-14' },
  { id: 'worker-james-bailey', firstName: 'James', lastName: 'Bailey', email: 'james.bailey@northfield-me.com', phone: '+44 7700 900039', jobTitle: 'BMS Apprentice', trade: 'BMS', status: 'onboarding', employmentType: 'apprentice', startDate: '2024-09-30', teamId: 'team-bms-lon', regionId: 'region-london', riskScore: 31, riskLevel: 'medium' },

  // Additional workers for variety
  { id: 'worker-ryan-rivera', firstName: 'Ryan', lastName: 'Rivera', email: 'ryan.rivera@northfield-me.com', phone: '+44 7700 900040', jobTitle: 'Electrician', trade: 'Electrical', status: 'active', employmentType: 'agency', startDate: '2024-01-15', teamId: 'team-electrical-nw', regionId: 'region-north-west', riskScore: 30, riskLevel: 'medium', cscsCardType: 'Blue', cscsExpiryDate: '2029-01-15' },
  { id: 'worker-kevin-ward', firstName: 'Kevin', lastName: 'Ward', email: 'kevin.ward@northfield-me.com', phone: '+44 7700 900041', jobTitle: 'Mechanical Fitter', trade: 'Mechanical', status: 'active', employmentType: 'casual', startDate: '2023-11-20', teamId: 'team-mechanical-se', regionId: 'region-south-east', riskScore: 26, riskLevel: 'medium', cscsCardType: 'Blue', cscsExpiryDate: '2028-11-20' },
  { id: 'worker-matthew-brooks', firstName: 'Matthew', lastName: 'Brooks', email: 'matthew.brooks@northfield-me.com', phone: '+44 7700 900042', jobTitle: 'HVAC Technician', trade: 'HVAC', status: 'resigned', employmentType: 'full_time', startDate: '2019-05-10', teamId: 'team-hvac-nw', regionId: 'region-north-west', riskScore: 0, riskLevel: 'low' },
  { id: 'worker-andrew-price', firstName: 'Andrew', lastName: 'Price', email: 'andrew.price@northfield-me.com', phone: '+44 7700 900043', jobTitle: 'Fire Systems Engineer', trade: 'Fire Systems', status: 'active', employmentType: 'part_time', startDate: '2022-09-05', teamId: 'team-fire-mid', regionId: 'region-midlands', riskScore: 23, riskLevel: 'low', cscsCardType: 'Blue', cscsExpiryDate: '2027-09-05' },
  { id: 'worker-joshua-howard', firstName: 'Joshua', lastName: 'Howard', email: 'joshua.howard@northfield-me.com', phone: '+44 7700 900044', jobTitle: 'Plumber', trade: 'Plumbing', status: 'active', employmentType: 'full_time', startDate: '2021-08-23', teamId: 'team-plumbing-se', regionId: 'region-south-east', riskScore: 12, riskLevel: 'low', cscsCardType: 'Blue', cscsExpiryDate: '2026-08-23' },
]

// Demo Issues
export const DEMO_ISSUES: Array<{
  id: string
  workerId: string
  title: string
  description: string
  issueType: IssueType
  severity: IssueSeverity
  status: IssueStatus
  createdAt: string
  dueDate?: string
}> = [
  { id: 'issue-001', workerId: 'worker-emma-brown', title: 'Late arrival to site', description: 'Worker arrived 45 minutes late to the Manchester Commercial site without prior notification.', issueType: 'attendance', severity: 'medium', status: 'open', createdAt: '2024-11-15', dueDate: '2024-11-22' },
  { id: 'issue-002', workerId: 'worker-jack-hall', title: 'Safety violation - No PPE', description: 'Worker was found working without safety glasses in a designated eye protection area.', issueType: 'safety', severity: 'critical', status: 'in_progress', createdAt: '2024-11-10', dueDate: '2024-11-17' },
  { id: 'issue-003', workerId: 'worker-freddie-mitchell', title: 'Quality concern - Wiring installation', description: 'Multiple junction boxes found with improper terminations requiring rework.', issueType: 'quality', severity: 'high', status: 'open', createdAt: '2024-11-18', dueDate: '2024-11-25' },
  { id: 'issue-004', workerId: 'worker-noah-scott', title: 'Documentation incomplete', description: 'Test certificates not submitted for completed installations on two sites.', issueType: 'documentation', severity: 'medium', status: 'pending_review', createdAt: '2024-11-08', dueDate: '2024-11-15' },
  { id: 'issue-005', workerId: 'worker-harrison-stewart', title: 'Communication with supervisor', description: 'Worker failed to report progress on multiple occasions this week.', issueType: 'communication', severity: 'medium', status: 'open', createdAt: '2024-11-20' },
  { id: 'issue-006', workerId: 'worker-daniel-morgan', title: 'Equipment damage', description: 'Company van rear bumper damaged. Incident report required.', issueType: 'equipment', severity: 'low', status: 'open', createdAt: '2024-11-19' },
  { id: 'issue-007', workerId: 'worker-david-wilson', title: 'Training certificate expired', description: 'First Aid at Work certificate expired and needs renewal.', issueType: 'training', severity: 'medium', status: 'in_progress', createdAt: '2024-11-05', dueDate: '2024-12-05' },
  { id: 'issue-008', workerId: 'worker-sarah-jones', title: 'Onboarding task overdue', description: 'Site induction for Birmingham project not completed within required timeframe.', issueType: 'training', severity: 'low', status: 'resolved', createdAt: '2024-10-28' },
  { id: 'issue-009', workerId: 'worker-jack-hall', title: 'Previous safety warning', description: 'Second safety incident in 3 months - pattern of behavior concern.', issueType: 'conduct', severity: 'critical', status: 'escalated', createdAt: '2024-09-15' },
  { id: 'issue-010', workerId: 'worker-emma-brown', title: 'Performance review concern', description: 'Below expected productivity on recent projects. Performance improvement plan may be needed.', issueType: 'performance', severity: 'medium', status: 'in_progress', createdAt: '2024-11-01' },
]

// Demo Onboarding Templates
export const DEMO_TEMPLATES = [
  {
    id: 'template-electrical-apprentice',
    name: 'Electrical Apprentice Onboarding',
    description: 'Comprehensive 90-day onboarding program for new electrical apprentices',
    roleType: 'Apprentice',
    trade: 'Electrical',
    durationDays: 90,
    tasks: [
      { name: 'Complete company induction', taskType: 'meeting' as TaskType, dueDay: 1, category: 'Induction' },
      { name: 'Health & Safety orientation', taskType: 'training' as TaskType, dueDay: 1, category: 'Safety' },
      { name: 'IT systems setup', taskType: 'access' as TaskType, dueDay: 2, category: 'Administration' },
      { name: 'PPE fitting and allocation', taskType: 'equipment' as TaskType, dueDay: 2, category: 'Safety' },
      { name: 'Meet the team introduction', taskType: 'introduction' as TaskType, dueDay: 3, category: 'Induction' },
      { name: 'Complete CSCS application', taskType: 'document' as TaskType, dueDay: 7, category: 'Certification' },
      { name: 'Tool training - basic hand tools', taskType: 'training' as TaskType, dueDay: 7, category: 'Training' },
      { name: 'Site safety induction - first site', taskType: 'training' as TaskType, dueDay: 14, category: 'Safety' },
      { name: 'Wiring regulations overview', taskType: 'training' as TaskType, dueDay: 21, category: 'Training' },
      { name: '30-day progress review', taskType: 'meeting' as TaskType, dueDay: 30, category: 'Review' },
      { name: 'First aid basics course', taskType: 'certification' as TaskType, dueDay: 45, category: 'Safety' },
      { name: 'Working at height training', taskType: 'certification' as TaskType, dueDay: 60, category: 'Safety' },
      { name: 'Competency assessment - Level 1', taskType: 'assessment' as TaskType, dueDay: 75, category: 'Assessment' },
      { name: '90-day probation review', taskType: 'meeting' as TaskType, dueDay: 90, category: 'Review' },
    ],
  },
  {
    id: 'template-mechanical-fitter',
    name: 'Mechanical Fitter Onboarding',
    description: 'Standard onboarding for experienced mechanical fitters',
    roleType: 'Operative',
    trade: 'Mechanical',
    durationDays: 30,
    tasks: [
      { name: 'Company induction', taskType: 'meeting' as TaskType, dueDay: 1, category: 'Induction' },
      { name: 'H&S documentation review', taskType: 'document' as TaskType, dueDay: 1, category: 'Safety' },
      { name: 'CSCS card verification', taskType: 'certification' as TaskType, dueDay: 1, category: 'Certification' },
      { name: 'System access setup', taskType: 'access' as TaskType, dueDay: 2, category: 'Administration' },
      { name: 'Company procedures training', taskType: 'training' as TaskType, dueDay: 3, category: 'Training' },
      { name: 'Meet assigned mentor', taskType: 'introduction' as TaskType, dueDay: 3, category: 'Induction' },
      { name: 'First site induction', taskType: 'training' as TaskType, dueDay: 5, category: 'Safety' },
      { name: 'Skills assessment', taskType: 'assessment' as TaskType, dueDay: 14, category: 'Assessment' },
      { name: '30-day review meeting', taskType: 'meeting' as TaskType, dueDay: 30, category: 'Review' },
    ],
  },
  {
    id: 'template-hvac-engineer',
    name: 'HVAC Engineer Onboarding',
    description: 'Comprehensive onboarding for HVAC engineering roles',
    roleType: 'Engineer',
    trade: 'HVAC',
    durationDays: 60,
    tasks: [
      { name: 'Company induction', taskType: 'meeting' as TaskType, dueDay: 1, category: 'Induction' },
      { name: 'F-Gas certification verification', taskType: 'certification' as TaskType, dueDay: 1, category: 'Certification' },
      { name: 'System access and vehicle allocation', taskType: 'access' as TaskType, dueDay: 2, category: 'Administration' },
      { name: 'Company software training', taskType: 'training' as TaskType, dueDay: 5, category: 'Training' },
      { name: 'Refrigerant handling procedures', taskType: 'training' as TaskType, dueDay: 7, category: 'Safety' },
      { name: 'Site familiarisation visits', taskType: 'introduction' as TaskType, dueDay: 14, category: 'Induction' },
      { name: 'Technical competency assessment', taskType: 'assessment' as TaskType, dueDay: 30, category: 'Assessment' },
      { name: '60-day performance review', taskType: 'meeting' as TaskType, dueDay: 60, category: 'Review' },
    ],
  },
]

// Demo Playbooks
export const DEMO_PLAYBOOKS = [
  {
    id: 'playbook-site-safety',
    title: 'Site Safety Essentials',
    description: 'Core safety requirements for all site-based workers',
    category: 'Safety',
    content: `# Site Safety Essentials

## Personal Protective Equipment (PPE)

All workers must wear appropriate PPE at all times while on site:

- **Hard hat** - Must be worn in all construction areas
- **Safety boots** - Steel toe caps required
- **Hi-vis vest** - Must be worn at all times
- **Safety glasses** - Required in all work areas
- **Gloves** - Appropriate to the task being performed

## Site Access

1. Sign in at the site office upon arrival
2. Attend daily briefing if required
3. Report to your supervisor
4. Sign out when leaving site

## Emergency Procedures

- Know the location of fire assembly points
- Familiarise yourself with emergency exits
- Report all accidents and near misses immediately

## Contact Information

Site Manager: Contact site office
H&S Department: 0161 123 4567
Emergency: 999`,
    roleTypes: ['Operative', 'Apprentice', 'Engineer'],
    isMandatory: true,
    requiresAcknowledgment: true,
  },
  {
    id: 'playbook-quality-standards',
    title: 'Quality Standards & Workmanship',
    description: 'Company standards for quality workmanship',
    category: 'Procedures',
    content: `# Quality Standards & Workmanship

## Our Commitment to Quality

Northfield M&E is committed to delivering the highest quality installations that meet or exceed industry standards.

## Key Principles

1. **Right First Time** - Complete work correctly the first time to avoid rework
2. **Documentation** - Maintain accurate records of all work completed
3. **Testing** - All installations must be tested before sign-off
4. **Cleanliness** - Leave all work areas clean and tidy

## Inspection Points

- Self-inspect your work before calling for inspection
- Ensure all fixings are secure and properly aligned
- Check all connections and terminations
- Verify labelling is complete and accurate

## Reporting Defects

If you discover a defect or quality issue:
1. Stop work immediately
2. Report to your supervisor
3. Document with photos if possible
4. Do not cover up until resolved`,
    roleTypes: ['Operative', 'Engineer'],
    isMandatory: true,
    requiresAcknowledgment: true,
  },
  {
    id: 'playbook-apprentice-guide',
    title: 'Apprentice Success Guide',
    description: 'Guide for new apprentices starting their journey',
    category: 'Guidelines',
    content: `# Apprentice Success Guide

## Welcome!

Congratulations on joining Northfield M&E as an apprentice. This guide will help you succeed in your new role.

## What to Expect

Your apprenticeship will include:
- On-the-job training with experienced engineers
- College attendance for technical qualifications
- Regular progress reviews
- Mentorship support

## Tips for Success

1. **Be punctual** - Arrive on time, every time
2. **Ask questions** - There are no stupid questions
3. **Take notes** - Keep a notebook for learning points
4. **Stay safe** - Always prioritise safety
5. **Show initiative** - Volunteer for tasks

## Support Available

- Your assigned mentor
- Training department
- HR team
- Apprenticeship coordinator

## College Schedule

You will attend college one day per week. Make sure to:
- Submit work on time
- Communicate any issues early
- Keep your portfolio up to date`,
    roleTypes: ['Apprentice'],
    isMandatory: true,
    requiresAcknowledgment: true,
  },
  {
    id: 'playbook-tool-care',
    title: 'Tool Care & Maintenance',
    description: 'Guidelines for proper tool care and maintenance',
    category: 'Best Practices',
    content: `# Tool Care & Maintenance

## Your Responsibility

Company tools and equipment represent a significant investment. Proper care extends their life and ensures safety.

## Daily Checks

Before use, check that tools:
- Are clean and free from damage
- Have secure handles and grips
- PAT test labels are in date
- Are appropriate for the task

## Storage

- Return tools to designated storage
- Clean tools before storage
- Report damaged or missing tools
- Secure tools overnight

## Reporting Issues

Report to stores/supervisor:
- Damaged tools
- Missing items
- Tools requiring calibration
- Equipment faults`,
    roleTypes: ['Operative', 'Apprentice', 'Engineer'],
    isMandatory: false,
    requiresAcknowledgment: false,
  },
]

// Demo CPD Records
export const DEMO_CPD_RECORDS = [
  { id: 'cpd-001', workerId: 'worker-james-cooper', title: 'BS7671 18th Edition Update', provider: 'NICEIC', category: 'Technical', trainingType: 'Course', startDate: '2024-06-15', hoursCompleted: 8, status: 'completed' },
  { id: 'cpd-002', workerId: 'worker-michael-smith', title: 'First Aid at Work', provider: 'St Johns Ambulance', category: 'Safety', trainingType: 'Course', startDate: '2024-03-10', hoursCompleted: 16, status: 'completed' },
  { id: 'cpd-003', workerId: 'worker-thomas-evans', title: 'F-Gas Certification Renewal', provider: 'City & Guilds', category: 'Certification', trainingType: 'Course', startDate: '2024-08-22', hoursCompleted: 24, status: 'completed' },
  { id: 'cpd-004', workerId: 'worker-oliver-wright', title: 'IPAF MEWP Operator', provider: 'IPAF', category: 'Safety', trainingType: 'Course', startDate: '2024-07-05', hoursCompleted: 8, status: 'completed' },
  { id: 'cpd-005', workerId: 'worker-mason-edwards', title: 'Leadership Skills Workshop', provider: 'Internal', category: 'Soft Skills', trainingType: 'Workshop', startDate: '2024-09-12', hoursCompleted: 4, status: 'completed' },
]
