import {
  SERVICES,
  todayIso,
  type HeroListQuery,
  type HeroSort,
} from "@hero-experience/shared";
import { FiSearch, FiX } from "react-icons/fi";
import { Button } from "../../../components/ui/Button.tsx";
import { SelectField, TextField } from "../../../components/ui/Field.tsx";
import { useUrlBackedInput } from "../../../lib/use-settled-value.ts";
import { ServiceIcon } from "../../services/ServiceIcon.tsx";
import { hasActiveFilters } from "../catalog-params.ts";
import styles from "./CatalogFilters.module.css";

const SORT_LABELS: Record<HeroSort, string> = {
  recommended: "Recommandés",
  rating: "Mieux notés",
  "price-asc": "Prix croissant",
  "price-desc": "Prix décroissant",
  name: "Nom (A → Z)",
  power: "Les plus puissants",
};

type FilterChanges = Partial<HeroListQuery>;

const toPrice = (value: string) =>
  value.trim() === "" || Number.isNaN(Number(value))
    ? undefined
    : Math.max(0, Math.round(Number(value)));

export function CatalogFilters({
  query,
  onChange,
  onReset,
}: {
  query: HeroListQuery;
  /** `replace` avoids one history entry per keystroke. */
  onChange: (changes: FilterChanges, options?: { replace?: boolean }) => void;
  onReset: () => void;
}) {
  // Text fields are edited locally, then pushed to the URL after a short pause
  const [search, setSearch] = useUrlBackedInput(
    query.search ?? "",
    350,
    (value) => {
      const search = value.trim();
      if (search !== (query.search ?? "")) {
        onChange({ search: search || undefined }, { replace: true });
      }
      return search;
    },
  );
  const priceInput = (key: "minPrice" | "maxPrice") => (value: string) => {
    const price = toPrice(value);
    if (price !== query[key]) onChange({ [key]: price }, { replace: true });
    return price?.toString() ?? "";
  };
  const [minPrice, setMinPrice] = useUrlBackedInput(
    query.minPrice?.toString() ?? "",
    500,
    priceInput("minPrice"),
  );
  const [maxPrice, setMaxPrice] = useUrlBackedInput(
    query.maxPrice?.toString() ?? "",
    500,
    priceInput("maxPrice"),
  );

  return (
    <section className={styles.filters} aria-label="Filtrer les héros">
      <div className={styles.search}>
        <FiSearch className={styles.searchIcon} aria-hidden="true" />
        <TextField
          label={<span className="visually-hidden">Rechercher un héros</span>}
          type="search"
          placeholder="Rechercher un héros (nom, identité secrète…)"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.services} role="group" aria-label="Services">
        <button
          type="button"
          className={styles.chip}
          aria-pressed={!query.service}
          onClick={() => onChange({ service: undefined })}
        >
          Tous les services
        </button>
        {SERVICES.map((service) => (
          <button
            key={service.slug}
            type="button"
            className={styles.chip}
            aria-pressed={query.service === service.slug}
            onClick={() =>
              onChange({
                service:
                  query.service === service.slug ? undefined : service.slug,
              })
            }
          >
            <ServiceIcon slug={service.slug} className={styles.chipIcon} />
            {service.label}
          </button>
        ))}
      </div>

      <div className={styles.row}>
        <TextField
          label="Prix min. (€/jour)"
          type="number"
          inputMode="numeric"
          min={0}
          step={10}
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
        />
        <TextField
          label="Prix max. (€/jour)"
          type="number"
          inputMode="numeric"
          min={0}
          step={10}
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
        />
        <TextField
          label="Disponible le"
          type="date"
          min={todayIso()}
          value={query.availableOn ?? ""}
          onChange={(event) =>
            onChange({ availableOn: event.target.value || undefined })
          }
        />
        <SelectField
          label="Trier par"
          value={query.sort}
          onChange={(event) =>
            onChange({ sort: event.target.value as HeroSort })
          }
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectField>
      </div>

      {hasActiveFilters(query) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className={styles.reset}
        >
          <FiX aria-hidden="true" /> Réinitialiser les filtres
        </Button>
      )}
    </section>
  );
}
