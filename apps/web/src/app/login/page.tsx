import LoginForm from "@/features/auth/components/LoginForm";
import AuthLayout from "@/components/layout/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
