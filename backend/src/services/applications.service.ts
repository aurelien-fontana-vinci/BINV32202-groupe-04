import { toApplication } from "../mappers/application.mapper.ts";
import type { Application } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

const requireStudent = (user: User): void => {
  if (!isStudent(user)) {
    throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut gérer ses candidatures");
  }
};

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  listForStudent: (viewer: User): Application[] => {
    requireStudent(viewer);
    return repository.findAllForStudent(viewer.id).map(toApplication);
  },

  apply: (viewer: User, offerId: number, message: string | null): Application => {
    requireStudent(viewer);

    const offerStatus = repository.findOfferStatus(offerId);
    if (offerStatus === undefined) {
      throw new HttpError(404, "OFFER_NOT_FOUND", "Cette offre n'existe pas");
    }
    if (offerStatus !== "PUBLISHED") {
      throw new HttpError(409, "OFFER_NOT_PUBLISHED", "Cette offre n'est pas publiée");
    }
    if (repository.hasApplicationForOffer(offerId, viewer.id)) {
      throw new HttpError(409, "APPLICATION_EXISTS", "Vous avez déjà candidaté à cette offre");
    }

    const applicationId = repository.create(offerId, viewer.id, message);
    const application = repository.findByIdForStudent(applicationId, viewer.id);
    if (application === undefined) {
      throw new HttpError(500, "APPLICATION_CREATE_FAILED", "La candidature n'a pas été créée");
    }
    return toApplication(application);
  },

  withdraw: (viewer: User, applicationId: number): Application => {
    requireStudent(viewer);

    const application = repository.findByIdForStudent(applicationId, viewer.id);
    if (application === undefined) {
      throw new HttpError(404, "APPLICATION_NOT_FOUND", "Cette candidature n'existe pas");
    }
    if (application.status !== "IN_PROGRESS") {
      throw new HttpError(409, "APPLICATION_ALREADY_PROCESSED", "Cette candidature a déjà été traitée");
    }
    if (!repository.markWithdrawn(applicationId, viewer.id)) {
      throw new HttpError(409, "APPLICATION_ALREADY_PROCESSED", "Cette candidature a déjà été traitée");
    }

    const withdrawn = repository.findByIdForStudent(applicationId, viewer.id);
    if (withdrawn === undefined) {
      throw new HttpError(500, "APPLICATION_UPDATE_FAILED", "La candidature n'a pas été mise à jour");
    }
    return toApplication(withdrawn);
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
