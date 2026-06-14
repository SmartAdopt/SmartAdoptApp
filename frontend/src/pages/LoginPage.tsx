// src/pages/LoginPage.tsx

import { AuthTemplate } from "../components/templates/AuthTemplate";
import { LoginForm } from "../components/organisms/LoginForm";

export const LoginPage = () => {
  return (
    <AuthTemplate>
      <LoginForm />
    </AuthTemplate>
  );
};
