import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 🔥 GLOBAL ERROR HANDLER (catches crashes before React)
window.onerror = function (message, source, lineno, colno, error) {
  document.body.innerHTML = `
    <div style="padding:20px;color:red;font-family:monospace;">
      <h2>Global Error</h2>
      <pre>${message}</pre>
    </div>
  `;
};

// 🔥 React Error Boundary
function ErrorFallback({ error }: { error: any }) {
  return (
    <div style={{ padding: 20, color: "red", fontFamily: "monospace" }}>
      <h2>App Crashed</h2>
      <pre>{String(error)}</pre>
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// 🚨 REMOVE OLD SERVICE WORKERS (VERY IMPORTANT)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

// 🚀 RENDER APP
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);