import { useState, useEffect } from "react";
import axios from "axios";
import "./PageHero.css";
import "./PageHeroResponsive.css";
import { useParams } from "react-router-dom";
import Header from "../../components/Header/Header";
import AvisClient from "../../components/Comment/AvisClient";
import Formulaire from "../../components/Formulaire/Formulaire";
import Footer from "../../components/Footer/Footer";

function PageHero() {
  const [superhero, setSuperhero] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(
        `https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/id/${id}.json`
      )
      .then((response) => {
        const fetchedSuperhero = response.data;
        const price =
          fetchedSuperhero.powerstats.durability +
          fetchedSuperhero.powerstats.strength;
        const updatedSuperhero = {
          ...fetchedSuperhero,
          pr: price,
        };

        setSuperhero(updatedSuperhero);
      })
      .catch((error) => {
        console.error("Erreur fetch", error);
      });
  }, [id]);

  const firstMaj = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  return (
    <>
      <div>
        <Header />
      </div>
      <div>
        {superhero && (
          <section className="profilHero">
            <img src={superhero.images.md} alt="avatarHero" />
            <div className="textHero">
              <h1 className="nameHero">{superhero.name}</h1>
              <p className="price">{superhero.pr}€/jour</p>
              <div className="parts">
                <div className="partLeft">
                  <p className="descriptions">
                    {" "}
                    <strong className="bioCategories">
                      Nom complet :
                    </strong>{" "}
                    {superhero.biography.fullName}
                  </p>
                  <p className="descriptions1">
                    {" "}
                    <strong className="bioCategories">Activité :</strong>{" "}
                    {superhero.work.occupation}{" "}
                  </p>
                  <p className="descriptions">
                    {" "}
                    <strong className="bioCategories">Genre :</strong>{" "}
                    {superhero.appearance.gender === "Female"
                      ? "Feminin"
                      : "Masculin"}{" "}
                  </p>
                  <p className="descriptions">
                    {" "}
                    <strong className="bioCategories">Taille :</strong>{" "}
                    {superhero.appearance.height[1]}{" "}
                  </p>
                  <p className="descriptions">
                    {" "}
                    <strong className="bioCategories">Poids :</strong>{" "}
                    {superhero.appearance.weight[1]}{" "}
                  </p>
                  <p className="descriptions">
                    {" "}
                    <strong className="bioCategories">
                      Fournisseur :
                    </strong>{" "}
                    {superhero.biography.publisher}
                  </p>
                </div>
                <div className="partRight">
                  <ul>
                    {Object.entries(superhero.powerstats).map(
                      ([key, value]) => (
                        <li key={key}>
                          <strong className="bioCategories">
                            {firstMaj(key)} :{" "}
                          </strong>{" "}
                          {value}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
      <div className="liner-top">
        <hr className="hr" />
      </div>
      <AvisClient />
      <div className="liner-down">
        {" "}
        <hr className="hr" />{" "}
      </div>
      <Formulaire />
      <Footer />
    </>
  );
}

export default PageHero;
