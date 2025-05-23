import React, { useState } from "react";
import LoginForm from "../components/LoginFrom.jsx";
import RegisterForm from "../components/RegisterFrom.jsx";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  // Handler to toggle views, passed as prop to forms
  const toggleAuth = () => setIsLogin((prev) => !prev);

  return (
    <div>
      {isLogin ? (
        <LoginForm onToggle={toggleAuth} />
      ) : (
        <RegisterForm onToggle={toggleAuth} />
      )}
    </div>
  );
}

export default AuthPage;
