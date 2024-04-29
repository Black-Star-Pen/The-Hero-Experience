import PropTypes from "prop-types";
import "./Hero.css";
import { Link } from "react-router-dom";

function convertMonth(month) {
  if (month === 0) return "Janv.";
  if (month === 1) return "Fev.";
  if (month === 2) return "Mars";
  if (month === 3) return "Avril";
  if (month === 4) return "Mai";
  if (month === 5) return "Juin";
  if (month === 6) return "Juil.";
  if (month === 7) return "Août";
  if (month === 8) return "Sept.";
  if (month === 9) return "Oct.";
  if (month === 10) return "Nov.";
  if (month === 11) return "Dec.";
  return false;
}

function HeroCard({ hero }) {
  return (
    <div className="card">
      <div className="avatar">
        <Link to={`/pagehero/${hero.id}`}>
          <img src={hero.images.sm} alt="avatar" />
        </Link>
      </div>
      <article className="description-container">
      <section id="card-title">
        <h1>{hero.name}</h1>
      </section>
        <div className="description">
          <p>{hero.biography.fullName}</p>
          <p>
            Prochaine dispo : {hero.date.getDate()}{" "}
            {convertMonth(hero.date.getMonth())}
          </p>
          <p>Prix : {hero.price}€ par jour</p>
        </div>
      </article>
    </div>
  );
}

HeroCard.propTypes = {
  hero: PropTypes.shape({
    id: PropTypes.number.isRequired,
    images: PropTypes.shape({
      sm: PropTypes.string.isRequired
    }).isRequired,
    name: PropTypes.string.isRequired,
    biography: PropTypes.shape({
      fullName: PropTypes.string.isRequired
    }).isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    price: PropTypes.number.isRequired
  }).isRequired
};

export default HeroCard;
