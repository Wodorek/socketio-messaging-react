import React from 'react';
import classes from './User.module.css';
import StatusIcon from './StatusIcon';

const User = (props) => {
  return (
    <div
      onClick={props.select}
      className={`${classes.user} ${props.selected ? classes.selected : ''}`}
    >
      <div className={classes.description}>
        <div className={classes.name}>{props.self ? 'Ja' : props.name}</div>
        <div>
          <StatusIcon connected={props.connected} />
        </div>
      </div>
      {props.hasNewMessages ? (
        <div className={classes.newMessages}>!</div>
      ) : null}
    </div>
  );
};

export default User;
