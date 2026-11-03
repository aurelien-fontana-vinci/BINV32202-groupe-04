import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ApplicationsPage from "../src/pages/ApplicationsPage.tsx";
import { stubFetch } from "./helpers/fetchMock.ts";

const applications = [
  {
    id: 1,
    offerId: 10,
    offerTitle: "Offre en cours",
    companyShortName: "Orbis",
    academicYear: "2026-2027",
    period: "P2",
    message: null,
    status: "IN_PROGRESS",
  },
  {
    id: 2,
    offerId: 11,
    offerTitle: "Offre retenue",
    companyShortName: "Datavia",
    academicYear: "2026-2027",
    period: "P2",
    message: "Mon message",
    status: "SELECTED",
  },
  {
    id: 3,
    offerId: 12,
    offerTitle: "Offre non retenue",
    companyShortName: "Hexagone",
    academicYear: "2026-2027",
    period: "OTHER",
    message: null,
    status: "REJECTED",
  },
  {
    id: 4,
    offerId: 13,
    offerTitle: "Offre retirée",
    companyShortName: "Lumen",
    academicYear: "2026-2027",
    period: "P1",
    message: null,
    status: "WITHDRAWN",
  },
];

describe("ApplicationsPage", () => {
  it("affiche les statuts et permet de retirer uniquement une candidature en cours", async () => {
    const withdrawnApplication = { ...applications[0], status: "WITHDRAWN" };
    const fetchMock = stubFetch({
      "/api/applications": (_input, init) =>
        init?.method === "POST"
          ? Response.json(withdrawnApplication)
          : Response.json(applications),
    });
    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Offre en cours")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Retenue")).toBeInTheDocument();
    expect(screen.getByText("Non retenue")).toBeInTheDocument();
    expect(screen.getByText("Retirée")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Retirer la candidature/ })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Retirer la candidature pour Offre en cours" }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/applications/1/withdraw",
      expect.objectContaining({ method: "POST", headers: { Authorization: "jeton" } }),
    ));
    await waitFor(() => expect(screen.getAllByText("Retirée")).toHaveLength(2));
    expect(screen.queryByRole("button", { name: /^Retirer la candidature/ })).not.toBeInTheDocument();
  });

  it("signale une session expirée", async () => {
    stubFetch({ "/api/applications": () => new Response(null, { status: 401 }) });
    const onUnauthorized = vi.fn();

    render(<ApplicationsPage token="jeton" onUnauthorized={onUnauthorized} />);

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalled());
  });

  it("affiche un état vide si aucune candidature n'existe", async () => {
    stubFetch({ "/api/applications": () => Response.json([]) });

    render(<ApplicationsPage token="jeton" onUnauthorized={vi.fn()} />);

    expect(await screen.findByText("Vous n'avez pas encore candidaté à une offre.")).toBeInTheDocument();
  });
});
