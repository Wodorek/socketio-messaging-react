import React, { useEffect, useState } from 'react';
import classes from './Chat.module.css';
import MessagePanel from './MessagePanel';
import socket from '../socket';
import User from './User';

const Chat = () => {
  const [users, setUsers] = useState([]);
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
      const newUsers = users.map((user) => {
        if (user.self) {
          user.connected = true;
        }
        return user;
      });
      setUsers(newUsers);
    });

    socket.on('disconnected', () => {
      const newUsers = users.map((user) => {
        if (user.self) {
          user.connected = false;
        }
        return user;
      });
      setUsers(newUsers);
    });

    const initReactiveProps = (user) => {
      user.messages = [];
      user.hasNewMessages = false;
    };

    socket.on('users', (_users) => {
      let newUsers = _users.map((user) => {
        for (let i = 0; i < users.length; i++) {
          const existingUser = users[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = user.connected;
          }
        }
        user.self = user.userID === socket.userID;
        initReactiveProps(user);
        return user;
      });

      newUsers = newUsers.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });

      setUsers(newUsers);
    });

    socket.on('user connected', (_user) => {
      let newUser = true;
      const newUsers = users.map((user) => {
        if (user.userID === _user.userID) {
          user.connected = true;
          newUser = false;
        }
        return user;
      });

      if (newUser) {
        initReactiveProps(_user);
        setUsers((prev) => [...prev, _user]);
      } else {
        setUsers(newUsers);
      }
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

    socket.on('private message', ({ content, from, to }) => {
      const newUsers = users.map((user) => {
        const fromSelf = socket.userID === from;
        if (user.userID === (fromSelf ? to : from)) {
          user.messages.push({
            content,
            fromSelf,
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
