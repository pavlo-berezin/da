import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import { diffChars } from 'diff'
import { w3cwebsocket as W3CWebSocket } from "websocket";
let client = new W3CWebSocket('ws://localhost:8080/')

function App() {
  const [inputState, setInputState] = useState('')
  const textArea = useRef();
  const [cursorPosition, setCursorPosition] = useState(0)
  const [websocket, setWebsocket] = useState(true);
  const [lastI, setLastI] = useState(-1);

  const onMessage = (message) => {
    const { state, lastI, position } = JSON.parse(message.data);

    setInputState(state);
    setLastI(lastI);
    position && setCursorPosition(position);
  };

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
  }, [])

  useEffect(() => {
    client.onmessage = websocket ? onMessage : () => { };
  }, [websocket])

  useEffect(() => {
    if (textArea.current) {
      textArea.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [inputState])

  const onKeyDown = (e) => {
    const { selectionStart } = e.target
    setCursorPosition(selectionStart);
  }

  const onInputChange = (ev) => {
    const { selectionStart } = ev.target

    setCursorPosition(selectionStart);
    setWebsocket(true);

    const diff = diffChars(inputState, ev.target.value);

    client.send(JSON.stringify({ diff, lastI }))
  }

  const onFocus = () => {
    if (textArea.current) {
      setCursorPosition(textArea.current.selectionStart);
    }
  }


  return (
    <div className="App">
      <textarea className="text-area" ref={textArea} value={inputState} onChange={onInputChange} onFocus={onFocus} onKeyDown={onKeyDown}></textarea>
      <div>
        <span>WebSocket</span>
        <div className="radio-group">
          <div>
            <input id="on" type="radio" onChange={() => setWebsocket(true)} value="true" checked={websocket}></input>
            <label htmlFor="on">On</label>
          </div>
          <div>
            <input id="off" type="radio" onChange={() => setWebsocket(false)} value="false" checked={!websocket}></input>
            <label htmlFor="off">Off</label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
