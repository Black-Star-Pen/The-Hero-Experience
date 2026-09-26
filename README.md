# The Hero Experience

> Déménagement, cours, événements, enquêtes : réservez les services d'un super-héros.

Application web de réservation de super-héros : un catalogue de 563 héros, des filtres par service,
prix et disponibilité, des fiches détaillées, des avis clients vérifiés et un compte client.
Le projet est **fictif** : aucune prestation ni aucun paiement réels.

![Page d'accueil](docs/screenshots/accueil.jpg)

| Catalogue                                    | Fiche héros                                              | Mobile                                                   |
| -------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| ![Catalogue](docs/screenshots/catalogue.jpg) | ![Fiche de Spider-Man](docs/screenshots/fiche-heros.jpg) | ![Fiche de Hulk sur mobile](docs/screenshots/mobile.jpg) |

## Fonctionnalités

- **Catalogue** : recherche (nom ou identité secrète), filtres par service, prix et date de
  disponibilité, tris (recommandés, mieux notés, prix, puissance), pagination. Les filtres vivent
  dans l'URL : une recherche se partage et le bouton « retour » fonctionne.
- **Fiche héros** : caractéristiques, super-pouvoirs, tarif journalier, périodes déjà réservées
  et avis clients.
- **Comptes** : inscription, connexion, profil, changement de mot de passe (API).
- **Réservations** : prix calculé par le serveur, pas de double réservation d'un héros,
  annulation tant que la prestation n'a pas commencé (API).
- **Avis vérifiés** : seuls les clients ayant réservé un héros peuvent le noter (API).
- **Accessibilité** : navigation au clavier, lien d'évitement, formulaires étiquetés, contrastes
  AA, respect de « réduire les animations ».

## Stack technique

|              |                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------- |
| **Front**    | React 19, TypeScript, Vite 8, React Router 8, TanStack Query, CSS Modules                      |
| **API**      | Node.js 24 (TypeScript exécuté nativement), Express 5, Zod, pino                               |
| **Données**  | PostgreSQL + Drizzle ORM ; PGlite (PostgreSQL embarqué) en développement et en test            |
| **Sécurité** | Argon2id, sessions en cookie `HttpOnly`, helmet (CSP), rate limiting, protection CSRF          |
| **Qualité**  | ESLint 10, Prettier, Vitest, Testing Library, MSW, Supertest, Husky, commitlint                |
| **Partagé**  | Package `@hero-experience/shared` : schémas Zod et types de l'API, communs au front et au back |

## Démarrage rapide

Prérequis : **Node.js 24** (voir `.nvmrc`). Rien d'autre : la base de données est embarquée.

```bash
npm install
npm run dev
```

- Front : <http://localhost:3000> (les appels `/api` sont relayés vers l'API)
- API : <http://localhost:3310/api/health>

Au premier lancement, l'API crée la base (`server/.data/`), importe les héros depuis la
[SuperHero API](https://github.com/akabab/superhero-api) et ajoute des données de démonstration.

**Compte de démo** : `demo@hero-experience.test` / `hero-demo-2026`

### Utiliser un vrai PostgreSQL

Copiez `server/.env.sample` en `server/.env` et renseignez `DATABASE_URL`
(par exemple `postgres://hero:hero@localhost:5432/hero_experience`). Toutes les variables sont
documentées dans ce fichier.

## Scripts

| Commande                          | Rôle                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Lance le front et l'API en mode développement                                                             |
| `npm run build`                   | Construit le front pour la production (`client/dist`)                                                     |
| `npm start`                       | Lance l'API ; avec `NODE_ENV=production`, elle sert aussi le front construit (`DATABASE_URL` obligatoire) |
| `npm test`                        | Lance tous les tests (API et front)                                                                       |
| `npm run lint` / `npm run format` | Vérifie le code / le formate                                                                              |
| `npm run typecheck`               | Vérifie les types de tous les workspaces                                                                  |
| `npm run db:generate`             | Génère une migration SQL à partir du schéma Drizzle                                                       |
| `npm run db:migrate`              | Applique les migrations                                                                                   |
| `npm run db:seed`                 | Réimporte le catalogue et ajoute les données de démo si besoin                                            |

## Architecture

```text
client/   Application React
  src/app/          Routes et mise en page (en-tête, pied de page)
  src/components/   Kit d'interface (boutons, champs, alertes…)
  src/features/     Code par fonctionnalité (héros, avis, réservations…)
  src/pages/        Pages, chargées à la demande
server/   API Express
  src/modules/      Une fonctionnalité par dossier : routes → contrôleur → service → repository
  src/db/           Client Drizzle (PostgreSQL ou PGlite) et migrations
  drizzle/          Migrations SQL générées
shared/   Contrats de l'API (schémas Zod, types) partagés par le client et le serveur
```

### API

| Méthode          | Route                                     | Description                                                                                        |
| ---------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `GET`            | `/api/heroes`                             | Catalogue : `search`, `service`, `minPrice`, `maxPrice`, `availableOn`, `sort`, `page`, `pageSize` |
| `GET`            | `/api/heroes/:id`                         | Fiche d'un héros                                                                                   |
| `GET`            | `/api/heroes/:id/availability`            | Périodes réservées (`from`, `to`)                                                                  |
| `GET`            | `/api/heroes/:id/reviews`                 | Avis et note moyenne                                                                               |
| `PUT` / `DELETE` | `/api/heroes/:id/reviews/mine`            | Donner, modifier ou retirer son avis                                                               |
| `POST`           | `/api/auth/register`, `/login`, `/logout` | Inscription, connexion, déconnexion                                                                |
| `GET`            | `/api/auth/session`                       | Utilisateur connecté (ou `null`)                                                                   |
| `PATCH`          | `/api/me`                                 | Modifier son profil                                                                                |
| `PUT`            | `/api/me/password`                        | Changer de mot de passe                                                                            |
| `GET` / `POST`   | `/api/bookings`                           | Mes réservations / réserver                                                                        |
| `POST`           | `/api/bookings/:id/cancel`                | Annuler une réservation                                                                            |
| `GET`            | `/api/health`                             | État de l'API et de la base                                                                        |

Les erreurs ont toujours la forme `{ "error": { "code", "message", "details"? } }`.

## Historique et crédits

The Hero Experience est né en 2024 : c'est le projet d'examen de l'équipe « Les 4 Fantastiques »
(formation développeur web de la Wild Code School, Paris), construit sur le template Harmonia.
Cette version en est une refonte complète (architecture, API, sécurité, interface). Le premier
commit du dépôt contient la version d'origine, sans les données personnelles de l'équipe.

- Données et images des héros : [SuperHero API](https://github.com/akabab/superhero-api) (akabab).
  Les personnages appartiennent à leurs éditeurs respectifs.
- Licence : [MIT](LICENSE.md).
