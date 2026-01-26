import { SignIn, SignUp } from '@clerk/react';

export const ClerkAuthComponent = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-xl rounded-lg",
            }
          }}
          routing="path"
          path="/auth/signin"
          signUpUrl="/auth/signup"
        />
      </div>
    </div>
  );
};

export const ClerkSignUp = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <SignUp 
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "w-full shadow-xl rounded-lg",
          }
        }}
        routing="path"
        path="/auth/signup"
        signInUrl="/auth/signin"
      />
    </div>
  );
};
