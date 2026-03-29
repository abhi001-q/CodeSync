import React from "react";
import "./index.css";
import { Editor } from "@monaco-editor/react";
function App() {
  return (
    <div>
      <main className="h-screen w-full bg-gray-900 gap-4 p-4 ">
        <aside className="h-full w-1/4 bg-amber-50 rounded-lg"></aside>
        <section className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// some comment"
            theme="vs-dark"
          />
        </section>
      </main>
    </div>
  );
}

export default App;
