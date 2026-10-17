import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CURA — Adaptive AI Assistant",
  description: "Adaptive AI Assistant for Care, Focus, and Everyday Assistance",
  icons: {
    icon: "/Cura Favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          background: "#ffffff",
          color: "#0F172A",
        }}
      >
        {children}
      </body>
    </html>
  );
}
