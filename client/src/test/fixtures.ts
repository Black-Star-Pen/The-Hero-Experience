import type {
  HeroAvailability,
  HeroDetail,
  HeroReviews,
  HeroSummary,
} from "@hero-experience/shared";

const image = (size: string, file: string) =>
  `https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/${size}/${file}`;

export const spiderMan: HeroDetail = {
  id: 620,
  name: "Spider-Man",
  fullName: "Peter Parker",
  publisher: "Marvel Comics",
  imageUrl: image("md", "620-spider-man.jpg"),
  dailyRate: 130,
  services: ["sport", "aide-aux-devoirs", "travaux", "spectacle"],
  rating: { average: 4.5, count: 2 },
  nextAvailableDate: "2099-01-04",
  alignment: "good",
  gender: "Male",
  race: "Human",
  heightCm: 178,
  weightKg: 74,
  occupation: "Freelance photographer, teacher",
  base: "New York, New York",
  placeOfBirth: "New York, New York",
  firstAppearance: "Amazing Fantasy #15",
  powerstats: {
    intelligence: 90,
    strength: 55,
    speed: 67,
    durability: 75,
    power: 74,
    combat: 85,
  },
  images: {
    sm: image("sm", "620-spider-man.jpg"),
    md: image("md", "620-spider-man.jpg"),
    lg: image("lg", "620-spider-man.jpg"),
  },
};

export const hulk: HeroSummary = {
  id: 332,
  name: "Hulk",
  fullName: "Bruce Banner",
  publisher: "Marvel Comics",
  imageUrl: image("md", "332-hulk.jpg"),
  dailyRate: 200,
  services: ["demenagement", "sport"],
  rating: { average: null, count: 0 },
  nextAvailableDate: "2000-01-01",
};

export const spiderManAvailability: HeroAvailability = {
  from: "2099-01-01",
  to: "2099-03-31",
  bookedRanges: [
    { start: "2099-01-01", end: "2099-01-03" },
    { start: "2099-02-10", end: "2099-02-10" },
  ],
};

export const spiderManReviews: HeroReviews = {
  items: [
    {
      id: 1,
      rating: 5,
      comment: "Mon fils a adoré son cours de parkour.",
      author: "Pepper P.",
      createdAt: "2026-09-11T18:00:00.000Z",
      updatedAt: "2026-09-11T18:00:00.000Z",
    },
    {
      id: 2,
      rating: 4,
      comment: "Superbes photos de mariage.",
      author: "Steve T.",
      createdAt: "2026-09-05T18:00:00.000Z",
      updatedAt: "2026-09-05T18:00:00.000Z",
    },
  ],
  page: 1,
  pageSize: 5,
  total: 2,
  totalPages: 1,
  summary: { average: 4.5, count: 2 },
  mine: null,
  canReview: false,
};
