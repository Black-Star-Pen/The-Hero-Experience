import "./FirstPage.css";
import { Link } from "react-router-dom";
import { FaRegUser } from "react-icons/fa6";
import { useState } from "react";
import { useStatus } from "../../contexts/auth";
import ban from "../../assets/images/logos/banner.svg";
import logo from "../../assets/images/logos/logo-fond-0.png";


function FirstPage() {
  const { login, currentUser, setLogin } = useStatus();
  const [showlog, setShowlog] = useState(false);

  const handleShowlog = () => {
    setShowlog(!showlog);
  };
  return (
    <section className="background">
      <div className="content">
        <div className="button-header">
          {!login && (
            <Link to="/userpage">
              <button type="button" className="login">
                LOGIN
              </button>
            </Link>
          )}
          {login && (
            <>
              <img
                src={currentUser.image}
                alt="avatar"
                role="presentation"
                onClick={handleShowlog}
                onKeyDown={handleShowlog}
              />
              {showlog && (
                <>
                  <p
                    id="log-out"
                    role="presentation"
                    onClick={() => setLogin(false)}
                  >
                    se déconnecter
                  </p>
                  <Link to="/userpage">
                    <p id="log-in">mon compte</p>
                  </Link>
                </>
              )}
            </>
          )}
          {!login && (
            <Link to="/userpage">
              <button type="button" aria-label="button" className="button-user">
                <FaRegUser className="user" />
              </button>
            </Link>
          )}
        </div>
        <div className="logo-header">
          <img src={logo} className="logo-entry" alt="logo" />
        </div>
        <img src={ban} className="banner" alt="bannière" />
        <p className="text-entry">
          <span>RENDEZ VOTRE QUOTIDIEN EXTRAORDINAIRE !</span> <br />
          Déménagements sans stress, cours de sport dynamiques, animations
          d'anniversaires mémorables et bien plus encore...
          <br />
          Réservez dès aujourd'hui et vivez l'aventure avec nos super-héros à vos côtés!
        </p>
        <Link to="/accueil">
          <button type="button" className="button-entry">
            DISCOVER THE EXPERIENCE
          </button>
        </Link>
      </div>
    </section>
  );
}

export default FirstPage;
