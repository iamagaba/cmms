import { SimpleAuthProvider } from '@/context/SimpleAuthContext'

export default function SimpleAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SimpleAuthProvider>{children}</SimpleAuthProvider>
}