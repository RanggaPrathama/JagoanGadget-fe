export type FieldOption = {
  label: string
  value: string | number
  disabled?: boolean
}

export type FieldBaseProps = {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  className?: string
}
