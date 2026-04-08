import { isValidElement } from 'react';

export const BrutalButton = ({
  onClick,
  children,
  type = 'button',
  disabled = false,
  className = '',
  icon,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (isValidElement(icon)) return <span className="brutal-btn-uiverse__icon">{icon}</span>;

    const IconComponent = icon;
    return (
      <span className="brutal-btn-uiverse__icon">
        <IconComponent />
      </span>
    );
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`brutal-btn-uiverse ${className}`.trim()}
    >
      <div className="brutal-btn-uiverse__dots-border" aria-hidden="true">
        <div className="brutal-btn-uiverse__dots">
          <span className="brutal-btn-uiverse__dot" />
          <span className="brutal-btn-uiverse__dot" />
          <span className="brutal-btn-uiverse__dot" />
          <span className="brutal-btn-uiverse__dot" />
          <span className="brutal-btn-uiverse__dot" />
          <span className="brutal-btn-uiverse__dot" />
          <span className="brutal-btn-uiverse__dot" />
          <span className="brutal-btn-uiverse__dot" />
        </div>
      </div>

      <span className="brutal-btn-uiverse__content">
        {renderIcon()}
        <span>{children}</span>
      </span>
    </button>
  );
};

export default BrutalButton;
