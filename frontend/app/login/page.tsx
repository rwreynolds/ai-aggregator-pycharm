import { LoginForm } from '../../components/Auth';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata = {
  title: 'Login - AI Services Aggregator',
  description: 'Login to your account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            AI Services Aggregator
          </Link>
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}