// src/components/ErrorBoundary.jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#ffebee', color: '#b71c1c' }}>
          <h2>Component Error</h2>
          <p>Please check the console for details</p>
        </div>
      );
    }
    return this.props.children;
  }
}