import { Router } from "express";
import { toOfferDto } from "../mappers/offer.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import { authorize } from "../middlewares/authorize.ts";
import { PERIOD_CODES, type PeriodCode } from "../models/offer.ts";
import type { OffersService } from "../services/offers.service.ts";
import { canListOffers } from "../services/permissions.ts";
import { HttpError } from "../utils/httpError.ts";

const parsePeriod = (value: unknown): PeriodCode | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new HttpError(400, "INVALID_QUERY", "Le paramètre period doit apparaître une seule fois");
  }

  const normalized = value.trim();
  if (normalized === "") return undefined;

  const period = PERIOD_CODES.find((code) => code === normalized);
  if (period === undefined) {
    throw new HttpError(400, "INVALID_QUERY", "Le paramètre period doit valoir P1, P2 ou OTHER");
  }
  return period;
};

export const createOffersRouter = (offersService: OffersService) => {
  const router = Router();

  router.get("/", authorize(canListOffers), (req, res) => {
    const offers = offersService.listOffers(getCurrentUser(req), parsePeriod(req.query.period));
    res.json(offers.map(toOfferDto));
  });

  return router;
};
