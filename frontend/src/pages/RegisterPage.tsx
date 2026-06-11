// src/pages/RegisterPage.tsx
import { AuthTemplate } from "../components/templates/AuthTemplate";
import { RegisterForm } from "../components/organisms/RegisterForm";

export const RegisterPage = () => {
  return (
    <AuthTemplate>
      <RegisterForm />
    </AuthTemplate>
  );
};
