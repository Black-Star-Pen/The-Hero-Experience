import type { HeroListQuery } from "@hero-experience/shared";
import { useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { useSearchParams } from "react-router";
import { Alert } from "../components/ui/Alert.tsx";
import { Button } from "../components/ui/Button.tsx";
import { Container } from "../components/ui/Container.tsx";
import { EmptyState } from "../components/ui/EmptyState.tsx";
import { PageHeader } from "../components/ui/PageHeader.tsx";
import { Pagination } from "../components/ui/Pagination.tsx";
import { Loading } from "../components/ui/Spinner.tsx";
import { useHeroes } from "../features/heroes/api.ts";
import {
  readCatalogParams,
  toSearchParams,
} from "../features/heroes/catalog-params.ts";
import { CatalogFilters } from "../features/heroes/components/CatalogFilters.tsx";
import { HeroGrid } from "../features/heroes/components/HeroCard.tsx";
import { pluralize } from "../lib/format.ts";
import styles from "./CatalogPage.module.css";

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = readCatalogParams(searchParams);
  const heroes = useHeroes(query);
  const resultsRef = useRef<HTMLDivElement>(null);

  const update = (
    changes: Partial<HeroListQuery>,
    options?: { replace?: boolean },
  ) => {
    // Any new filter brings the visitor back to the first page
    setSearchParams(toSearchParams({ ...query, page: 1, ...changes }), options);
  };
  const goToPage = (page: number) => {
    update({ page });
    resultsRef.current?.scrollIntoView({ block: "start" });
  };

  return (
    <>
      <title>Nos héros · The Hero Experience</title>
      <PageHeader title="Nos héros" eyebrow="Catalogue">
        Déménageurs surpuissants, coachs imbattables, profs géniaux : trouvez le
        héros qu'il vous faut, au bon prix et à la bonne date.
      </PageHeader>

      <Container className={styles.page}>
        <CatalogFilters
          query={query}
          onChange={update}
          onReset={() => setSearchParams(toSearchParams({ sort: query.sort }))}
        />

        <div
          ref={resultsRef}
          className={styles.results}
          aria-busy={heroes.isFetching}
        >
          {heroes.isPending ? (
            <Loading label="Chargement des héros…" />
          ) : heroes.isError ? (
            <Alert tone="error" title="Impossible de charger les héros.">
              <p>{heroes.error.message}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void heroes.refetch()}
              >
                Réessayer
              </Button>
            </Alert>
          ) : heroes.data.total === 0 ? (
            <EmptyState
              icon={<FiSearch />}
              title="Aucun héros ne correspond"
              action={
                <Button
                  variant="secondary"
                  onClick={() =>
                    setSearchParams(toSearchParams({ sort: query.sort }))
                  }
                >
                  Voir tous les héros
                </Button>
              }
            >
              Même avec des super-pouvoirs, personne ne coche toutes ces cases.
              Essayez d'élargir votre recherche.
            </EmptyState>
          ) : (
            <>
              <p className={styles.count} aria-live="polite">
                {pluralize(heroes.data.total, "héros trouvé", "héros trouvés")}
              </p>
              <div
                className={heroes.isPlaceholderData ? styles.stale : undefined}
              >
                <HeroGrid heroes={heroes.data.items} />
              </div>
              <Pagination
                page={heroes.data.page}
                totalPages={heroes.data.totalPages}
                onChange={goToPage}
              />
            </>
          )}
        </div>
      </Container>
    </>
  );
}
