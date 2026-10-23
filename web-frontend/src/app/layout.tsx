import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CURA — Adaptive Healthcare AI Assistant",
  description:
    "Real-time, multimodal cognitive healthcare companion with specialized sanctuaries for Alzheimer's care, ADHD focus, and general medical intelligence.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600;700&family=Lexend:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 9999px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.35);
          }
          /* Animations */
          @keyframes pulseGlow {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.08); opacity: 0.4; }
          }
          @keyframes soundwave {
            0%, 100% { height: 6px; }
            50% { height: 28px; }
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
