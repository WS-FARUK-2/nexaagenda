export const metadata = {
  title: "NexaAgenda",
  description: "Sistema de Agendamento SaaS",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}