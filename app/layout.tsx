import Header from "@/components/header";
import Footer from "@/components/footer";

import "./globals.css";
import "@/styles/base.css";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Oracle of Art</title>
      </head>
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
