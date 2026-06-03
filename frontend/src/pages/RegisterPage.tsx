// src/pages/RegisterPage.tsx
import { AuthTemplate } from '../components/templates/AuthTemplate';
import { RegisterForm } from '../components/organisms/RegisterForm';

const RegisterPage = () => {
  return (
    <AuthTemplate>
      <RegisterForm />
    </AuthTemplate>
  );
};

export default RegisterPage;