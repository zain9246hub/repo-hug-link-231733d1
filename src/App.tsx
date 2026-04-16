import React from "react";

window.onerror = function (msg, url, line, col, error) {
  alert("ERROR: " + msg);
};

const App = () => {
  // 🔥 FORCE ERROR
  const x = undefinedVariable.test;

  return <h1>Should not reach</h1>;
};

export default App;