"use client";

import { useState } from "react";
import { loginUser } from "../utils/api";
import Input from "../components/Input";
import Captcha from "../components/Captcha";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaValid) {
      setMessage("⚠️ Resolva o CAPTCHA antes de continuar!");
      return;
    }

    const response = await loginUser(email, password);
    if (response.error) {
      setMessage(response.error);
    } else {
      setMessage("Login bem-sucedido!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-center text-4xl text-black font-bold mb-4">Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <Captcha onValidate={setCaptchaValid} />

          <button className="w-full bg-green-500 text-white p-2 rounded-md">Entrar</button>
        </form>
        {message && <p className="mt-3 text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default Login;