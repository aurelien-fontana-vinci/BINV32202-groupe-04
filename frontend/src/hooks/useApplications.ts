import { useCallback, useEffect, useState } from "react";
import type { Application } from "../models/application.ts";
import {
  createApplication,
  getApplications,
  withdrawApplication,
} from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";

export const useApplications = (
  token: string,
  onUnauthorized: () => void,
  enabled = true,
) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingOfferId, setPendingOfferId] = useState<number | null>(null);
  const [pendingApplicationId, setPendingApplicationId] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    getApplications(token, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setApplications(data);
          setError(null);
          setLoadedToken(token);
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setError(reason instanceof Error ? reason.message : "Erreur inconnue");
          setLoadedToken(token);
        }
      })

    return () => controller.abort();
  }, [enabled, onUnauthorized, token]);

  const apply = useCallback(
    async (offerId: number, message: string) => {
      setActionError(null);
      setPendingOfferId(offerId);
      try {
        const application = await createApplication(token, offerId, message);
        setApplications((current) => [application, ...current]);
      } catch (reason) {
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setActionError(reason instanceof Error ? reason.message : "Erreur inconnue");
        }
      } finally {
        setPendingOfferId(null);
      }
    },
    [onUnauthorized, token],
  );

  const withdraw = useCallback(
    async (applicationId: number) => {
      setActionError(null);
      setPendingApplicationId(applicationId);
      try {
        const application = await withdrawApplication(token, applicationId);
        setApplications((current) =>
          current.map((item) => (item.id === application.id ? application : item)),
        );
      } catch (reason) {
        if (isUnauthorized(reason)) {
          onUnauthorized();
        } else {
          setActionError(reason instanceof Error ? reason.message : "Erreur inconnue");
        }
      } finally {
        setPendingApplicationId(null);
      }
    },
    [onUnauthorized, token],
  );

  return {
    applications: loadedToken === token ? applications : [],
    isLoading: enabled && loadedToken !== token,
    error: loadedToken === token ? error : null,
    actionError,
    pendingOfferId,
    pendingApplicationId,
    apply,
    withdraw,
  };
};
