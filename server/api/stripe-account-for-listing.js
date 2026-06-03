const { getSdk, getIntegrationSdk, handleError, serialize } = require('../api-util/sdk');

/**
 * Returns the seller's Stripe Connect account id for a given listing.
 *
 * Used by the checkout page to initialise the Payment Request Button
 * (Apple Pay / Google Pay / Stripe Link) with `onBehalfOf`. The wallet
 * sheet's merchant attribution must match the `on_behalf_of` account
 * on the Sharetribe-created PaymentIntent — otherwise Stripe renders
 * the wallet sheet under the platform account rather than the seller.
 *
 * The seller's `stripeAccount.attributes.stripeAccountId` is not exposed
 * to the public Marketplace API, so this endpoint bridges to the
 * Integration SDK on the server.
 *
 * Auth: the caller must be a logged-in marketplace user (verified by
 * round-tripping the user's session cookie through the standard SDK).
 * This prevents an unauthenticated client from enumerating sellers'
 * connected account ids.
 */
module.exports = (req, res) => {
  const { listingId } = req.body || {};

  if (!listingId) {
    return res
      .status(400)
      .set('Content-Type', 'application/transit+json')
      .send(serialize({ errors: [{ status: 400, code: 'missing-listing-id' }] }))
      .end();
  }

  const integrationSdk = getIntegrationSdk();
  if (!integrationSdk) {
    // Integration SDK credentials aren't configured — surface a clear
    // 501 so the client can degrade (hide the wallet button) rather
    // than try to call confirmPayment with no onBehalfOf.
    return res
      .status(501)
      .set('Content-Type', 'application/transit+json')
      .send(serialize({ errors: [{ status: 501, code: 'integration-sdk-not-configured' }] }))
      .end();
  }

  // Auth check: read currentUser via the user's own session. If this
  // fails the SDK throws and we 401. The Integration SDK call below
  // only fires once we know there's a real authenticated marketplace
  // user behind this request.
  const sdk = getSdk(req, res);

  sdk.currentUser
    .show()
    .then(() => integrationSdk.listings.show({ id: listingId }))
    .then(listingResp => {
      const authorRel = listingResp?.data?.data?.relationships?.author?.data;
      if (!authorRel?.id) {
        const err = new Error('Listing has no author relationship');
        err.status = 404;
        throw err;
      }
      return integrationSdk.users.show({ id: authorRel.id, include: ['stripeAccount'] });
    })
    .then(userResp => {
      const included = userResp?.data?.included || [];
      const stripeAccount = included.find(rec => rec.type === 'stripeAccount');
      const providerStripeAccountId = stripeAccount?.attributes?.stripeAccountId || null;

      res
        .status(200)
        .set('Content-Type', 'application/transit+json')
        .send(serialize({ data: { providerStripeAccountId } }))
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
