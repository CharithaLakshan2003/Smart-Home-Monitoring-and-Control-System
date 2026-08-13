interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  size?: 'default' | 'small';
}

export function ToggleSwitch({ checked, disabled = false, onChange, size = 'default' }: ToggleSwitchProps) {
  const isSmall = size === 'small';

  return (
    <label
      className={`relative flex-shrink-0 ${isSmall ? 'w-[38px] h-[22px]' : 'w-[48px] h-[26px]'}`}
    >
      <input
        type="checkbox"
        className="toggle-input sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={isSmall ? 'toggle-slider-sm' : 'toggle-slider'} />
    </label>
  );
}
