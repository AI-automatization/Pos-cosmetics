import { redirect } from 'next/navigation';

// Middleware handles auth check — if we get here, user is logged in
export default function HomePage() {
  redirect('/dashboard');
}
