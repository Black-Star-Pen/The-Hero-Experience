import { useState } from "react";
import { FiLogIn, FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi";
import { Link, NavLink, useLocation } from "react-router";
import logo from "../../assets/logo.png";
import { ButtonLink } from "../../components/ui/Button.tsx";
import { Container } from "../../components/ui/Container.tsx";
import { useLogout, useSession } from "../../features/auth/api.ts";
import { loginLink } from "../../features/auth/redirect.ts";
import styles from "./Header.module.css";

const NAVIGATION = [
  { to: "/heros", label: "Nos héros" },
  { to: "/#services", label: "Services" },
  { to: "/#comment-ca-marche", label: "Comment ça marche" },
  { to: "/faq", label: "FAQ" },
];

export function Logo() {
  return (
    <Link to="/" className={styles.brand}>
      <img src={logo} alt="" className={styles.logo} width={69} height={40} />
      <span className={styles.wordmark}>
        The <span className={styles.accent}>Hero</span> Experience
      </span>
    </Link>
  );
}

/** "Connexion" for visitors, the account and "Déconnexion" for customers. */
function AccountLinks() {
  const session = useSession();
  const logout = useLogout();
  const { pathname, search } = useLocation();

  if (session.isPending) return null;
  if (!session.data) {
    // Come back to the current page after signing in
    const onAuthPage = ["/connexion", "/inscription"].includes(pathname);
    return (
      <NavLink
        to={onAuthPage ? "/connexion" : loginLink(pathname + search)}
        className={styles.link}
      >
        <FiLogIn aria-hidden="true" />
        Connexion
      </NavLink>
    );
  }
  return (
    <div className={styles.account}>
      <NavLink to="/compte" className={styles.link}>
        <FiUser aria-hidden="true" />
        <span className={styles.firstName}>{session.data.firstName}</span>{" "}
        <span className="visually-hidden">(mon compte)</span>
      </NavLink>
      <button
        type="button"
        className={styles.link}
        title="Déconnexion"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        <FiLogOut aria-hidden="true" />
        <span className={styles.logoutLabel}>Déconnexion</span>
      </button>
    </div>
  );
}

export function Header() {
  const location = useLocation();
  // The mobile menu stays open on the page where it was opened only:
  // any navigation closes it
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === location.key;

  return (
    <header className={styles.header}>
      <Container className={styles.bar}>
        <Logo />
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpenOn(open ? null : location.key)}
        >
          {open ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
          <span className="visually-hidden">
            {open ? "Fermer le menu" : "Ouvrir le menu"}
          </span>
        </button>
        <nav
          id="main-navigation"
          className={styles.nav}
          data-open={open}
          aria-label="Navigation principale"
        >
          <ul className={styles.links}>
            {NAVIGATION.map((item) => (
              <li key={item.to}>
                {item.to.includes("#") ? (
                  // Sections of the home page: NavLink ignores the hash and
                  // would mark them all as the current page on the home page
                  <Link to={item.to} className={styles.link}>
                    {item.label}
                  </Link>
                ) : (
                  <NavLink to={item.to} className={styles.link} end>
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          <AccountLinks />
          <ButtonLink to="/heros" size="sm" className={styles.cta}>
            Réserver un héros
          </ButtonLink>
        </nav>
      </Container>
    </header>
  );
}
