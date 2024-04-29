import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import PropTypes from "prop-types"
import "./Paypal.css";

function Paypal({ visibleButtonPaypal, handleSubmit }) {
  return (
    <div className="container-button">
      <form>
        {/* Vos champs de formulaire ici */}
        <button type="button" id="valider" onClick={handleSubmit}>
          Valider la commande
        </button>
        {visibleButtonPaypal && (
          <PayPalScriptProvider options={{ clientId: "test" }}>
            <PayPalButtons
              className="paypal"
              style={{ layout: "horizontal", color: "blue", height: 55 }}
            />
          </PayPalScriptProvider>
        )}
      </form>
    </div>
  );
}
Paypal.propTypes = {
  visibleButtonPaypal: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired
}
export default Paypal;
