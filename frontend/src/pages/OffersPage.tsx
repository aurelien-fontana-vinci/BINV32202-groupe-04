import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import OfferTable from "../components/OfferTable.tsx";
import { useOffers } from "../hooks/useOffers.ts";
import { useApplications } from "../hooks/useApplications.ts";
import type { PeriodCode } from "../models/offer.ts";
import type { User } from "../models/user.ts";

interface OffersPageProps {
  user: User;
  token: string;
  onUnauthorized: () => void;
}

const DESCRIPTIONS = {
  ADMIN: "Toutes les offres, tous statuts confondus.",
  STUDENT: "Les offres publiées.",
  CONTACT: "Les offres que vous avez déposées.",
} as const;

const OffersPage = ({ user, token, onUnauthorized }: OffersPageProps) => {
  const { offers, isLoading, error, period, setPeriod } = useOffers(token, onUnauthorized);
  const {
    applications,
    isLoading: areApplicationsLoading,
    error: applicationsError,
    actionError,
    pendingOfferId,
    apply,
  } = useApplications(token, onUnauthorized, user.kind === "STUDENT");
  const canApply = user.kind === "STUDENT" && applicationsError === null;

  const renderContent = () => {
    if (error) return <ErrorState message={error} />;
    if (isLoading) return <LoadingState />;
    if (offers.length === 0) return <EmptyState message="Aucune offre à afficher." />;
    return (
      <>
        <p className="result-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""}
        </p>
        <OfferTable
          offers={offers}
          applications={applications}
          applicationsLoading={areApplicationsLoading}
          pendingOfferId={pendingOfferId}
          onApply={canApply ? (offerId, message) => void apply(offerId, message) : undefined}
        />
      </>
    );
  };

  return (
    <section>
      <h1>Offres de stage</h1>
      <p>{DESCRIPTIONS[user.kind]}</p>
      <label className="period-filter" htmlFor="offer-period">
        Période
        <select
          id="offer-period"
          value={period ?? ""}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setPeriod(value === "" ? undefined : (value as PeriodCode));
          }}
        >
          <option value="">Toutes les périodes</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="OTHER">Autre</option>
        </select>
      </label>
      {renderContent()}
      {applicationsError && <ErrorState message={applicationsError} />}
      {actionError && <ErrorState message={actionError} />}
    </section>
  );
};

export default OffersPage;
