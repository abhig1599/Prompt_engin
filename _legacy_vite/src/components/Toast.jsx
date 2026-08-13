// src/components/Toast.jsx
export default function Toast({ msg, show }) {
  return (
    <div className={`toast ${show ? 'show' : ''}`} role="status" aria-live="polite">
      {msg}
    </div>
  );
}
