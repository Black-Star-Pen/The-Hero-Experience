import { useState } from "react";
import { useStatus } from "../../contexts/auth";
import "./UserProfil.css";

function UserProfil() {
  const [isOrder, setIsOrder] = useState(false);
  const [isDetails, setIsDetails] = useState(true);
  const { currentUser } = useStatus();

  return (
    <div className="user-profil">
      <section id="user-list">
        <ul>
          <li
            role="presentation"
            onClick={() => {
              setIsDetails(true);
              setIsOrder(false);
            }}
            onKeyDown={() => {
              setIsDetails(true);
              setIsOrder(false);
            }}
          >
            mes informations
          </li>
          <li
            role="presentation"
            onClick={() => {
              setIsDetails(false);
              setIsOrder(true);
            }}
            onKeyDown={() => {
              setIsDetails(false);
              setIsOrder(true);
            }}
          >
            mon historique de commandes
          </li>
        </ul>
      </section>
      <div className="information-sections">
        {isDetails && (
          <section id="details-container">
            <p>{currentUser.firstName}</p>
            <p>{currentUser.lastName}</p>
            <p>{currentUser.DDN}</p>
            <p>{currentUser.email}</p>
            <p>{currentUser.tel}</p>
            <p>{currentUser.address}</p>
          </section>
        )}
        {isOrder && (
          <section id="orders-container">
            {currentUser.orders.map((order) => (
              <p key={order.index}>{order}</p>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default UserProfil;
