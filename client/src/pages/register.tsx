import { RegisterForm } from '@/components/auth/register-form';

export const Register = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Join Kabir Club</h1>
        <RegisterForm />
      </div>
    </div>
  );
};