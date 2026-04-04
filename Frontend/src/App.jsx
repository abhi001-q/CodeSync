import React, { useRef, useMemo, useState, useEffect } from "react";
import "./index.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);

  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const [users, setUsers] = useState([]);

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editor) => {
    editorRef.current = editor;
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const name = e.target.username.value;
    setUsername(name);
    window.history.pushState({}, "", "?username=" + name);
  };

  useEffect(() => {
    if (!username || !editorRef.current) return;

    const provider = new SocketIOProvider(
      "http://localhost:3000", 
      "monaco",
      ydoc
    );

    provider.awareness.setLocalStateField("user", { username });

    
    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().values());

      const activeUsers = states
        .map((state) => state.user)
        .filter((user) => user?.username);

      setUsers(activeUsers);
    });

    
    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness
    );

    return () => {
      provider.disconnect();
    };
  }, [username, ydoc, yText]);

  
  if (!username) {
    return (
      <main className="flex h-screen w-full bg-gray-900 items-center justify-center">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            name="username" 
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
          >
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full bg-gray-900 gap-4 p-4">
      {/* Sidebar */}
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg p-4">
        <h2 className="font-bold mb-2">Users</h2>
        {users.map((user, index) => (
          <p key={index}>{user.username}</p>
        ))}
      </aside>

      {/* Editor */}
      <section className="h-full flex-1 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start coding..."
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>
    </main>
  );
}

export default App;