import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { APPLICATION, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import type { UserKind } from "../src/models/user.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const applicationsAs = (kind: UserKind, id: number) =>
  request(app).get("/applications").set("Authorization", tokenFor(kind, id));

describe("GET /applications", () => {
  it("refuse une requête sans session", async () => {
    const response = await request(app).get("/applications");

    expect(response.status).toBe(401);
  });

  it("refuse les profils autres qu'étudiant", async () => {
    const response = await applicationsAs("ADMIN", 1);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("retourne seulement les candidatures de l'étudiant connecté et leurs statuts", async () => {
    const response = await applicationsAs("STUDENT", STUDENT.INES_HADDAD);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: APPLICATION.INES_FLEET_APP,
          offerId: OFFER.FLEET_APP,
          status: "IN_PROGRESS",
          offerTitle: "Application React de gestion de flotte",
        }),
        expect.objectContaining({
          id: APPLICATION.INES_BILLING_API,
          status: "WITHDRAWN",
        }),
      ]),
    );
    expect(response.body).toHaveLength(2);
    expect(response.body.every((application: { appliedAt?: string }) => !("appliedAt" in application))).toBe(true);
  });
});

describe("POST /applications", () => {
  it("crée une candidature avec un message facultatif", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.DMYTRO_KOVALENKO))
      .send({ offerId: OFFER.FLEET_APP, message: "  Le sujet me motive.  " });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      offerId: OFFER.FLEET_APP,
      offerTitle: "Application React de gestion de flotte",
      message: "Le sujet me motive.",
      status: "IN_PROGRESS",
    });
  });

  it("accepte une candidature sans message", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.DMYTRO_KOVALENKO))
      .send({ offerId: OFFER.FLEET_APP });

    expect(response.status).toBe(201);
    expect(response.body.message).toBeNull();
  });

  it("refuse une offre non publiée et une offre inexistante", async () => {
    const token = tokenFor("STUDENT", STUDENT.DMYTRO_KOVALENKO);
    const unpublished = await request(app)
      .post("/applications")
      .set("Authorization", token)
      .send({ offerId: OFFER.CLIENT_PORTAL });
    const missing = await request(app)
      .post("/applications")
      .set("Authorization", token)
      .send({ offerId: 999 });

    expect(unpublished.status).toBe(409);
    expect(unpublished.body.error.code).toBe("OFFER_NOT_PUBLISHED");
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe("OFFER_NOT_FOUND");
  });

  it("interdit une deuxième candidature même après retrait", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.INES_HADDAD))
      .send({ offerId: OFFER.BILLING_API });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_EXISTS");
  });

  it.each([
    ["un identifiant absent", {}],
    ["un identifiant invalide", { offerId: 0 }],
    ["un message non textuel", { offerId: OFFER.FLEET_APP, message: 42 }],
  ])("rejette un corps avec %s", async (_case, body) => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.DMYTRO_KOVALENKO))
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });

  it("refuse un utilisateur qui n'est pas étudiant", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("ADMIN", 1))
      .send({ offerId: OFFER.FLEET_APP });

    expect(response.status).toBe(403);
  });
});

describe("POST /applications/:id/withdraw", () => {
  it("retire une candidature en cours", async () => {
    const response = await request(app)
      .post(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("WITHDRAWN");
  });

  it("refuse le retrait d'une candidature traitée", async () => {
    const response = await request(app)
      .post(`/applications/${APPLICATION.MATEUSZ_CLOUD_MIGRATION}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_ALREADY_PROCESSED");
  });

  it("ne révèle pas et ne retire pas la candidature d'un autre étudiant", async () => {
    const response = await request(app)
      .post(`/applications/${APPLICATION.LUCAS_FLEET_APP}/withdraw`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.INES_HADDAD));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("APPLICATION_NOT_FOUND");
  });

  it("valide l'identifiant de candidature", async () => {
    const response = await request(app)
      .post("/applications/not-a-number/withdraw")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LUCAS_DUPONT));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });
});
