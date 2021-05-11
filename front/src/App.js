import { useEffect, useState } from 'react';
import Chat from './Components/Chat';
import classes from './App.module.css';
import SelectUsername from './Components/SelectUsername';
import socket from './socket';

function App() {
  const [usernameSelected, setUsernameSelected] = useState(false);

  useEffect(() => {
    socket.on('connect_error', (err) => {
      if (err.message === 'invalid username') {
        setUsernameSelected(false);
      }
    });
    return () => {
      socket.off('connect_error');
    };
  });

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
