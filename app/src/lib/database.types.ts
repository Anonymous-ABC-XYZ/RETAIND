export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrgRole = 'ORG_ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'OPERATIVE' | 'VIEWER'
export type WorkerStatus = 'active' | 'onboarding' | 'probation' | 'suspended' | 'terminated' | 'resigned'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'apprentice' | 'casual' | 'agency'
export type TaskType = 'document' | 'training' | 'certification' | 'meeting' | 'form' | 'equipment' | 'access' | 'introduction' | 'assessment' | 'other'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'overdue' | 'blocked'
export type IssueType = 'performance' | 'attendance' | 'conduct' | 'safety' | 'quality' | 'training' | 'documentation' | 'equipment' | 'communication' | 'other'
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IssueStatus = 'open' | 'in_progress' | 'pending_review' | 'resolved' | 'escalated' | 'closed'
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          job_title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          job_title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          job_title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organisations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          industry: string | null
          address: string | null
          city: string | null
          postcode: string | null
          country: string | null
          phone: string | null
          website: string | null
          settings: Json
          subscription_tier: string
          subscription_status: string
          max_workers: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          industry?: string | null
          address?: string | null
          city?: string | null
          postcode?: string | null
          country?: string | null
          phone?: string | null
          website?: string | null
          settings?: Json
          subscription_tier?: string
          subscription_status?: string
          max_workers?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          industry?: string | null
          address?: string | null
          city?: string | null
          postcode?: string | null
          country?: string | null
          phone?: string | null
          website?: string | null
          settings?: Json
          subscription_tier?: string
          subscription_status?: string
          max_workers?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_organisations: {
        Row: {
          id: string
          user_id: string
          organisation_id: string
          role: OrgRole
          is_primary: boolean
          joined_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organisation_id: string
          role?: OrgRole
          is_primary?: boolean
          joined_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organisation_id?: string
          role?: OrgRole
          is_primary?: boolean
          joined_at?: string
        }
      }
      super_admins: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
      regions: {
        Row: {
          id: string
          organisation_id: string
          name: string
          code: string | null
          description: string | null
          manager_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          name: string
          code?: string | null
          description?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          name?: string
          code?: string | null
          description?: string | null
          manager_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          organisation_id: string
          region_id: string | null
          name: string
          code: string | null
          description: string | null
          leader_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          region_id?: string | null
          name: string
          code?: string | null
          description?: string | null
          leader_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          region_id?: string | null
          name?: string
          code?: string | null
          description?: string | null
          leader_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workers: {
        Row: {
          id: string
          organisation_id: string
          team_id: string | null
          region_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          avatar_url: string | null
          date_of_birth: string | null
          address: string | null
          city: string | null
          postcode: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employee_number: string | null
          job_title: string
          trade: string | null
          status: WorkerStatus
          employment_type: EmploymentType
          start_date: string
          probation_end_date: string | null
          end_date: string | null
          cscs_card_number: string | null
          cscs_card_type: string | null
          cscs_expiry_date: string | null
          ni_number: string | null
          hourly_rate: number | null
          day_rate: number | null
          line_manager_id: string | null
          mentor_id: string | null
          risk_score: number
          risk_level: string
          last_risk_assessment: string | null
          notes: string | null
          tags: string[] | null
          custom_fields: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          team_id?: string | null
          region_id?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          postcode?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string | null
          job_title: string
          trade?: string | null
          status?: WorkerStatus
          employment_type?: EmploymentType
          start_date: string
          probation_end_date?: string | null
          end_date?: string | null
          cscs_card_number?: string | null
          cscs_card_type?: string | null
          cscs_expiry_date?: string | null
          ni_number?: string | null
          hourly_rate?: number | null
          day_rate?: number | null
          line_manager_id?: string | null
          mentor_id?: string | null
          risk_score?: number
          risk_level?: string
          last_risk_assessment?: string | null
          notes?: string | null
          tags?: string[] | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          team_id?: string | null
          region_id?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          address?: string | null
          city?: string | null
          postcode?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employee_number?: string | null
          job_title?: string
          trade?: string | null
          status?: WorkerStatus
          employment_type?: EmploymentType
          start_date?: string
          probation_end_date?: string | null
          end_date?: string | null
          cscs_card_number?: string | null
          cscs_card_type?: string | null
          cscs_expiry_date?: string | null
          ni_number?: string | null
          hourly_rate?: number | null
          day_rate?: number | null
          line_manager_id?: string | null
          mentor_id?: string | null
          risk_score?: number
          risk_level?: string
          last_risk_assessment?: string | null
          notes?: string | null
          tags?: string[] | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
        }
      }
      onboarding_templates: {
        Row: {
          id: string
          organisation_id: string
          name: string
          description: string | null
          role_type: string | null
          trade: string | null
          duration_days: number
          is_active: boolean
          is_default: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          name: string
          description?: string | null
          role_type?: string | null
          trade?: string | null
          duration_days?: number
          is_active?: boolean
          is_default?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          name?: string
          description?: string | null
          role_type?: string | null
          trade?: string | null
          duration_days?: number
          is_active?: boolean
          is_default?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      template_tasks: {
        Row: {
          id: string
          template_id: string
          name: string
          description: string | null
          task_type: TaskType
          category: string | null
          due_day: number
          is_required: boolean
          requires_evidence: boolean
          requires_sign_off: boolean
          sign_off_role: OrgRole | null
          instructions: string | null
          resources: Json
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          name: string
          description?: string | null
          task_type?: TaskType
          category?: string | null
          due_day: number
          is_required?: boolean
          requires_evidence?: boolean
          requires_sign_off?: boolean
          sign_off_role?: OrgRole | null
          instructions?: string | null
          resources?: Json
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          name?: string
          description?: string | null
          task_type?: TaskType
          category?: string | null
          due_day?: number
          is_required?: boolean
          requires_evidence?: boolean
          requires_sign_off?: boolean
          sign_off_role?: OrgRole | null
          instructions?: string | null
          resources?: Json
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      onboarding_assignments: {
        Row: {
          id: string
          organisation_id: string
          worker_id: string
          template_id: string
          assigned_by: string | null
          start_date: string
          target_completion_date: string | null
          actual_completion_date: string | null
          status: string
          progress_percentage: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          worker_id: string
          template_id: string
          assigned_by?: string | null
          start_date: string
          target_completion_date?: string | null
          actual_completion_date?: string | null
          status?: string
          progress_percentage?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          worker_id?: string
          template_id?: string
          assigned_by?: string | null
          start_date?: string
          target_completion_date?: string | null
          actual_completion_date?: string | null
          status?: string
          progress_percentage?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assigned_tasks: {
        Row: {
          id: string
          assignment_id: string
          template_task_id: string
          worker_id: string
          status: TaskStatus
          due_date: string
          completed_date: string | null
          completed_by: string | null
          signed_off_by: string | null
          signed_off_at: string | null
          evidence_url: string | null
          evidence_notes: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          template_task_id: string
          worker_id: string
          status?: TaskStatus
          due_date: string
          completed_date?: string | null
          completed_by?: string | null
          signed_off_by?: string | null
          signed_off_at?: string | null
          evidence_url?: string | null
          evidence_notes?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          template_task_id?: string
          worker_id?: string
          status?: TaskStatus
          due_date?: string
          completed_date?: string | null
          completed_by?: string | null
          signed_off_by?: string | null
          signed_off_at?: string | null
          evidence_url?: string | null
          evidence_notes?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      issues: {
        Row: {
          id: string
          organisation_id: string
          worker_id: string
          reported_by: string | null
          assigned_to: string | null
          title: string
          description: string
          issue_type: IssueType
          severity: IssueSeverity
          status: IssueStatus
          due_date: string | null
          resolved_date: string | null
          resolved_by: string | null
          resolution_notes: string | null
          root_cause: string | null
          corrective_action: string | null
          preventive_action: string | null
          is_confidential: boolean
          tags: string[] | null
          attachments: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          worker_id: string
          reported_by?: string | null
          assigned_to?: string | null
          title: string
          description: string
          issue_type: IssueType
          severity?: IssueSeverity
          status?: IssueStatus
          due_date?: string | null
          resolved_date?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          root_cause?: string | null
          corrective_action?: string | null
          preventive_action?: string | null
          is_confidential?: boolean
          tags?: string[] | null
          attachments?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          worker_id?: string
          reported_by?: string | null
          assigned_to?: string | null
          title?: string
          description?: string
          issue_type?: IssueType
          severity?: IssueSeverity
          status?: IssueStatus
          due_date?: string | null
          resolved_date?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          root_cause?: string | null
          corrective_action?: string | null
          preventive_action?: string | null
          is_confidential?: boolean
          tags?: string[] | null
          attachments?: Json
          created_at?: string
          updated_at?: string
        }
      }
      issue_comments: {
        Row: {
          id: string
          issue_id: string
          author_id: string | null
          content: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          issue_id: string
          author_id?: string | null
          content: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          issue_id?: string
          author_id?: string | null
          content?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cpd_records: {
        Row: {
          id: string
          organisation_id: string
          worker_id: string
          title: string
          description: string | null
          provider: string | null
          category: string | null
          training_type: string | null
          start_date: string
          end_date: string | null
          hours_completed: number | null
          cost: number | null
          status: string
          certificate_number: string | null
          certificate_url: string | null
          expiry_date: string | null
          notes: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          worker_id: string
          title: string
          description?: string | null
          provider?: string | null
          category?: string | null
          training_type?: string | null
          start_date: string
          end_date?: string | null
          hours_completed?: number | null
          cost?: number | null
          status?: string
          certificate_number?: string | null
          certificate_url?: string | null
          expiry_date?: string | null
          notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          worker_id?: string
          title?: string
          description?: string | null
          provider?: string | null
          category?: string | null
          training_type?: string | null
          start_date?: string
          end_date?: string | null
          hours_completed?: number | null
          cost?: number | null
          status?: string
          certificate_number?: string | null
          certificate_url?: string | null
          expiry_date?: string | null
          notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      mentor_notes: {
        Row: {
          id: string
          organisation_id: string
          worker_id: string
          mentor_id: string | null
          note_type: string
          title: string | null
          content: string
          is_private: boolean
          follow_up_date: string | null
          follow_up_completed: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          worker_id: string
          mentor_id?: string | null
          note_type?: string
          title?: string | null
          content: string
          is_private?: boolean
          follow_up_date?: string | null
          follow_up_completed?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          worker_id?: string
          mentor_id?: string | null
          note_type?: string
          title?: string | null
          content?: string
          is_private?: boolean
          follow_up_date?: string | null
          follow_up_completed?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      playbooks: {
        Row: {
          id: string
          organisation_id: string
          title: string
          description: string | null
          category: string | null
          content: string
          role_types: string[] | null
          trades: string[] | null
          version: string
          is_published: boolean
          is_mandatory: boolean
          requires_acknowledgment: boolean
          author_id: string | null
          last_reviewed_at: string | null
          last_reviewed_by: string | null
          tags: string[] | null
          attachments: Json
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          title: string
          description?: string | null
          category?: string | null
          content: string
          role_types?: string[] | null
          trades?: string[] | null
          version?: string
          is_published?: boolean
          is_mandatory?: boolean
          requires_acknowledgment?: boolean
          author_id?: string | null
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
          tags?: string[] | null
          attachments?: Json
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          title?: string
          description?: string | null
          category?: string | null
          content?: string
          role_types?: string[] | null
          trades?: string[] | null
          version?: string
          is_published?: boolean
          is_mandatory?: boolean
          requires_acknowledgment?: boolean
          author_id?: string | null
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
          tags?: string[] | null
          attachments?: Json
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      playbook_acknowledgments: {
        Row: {
          id: string
          playbook_id: string
          worker_id: string
          acknowledged_at: string
        }
        Insert: {
          id?: string
          playbook_id: string
          worker_id: string
          acknowledged_at?: string
        }
        Update: {
          id?: string
          playbook_id?: string
          worker_id?: string
          acknowledged_at?: string
        }
      }
      org_invites: {
        Row: {
          id: string
          organisation_id: string
          email: string
          role: OrgRole
          status: InviteStatus
          invited_by: string | null
          token: string | null
          message: string | null
          expires_at: string
          accepted_at: string | null
          declined_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organisation_id: string
          email: string
          role?: OrgRole
          status?: InviteStatus
          invited_by?: string | null
          token?: string | null
          message?: string | null
          expires_at?: string
          accepted_at?: string | null
          declined_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organisation_id?: string
          email?: string
          role?: OrgRole
          status?: InviteStatus
          invited_by?: string | null
          token?: string | null
          message?: string | null
          expires_at?: string
          accepted_at?: string | null
          declined_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      calculate_worker_risk_score: {
        Args: { worker_uuid: string }
        Returns: Json
      }
      get_org_dashboard_metrics: {
        Args: { org_uuid: string }
        Returns: Json
      }
      accept_org_invite: {
        Args: { invite_token: string }
        Returns: Json
      }
      decline_org_invite: {
        Args: { invite_token: string }
        Returns: Json
      }
    }
  }
}

// Helper types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Organisation = Database['public']['Tables']['organisations']['Row']
export type UserOrganisation = Database['public']['Tables']['user_organisations']['Row']
export type Region = Database['public']['Tables']['regions']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type Worker = Database['public']['Tables']['workers']['Row']
export type OnboardingTemplate = Database['public']['Tables']['onboarding_templates']['Row']
export type TemplateTask = Database['public']['Tables']['template_tasks']['Row']
export type OnboardingAssignment = Database['public']['Tables']['onboarding_assignments']['Row']
export type AssignedTask = Database['public']['Tables']['assigned_tasks']['Row']
export type Issue = Database['public']['Tables']['issues']['Row']
export type IssueComment = Database['public']['Tables']['issue_comments']['Row']
export type CpdRecord = Database['public']['Tables']['cpd_records']['Row']
export type MentorNote = Database['public']['Tables']['mentor_notes']['Row']
export type Playbook = Database['public']['Tables']['playbooks']['Row']
export type PlaybookAcknowledgment = Database['public']['Tables']['playbook_acknowledgments']['Row']
export type OrgInvite = Database['public']['Tables']['org_invites']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type OrganisationInsert = Database['public']['Tables']['organisations']['Insert']
export type WorkerInsert = Database['public']['Tables']['workers']['Insert']
export type IssueInsert = Database['public']['Tables']['issues']['Insert']
export type CpdRecordInsert = Database['public']['Tables']['cpd_records']['Insert']
export type MentorNoteInsert = Database['public']['Tables']['mentor_notes']['Insert']
