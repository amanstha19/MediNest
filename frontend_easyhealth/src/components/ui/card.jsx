import React from 'react'
import PropTypes from 'prop-types'

export const Card = ({ children, className = '' }) => {
  return <div className={`eh-card ${className}`}>{children}</div>
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export const CardContent = ({ children, className = '' }) => {
  return <div className={`eh-card__body ${className}`}>{children}</div>
}

CardContent.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export default Card
