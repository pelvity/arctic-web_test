import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Toaster } from "sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ActionLogPanel } from "@/components/ActionLogPanel";
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini Snippet Vault",
  description: "A premium tool to store and search useful snippets, links, and commands.",
};

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();
  const t = await getTranslations("Index");

  return (
    <html lang={locale} className="dark">
      <body className={`${inter.variable} min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 flex flex-col`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                {t("title")}
              </h1>
              <LanguageSwitcher />
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
            {children}
          </main>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              className: "bg-zinc-900 border-white/10 text-white",
              duration: 4000,
            }}
          />
          <ActionLogPanel />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
