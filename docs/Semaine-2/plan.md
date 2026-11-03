# Plan — EF-32 et EF-33 : candidatures étudiantes

## Problème et approche

Le parcours d'offres et les connexions de démonstration sont en place. Le schéma SQLite contient déjà `applications`, ses statuts `IN_PROGRESS`, `SELECTED`, `REJECTED` et `WITHDRAWN`, ainsi que des données de démonstration couvrant ces états. La règle confirmée interdisant une nouvelle candidature après retrait nécessite une migration ajoutant l'unicité du couple (offre, étudiant).

Implémenter EF-32 et EF-33 sur le parcours existant : l'étudiant candidate depuis la liste des offres publiées avec un message facultatif, consulte ses candidatures, puis peut retirer celles qui sont encore en cours. Les contrôles d'identité et de transition resteront côté API ; l'interface affichera les statuts en français. EF-30, EF-31, EF-34 et la création du stage restent hors périmètre.

## Étapes

1. **Candidater** — Ajouter les endpoints et couches backend de candidature, vérifier qu'un étudiant ne candidate qu'à une offre `PUBLISHED` et ne peut créer qu'une candidature par offre (même après retrait), et ajouter l'action avec message facultatif à la liste existante des offres. Ajouter une migration d'unicité et traiter explicitement une tentative doublon. Tester les droits, validations, données enregistrées et refus d'une offre non publiée.
2. **Consulter ses candidatures** — Exposer uniquement les candidatures de l'étudiant connecté avec leurs offres et statuts ; ajouter la page et la navigation « Mes candidatures ». Afficher les libellés demandés : « En cours », « Retenue », « Non retenue », « Retirée ».
3. **Retirer une candidature** — Ajouter l'action de retrait, limitée par le service aux candidatures de l'étudiant connecté encore `IN_PROGRESS`, puis proposer le retrait depuis la page de consultation et actualiser l'affichage. Tester qu'une candidature traitée ou appartenant à un autre étudiant ne peut être retirée.

## Fichiers et composants concernés

- Backend : `backend/src/app.ts` ; nouveaux `applications.controller.ts`, `applications.service.ts`, `applications.repository.ts`, `models/application.ts`, `mappers/application.mapper.ts` ; `backend/API.md` ; nouveaux tests API dédiés dans `backend/tests/applications.test.ts`.
- Frontend : `frontend/src/App.tsx`, `components/NavBar.tsx`, `pages/OffersPage.tsx` et `components/OfferTable.tsx` pour candidater ; nouveaux `pages/ApplicationsPage.tsx`, `hooks/useApplications.ts`, `services/applications.service.ts`, `models/application.ts` ; `utils/labels.ts`, `utils/guards.ts`, `index.css` ; tests dédiés de candidature et de consultation/retrait, avec navigation couverte dans les tests existants.
- Base et démo : réutiliser `applications` et les utilisateurs/offres/candidatures déjà présents dans `backend/src/db/seed/`; créer `backend/src/db/migrations/002_unique_application_per_student_offer.sql` pour interdire les candidatures en doublon, sans modifier les données de démo existantes.
- Documentation : mettre à jour `README.md` et `docs/architecture.md` pour refléter les fonctionnalités réalisées.

## Vérifications et tests envisagés

- Tests backend API sur base SQLite en mémoire : authentification et profil étudiant requis, candidater sur offre publiée, refus si offre non publiée/inexistante ou déjà candidate (y compris après retrait), message facultatif et invalide, cloisonnement des candidatures par étudiant, statuts mappés, retrait autorisé uniquement avant traitement.
- Tests frontend Vitest/Testing Library : bouton et saisie facultative dans la liste d'offres, rendu de la liste et des quatre statuts, possibilité de retrait seulement pour « En cours », erreurs et session expirée.
- Vérification finale ciblée : `npm run check` (lint, typecheck, tests et build), selon disponibilité de Node et des dépendances installées.

## Décisions métier à confirmer

- **Nouvelle candidature après retrait** : décision confirmée : non. Le retrait est définitif pour cette offre ; l'ancienne candidature reste visible comme « Retirée » et une contrainte d'unicité permanente empêche toute nouvelle candidature.
- **Taille du message** : le cahier ne fixe pas de limite. Proposition par défaut : accepter un message texte facultatif sans limite métier arbitraire, avec validation de type et rejet des corps invalides ; adopter une limite si elle est souhaitée.
- « Traitée » est interprété selon les statuts existants comme `SELECTED` ou `REJECTED` ; seul `IN_PROGRESS` est retirable. Aucune action administrateur de sélection ni création de stage ne sera ajoutée.
