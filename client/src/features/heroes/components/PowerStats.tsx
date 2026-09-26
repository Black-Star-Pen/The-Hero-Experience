import type { Powerstats } from "@hero-experience/shared";
import styles from "./PowerStats.module.css";

const LABELS: Record<keyof Powerstats, string> = {
  intelligence: "Intelligence",
  strength: "Force",
  speed: "Vitesse",
  durability: "Résistance",
  power: "Pouvoirs",
  combat: "Combat",
};

export function PowerStats({ stats }: { stats: Powerstats }) {
  return (
    <dl className={styles.stats}>
      {(Object.keys(LABELS) as (keyof Powerstats)[]).map((key) => (
        <div key={key} className={styles.stat}>
          <dt>{LABELS[key]}</dt>
          <dd>
            <span className={styles.value}>
              {stats[key]}
              <span className="visually-hidden"> sur 100</span>
            </span>
            <span className={styles.track} aria-hidden="true">
              <span
                className={styles.bar}
                style={{ width: `${stats[key]}%` }}
              />
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
