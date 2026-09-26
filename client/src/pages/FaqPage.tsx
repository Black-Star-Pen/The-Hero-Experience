import { FiChevronDown } from "react-icons/fi";
import { ButtonLink } from "../components/ui/Button.tsx";
import { Container } from "../components/ui/Container.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import styles from "./FaqPage.module.css";

const QUESTIONS = [
  {
    question: "Quels types de services proposons-nous ?",
    answer:
      "Déménagement, sport, aide aux devoirs, travaux, événements, spectacle, enquêtes et cours de musique. Chaque héros propose les services qui correspondent à son métier et à ses super-pouvoirs.",
  },
  {
    question: "Comment fonctionne la location d'un super-héros ?",
    answer:
      "C'est simple ! Parcourez notre catalogue, choisissez le héros et le service désirés, sélectionnez vos dates puis confirmez la réservation depuis votre compte. Votre héros est alors bloqué pour vous.",
  },
  {
    question: "Quels sont les tarifs de location ?",
    answer:
      "Chaque héros a un tarif journalier, affiché sur sa fiche : il dépend de sa force et de sa résistance, avec un minimum de 30 € par jour. Le prix total (tarif × nombre de jours) est calculé avant la confirmation.",
  },
  {
    question:
      "Puis-je demander un super-héros spécifique pour ma réservation ?",
    answer:
      "Absolument : vous réservez directement le héros de votre choix. Sa fiche indique ses prochaines disponibilités et les périodes déjà réservées.",
  },
  {
    question: "Puis-je annuler une réservation ?",
    answer:
      "Oui, gratuitement, depuis votre espace client, tant que la prestation n'a pas commencé.",
  },
  {
    question: "Qui peut laisser un avis ?",
    answer:
      "Seuls les clients qui ont réservé un héros peuvent donner leur avis sur lui : tous les avis affichés sont vérifiés.",
  },
  {
    question:
      "Comment garantissez-vous la sécurité de vos clients lors des interventions ?",
    answer:
      "La sécurité de nos clients est notre priorité absolue. Tous nos super-héros sont formés pour effectuer leurs tâches de manière professionnelle et sécurisée, et une assurance couvre toutes les interventions.",
  },
  {
    question: "Les prestations et les paiements sont-ils réels ?",
    answer:
      "Non : The Hero Experience est un projet fictif réalisé à des fins pédagogiques. Aucun héros ne viendra (hélas) et aucun paiement n'est demandé.",
  },
];

export function FaqPage() {
  return (
    <>
      <title>Questions fréquentes · The Hero Experience</title>
      <PageHeader title="Questions fréquentes" eyebrow="FAQ">
        Tout ce qu'il faut savoir avant d'appeler un héros à la rescousse.
      </PageHeader>
      <Container size="narrow" className={styles.page}>
        <div className={styles.list}>
          {QUESTIONS.map(({ question, answer }) => (
            <details key={question} className={styles.item}>
              <summary className={styles.question}>
                {question}
                <FiChevronDown className={styles.icon} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{answer}</p>
            </details>
          ))}
        </div>
        <div className={styles.cta}>
          <p>Vous avez trouvé votre réponse ?</p>
          <ButtonLink to="/heros">Découvrir nos héros</ButtonLink>
        </div>
      </Container>
    </>
  );
}
