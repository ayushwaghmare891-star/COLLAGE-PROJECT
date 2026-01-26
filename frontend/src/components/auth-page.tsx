import { useState } from "react";
import { SignupPage } from "./sign-up-page";
import { Component as LoginPage } from "./ui/animated-characters-login-page";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="w-full min-h-screen transition-opacity duration-500">
      <div className={`transition-opacity duration-500 ${isLogin ? 'opacity-100' : 'opacity-100'}`}>
        {isLogin ? (
          <LoginPage onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupPage onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}
