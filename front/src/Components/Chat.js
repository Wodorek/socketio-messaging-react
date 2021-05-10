import React, { useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import classes from './Chat.module.css';
import MessagePanel from './MessagePanel';
import socket from '../socket';
import User from './User';

const Chat = () => {
  const [users, setUsers] = useImmer([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const onSelectUser = (user) => {
    setSelectedUser(user);
    user.hasNewMessages = false;
  };

  const onMessage = (content) => {
    if (selectedUser) {
      socket.emit('private message', {
        content,
        to: selectedUser.userID,
      });
      selectedUser.messages.push({
        content,
        fromSelf: true,
      });
    }
  };

  useEffect(() => {
    socket.on('connect', () => {
      setUsers((draft) => {
        draft.forEach((user) => {
          if (user.self) {
            user.connected = true;
          }
        });
      });
    });

    socket.on('disconnected', () => {});

    const initReactiveProps = (user) => {
      user.messages = [];
      user.hasNewMessages = false;
    };

    socket.on('users', (_users) => {
      _users.forEach((user) => {
        for (let i = 0; i < users.length; i++) {
          const existingUser = users[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = user.connected;
            return;
          }
        }
        user.self = user.userID === socket.userID;
        initReactiveProps(user);
        setUsers((draft) => {
          draft.push(user);
        });
      });

      setUsers((draft) => {
        draft.sort((a, b) => {
          if (a.self) return -1;
          if (b.self) return 1;
          if (a.username < b.username) return -1;
          return a.username > b.username ? 1 : 0;
        });
      });
    });

    socket.on('user connected', (user) => {
      setUsers((draft) => {
        for (let i = 0; i < draft.length; i++) {
          const existingUser = draft[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = true;
            return;
          }
        }
        initReactiveProps(user);
        draft.push(user);
      });
    });

    socket.on('user disconnected', (id) => {
      setUsers((draft) => {
        for (let i = 0; i < draft.length; i++) {
          const user = draft[i];
          if (user.userID === id) {
            user.connected = false;
            break;
          }
        }
      });
    });

    socket.on('private message', ({ content, from, to }) => {
      setUsers((draft) => {
        for (let i = 0; i < draft.length; i++) {
          const user = draft[i];
          const fromSelf = socket.userID === from;
          if (user.userID === (fromSelf ? to : from)) {
            user.messages.push({
              content,
              fromSelf,
            });
            if (user !== selectedUser) {
              user.hasNewMessages = true;
            }
            break;
          }
        }
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('users');
      socket.off('user connected');
      socket.off('user disconnected');
      socket.off('private message');
    };
  }, [selectedUser, setUsers, users]);
  return (
    <div>
      <div className={classes.leftPanel}>
        {users.map((user) => {
          return (
            <User
              hasNewMessages={user.hasNewMessages}
              select={() => onSelectUser(user)}
              selected={selectedUser === user}
              key={user.userID}
              username={user.username}
              connected={user.connected}
              self={user.self}
            />
          );
        })}
      </div>
      {selectedUser ? (
        <MessagePanel
          onMessage={(message) => onMessage(message)}
          user={selectedUser}
        />
      ) : null}
    </div>
  );
};

export default Chat;
