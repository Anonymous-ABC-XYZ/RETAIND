import { supabase } from '@/lib/supabase'
import { generateRandomWorkers, type RandomWorker } from './generateRandomWorkers'

/**
 * Seeds random worker data into the database for a given organization.
 * This function is idempotent - it uses upsert to handle conflicts.
 */
export async function seedRandomWorkers(orgId: string, count: number = 50): Promise<{ success: boolean; count: number; error?: string }> {
  console.log(`Generating ${count} random workers for org: ${orgId}`)

  try {
    const workers = generateRandomWorkers(count)

    const workersToInsert = workers.map((worker: RandomWorker) => ({
      id: worker.id,
      organisation_id: orgId,
      team_id: worker.teamId,
      region_id: worker.regionId,
      first_name: worker.firstName,
      last_name: worker.lastName,
      email: worker.email,
      phone: worker.phone,
      date_of_birth: worker.dateOfBirth,
      address: worker.address,
      city: worker.city,
      postcode: worker.postcode,
      emergency_contact_name: worker.emergencyContactName,
      emergency_contact_phone: worker.emergencyContactPhone,
      employee_number: worker.employeeNumber,
      job_title: worker.jobTitle,
      trade: worker.trade,
      status: worker.status,
      employment_type: worker.employmentType,
      start_date: worker.startDate,
      probation_end_date: worker.probationEndDate,
      cscs_card_number: worker.cscsCardNumber,
      cscs_card_type: worker.cscsCardType,
      cscs_expiry_date: worker.cscsExpiryDate,
      ni_number: worker.niNumber,
      hourly_rate: worker.hourlyRate,
      day_rate: worker.dayRate,
      risk_score: worker.riskScore,
      risk_level: worker.riskLevel,
    }))

    console.log('Seeding workers...')
    const { error } = await supabase
      .from('workers')
      .upsert(workersToInsert as any, { onConflict: 'id' })

    if (error) {
      console.error('Error seeding workers:', error)
      return { success: false, count: 0, error: error.message }
    }

    console.log(`Successfully seeded ${count} random workers!`)
    return { success: true, count }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error during random worker seed:', error)
    return { success: false, count: 0, error: errorMessage }
  }
}

/**
 * Deletes all randomly generated workers (those with IDs starting with 'random-worker-')
 */
export async function deleteRandomWorkers(orgId: string): Promise<{ success: boolean; error?: string }> {
  console.log(`Deleting random workers for org: ${orgId}`)

  try {
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('organisation_id', orgId)
      .like('id', 'random-worker-%')

    if (error) {
      console.error('Error deleting random workers:', error)
      return { success: false, error: error.message }
    }

    console.log('Successfully deleted random workers!')
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error during random worker deletion:', error)
    return { success: false, error: errorMessage }
  }
}
