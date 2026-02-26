import { supabase } from '@/lib/supabase'
import {
  DEMO_REGIONS,
  DEMO_TEAMS,
  DEMO_WORKERS,
  DEMO_ISSUES,
  DEMO_TEMPLATES,
  DEMO_PLAYBOOKS,
  DEMO_CPD_RECORDS,
} from './demoData'

/**
 * Seeds demo data into the database for a given organization.
 * This function is idempotent - it checks if data already exists before inserting.
 */
export async function seedDemoData(orgId: string): Promise<void> {
  console.log('Starting demo data seed for org:', orgId)

  try {
    // 1. Seed Regions
    console.log('Seeding regions...')
    const regionsToInsert = DEMO_REGIONS.map((region) => ({
      id: region.id,
      organisation_id: orgId,
      name: region.name,
      code: region.code,
      description: region.description,
      is_active: true,
    }))

    const { error: regionsError } = await supabase
      .from('regions')
      .upsert(regionsToInsert as any, { onConflict: 'id' })

    if (regionsError) {
      console.error('Error seeding regions:', regionsError)
    }

    // 2. Seed Teams
    console.log('Seeding teams...')
    const teamsToInsert = DEMO_TEAMS.map((team) => ({
      id: team.id,
      organisation_id: orgId,
      region_id: team.regionId,
      name: team.name,
      code: team.code,
      is_active: true,
    }))

    const { error: teamsError } = await supabase
      .from('teams')
      .upsert(teamsToInsert as any, { onConflict: 'id' })

    if (teamsError) {
      console.error('Error seeding teams:', teamsError)
    }

    // 3. Seed Workers
    console.log('Seeding workers...')
    const workersToInsert = DEMO_WORKERS.map((worker) => ({
      id: worker.id,
      organisation_id: orgId,
      team_id: worker.teamId,
      region_id: worker.regionId,
      first_name: worker.firstName,
      last_name: worker.lastName,
      email: worker.email,
      phone: worker.phone,
      job_title: worker.jobTitle,
      trade: worker.trade,
      status: worker.status,
      employment_type: worker.employmentType,
      start_date: worker.startDate,
      risk_score: worker.riskScore,
      risk_level: worker.riskLevel,
      cscs_card_type: worker.cscsCardType,
      cscs_expiry_date: worker.cscsExpiryDate,
    }))

    const { error: workersError } = await supabase
      .from('workers')
      .upsert(workersToInsert as any, { onConflict: 'id' })

    if (workersError) {
      console.error('Error seeding workers:', workersError)
    }

    // 4. Seed Onboarding Templates
    console.log('Seeding templates...')
    for (const template of DEMO_TEMPLATES) {
      const templateData = {
        id: template.id,
        organisation_id: orgId,
        name: template.name,
        description: template.description,
        role_type: template.roleType,
        trade: template.trade,
        duration_days: template.durationDays,
        is_active: true,
        is_default: template.id === 'template-electrical-apprentice',
      }

      const { error: templateError } = await supabase
        .from('onboarding_templates')
        .upsert(templateData as any, { onConflict: 'id' })

      if (templateError) {
        console.error('Error seeding template:', templateError)
        continue
      }

      // Seed template tasks
      const tasksToInsert = template.tasks.map((task, index) => ({
        id: `${template.id}-task-${index + 1}`,
        template_id: template.id,
        name: task.name,
        task_type: task.taskType,
        due_day: task.dueDay,
        category: task.category,
        is_required: true,
        order_index: index,
      }))

      const { error: tasksError } = await supabase
        .from('template_tasks')
        .upsert(tasksToInsert as any, { onConflict: 'id' })

      if (tasksError) {
        console.error('Error seeding template tasks:', tasksError)
      }
    }

    // 5. Seed Issues
    console.log('Seeding issues...')
    const issuesToInsert = DEMO_ISSUES.map((issue) => ({
      id: issue.id,
      organisation_id: orgId,
      worker_id: issue.workerId,
      title: issue.title,
      description: issue.description,
      issue_type: issue.issueType,
      severity: issue.severity,
      status: issue.status,
      created_at: new Date(issue.createdAt).toISOString(),
      due_date: issue.dueDate,
    }))

    const { error: issuesError } = await supabase
      .from('issues')
      .upsert(issuesToInsert as any, { onConflict: 'id' })

    if (issuesError) {
      console.error('Error seeding issues:', issuesError)
    }

    // 6. Seed Playbooks
    console.log('Seeding playbooks...')
    const playbooksToInsert = DEMO_PLAYBOOKS.map((playbook) => ({
      id: playbook.id,
      organisation_id: orgId,
      title: playbook.title,
      description: playbook.description,
      category: playbook.category,
      content: playbook.content,
      role_types: playbook.roleTypes,
      is_published: true,
      is_mandatory: playbook.isMandatory,
      requires_acknowledgment: playbook.requiresAcknowledgment,
    }))

    const { error: playbooksError } = await supabase
      .from('playbooks')
      .upsert(playbooksToInsert as any, { onConflict: 'id' })

    if (playbooksError) {
      console.error('Error seeding playbooks:', playbooksError)
    }

    // 7. Seed CPD Records
    console.log('Seeding CPD records...')
    const cpdToInsert = DEMO_CPD_RECORDS.map((cpd) => ({
      id: cpd.id,
      organisation_id: orgId,
      worker_id: cpd.workerId,
      title: cpd.title,
      provider: cpd.provider,
      category: cpd.category,
      training_type: cpd.trainingType,
      start_date: cpd.startDate,
      hours_completed: cpd.hoursCompleted,
      status: cpd.status,
    }))

    const { error: cpdError } = await supabase
      .from('cpd_records')
      .upsert(cpdToInsert as any, { onConflict: 'id' })

    if (cpdError) {
      console.error('Error seeding CPD records:', cpdError)
    }

    // 8. Create onboarding assignments for workers in 'onboarding' status
    console.log('Creating onboarding assignments...')
    const onboardingWorkers = DEMO_WORKERS.filter((w) => w.status === 'onboarding')

    for (const worker of onboardingWorkers) {
      // Find appropriate template based on trade
      const template = DEMO_TEMPLATES.find(
        (t) => t.trade === worker.trade || t.id === 'template-electrical-apprentice'
      )

      if (template) {
        const assignmentId = `assignment-${worker.id}`

        const { error: assignmentError } = await supabase
          .from('onboarding_assignments')
          .upsert({
            id: assignmentId,
            organisation_id: orgId,
            worker_id: worker.id,
            template_id: template.id,
            start_date: worker.startDate,
            status: 'in_progress',
            progress_percentage: Math.floor(Math.random() * 60) + 10, // Random progress 10-70%
          } as any, { onConflict: 'id' })

        if (assignmentError) {
          console.error('Error creating assignment:', assignmentError)
          continue
        }

        // Create assigned tasks
        const tasks = template.tasks.map((task, index) => {
          const dueDate = new Date(worker.startDate)
          dueDate.setDate(dueDate.getDate() + task.dueDay)

          // Randomly complete some tasks
          const isCompleted = Math.random() > 0.5 && dueDate < new Date()

          return {
            id: `${assignmentId}-task-${index + 1}`,
            assignment_id: assignmentId,
            template_task_id: `${template.id}-task-${index + 1}`,
            worker_id: worker.id,
            status: isCompleted ? 'completed' : (dueDate < new Date() ? 'overdue' : 'pending'),
            due_date: dueDate.toISOString().split('T')[0],
            completed_date: isCompleted ? new Date().toISOString() : null,
          }
        })

        const { error: tasksError } = await supabase
          .from('assigned_tasks')
          .upsert(tasks as any, { onConflict: 'id' })

        if (tasksError) {
          console.error('Error creating assigned tasks:', tasksError)
        }
      }
    }

    console.log('Demo data seed completed successfully!')
  } catch (error) {
    console.error('Error during demo data seed:', error)
    throw error
  }
}
