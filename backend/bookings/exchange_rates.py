"""
Dynamic USD/ETB exchange rates from payment providers.
Stripe supplies the international card rate; Chapa-aligned ETB uses a live
market feed (Chapa has no public FX endpoint — they convert at checkout using
NBE/market rates, which the secondary feed tracks).
"""
import logging
import requests
import stripe
from decimal import Decimal
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

logger = logging.getLogger(__name__)

EXCHANGE_RATE_CACHE_KEY = "exchange_rates_bundle_v2"
EXCHANGE_RATE_CACHE_TTL = 60 * 15  # 15 minutes — fresher than the old 1-hour cache
EXCHANGE_RATE_API_URL = "https://api.exchangerate.fun/latest?base=USD"


def _fallback_rate():
    return Decimal(str(getattr(settings, "USD_TO_ETB_RATE", "135.00")))


def _fetch_stripe_usd_to_etb():
    """Stripe Exchange Rates API — used for USD card payments."""
    secret = getattr(settings, "STRIPE_SECRET_KEY", "")
    if not secret:
        return None
    try:
        stripe.api_key = secret
        rate_obj = stripe.ExchangeRate.retrieve("usd")
        etb = rate_obj.rates.get("etb") or rate_obj.rates.get("ETB")
        if etb is None:
            return None
        value = Decimal(str(etb))
        return value if value > 0 else None
    except Exception:
        logger.warning("Stripe exchange rate fetch failed.", exc_info=True)
        return None


def _fetch_market_usd_to_etb():
    """Live market USD→ETB (Chapa / local checkout alignment)."""
    try:
        resp = requests.get(EXCHANGE_RATE_API_URL, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        rate = Decimal(str(data["rates"]["ETB"]))
        return rate if rate > 0 else None
    except Exception:
        logger.warning("Market USD/ETB rate fetch failed.", exc_info=True)
        return None


def get_exchange_rate_bundle(force_refresh=False):
    """
    Returns a dict with stripe, chapa, and effective rates plus metadata.
    Never raises — payment and display flows must stay up.
    """
    if not force_refresh:
        cached = cache.get(EXCHANGE_RATE_CACHE_KEY)
        if cached is not None:
            return cached

    fallback = _fallback_rate()
    stripe_rate = _fetch_stripe_usd_to_etb()
    chapa_rate = _fetch_market_usd_to_etb()

    bundle = {
        "stripe_usd_to_etb": str(stripe_rate or chapa_rate or fallback),
        "chapa_usd_to_etb": str(chapa_rate or stripe_rate or fallback),
        "usd_to_etb": str(chapa_rate or stripe_rate or fallback),
        "stripe_source": "stripe" if stripe_rate else ("market" if chapa_rate else "fallback"),
        "chapa_source": "market" if chapa_rate else ("stripe" if stripe_rate else "fallback"),
        "fallback_rate": str(fallback),
        "updated_at": timezone.now().isoformat(),
    }

    cache.set(EXCHANGE_RATE_CACHE_KEY, bundle, EXCHANGE_RATE_CACHE_TTL)
    return bundle


def get_usd_to_etb_rate(provider="chapa"):
    """
    Single rate for backend payment math.
    provider: 'stripe' | 'chapa' (default chapa for ETB checkout)
    """
    bundle = get_exchange_rate_bundle()
    key = "stripe_usd_to_etb" if provider == "stripe" else "chapa_usd_to_etb"
    return Decimal(bundle[key])
