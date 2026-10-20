import { useEffect, useState } from "react";
import type { Offer, PeriodCode } from "../models/offer.ts";
import { getOffers } from "../services/offers.service.ts";
import { isUnauthorized } from "../utils/api.ts";

/**
 * Offres visibles par l'utilisateur, choisies par le backend selon son profil.
 * onUnauthorized doit être stable (useCallback) pour ne pas relancer le chargement.
 */
export const useOffers = (token: string, onUnauthorized: () => void) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodCode | undefined>(undefined);

  const changePeriod = (nextPeriod: PeriodCode | undefined) => {
    if (nextPeriod === selectedPeriod) return;
    setIsLoading(true);
    setError(null);
    setSelectedPeriod(nextPeriod);
  };

  useEffect(() => {
    const controller = new AbortController();

    getOffers(token, selectedPeriod, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setOffers(data);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setError(reason instanceof Error ? reason.message : "Erreur inconnue");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [token, onUnauthorized, selectedPeriod]);

  return { offers, isLoading, error, period: selectedPeriod, setPeriod: changePeriod };
};
