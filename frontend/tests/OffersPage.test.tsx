import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OffersPage from "../src/pages/OffersPage.tsx";
import { adminUser, contactUser, stubFetch, studentUser } from "./helpers/fetchMock.ts";

const offers = [
  {
    id: 2,
    title: "Refonte du portail client",
    companyShortName: "Lumen Digital",
    academicYear: "2026-2027",
    period: "P2",
    status: "SUBMITTED",
  },
  {
    id: 5,
    title: "Tableau de bord de qualité des données",
    companyShortName: "Lumen Data",
    academicYear: "2026-2027",
    period: "OTHER",
    status: "ASSIGNED",
  },
];

describe("OffersPage", () => {
  it("transmet la période choisie à l'API et peut revenir à toutes les périodes", async () => {
    const fetchMock = stubFetch({ "/api/offers": () => Response.json(offers) });
    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    await screen.findByText("Refonte du portail client");
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/offers",
      expect.objectContaining({ headers: { Authorization: "jeton" } }),
    );

    const periodSelect = screen.getByRole("combobox", { name: "Période" });
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Toutes les périodes",
      "P1",
      "P2",
      "Autre",
    ]);
    fireEvent.change(periodSelect, { target: { value: "P1" } });
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/offers?period=P1",
        expect.objectContaining({ headers: { Authorization: "jeton" } }),
      ),
    );

    fireEvent.change(periodSelect, { target: { value: "" } });
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/offers",
        expect.objectContaining({ headers: { Authorization: "jeton" } }),
      ),
    );
  });

  it("affiche les offres avec leurs libellés français", async () => {
    stubFetch({ "/api/offers": () => Response.json(offers) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Refonte du portail client")).toBeInTheDocument();
    expect(screen.getByText("Soumise")).toBeInTheDocument();
    expect(screen.getByText("Attribuée")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Autre" })).toBeInTheDocument();
    expect(screen.getByText("2 offres")).toBeInTheDocument();
    expect(screen.getByText("Les offres que vous avez déposées.")).toBeInTheDocument();
  });

  it("adapte la description au profil", async () => {
    stubFetch({ "/api/offers": () => Response.json([]) });

    const { unmount } = render(
      <OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />,
    );
    expect(screen.getByText("Les offres publiées.")).toBeInTheDocument();
    expect(await screen.findByText("Aucune offre à afficher.")).toBeInTheDocument();
    unmount();

    render(<OffersPage user={adminUser} token="jeton" onUnauthorized={vi.fn()} />);
    expect(screen.getByText("Toutes les offres, tous statuts confondus.")).toBeInTheDocument();
  });

  it("affiche un refus d'accès renvoyé par le backend", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 403 }) });

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("statut 403");
  });

  it("permet à un étudiant de candidater avec un message facultatif", async () => {
    const publishedOffer = {
      id: 44,
      title: "Application React de gestion de flotte",
      companyShortName: "Lumen Digital",
      academicYear: "2026-2027",
      period: "P2",
      status: "PUBLISHED",
    };
    const application = {
      id: 20,
      offerId: publishedOffer.id,
      offerTitle: "Application React de gestion de flotte",
      companyShortName: "Lumen Digital",
      academicYear: "2026-2027",
      period: "P2",
      message: "Le sujet me motive.",
      status: "IN_PROGRESS",
    };
    const fetchMock = stubFetch({
      "/api/offers": () => Response.json([publishedOffer]),
      "/api/applications": (_input, init) =>
        init?.method === "POST" ? Response.json(application, { status: 201 }) : Response.json([]),
    });

    render(<OffersPage user={studentUser} token="jeton" onUnauthorized={vi.fn()} />);

    const message = await screen.findByRole("textbox", {
      name: "Message facultatif pour Application React de gestion de flotte",
    });
    fireEvent.change(message, { target: { value: "Le sujet me motive." } });
    fireEvent.click(screen.getByRole("button", { name: "Candidater" }));

    expect(await screen.findByText("En cours")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/applications",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "jeton", "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: publishedOffer.id, message: "Le sujet me motive." }),
      }),
    );
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/offers": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<OffersPage user={contactUser} token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });
});
