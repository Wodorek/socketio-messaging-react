import React, { useEffect, useState } from 'react';
import { useImmer } from 'use-immer';
import classes from './Chat.module.css';
import MessagePanel from './MessagePanel';
import socket from '../socket';
import User from './User';

const Chat = () => {
  const [users, setUsers] = useImmer([]);
  console.log(users);
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

    socket.on('disconnect', () => {
      setUsers((draft) => {
        draft.forEach((user) => {
          if (user.self) {
            user.connected = false;
          }
        });
      });
    });

    const initReactiveProperties = (user) => {
      user.connected = true;
      user.messages = [];
      user.hasNewMessages = false;
    };

    socket.on('users', (_users) => {
      _users.forEach((user) => {
        user.self = user.userID === socket.id;
        initReactiveProperties(user);
      });

      setUsers(
        _users.sort((a, b) => {
          if (a.self) return -1;
          if (b.self) return 1;
          if (a.username < b.username) return -1;
          return a.username > b.username ? 1 : 0;
        })
      );
    });

    socket.on('user connected', (user) => {
      initReactiveProperties(user);
      setUsers((draft) => {
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

    socket.on('private message', ({ content, from }) => {
      setUsers((draft) => {
        for (let i = 0; i < draft.length; i++) {
          const user = draft[i];
          if (user.userID === from) {
            user.messages.push({
              content,
              fromSelf: false,
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
