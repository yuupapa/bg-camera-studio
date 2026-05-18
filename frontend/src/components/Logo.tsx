interface Props {
  size?: number
  className?: string
}

// Single source of truth for the app logo. Place the logo file at
// frontend/public/logo.png — it is served at /logo.png.
export default function Logo({ size = 36, className = '' }: Props) {
  return (
    <img
      src={import.meta.env.BASE_URL + 'logo.png'}
      alt="BG Camera Studio"
      width={size}
      height={size}
      draggable={false}
      className={`rounded-xl object-contain select-none ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
