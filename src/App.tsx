import React from "react";

// 🔥 Force error popup (mobile pe bhi dikhega)
window.onerror = function (msg, url, line, col, error) {
  alert("ERROR: " + msg);
};

const App = () => {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "black" }}>PURE WORKING ✅</h1>
    </div>
  );
};

export default App;