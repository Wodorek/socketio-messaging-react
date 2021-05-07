import React, { useState } from 'react';
import classes from './MessagePanel.module.css';
import StatusIcon from './StatusIcon';

const MessagePanel = (props) => {
  const [value, setValue] = useState('');

  const displaySender = (message, idx) => {
    return (
      idx === 0 ||
      props.user.messages[idx - 1].fromSelf !==
        props.user.messages[idx].fromSelf
    );
  };

  const sendMessageHandler = (event) => {
    event.preventDefault();
    props.onMessage(value);
    setValue('');
  };

  const isValid = () => {
    if (value.length > 0) {
      return false;
    }
    return true;
  };

  const messages = props.user.messages.map((message, idx) => {
    return (
      <li className={classes.message} key={idx}>
        {displaySender(message, idx) ? (
          <div className={classes.sender}>
            {message.fromSelf ? '(yourself)' : props.user.username}
          </div>
        ) : null}
        {message.content}
      </li>
    );
  });

  return (
    <div className={classes.rightPanel}>
      <div className={classes.header}>
        <StatusIcon connected={props.user.connected} />
        {props.user.username}
      </div>
      <ul className={classes.messages}>{messages}</ul>
      <form onSubmit={(e) => sendMessageHandler(e)} className={classes.form}>
        <textarea
          className={classes.input}
          placeholder="Your message..."
          value={value}
          onChange={(event) => setValue((prev) => event.target.value)}
        />
        <button disabled={isValid()} className={classes.sendButton}>
          Send
        </button>
      </form>
    </div>
  );
};

export default MessagePanel;
