import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign in to Academic Progress Tracker - APT by Roots & Wings"
        description="Empowering schools and parents with actionable insights to help students reach their full potential."
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
