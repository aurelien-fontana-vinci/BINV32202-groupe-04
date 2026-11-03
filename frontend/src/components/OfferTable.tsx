import { useState } from "react";
import type { Application } from "../models/application.ts";
import type { Offer } from "../models/offer.ts";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_TONES,
  OFFER_STATUS_LABELS,
  OFFER_STATUS_TONES,
  PERIOD_LABELS,
} from "../utils/labels.ts";
import StatusBadge from "./StatusBadge.tsx";

interface OfferTableProps {
  offers: Offer[];
  applications?: Application[];
  applicationsLoading?: boolean;
  pendingOfferId?: number | null;
  onApply?: (offerId: number, message: string) => void;
}

const OfferTable = ({
  offers,
  applications = [],
  applicationsLoading = false,
  pendingOfferId = null,
  onApply,
}: OfferTableProps) => {
  const [messages, setMessages] = useState<Record<number, string>>({});
  const applicationByOfferId = new Map(applications.map((application) => [application.offerId, application]));

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Titre</th>
            <th scope="col">Entreprise</th>
            <th scope="col">Année</th>
            <th scope="col">Période</th>
            <th scope="col">Statut</th>
            {onApply && <th scope="col">Candidature</th>}
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => {
            const application = applicationByOfferId.get(offer.id);
            return (
              <tr key={offer.id}>
                <td>{offer.title}</td>
                <td>{offer.companyShortName}</td>
                <td>{offer.academicYear}</td>
                <td>{PERIOD_LABELS[offer.period]}</td>
                <td>
                  <StatusBadge
                    label={OFFER_STATUS_LABELS[offer.status]}
                    tone={OFFER_STATUS_TONES[offer.status]}
                  />
                </td>
                {onApply && (
                  <td>
                    {application ? (
                      <StatusBadge
                        label={APPLICATION_STATUS_LABELS[application.status]}
                        tone={APPLICATION_STATUS_TONES[application.status]}
                      />
                    ) : offer.status !== "PUBLISHED" ? (
                      "—"
                    ) : (
                      <form
                        className="application-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          onApply(offer.id, messages[offer.id] ?? "");
                        }}
                      >
                        <label className="sr-only" htmlFor={`application-message-${offer.id}`}>
                          Message facultatif pour {offer.title}
                        </label>
                        <textarea
                          id={`application-message-${offer.id}`}
                          value={messages[offer.id] ?? ""}
                          onChange={(event) =>
                            setMessages((current) => ({ ...current, [offer.id]: event.target.value }))
                          }
                          placeholder="Message facultatif"
                          rows={2}
                        />
                        <button
                          type="submit"
                          disabled={applicationsLoading || pendingOfferId !== null}
                        >
                          {pendingOfferId === offer.id ? "Envoi…" : "Candidater"}
                        </button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OfferTable;
