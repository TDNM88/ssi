import type React from "react"
import Head from "next/head"
import Header from "../Header"
import Footer from "../Footer"

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export default function Layout({ children, title = "London SSI" }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="London SSI Trading Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  )
}
