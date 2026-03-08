import { createClient } from '@supabase/supabase-js'

// Configuration - these should match your .env.local
const SUPABASE_URL = 'https://ivxcnqttrxuhwpsqkkin.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2eGNucXR0cnh1aHdwc3Fra2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDI4ODYsImV4cCI6MjA4NzY3ODg4Nn0.h48y1nBSiy0k1bKmyeLVKkCYaKO5Op1CGvxxsnD4IAo'
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001'

// Worker count to generate
const WORKER_COUNT = 100

// Types
type WorkerStatus = 'active' | 'onboarding' | 'probation' | 'suspended' | 'terminated' | 'resigned'
type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'apprentice' | 'casual' | 'agency'

// Demo data references
const DEMO_REGIONS = [
  { id: 'region-north-west', name: 'North West' },
  { id: 'region-south-east', name: 'South East' },
  { id: 'region-midlands', name: 'Midlands' },
  { id: 'region-london', name: 'London' },
]

const DEMO_TEAMS = [
  { id: 'team-electrical-nw', name: 'Electrical - NW', regionId: 'region-north-west' },
  { id: 'team-mechanical-nw', name: 'Mechanical - NW', regionId: 'region-north-west' },
  { id: 'team-hvac-nw', name: 'HVAC - NW', regionId: 'region-north-west' },
  { id: 'team-electrical-se', name: 'Electrical - SE', regionId: 'region-south-east' },
  { id: 'team-mechanical-se', name: 'Mechanical - SE', regionId: 'region-south-east' },
  { id: 'team-plumbing-se', name: 'Plumbing - SE', regionId: 'region-south-east' },
  { id: 'team-electrical-mid', name: 'Electrical - Midlands', regionId: 'region-midlands' },
  { id: 'team-mechanical-mid', name: 'Mechanical - Midlands', regionId: 'region-midlands' },
  { id: 'team-fire-mid', name: 'Fire Systems - Midlands', regionId: 'region-midlands' },
  { id: 'team-electrical-lon', name: 'Electrical - London', regionId: 'region-london' },
  { id: 'team-mechanical-lon', name: 'Mechanical - London', regionId: 'region-london' },
  { id: 'team-bms-lon', name: 'BMS - London', regionId: 'region-london' },
]

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
  return generateDateInRange(2016, 2025)
}

function generateCSCSExpiry(startDate: string): string {
  const start = new Date(startDate)
  const expiryYear = start.getFullYear() + 5
  return `${expiryYear}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
}

function generateDateOfBirth(): string {
  const currentYear = new Date().getFullYear()
  return generateDateInRange(currentYear - 65, currentYear - 18)
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

interface RandomWorker {
  id: string
  organisation_id: string
  team_id: string
  region_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  address: string
  city: string
  postcode: string
  emergency_contact_name: string
  emergency_contact_phone: string
  employee_number: string
  job_title: string
  trade: string
  status: WorkerStatus
  employment_type: EmploymentType
  start_date: string
  probation_end_date?: string
  cscs_card_number?: string
  cscs_card_type?: string
  cscs_expiry_date?: string
  ni_number: string
  hourly_rate?: number
  day_rate?: number
  risk_score: number
  risk_level: string
}

function generateRandomWorker(index: number, orgId: string): RandomWorker {
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
    organisation_id: orgId,
    team_id: team.id,
    region_id: region.id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: generateUKPhone(),
    date_of_birth: generateDateOfBirth(),
    address: `${randomInt(1, 200)} ${randomElement(STREET_NAMES)}`,
    city,
    postcode: generatePostcode(),
    emergency_contact_name: `${emergencyFirstName} ${emergencyLastName}`,
    emergency_contact_phone: generateUKPhone(),
    employee_number: generateEmployeeNumber(),
    job_title: jobTitle,
    trade,
    status,
    employment_type: employmentType,
    start_date: startDate,
    probation_end_date: probationEndDate,
    cscs_card_number: cscsCardNumber,
    cscs_card_type: cscsCardType,
    cscs_expiry_date: cscsExpiryDate,
    ni_number: generateNINumber(),
    hourly_rate: hourlyRate,
    day_rate: dayRate,
    risk_score: riskScore,
    risk_level: calculateRiskLevel(riskScore),
  }
}

async function main() {
  console.log('🌱 Starting random worker seed...')
  console.log(`📊 Generating ${WORKER_COUNT} workers for org: ${DEMO_ORG_ID}`)

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Generate workers
  const workers: RandomWorker[] = []
  for (let i = 0; i < WORKER_COUNT; i++) {
    workers.push(generateRandomWorker(i + 1, DEMO_ORG_ID))
  }

  console.log('✅ Generated workers, inserting into database...')

  // Insert in batches of 50 to avoid timeouts
  const batchSize = 50
  let inserted = 0

  for (let i = 0; i < workers.length; i += batchSize) {
    const batch = workers.slice(i, i + batchSize)

    const { error } = await supabase
      .from('workers')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message)
      throw error
    }

    inserted += batch.length
    console.log(`📥 Inserted ${inserted}/${workers.length} workers...`)
  }

  console.log('✅ Successfully seeded random worker data!')
  console.log(`📊 Summary:`)
  console.log(`   - Total workers: ${workers.length}`)
  console.log(`   - Active: ${workers.filter(w => w.status === 'active').length}`)
  console.log(`   - Onboarding: ${workers.filter(w => w.status === 'onboarding').length}`)
  console.log(`   - Probation: ${workers.filter(w => w.status === 'probation').length}`)
  console.log(`   - Suspended: ${workers.filter(w => w.status === 'suspended').length}`)
  console.log(`   - Terminated: ${workers.filter(w => w.status === 'terminated').length}`)
  console.log(`   - Resigned: ${workers.filter(w => w.status === 'resigned').length}`)
}

main().catch(console.error)
