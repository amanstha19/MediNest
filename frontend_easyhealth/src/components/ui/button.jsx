// src/components/ui/button.jsx

import React from 'react'
import PropTypes from 'prop-types'

const Button = ({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
}) => {
  const classes = [
    'eh-btn',
    `eh-btn--${variant}`,
    `eh-btn--${size}`,
    className,
  ]

  return (
    <button type={type} className={classes.join(' ')} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'outline', 'success', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
}

export default Button
