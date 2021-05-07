import React, { useEffect, useState } from 'react';
import classes from './Chat.module.css';
import MessagePanel from './MessagePanel';
import socket from '../socket';
import User from './User';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const selectUserHandler = (user) => {
    setSelectedUser(user);
    user.hasNewMessages = false;
  };

  const messageHandler = (content) => {
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
      users.forEach((user) => {
        if (user.self) {
          user.connected = true;
        }
      });
      setUsers((prev) => {
        return prev;
      });
    });

    const initReactiveProps = (user) => {
      user.connected = true;
      user.messages = [];
      user.hasNewMessages = false;
    };

    socket.on('users', (users) => {
      users.forEach((user) => {
        user.self = user.userID === socket.id;
        initReactiveProps(user);
      });

      const sortedUsers = users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });
      setUsers(sortedUsers);
    });

    socket.on('user connected', (user) => {
      initReactiveProps(user);
      setUsers((prev) => {
        return [...prev, user];
      });
    });

    socket.on('user disconnected', (id) => {
      const newUsers = users.map((user) => {
        if (user.userID === id) {
          user.connected = false;
        }
        return user;
      });

      setUsers(newUsers);
    });

    socket.on('private message', ({ content, from }) => {
      const newUsers = users.map((user) => {
        if (user.userID === from) {
          user.messages.push({
            content,
            fromSelf: false,
          });
          if (user !== selectedUser) {
            user.hasNewMessages = true;
          }
        }
        return user;
      });
      setUsers(newUsers);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('users');
      socket.off('user connected');
      socket.off('user disconnected');
      socket.off('private message');
    };
  }, [selectedUser, users]);
  return (
    <div>
      <div className={classes.leftPanel}>
        {users.map((user) => {
          return (
            <User
              hasNewMessages={user.hasNewMessages}
              select={() => selectUserHandler(user)}
              selected={selectedUser === user}
              key={user.userID}
              name={user.username}
              connected={user.connected}
              self={user.self}
            />
          );
        })}
      </div>
      {selectedUser ? (
        <MessagePanel
          onMessage={(message) => messageHandler(message)}
          user={selectedUser}
        />
      ) : null}
    </div>
  );
};

export default Chat;
