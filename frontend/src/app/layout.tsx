import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Microalgae IoT - Carbon Capture & Recovery Platform",
  description: "Automated photobioreactor monitoring, biological kinetics modeling, and AI copilot for photosynthetic CO₂ sequestration.",
  keywords: ["microalgae", "carbon capture", "ESP32", "photobioreactor", "IoT", "Chlorella vulgaris", "climate tech"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-eco-950 text-eco-50 selection:bg-eco-500 selection:text-white antialiased">
        {children}
      </body>
    </html>
  );
}
