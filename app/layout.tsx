import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NexaAgenda",
  description: "Sistema de Agendamento SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
