// src/components/LoadingScreen.jsx
import React from 'react';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.loader}></div>
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loader: {
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #3498db',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
  },
  message: {
    marginTop: '20px',
    color: '#fff',
    fontSize: '18px',
  },
};

export default LoadingScreen;
