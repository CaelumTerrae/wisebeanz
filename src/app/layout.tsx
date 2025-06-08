import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Function to get a random viewport position
function getRandomViewport() {
  // Image dimensions: 3840x2160
  const x = Math.floor(Math.random() * 3840 / 2); // 3840 - 400
  const y = Math.floor(Math.random() * 2160 / 2); // 2160 - 400
  return `-${x}px -${y}px`;
}

export const metadata: Metadata = {
  title: "Wisebeanz",
  description: "2 wise beans sharing bean sized wisdom",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const position = getRandomViewport();
  
  return (
    <html lang="en">
      <head>
        <style>{`
          .background-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
            overflow: hidden;
          }

          .background-image {
            width: 100%;
            height: 100%;
            background-image: url('/wisebeanz.png');
            background-position: ${position};
            background-size: 600%;
            background-repeat: no-repeat;
          }
        `}</style>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}>
        <div className="background-wrapper">
          <div className="background-image"></div>
        </div>
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </body>
    </html>
  );
}
