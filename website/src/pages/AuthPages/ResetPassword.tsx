import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <>
      <PageMeta
        title="Reset Password - Academic Progress Tracker - APT by Roots & Wings"
        description="Reset your password for Academic Progress Tracker - APT by Roots & Wings"
      />
      <AuthLayout>
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
