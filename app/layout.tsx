import {
  JetBrains_Mono,
  Manrope,
  Work_Sans,
  Inter,
  Poppins,
} from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className={`${inter.variable} ${fontMono.variable} antialiased`}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster richColors position="top-right" />
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
