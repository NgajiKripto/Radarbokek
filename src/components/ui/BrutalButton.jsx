import { isValidElement } from 'react';

import '../../styles/brutal-button.css';

const BrutalButton = ({
  onClick,
  children,
  type = 'button',
  disabled = false,
  className = '',
  icon,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (isValidElement(icon)) return <span className="brutal-button__icon">{icon}</span>;

    const IconComponent = icon;
    return (
      <span className="brutal-button__icon">
        <IconComponent className="w-4 h-4" />
      </span>
    );
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`brutal-button ${className}`.trim()}
    >
      <div className="brutal-button__dots-border" aria-hidden="true">
        <div className="brutal-button__dots">
          <span className="brutal-button__dot" />
          <span className="brutal-button__dot" />
          <span className="brutal-button__dot" />
          <span className="brutal-button__dot" />
          <span className="brutal-button__dot" />
          <span className="brutal-button__dot" />
          <span className="brutal-button__dot" />
          <span className="brutal-button__dot" />
        </div>
      </div>

      <span className="brutal-button__content">
        {renderIcon()}
        <span>{children}</span>
      </span>
    </button>
  );
};

export default BrutalButton;
