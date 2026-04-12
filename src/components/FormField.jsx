function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <label className="block space-y-2" htmlFor={name}>
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-ink outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
      />
    </label>
  )
}

export default FormField
