import React, { useRef, useMemo, useState, useEffect } from "react";
import "./index.css";
import { Editor } from "@monaco-editor/react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const [editor, setEditor] = useState(null);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });

  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  const handleMount = (editorInstance) => {
    setEditor(editorInstance);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const name = e.target.username.value.trim();
    if (!name) return;
    setUsername(name);
    window.history.pushState({}, "", "?username=" + name);
  };

  useEffect(() => {
    // Both must be present to start the sync engine
    if (!username || !editor) return;

    // FIX: Added the 4th argument {} to prevent 'autoConnect' undefined error
    const provider = new SocketIOProvider(
      "http://localhost:3000",
      "monaco",
      ydoc,
      { autoConnect: true } 
    );

    provider.awareness.setLocalStateField("user", { username });

    const handleAwareness = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const activeUsers = states
        .map((state) => state.user)
        .filter((user) => user?.username);
      setUsers(activeUsers);
    };

    provider.awareness.on("change", handleAwareness);

    const binding = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );

    return () => {
      provider.awareness.off("change", handleAwareness);
      binding.destroy();
      provider.disconnect();
    };
  }, [username, editor, ydoc, yText]);

  if (!username) {
    return (
      <main className="flex h-screen w-full bg-gray-900 items-center justify-center">
        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            name="username"
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-amber-50"
            required
            autoComplete="off"
          />
          <button
            type="submit"
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold hover:bg-amber-100 transition-colors"
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
      <aside className="h-full w-1/4 bg-amber-50 rounded-lg p-4 flex flex-col">
        <h2 className="font-bold mb-4 text-gray-900 border-b border-gray-300 pb-2 text-xl">
          Collaborators ({users.length})
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2">
          {users.map((user, index) => (
            <div key={index} className="py-1 text-gray-800 flex items-center gap-2">
               <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
               <span className="font-medium">{user.username}</span>
               {user.username === username && <span className="text-xs text-gray-500">(You)</span>}
            </div>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <section className="h-full flex-1 bg-neutral-800 rounded-lg overflow-hidden border border-gray-700 shadow-2xl">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Start collaborating..."
          theme="vs-dark"
          onMount={handleMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on"
          }}
        />
      </section>
    </main>
  );
}

export default App;