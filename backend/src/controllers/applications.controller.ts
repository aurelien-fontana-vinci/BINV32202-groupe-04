import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { HttpError } from "../utils/httpError.ts";

const parsePositiveInteger = (value: unknown, field: string): number => {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, "INVALID_BODY", `${field} doit être un entier positif`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new HttpError(400, "INVALID_BODY", `${field} doit être un entier positif`);
  }
  return parsed;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseApplicationBody = (body: unknown): { offerId: number; message: string | null } => {
  if (!isRecord(body)) {
    throw new HttpError(400, "INVALID_BODY", "Le corps doit contenir offerId et message facultatif");
  }
  if (typeof body.offerId !== "number" || !Number.isSafeInteger(body.offerId) || body.offerId < 1) {
    throw new HttpError(400, "INVALID_BODY", "offerId doit être un entier positif");
  }
  if (body.message !== undefined && body.message !== null && typeof body.message !== "string") {
    throw new HttpError(400, "INVALID_BODY", "message doit être une chaîne de caractères");
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  return { offerId: body.offerId, message: message === "" ? null : message };
};

export const createApplicationsRouter = (applicationsService: ApplicationsService) => {
  const router = Router();

  router.get("/", (req, res) => {
    res.json(applicationsService.listForStudent(getCurrentUser(req)).map(toApplicationDto));
  });

  router.post("/", (req, res) => {
    const { offerId, message } = parseApplicationBody(req.body);
    const application = applicationsService.apply(getCurrentUser(req), offerId, message);
    res.status(201).json(toApplicationDto(application));
  });

  router.post("/:id/withdraw", (req, res) => {
    const id = parsePositiveInteger(req.params.id, "id");
    const application = applicationsService.withdraw(getCurrentUser(req), id);
    res.json(toApplicationDto(application));
  });

  return router;
};
