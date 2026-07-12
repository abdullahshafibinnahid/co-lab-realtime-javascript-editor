// client/src/App.jsx
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import Editor from '@monaco-editor/react';

const SOCKET_SERVER_URL = "http://localhost:5000";

function App() {
  const [code, setCode] = useState(`// JavaScript \nconsole.log("Hello World!");`);
  const [output, setOutput] = useState(""); // saving
  const [isRunning, setIsRunning] = useState(false);
  const socketRef = useRef(null);
  const roomId = "room-123";

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit('join-room', { roomId });
    socketRef.current.on('code-update', (updatedCode) => setCode(updatedCode));
    return () => { socketRef.current.disconnect(); };
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
    socketRef.current.emit('code-change', { roomId, code: value });
  };

  // backend running func
  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running...");
    try {
      const response = await fetch(`${SOCKET_SERVER_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      setOutput(data.output || "none output!!");
    } catch (err) {
      setOutput("sever is broken :(");
    }
    setIsRunning(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1e1e1e', color: '#fff', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2>Co-Lab: Real-Time Code Editor</h2>
        <button 
          onClick={runCode} 
          disabled={isRunning}
          style={{ padding: '10px 25px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isRunning ? "Running..." : "▶ Run Code"}
        </button>
      </div>

      <Editor
        height="55vh"
        theme="vs-dark"
        defaultLanguage="javascript"
        value={code}
        onChange={handleEditorChange}
        options={{ fontSize: 16, minimap: { enabled: false } }} 
      />

      <div style={{ marginTop: '15px' }}>
        <h4>Output:</h4>
        <pre style={{ backgroundColor: '#000', padding: '15px', borderRadius: '5px', color: '#0f0', minHeight: '80px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '14px' }}>
          {output}
        </pre>
      </div>
    </div>
  );
}
export default App;