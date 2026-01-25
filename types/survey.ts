export type FieldType = 'text' | 'email' | 'select' | 'radio' | 'checkbox' | 'textarea'

export interface SurveyField {
  id: string
  type: FieldType
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

export interface SurveyConfig {
  title: string
  subtitle: string
  fields: SurveyField[]
}
