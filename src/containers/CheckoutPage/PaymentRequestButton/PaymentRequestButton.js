import React, { useEffect, useRef, useState } from 'react';

import { FormattedMessage } from '../../../util/reactIntl';

import css from './PaymentRequestButton.module.css';

/**
 * Wraps Stripe's Payment Request Button so the same component surfaces
 * Apple Pay (Safari macOS/iOS), Google Pay (Chrome / Android), and
 * Stripe Link — whichever the buyer's browser advertises. Stripe picks
 * which wallet renders; we just mount the button.
 *
 * The component is intentionally dumb: it knows how to render the
 * wallet button and how to forward the wallet's `paymentmethod` event
 * upward. Confirming the payment against Stripe + Sharetribe is the
 * caller's responsibility — same pattern Sharetribe's existing card
 * path already uses (the wallet just hands us a PaymentMethod id; we
 * pass it into `stripe.confirmCardPayment` exactly like the saved-card
 * flow does).
 *
 * @param {Object} props
 * @param {Object} props.stripe — Stripe.js instance from window.Stripe()
 * @param {number} props.amount — total amount in the smallest currency unit (cents/øre/etc.)
 * @param {string} props.currency — ISO currency code, lowercase (e.g. 'usd', 'eur', 'nok')
 * @param {string} props.country — Stripe-account country, two-letter (e.g. 'US', 'FI', 'NO')
 * @param {string} props.label — human-readable line item label shown in the wallet sheet
 * @param {string} props.onBehalfOf — connected Stripe account id of the seller.
 *        Sharetribe creates the PaymentIntent with `on_behalf_of` pointing at
 *        the seller, and Stripe requires this matching id on the
 *        client-side `paymentRequest` so the wallet sheet attributes the
 *        merchant to the seller rather than the platform. Caller must
 *        only render this component once the id is known.
 * @param {Function} props.onPaymentMethod — fires when the buyer authorises in the
 *        wallet. Receives `{ paymentMethod, complete }`. Call
 *        `complete('success')` or `complete('fail')` once Sharetribe's
 *        confirm-payment transition has resolved.
 */
const PaymentRequestButton = props => {
  const {
    stripe,
    amount,
    currency,
    country,
    label,
    onBehalfOf,
    onPaymentMethod,
  } = props;
  const mountRef = useRef(null);
  const paymentRequestRef = useRef(null);
  const onPaymentMethodRef = useRef(onPaymentMethod);
  const [canRender, setCanRender] = useState(false);

  // Keep the latest handler in a ref so the `paymentmethod` listener
  // (registered once on mount) always sees the up-to-date callback
  // without us having to tear down / re-mount the button.
  useEffect(() => {
    onPaymentMethodRef.current = onPaymentMethod;
  }, [onPaymentMethod]);

  useEffect(() => {
    if (
      !stripe ||
      !amount ||
      !currency ||
      !country ||
      !onBehalfOf ||
      paymentRequestRef.current
    ) {
      return undefined;
    }
    // Some Stripe.js test mocks omit the paymentRequest API; bail out
    // gracefully so the rest of the checkout still mounts.
    if (typeof stripe.paymentRequest !== 'function') {
      return undefined;
    }

    const paymentRequest = stripe.paymentRequest({
      country,
      currency: currency.toLowerCase(),
      total: { label, amount },
      requestPayerName: true,
      requestPayerEmail: true,
      // Must match the `on_behalf_of` account on the Sharetribe-created
      // PaymentIntent — otherwise the wallet sheet shows the platform
      // as merchant of record instead of the seller.
      onBehalfOf,
    });

    paymentRequest.canMakePayment().then(result => {
      if (!result) {
        return;
      }
      // result is { applePay, googlePay, link } — any truthy value means
      // at least one wallet is available, so we render the button.
      setCanRender(true);
      const elements = stripe.elements();
      const prButton = elements.create('paymentRequestButton', { paymentRequest });
      if (mountRef.current) {
        prButton.mount(mountRef.current);
      }
    });

    paymentRequest.on('paymentmethod', event => {
      const handler = onPaymentMethodRef.current;
      if (typeof handler !== 'function') {
        event.complete('fail');
        return;
      }
      handler({
        paymentMethod: event.paymentMethod,
        complete: event.complete,
        payerName: event.payerName,
        payerEmail: event.payerEmail,
      });
    });

    paymentRequestRef.current = paymentRequest;
    return undefined;
  }, [stripe, amount, currency, country, label, onBehalfOf]);

  if (!canRender) {
    return null;
  }

  return (
    <div className={css.root}>
      <div ref={mountRef} className={css.button} />
      <div className={css.divider}>
        <span className={css.dividerLabel}>
          <FormattedMessage id="PaymentRequestButton.orPayWithCard" />
        </span>
      </div>
    </div>
  );
};

export default PaymentRequestButton;
