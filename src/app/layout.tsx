import {ClerkProvider,SignInButton,SignedIn,SignedOut,UserButton } from '@clerk/nextjs'
import './globals.css'
import Providers from '@/components/Providers';
import {Toaster} from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <Providers>
      <html lang="en">
        <body>
          {/* <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn> */}
          {children}
          <Toaster/>
        </body>
      </html>
      </Providers>
    </ClerkProvider>
  )
}
