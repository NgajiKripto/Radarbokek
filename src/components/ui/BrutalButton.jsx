import '../../styles/brutal-button.css';

export default function BrutalButton({
  onClick,
  children,
  type = 'button',
  disabled = false,
  className = '',
  icon = null,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`brutal-button ${className}`.trim()}
    >
      <span className="brutal-button__content">
        {icon ? <span className="brutal-button__icon">{icon}</span> : null}
        <span className="brutal-button__label">{children}</span>
      </span>
      <span className="brutal-button__dots brutal-button__dots--top" aria-hidden="true" />
      <span className="brutal-button__dots brutal-button__dots--bottom" aria-hidden="true" />
    </button>
  );
}
