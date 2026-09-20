import "./globals.css";

export const metadata = {
  title: "Ineractive Workspace",
  description: "Ineractive session-only control-plane workspace shell",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
