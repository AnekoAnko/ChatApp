import { useEffect, useState } from 'react'
import './App.css'
import io from 'socket.io-client';

const socket = io.connect('http://localhost:3000');

function App() {
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');
  const [userConnected, setUserConnected] = useState(false);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('deliver message', data => {
      setMessages(prevMessages => [...prevMessages, {message: `${data.name}: ${data.message}`, isOwnMessage: false}]);
      console.log(data.message);
    });

    socket.on('user connected', name => {
      setMessages(prevMessages => [...prevMessages, { message: `User ${name} connected!`, isOwnMessage: false }]);
    });

    socket.on('user disconnected', name => {
      setMessages(prevMessages => [...prevMessages, { message: `User ${name} disconnected!`, isOwnMessage: false }]);
    });

    return () => {
      socket.off('deliver message');
      socket.off('user connected');
      socket.off('user disconnected');
    };

  }, [socket]);

  const joinRoom = () => {
    if (room !== ''){
      setUserConnected(true);
      socket.emit('join room', {room, name});
    }
  }

  const leaveRoom = () => {
    if (userConnected) {
      setUserConnected(false);
      socket.emit('leave room', {room, name});
    }
  }

  const sendMessage = () => {
    setMessages([...messages, {message: `You: ${message}`, isOwnMessage:true}]);
    socket.emit('send message', {message, room, name});
    setMessage('');
  }

  return (
    <div className='container'>
      <div id="messages">
        {messages.map((item, index) => (
          <>
            <p id="message" style={{backgroundColor: item.isOwnMessage ? "lightblue" : "azure"}} key={index}>{item.message}</p>
            <br />
          </>
        ))}
      </div>
      {!userConnected && (
      <div>
        <input onChange={(e) => {setName(e.target.value)}} id="input" placeholder='write your name' value={name} required/>
        <input onChange={(e) => {setRoom(e.target.value)}} id="input" placeholder='join room' value={room} required/>
        <button type="submit" onClick={joinRoom} id="button">Join</button>
      </div>
      )}
      <textarea onChange={(e) => {setMessage(e.target.value)}} id="messageInput" placeholder='Write a message...' value={message} required/>
      <button onClick={sendMessage} id="button">Send</button>
      {userConnected && 
      <button onClick={leaveRoom}>Disconnect!</button>
      }
    </div>
  )
}

export default App
