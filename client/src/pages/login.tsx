import { LoginForm } from '@/components/auth/login-form';

export const Login = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Login to Kabir Club</h1>
        <LoginForm />
      </div>
    </div>
  );
};