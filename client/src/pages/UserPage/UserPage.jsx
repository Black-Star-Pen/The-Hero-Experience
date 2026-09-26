import { useState } from "react";
import { useStatus } from "../../contexts/auth";
import UserProfil from "../../components/UserProfil/UserProfil";

// import des fichiers style et composants :
import Header from "../../components/Header/Header";
import "./UserPage.css";
import Footer from "../../components/Footer/Footer";

const avatar = (image) =>
  `https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/${image}`;

// Fictional demo accounts, until the real authentication replaces them.
const users = [
  {
    id: 1,
    firstName: "Peter",
    lastName: "Parker",
    email: "peter.parker@hero-experience.test",
    password: "demo",
    image: avatar("620-spider-man.jpg"),
    DDN: "10/08/2001",
    address: "20 Ingram Street, Queens, New York",
    tel: "01 23 45 67 89",
    orders: [
      "Commande effectuée le 01 Janv 2024, prestataire: Hulk, occasion : déménagement, prix : 200€ - statut : validée",
      "Commande effectuée le 02 Mars 2024, prestataire: Doctor Strange, occasion: évènement, prix : 94€ - statut : validée",
    ],
  },
  {
    id: 2,
    firstName: "Diana",
    lastName: "Prince",
    email: "diana.prince@hero-experience.test",
    password: "demo",
    image: avatar("720-wonder-woman.jpg"),
    DDN: "22/03/1941",
    address: "1 Paradise Island, Themyscira",
    tel: "01 98 76 54 32",
    orders: [
      "Commande effectuée le 01 Janv 2024, prestataire: Spiderman, occasion : évènement, prix : 130€ - statut : validée",
    ],
  },
];

function UserPage() {
  const { login, setLogin, currentUser, setCurrentUser } = useStatus();

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [notUser, setNotUser] = useState(false);

  const clickSubmit = (event) => {
    event.preventDefault();
    const user = users.find(
      (candidate) =>
        candidate.email === emailInput && candidate.password === passwordInput,
    );
    if (user) {
      setLogin(true);
      setCurrentUser(user);
      setNotUser(false);
    } else {
      setEmailInput("");
      setPasswordInput("");
      setNotUser(true);
    }
  };

  return (
    <>
      <Header users={users} currentUser={currentUser} />
      <div className="card-user-container">
        {!login && (
          <form>
            <section id="email-container">
              <label htmlFor="email">Email</label>
              <input
                value={emailInput}
                type="text"
                id="email"
                placeholder=" spiderman@example.com"
                onChange={(event) => setEmailInput(event.target.value)}
              />
            </section>
            <section id="password-container">
              <label htmlFor="password">Password</label>
              <input
                value={passwordInput}
                type="password"
                id="password"
                placeholder="   *******"
                onChange={(event) => setPasswordInput(event.target.value)}
              />
            </section>
            {notUser && <p id="error-log">**utilisateur non reconnu**</p>}
            <button type="submit" onClick={clickSubmit}>
              LOG IN
            </button>
          </form>
        )}
      </div>
      {login && (
        <>
          <h1 id="welcome-message">Bienvenue sur votre compte !</h1>
          <UserProfil />
        </>
      )}
      <Footer />
    </>
  );
}

export default UserPage;
