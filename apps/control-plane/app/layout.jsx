import "./globals.css";

export const metadata = {
  title: "Ineractive",
  description: "Ineractive control-plane workspace shell",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
