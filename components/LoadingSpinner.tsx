export default function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px'
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `3px solid rgba(37, 99, 235, 0.2)`,
        borderTop: `3px solid #2563eb`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
