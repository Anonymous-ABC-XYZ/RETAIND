import type { WorkerStatus, EmploymentType } from '@/lib/database.types'
import { DEMO_TEAMS, DEMO_REGIONS } from './demoData'

// UK first names
const FIRST_NAMES = [
  'Oliver', 'George', 'Arthur', 'Noah', 'Muhammad', 'Leo', 'Oscar', 'Harry',
  'Archie', 'Jack', 'Henry', 'Charlie', 'Freddie', 'Theo', 'Thomas', 'Alfie',
  'Jacob', 'James', 'William', 'Lucas', 'Edward', 'Ethan', 'Alexander', 'Joseph',
  'Samuel', 'Daniel', 'Adam', 'Mohammed', 'David', 'Ryan', 'Ben', 'Luke',
  'Sophie', 'Emily', 'Olivia', 'Amelia', 'Isla', 'Ava', 'Mia', 'Grace',
  'Freya', 'Lily', 'Ella', 'Charlotte', 'Sophia', 'Isabella', 'Evelyn', 'Harper',
  'Jessica', 'Emma', 'Hannah', 'Eleanor', 'Alice', 'Ruby', 'Lucy', 'Chloe',
]

// UK last names
const LAST_NAMES = [
  'Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans',
  'Thomas', 'Johnson', 'Roberts', 'Robinson', 'Thompson', 'Wright', 'Walker', 'White',
  'Edwards', 'Hughes', 'Green', 'Hall', 'Lewis', 'Harris', 'Clarke', 'Patel',
  'Jackson', 'Wood', 'Turner', 'Martin', 'Cooper', 'Hill', 'Ward', 'Morris',
  'Moore', 'Clark', 'Lee', 'King', 'Baker', 'Harrison', 'Morgan', 'Allen',
  'James', 'Scott', 'Adams', 'Mitchell', 'Phillips', 'Campbell', 'Parker', 'Collins',
  'Stewart', 'Murphy', 'Cook', 'Rogers', 'Bell', 'Kelly', 'Murray', 'Price',
]

// Job titles by trade
const JOB_TITLES: Record<string, string[]> = {
  'Electrical': ['Electrician', 'Senior Electrician', 'Lead Electrician', 'Electrical Engineer', 'Apprentice Electrician', 'Electrical Supervisor'],
  'Mechanical': ['Mechanical Engineer', 'Pipefitter', 'Mechanical Fitter', 'Senior Mechanical Engineer', 'Apprentice Pipefitter', 'Mechanical Supervisor'],
  'HVAC': ['HVAC Engineer', 'HVAC Technician', 'Senior HVAC Engineer', 'HVAC Apprentice', 'Refrigeration Engineer', 'Air Conditioning Technician'],
  'Plumbing': ['Plumber', 'Senior Plumber', 'Lead Plumber', 'Apprentice Plumber', 'Plumbing Supervisor'],
  'Fire Systems': ['Fire Systems Engineer', 'Fire Alarm Technician', 'Fire Systems Apprentice', 'Sprinkler Fitter', 'Fire Safety Engineer'],
  'BMS': ['BMS Engineer', 'BMS Technician', 'Senior BMS Engineer', 'BMS Apprentice', 'Controls Engineer', 'Building Automation Specialist'],
}

// CSCS card types
const CSCS_CARD_TYPES = ['Gold', 'Blue', 'Green Trainee', 'Red Provisional', 'Black Manager', 'White Professional']

// UK cities
const UK_CITIES = [
  'Manchester', 'Liverpool', 'Birmingham', 'London', 'Leeds', 'Sheffield',
  'Bristol', 'Nottingham', 'Leicester', 'Newcastle', 'Southampton', 'Portsmouth',
  'Oxford', 'Cambridge', 'Brighton', 'Reading', 'Milton Keynes', 'Coventry',
]

// UK street names
const STREET_NAMES = [
  'High Street', 'Church Road', 'Station Road', 'Victoria Road', 'Park Road',
  'London Road', 'Mill Lane', 'Main Street', 'Green Lane', 'Oak Avenue',
  'King Street', 'Queen Street', 'Bridge Street', 'New Road', 'West Street',
]

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateUKPhone(): string {
  const prefixes = ['7700', '7800', '7900', '7400', '7500', '7600']
  const prefix = randomElement(prefixes)
  const number = randomInt(100000, 999999)
  return `+44 ${prefix} ${number}`
}

function generatePostcode(): string {
  const areas = ['M', 'L', 'B', 'E', 'N', 'S', 'W', 'NG', 'LE', 'NE', 'SO', 'OX', 'CB', 'BN', 'RG', 'MK', 'CV']
  const area = randomElement(areas)
  const district = randomInt(1, 20)
  const sector = randomInt(1, 9)
  const unit = String.fromCharCode(65 + randomInt(0, 25)) + String.fromCharCode(65 + randomInt(0, 25))
  return `${area}${district} ${sector}${unit}`
}

function generateEmployeeNumber(): string {
  const prefix = randomElement(['NME', 'EMP', 'WKR'])
  const number = randomInt(1000, 9999)
  return `${prefix}-${number}`
}

function generateNINumber(): string {
  const letters = 'ABCEGHJKLMNPRSTWXYZ'
  const prefix = letters[randomInt(0, letters.length - 1)] + letters[randomInt(0, letters.length - 1)]
  const numbers = `${randomInt(10, 99)}${randomInt(10, 99)}${randomInt(10, 99)}`
  const suffix = ['A', 'B', 'C', 'D'][randomInt(0, 3)]
  return `${prefix}${numbers}${suffix}`
}

function generateDateInRange(startYear: number, endYear: number): string {
  const year = randomInt(startYear, endYear)
  const month = String(randomInt(1, 12)).padStart(2, '0')
  const day = String(randomInt(1, 28)).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function generateStartDate(): string {
  // Generate start dates from 2016 to 2025
  return generateDateInRange(2016, 2025)
}

function generateCSCSExpiry(startDate: string): string {
  const start = new Date(startDate)
  const expiryYear = start.getFullYear() + 5
  return `${expiryYear}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
}

function generateDateOfBirth(): string {
  // Workers aged 18-65
  const currentYear = new Date().getFullYear()
  return generateDateInRange(currentYear - 65, currentYear - 18)
}

export interface RandomWorker {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  city: string
  postcode: string
  emergencyContactName: string
  emergencyContactPhone: string
  employeeNumber: string
  jobTitle: string
  trade: string
  status: WorkerStatus
  employmentType: EmploymentType
  startDate: string
  probationEndDate?: string
  cscsCardNumber?: string
  cscsCardType?: string
  cscsExpiryDate?: string
  niNumber: string
  hourlyRate?: number
  dayRate?: number
  riskScore: number
  riskLevel: string
  teamId: string
  regionId: string
}

function getTradeFromTeam(teamId: string): string {
  const team = DEMO_TEAMS.find(t => t.id === teamId)
  if (!team) return 'Electrical'

  if (team.name.includes('Electrical')) return 'Electrical'
  if (team.name.includes('Mechanical')) return 'Mechanical'
  if (team.name.includes('HVAC')) return 'HVAC'
  if (team.name.includes('Plumbing')) return 'Plumbing'
  if (team.name.includes('Fire')) return 'Fire Systems'
  if (team.name.includes('BMS')) return 'BMS'
  return 'Electrical'
}

function calculateRiskLevel(score: number): string {
  if (score >= 70) return 'critical'
  if (score >= 50) return 'high'
  if (score >= 25) return 'medium'
  return 'low'
}

export function generateRandomWorker(index: number): RandomWorker {
  const firstName = randomElement(FIRST_NAMES)
  const lastName = randomElement(LAST_NAMES)
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@northfield-me.com`

  const team = randomElement(DEMO_TEAMS)
  const region = DEMO_REGIONS.find(r => r.id === team.regionId) || DEMO_REGIONS[0]
  const trade = getTradeFromTeam(team.id)
  const jobTitles = JOB_TITLES[trade] || JOB_TITLES['Electrical']
  const jobTitle = randomElement(jobTitles)

  const isApprentice = jobTitle.toLowerCase().includes('apprentice')
  const isSenior = jobTitle.toLowerCase().includes('senior') || jobTitle.toLowerCase().includes('lead')

  // Determine status with weighted probabilities
  const statusRoll = Math.random()
  let status: WorkerStatus
  if (statusRoll < 0.65) status = 'active'
  else if (statusRoll < 0.80) status = 'onboarding'
  else if (statusRoll < 0.90) status = 'probation'
  else if (statusRoll < 0.95) status = 'suspended'
  else if (statusRoll < 0.98) status = 'terminated'
  else status = 'resigned'

  // Determine employment type
  let employmentType: EmploymentType
  if (isApprentice) {
    employmentType = 'apprentice'
  } else {
    const typeRoll = Math.random()
    if (typeRoll < 0.70) employmentType = 'full_time'
    else if (typeRoll < 0.80) employmentType = 'part_time'
    else if (typeRoll < 0.90) employmentType = 'contract'
    else if (typeRoll < 0.95) employmentType = 'casual'
    else employmentType = 'agency'
  }

  const startDate = generateStartDate()

  // Risk score based on status and random factors
  let baseRisk = randomInt(0, 30)
  if (status === 'onboarding') baseRisk += randomInt(20, 40)
  if (status === 'probation') baseRisk += randomInt(30, 50)
  if (status === 'suspended') baseRisk += randomInt(60, 80)
  if (isApprentice) baseRisk += randomInt(10, 20)
  const riskScore = Math.min(100, baseRisk)

  // Generate rates based on seniority
  let hourlyRate: number | undefined
  let dayRate: number | undefined
  if (isApprentice) {
    hourlyRate = randomInt(8, 12)
  } else if (isSenior) {
    hourlyRate = randomInt(25, 40)
    dayRate = randomInt(200, 350)
  } else {
    hourlyRate = randomInt(15, 28)
    dayRate = randomInt(120, 220)
  }

  // CSCS card details (not all workers have one yet)
  const hasCSCS = Math.random() > 0.15
  const cscsCardType = hasCSCS ? (isApprentice ? 'Green Trainee' : randomElement(CSCS_CARD_TYPES)) : undefined
  const cscsExpiryDate = hasCSCS ? generateCSCSExpiry(startDate) : undefined
  const cscsCardNumber = hasCSCS ? `CSCS${randomInt(100000000, 999999999)}` : undefined

  // Probation end date (90 days after start for probation workers)
  let probationEndDate: string | undefined
  if (status === 'probation' || status === 'onboarding') {
    const start = new Date(startDate)
    start.setDate(start.getDate() + 90)
    probationEndDate = start.toISOString().split('T')[0]
  }

  const city = randomElement(UK_CITIES)
  const emergencyFirstName = randomElement(FIRST_NAMES)
  const emergencyLastName = randomElement(LAST_NAMES)

  return {
    id: `random-worker-${index.toString().padStart(4, '0')}`,
    firstName,
    lastName,
    email,
    phone: generateUKPhone(),
    dateOfBirth: generateDateOfBirth(),
    address: `${randomInt(1, 200)} ${randomElement(STREET_NAMES)}`,
    city,
    postcode: generatePostcode(),
    emergencyContactName: `${emergencyFirstName} ${emergencyLastName}`,
    emergencyContactPhone: generateUKPhone(),
    employeeNumber: generateEmployeeNumber(),
    jobTitle,
    trade,
    status,
    employmentType,
    startDate,
    probationEndDate,
    cscsCardNumber,
    cscsCardType,
    cscsExpiryDate,
    niNumber: generateNINumber(),
    hourlyRate,
    dayRate,
    riskScore,
    riskLevel: calculateRiskLevel(riskScore),
    teamId: team.id,
    regionId: region.id,
  }
}

export function generateRandomWorkers(count: number): RandomWorker[] {
  const workers: RandomWorker[] = []
  for (let i = 0; i < count; i++) {
    workers.push(generateRandomWorker(i + 1))
  }
  return workers
}
