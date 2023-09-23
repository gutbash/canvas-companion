import 'styles/globals.css'
import { Inter, Work_Sans, Rubik } from 'next/font/google'

const workSans = Work_Sans({ subsets: ['latin'] })
const rubik = Rubik({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'chatbot-memory-hci',
  description: '',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
