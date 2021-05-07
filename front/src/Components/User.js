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
        <div className={classes.name}>
          {props.username}
          {props.self ? ' (yourself)' : ''}
        </div>
        <div className={classes.status}>
          <StatusIcon connected={props.connected} />{' '}
          {props.connected ? 'online' : 'offline'}
        </div>
      </div>
      {props.hasNewMessages ? (
        <div className={classes.newMessages}>!</div>
      ) : null}
    </div>
  );
};

export default User;
