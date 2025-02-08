import { useState } from "react";
import Image from "next/image";

const Captcha = ({ onValidate }: { onValidate: (valid: boolean) => void }) => {
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaSrc, setCaptchaSrc] = useState("http://localhost:3001/captcha");
  const [message, setMessage] = useState("");

  const refreshCaptcha = () => {
    setCaptchaSrc(`http://localhost:3001/captcha?${Date.now()}`);
  };

  const handleValidation = async () => {
    const res = await fetch("http://localhost:3001/validate-captcha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captchaInput }),
    });

    const data = await res.json();
    if (data.success) {
      onValidate(true);
      setMessage("✅ CAPTCHA correto!");
    } else {
      onValidate(false);
      setMessage("❌ CAPTCHA inválido!");
    }
  };

  return (
    <div className="flex flex-col items-center">
          <Image src={captchaSrc} alt="CAPTCHA" className="border rounded-md mb-2" width={200} height={300}    />
      <button onClick={refreshCaptcha} className="text-blue-500 text-sm">Atualizar CAPTCHA</button>
      <input
        type="text"
        placeholder="Digite o código"
        value={captchaInput}
        onChange={(e) => setCaptchaInput(e.target.value)}
        className="border px-3 py-2 rounded-md mt-2"
      />
      <button onClick={handleValidation} className="bg-green-500 text-white px-4 py-2 mt-2 rounded-md">
        Validar CAPTCHA
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};

export default Captcha;
