import React from 'react';
import classes from './StatusIcon.module.css';

const StatusIcon = (props) => {
  return (
    <i
      className={`${classes.icon} ${props.connected ? classes.connected : ''}`}
    ></i>
  );
};

export default StatusIcon;
