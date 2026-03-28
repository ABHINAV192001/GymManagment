import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

import { Providers } from "./components/Providers";
import JoyfulBackground from "./components/JoyfulBackground";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <Providers>
          <JoyfulBackground />
          {children}
        </Providers>
      </body>
    </html>
  );
}
