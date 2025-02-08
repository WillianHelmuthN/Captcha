export const registerUser = async (email: string, password: string) => {
  const res = await fetch("http://localhost:3001/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
};

export const loginUser = async (email: string, password: string, ) => {
  const res = await fetch("http://localhost:3001/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
};
