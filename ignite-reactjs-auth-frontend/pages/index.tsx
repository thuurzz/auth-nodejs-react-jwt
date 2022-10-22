import type { NextPage } from "next";
import { FormEvent, useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { singIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const data = {
      email,
      password,
    };

    await singIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input
        type="email"
        name={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        name={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
};

export default Home;
