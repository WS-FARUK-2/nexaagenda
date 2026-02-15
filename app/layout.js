export const metadata = {
  title: 'NexaAgenda',
  description: 'NexaAgenda Project',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Tailwind CSS for styling */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="antialiased bg-gray-950 text-white">
        {children}
      </body>
    </html>
  )
}