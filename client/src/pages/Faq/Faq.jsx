import { MdArrowDropDown } from "react-icons/md";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Faq.css";

const questions = [
  {
    question: "Quels types de services proposons-nous ?",
    answer:
      "Nous proposons une gamme variée de services, allant des déménagements aux animations d'événements en passant par les cours de sport et bien d'autres encore. Consultez notre catalogue pour découvrir toutes nos offres.",
  },
  {
    question: "Comment fonctionne la location d'un super-héros ?",
    answer:
      "C'est simple ! Vous parcourez notre catalogue en ligne, choisissez le super-héros et le service désiré, sélectionnez la date qui vous convient, puis procédez au paiement sécurisé. Votre super-héros sera alors prêt à intervenir selon vos besoins.",
  },
  {
    question: "Quels super-héros sont disponibles à la location ?",
    answer:
      "Nous avons une équipe diversifiée de super-héros prêts à répondre à vos demandes. De la force surhumaine à la maîtrise des éléments, en passant par la vitesse fulgurante et la télépathie, nos héros ont une large variété de compétences à votre service.",
  },
  {
    question:
      "Comment garantissez-vous la sécurité de vos clients lors des interventions ?",
    answer:
      "La sécurité de nos clients est notre priorité absolue. Tous nos super-héros sont formés pour effectuer leurs tâches de manière professionnelle et sécurisée. De plus, nous avons une assurance couvrant toutes les interventions.",
  },
  {
    question: "Puis-je demander un super-héros spécifique pour ma réservation ?",
    answer:
      "Absolument ! Vous pouvez spécifier le super-héros que vous préférez lors de votre réservation, sous réserve de sa disponibilité. Nous ferons de notre mieux pour répondre à votre demande.",
  },
  {
    question: "Quels sont les tarifs de location ?",
    answer:
      "Nos tarifs varient en fonction du service demandé, de la durée de l'intervention et du super-héros choisi. Vous trouverez des détails sur les tarifs spécifiques sur notre site web.",
  },
];

function Faq() {
  return (
    <>
      <Header />
      <div className="size">
        {questions.map(({ question, answer }) => (
          <details key={question} className="faq-item">
            <summary className="title">
              {question}
              <MdArrowDropDown className="faq-icon" aria-hidden="true" />
            </summary>
            <p className="faq-answer">{answer}</p>
          </details>
        ))}
      </div>
      <Footer />
    </>
  );
}

export default Faq;
