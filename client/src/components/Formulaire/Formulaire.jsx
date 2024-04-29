import { useState } from "react";
import Paypal from "../Paypal/Paypal";
import "./Formulaire.css";
import "./FormulaireResponsive.css";

function Formulaire() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [visibleButtonPaypal, setVisibleButtonPaypal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (
      nom === "" ||
      prenom === "" ||
      email === "" ||
      telephone === "" ||
      adresse === "" ||
      ville === "" ||
      codePostal === ""
    ) {
      setVisibleButtonPaypal(false);
      setErrorMessage(true);
    } else {
      setVisibleButtonPaypal(true);
    }
  };

  return (
    <div className="bigContainer">
      <h2 className="titleComment">Réserver ce super héro !</h2>
      <div className="container">
        <div className="container-data">
          <div className="usedata">
            <div className="labelLeft">
              <label htmlFor="nom">NOM:</label>
              <input
                type="text"
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </div>

            <div>
              <label className="prenom" htmlFor="prenom">
                PRENOM:
              </label>
              <input
                type="text"
                id="prenom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
              />
            </div>
          </div>

          <div className="usedata-2">
            <div className="labelLeft">
              <label htmlFor="email">EMAIL:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="telephone">TELEPHONE:</label>
              <input
                type="tel"
                id="telephone"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>
          </div>

          <div className="Home">
            <label htmlFor="adresse">ADRESSE:</label>
            <input
              type="adresse"
              id="adresse"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
            />
          </div>

          <div className="position">
            <div className="labelLeft">
              <label htmlFor="ville">VILLE:</label>
              <input
                type="text"
                id="ville"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="codePostal">CODE POSTAL:</label>
              <input
                type="text"
                id="codePostal"
                value={codePostal}
                onChange={(e) => setCodePostal(e.target.value)}
              />
            </div>
          </div>
          {errorMessage && (
          <p id="error-message">* Veuillez renseigner tous les champs svp *</p>
        )}
        </div>
        <Paypal
          visibleButtonPaypal={visibleButtonPaypal}
          handleSubmit={handleSubmit}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}

export default Formulaire;
