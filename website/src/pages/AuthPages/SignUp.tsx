import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Sign Up for Academic Progress Tracker - APT by Roots & Wings"
        description="Empowering schools and parents with actionable insights to help students reach their full potential."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
