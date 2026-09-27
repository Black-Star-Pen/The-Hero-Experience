import { randomBytes } from "node:crypto";
import {
  addDays,
  countDays,
  DEMO_CREDENTIALS,
  todayIso,
  type ServiceSlug,
} from "@hero-experience/shared";
import { eq, inArray } from "drizzle-orm";
import type { Database } from "../../db/client.ts";
import type { Logger } from "../../lib/logger.ts";
import { hashPassword } from "../../lib/password.ts";
import { bookings, type NewBookingRow } from "../bookings/bookings.schema.ts";
import { heroes } from "../heroes/heroes.schema.ts";
import { reviews } from "../reviews/reviews.schema.ts";
import { users } from "../users/users.schema.ts";

/** Public demo account, documented in the README and on the sign-in page. */
export const DEMO_ACCOUNT = {
  ...DEMO_CREDENTIALS,
  firstName: "Le Prince",
  lastName: "Watson",
} as const;

const DEMO_ADDRESS = {
  address: "20 Ingram Street",
  postalCode: "75011",
  city: "Paris",
  phone: "01 23 45 67 89",
};

/** Fictional customers who left the demo reviews. */
const REVIEWERS = [
  ["Lois", "Lane"],
  ["Alfred", "Pennyworth"],
  ["Pepper", "Potts"],
  ["Jane", "Foster"],
  ["Steve", "Trevor"],
  ["May", "Parker"],
  ["Jimmy", "Olsen"],
  ["Betty", "Ross"],
] as const;

/** [hero id, service, rating, comment] */
const REVIEWS: [number, ServiceSlug, number, string][] = [
  [
    332,
    "demenagement",
    5,
    "Hulk a monté mon canapé au 6e étage sans ascenseur. Il a juste un peu cabossé la rampe.",
  ],
  [
    332,
    "demenagement",
    4,
    "Déménagement ultra rapide ! Petit bémol : surtout ne pas le contrarier quand un carton tombe.",
  ],
  [
    620,
    "sport",
    5,
    "Mon fils a adoré son cours de parkour. Il veut maintenant grimper sur tous les murs de la maison.",
  ],
  [
    620,
    "aide-aux-devoirs",
    5,
    "Un prof de sciences patient et passionné. Les maths n'ont jamais été aussi drôles.",
  ],
  [
    620,
    "spectacle",
    4,
    "Superbes photos de mariage, même si certains clichés ont été pris la tête en bas.",
  ],
  [
    644,
    "demenagement",
    5,
    "Il a déplacé la maison entière de deux mètres pour qu'elle soit mieux exposée au soleil.",
  ],
  [
    644,
    "enquetes",
    4,
    "Enquête bouclée en une après-midi. Très discret, sauf quand il enlève ses lunettes.",
  ],
  [
    70,
    "aide-aux-devoirs",
    5,
    "Il a aidé ma fille pour son exposé de chimie, puis installé une alarme dans toute la maison.",
  ],
  [
    70,
    "aide-aux-devoirs",
    4,
    "Très pédagogue, mais il ne travaille que le soir. Et toujours habillé en noir.",
  ],
  [
    720,
    "sport",
    5,
    "Un entraînement intense et bienveillant. J'ai perdu 3 kilos et gagné une confiance en moi énorme.",
  ],
  [
    720,
    "evenements",
    5,
    "Animation d'anniversaire parfaite, les enfants ont adoré le lancer de bouclier.",
  ],
  [
    346,
    "travaux",
    5,
    "Toute l'électricité refaite, plus une IA qui répond à nos blagues. La maison parle maintenant.",
  ],
  [
    346,
    "travaux",
    3,
    "Travail impeccable, mais il a laissé son logo partout, même dans la salle de bain.",
  ],
  [
    659,
    "demenagement",
    4,
    "Le marteau est très pratique pour les cartons lourds. Prévoir un paratonnerre.",
  ],
  [
    659,
    "evenements",
    5,
    "Thor a animé notre banquet médiéval. Il a bu tout l'hydromel, mais quelle ambiance !",
  ],
  [
    107,
    "sport",
    5,
    "Les meilleurs cours d'autodéfense de ma vie. Je ne regarde plus les ruelles sombres pareil.",
  ],
  [
    107,
    "enquetes",
    5,
    "Filature menée avec un professionnalisme glaçant. Rapport rendu avant même que je le demande.",
  ],
  [
    226,
    "aide-aux-devoirs",
    4,
    "Excellent en biologie, mais ses exemples parlent souvent d'autres dimensions.",
  ],
  [
    226,
    "evenements",
    5,
    "Un tour de magie bluffant au mariage : les invités sont revenus… d'un autre continent.",
  ],
  [
    211,
    "musique",
    5,
    "Cours de chant génial, et les jeux de lumière disco sont inclus !",
  ],
  [
    211,
    "evenements",
    5,
    "Dazzler a transformé notre fête d'entreprise en concert. Tout le monde en parle encore.",
  ],
  [
    213,
    "sport",
    3,
    "Coach efficace mais bavard. Et il s'adresse sans arrêt à une caméra invisible.",
  ],
  [
    213,
    "evenements",
    4,
    "Animation hilarante. Évitez juste de lui confier la découpe du gâteau.",
  ],
  [
    149,
    "sport",
    5,
    "Un coach motivant, ponctuel et poli. Il a même aidé ma grand-mère à traverser.",
  ],
  [
    303,
    "demenagement",
    4,
    "Il a porté tous les meubles. Il ne dit qu'une seule phrase, mais on se comprend.",
  ],
  [
    303,
    "travaux",
    5,
    "Parfait pour le jardinage : nos arbres n'ont jamais été aussi beaux.",
  ],
  [
    638,
    "evenements",
    4,
    "Elle a chassé les nuages pile pour notre mariage en plein air. Magique.",
  ],
  [
    717,
    "sport",
    4,
    "Coach bourru mais redoutablement efficace. Ne jamais lui parler avant son café.",
  ],
  [
    370,
    "aide-aux-devoirs",
    2,
    "Très intelligent, mais ses méthodes pédagogiques sont… discutables. Mon fils rit tout le temps.",
  ],
];

/** Upcoming bookings of the reviewers, so that some heroes are busy. [hero id, days from today, length] */
const BUSY_HEROES: [number, number, number][] = [
  [620, 0, 3],
  [644, 2, 4],
  [70, 0, 1],
  [332, 5, 2],
  [107, 1, 5],
  [226, 0, 2],
];

type HeroInfo = { id: number; dailyRate: number; services: ServiceSlug[] };

const booking = (
  userId: number,
  hero: HeroInfo,
  service: ServiceSlug,
  startDate: string,
  days: number,
): NewBookingRow => {
  const endDate = addDays(startDate, days - 1);
  return {
    userId,
    heroId: hero.id,
    service: hero.services.includes(service) ? service : hero.services[0]!,
    startDate,
    endDate,
    dailyRate: hero.dailyRate,
    totalPrice: countDays(startDate, endDate) * hero.dailyRate,
    ...DEMO_ADDRESS,
  };
};

/** The fictional reviewers are recreated with the demo data: the first one dates it. */
const reviewerEmail = (index: number) =>
  `client${index + 1}@hero-experience.test`;

/** Day (Europe/Paris) when the demo data was last created, null if never. */
async function demoDataDay(db: Database): Promise<string | null> {
  const [marker] = await db
    .select({ createdAt: users.createdAt })
    .from(users)
    .where(eq(users.email, reviewerEmail(0)));
  return marker ? todayIso(marker.createdAt) : null;
}

/** False when the name of the demo account differs from DEMO_ACCOUNT (renamed in a new version). */
async function demoNameIsCurrent(db: Database): Promise<boolean> {
  const [demo] = await db
    .select({ firstName: users.firstName, lastName: users.lastName })
    .from(users)
    .where(eq(users.email, DEMO_ACCOUNT.email));
  return (
    demo?.firstName === DEMO_ACCOUNT.firstName &&
    demo.lastName === DEMO_ACCOUNT.lastName
  );
}

/**
 * Fills the database with a demo account, fictional customers, bookings and
 * reviews, so that the app looks alive on the first visit.
 *
 * The demo account is public: once a day, its bookings and reviews are
 * recreated, its profile and password restored, and the other demo data
 * recreated with dates relative to the new day. The account itself is kept,
 * so that visitors who are signed in stay signed in.
 * Does nothing if the data is from today (and the demo account still has its
 * name) or if the catalogue is empty.
 */
export async function seedDemoData({
  db,
  logger,
  now = new Date(),
}: {
  db: Database;
  logger: Logger;
  now?: Date;
}): Promise<void> {
  const today = todayIso(now);
  const createdOn = await demoDataDay(db);
  if (
    createdOn !== null &&
    createdOn >= today &&
    (await demoNameIsCurrent(db))
  ) {
    return;
  }

  const heroIds = [
    ...new Set([
      ...REVIEWS.map(([id]) => id),
      ...BUSY_HEROES.map(([id]) => id),
      720,
    ]),
  ];
  const heroRows = await db
    .select({
      id: heroes.id,
      dailyRate: heroes.dailyRate,
      services: heroes.services,
    })
    .from(heroes)
    .where(inArray(heroes.id, heroIds));
  if (heroRows.length === 0) {
    logger.warn("Demo data skipped: the hero catalogue is empty");
    return;
  }
  const heroById = new Map(heroRows.map((hero) => [hero.id, hero]));
  const demoProfile = {
    passwordHash: await hashPassword(DEMO_ACCOUNT.password),
    firstName: DEMO_ACCOUNT.firstName,
    lastName: DEMO_ACCOUNT.lastName,
    ...DEMO_ADDRESS,
  };

  const refreshed = await db.transaction(async (tx) => {
    // Undo what visitors did with the demo account (the reviewers' data
    // goes away with them, through the cascading foreign keys)
    await tx.delete(users).where(
      inArray(
        users.email,
        REVIEWERS.map((_, index) => reviewerEmail(index)),
      ),
    );
    const [existing] = await tx
      .update(users)
      .set({ ...demoProfile, updatedAt: now })
      .where(eq(users.email, DEMO_ACCOUNT.email))
      .returning({ id: users.id });
    if (existing) {
      await tx.delete(bookings).where(eq(bookings.userId, existing.id));
      await tx.delete(reviews).where(eq(reviews.userId, existing.id));
    }
    const [demo] = existing
      ? [existing]
      : await tx
          .insert(users)
          .values({ email: DEMO_ACCOUNT.email, ...demoProfile })
          .returning({ id: users.id });

    const reviewers = await tx
      .insert(users)
      .values(
        await Promise.all(
          REVIEWERS.map(async ([firstName, lastName], index) => ({
            email: reviewerEmail(index),
            // Nobody can sign in with these fictional accounts
            passwordHash: await hashPassword(randomBytes(32).toString("hex")),
            firstName,
            lastName,
            createdAt: now,
          })),
        ),
      )
      .returning({ id: users.id });

    // Past bookings and the reviews that followed them
    for (const [
      index,
      [heroId, service, rating, comment],
    ] of REVIEWS.entries()) {
      const hero = heroById.get(heroId);
      const reviewer = reviewers[index % reviewers.length];
      if (!hero || !reviewer) continue;
      const startDate = addDays(today, -(10 + index * 3));
      await tx
        .insert(bookings)
        .values(booking(reviewer.id, hero, service, startDate, 1));
      await tx
        .insert(reviews)
        .values({
          heroId,
          userId: reviewer.id,
          rating,
          comment,
          createdAt: new Date(`${addDays(startDate, 1)}T18:00:00Z`),
          updatedAt: new Date(`${addDays(startDate, 1)}T18:00:00Z`),
        })
        .onConflictDoNothing();
    }

    for (const [index, [heroId, fromToday, days]] of BUSY_HEROES.entries()) {
      const hero = heroById.get(heroId);
      const reviewer = reviewers[index % reviewers.length];
      if (!hero || !reviewer) continue;
      await tx
        .insert(bookings)
        .values(
          booking(
            reviewer.id,
            hero,
            hero.services[0]!,
            addDays(today, fromToday),
            days,
          ),
        );
    }

    // The demo customer's history: done, upcoming and cancelled bookings
    const hulk = heroById.get(332);
    const wonderWoman = heroById.get(720);
    const superman = heroById.get(644);
    if (demo && hulk && wonderWoman && superman) {
      await tx.insert(bookings).values([
        booking(demo.id, hulk, "demenagement", addDays(today, -40), 2),
        booking(demo.id, wonderWoman, "sport", addDays(today, 12), 1),
        {
          ...booking(demo.id, superman, "travaux", addDays(today, 30), 3),
          status: "cancelled",
          cancelledAt: now,
        },
      ]);
    }
    return existing !== undefined;
  });

  logger.info(
    { account: DEMO_ACCOUNT.email, reviews: REVIEWS.length },
    refreshed ? "Demo data refreshed" : "Demo data created",
  );
}
