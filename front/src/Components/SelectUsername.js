import React, { useState } from 'react';
import classes from './SelectUsername.module.css';
import socket from '../socket';

const SelectUsername = (props) => {
  const [username, setUsername] = useState('');

  const submitHandler = (event) => {
    event.preventDefault();
    socket.auth = { username };
    socket.connect();

    props.select(true);
  };

  return (
    <div className={classes.selectUsername}>
      <form>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <button disabled={username < 2} onClick={(e) => submitHandler(e)}>
          Send
        </button>
      </form>
    </div>
  );
};

export default SelectUsername;
