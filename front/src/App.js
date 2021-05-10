import { useEffect, useState } from 'react';
import Chat from './Components/Chat';
import SelectUsername from './Components/SelectUsername';
import socket from './socket';
import classes from './App.module.css';

function App() {
  const [usernameSelected, setUsernameSelected] = useState(false);

  useEffect(() => {
    const sessionID = localStorage.getItem('sessionID');

    if (sessionID) {
      setUsernameSelected(true);
      socket.auth = { sessionID };
      socket.connect();
    }

    socket.on('session', ({ sessionID, userID }) => {
      // attach the sessionID to the next reconnection attempts
      socket.auth = { sessionID };
      // store it in the local storage
      localStorage.setItem('sessionID', sessionID);
      // save the ID of the user
      socket.userID = userID;
    });

    socket.on('connect_error', (err) => {
      if (err.message === 'invalid username') {
        setUsernameSelected(false);
      }
    });
    return () => {
      socket.off('connect_error');
    };
  }, []);

  return (
    <div className={classes.App}>
      {usernameSelected ? (
        <Chat />
      ) : (
        <SelectUsername select={setUsernameSelected} />
      )}
    </div>
  );
}

export default App;
