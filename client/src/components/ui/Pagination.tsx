import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { pageItems } from "../../lib/pagination.ts";
import styles from "./Pagination.module.css";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.arrow}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <FiChevronLeft aria-hidden="true" />
        <span className="visually-hidden">Page précédente</span>
      </button>
      <ol className={styles.pages}>
        {pageItems(page, totalPages).map((item) =>
          item.type === "gap" ? (
            <li
              key={`gap-${item.after}`}
              className={styles.gap}
              aria-hidden="true"
            >
              …
            </li>
          ) : (
            <li key={item.page}>
              <button
                type="button"
                className={styles.page}
                aria-current={item.page === page ? "page" : undefined}
                onClick={() => onChange(item.page)}
              >
                <span className="visually-hidden">Page </span>
                {item.page}
              </button>
            </li>
          ),
        )}
      </ol>
      <button
        type="button"
        className={styles.arrow}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        <FiChevronRight aria-hidden="true" />
        <span className="visually-hidden">Page suivante</span>
      </button>
    </nav>
  );
}
