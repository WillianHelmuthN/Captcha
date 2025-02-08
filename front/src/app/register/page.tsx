"use client";

import { useState } from "react";
import { registerUser } from "../../utils/api";
import Input from "../../components/Input";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await registerUser(email, password);

    if (response.error) {
      setMessage(response.error);
    } else {
      setMessage("Usuário criado! Redirecionando...");
      setTimeout(() => ("/"), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Registrar</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-blue-500 text-white p-2 rounded-md">Registrar</button>
        </form>
        {message && <p className="mt-3 text-red-500">{message}</p>}
      </div>
    </div>
  );
};

export default Register;
