# Semaine 3 — bilan
#### Ce bilan a été generé/completé en partie avec l'ia pour qu'il soit plus lisible et clair, pour les tableaux nottament. Tous les fichiers generés et utilisés en séance se trouve dans le dossier Semaine-3 ainsi que la discussion. Environ 15% de l'abonnement githubCopilot à été utilisé. 

### Inventaire des guides et senseurs

La matrice repère trois guides inférentiels et cinq senseurs computationnels.

| Mécanisme et emplacement | Rôle et exemple | Vérification |
|---|---|---|
| Guide agent — [`AGENTS.md`](../AGENTS.md) | Oriente les changements ; ex. les services restent indépendants d’Express `Request`/`Response`. | Lu. Pas de test qui vérifie que l’agent suit ses consignes. |
| Guides de contexte — [`README.md`](../README.md), [`docs/architecture.md`](./architecture.md), [`backend/API.md`](../backend/API.md), [`docs/seed.md`](./seed.md), cahier des charges | Décrivent architecture, contrats, données et besoins ; ex. offre non publiée refusée à la candidature. | Documents lus ; ce ne sont pas des contrôles exécutables. |
| Checklist humaine — [modèle de PR](../.github/pull_request_template.md) | Guide la revue : tests, droits backend, documentation API, validation navigateur. | Lu, mais aucune PR créée pendant l’exercice. |
| Tests — `backend/tests/`, `frontend/tests/` | Vérifient des comportements définis ; ex. candidater à une offre publiée, refuser une offre non publiée. | `npm run check` réussi : 133 tests backend et 52 frontend. |
| Oxlint — configurations backend/frontend | Détecte des violations statiques ; ex. `any` interdit, règles React Hooks vérifiées. | Lint réussi dans `npm run check`. |
| TypeScript — `backend/tsconfig.json`, `frontend/tsconfig.json` | Détecte des incohérences de types ; ex. `strict` et `noUncheckedIndexedAccess`. | Vérifications TypeScript réussies dans `npm run check`. |
| Build — scripts backend/frontend | Vérifie la compilation ; ex. `tsc` backend, `tsc -b` puis Vite frontend. | Builds backend et frontend réussis dans `npm run check`. |
| Contrôle global — `package.json`, `npm run check` | Enchaîne lint, types, tests et builds. | Exécuté à la racine avec succès. |

Deux cases restent vides : aucun senseur inférentiel de revue IA ni guide computationnel de génération de code n’a été repéré.

### Couverture EF-32 / EF-33

La [matrice de traçabilité](./Semaine-3/traceabilite-ef32-ef33.html) relie 17 cas précis à leurs assertions. Résumé :

| Cas | Test(s) et assertions vérifiées | Couverture |
|---|---|---|
| Candidater à une offre publiée avec message | `backend/tests/applications.test.ts`, « crée une candidature avec un message facultatif » : 201, offre/titre, message nettoyé, `IN_PROGRESS`. `frontend/tests/OffersPage.test.tsx`, « permet à un étudiant de candidater avec un message facultatif » : POST et message « En cours ». | Couvert |
| Message omis | `applications.test.ts`, « accepte une candidature sans message » : 201, message `null`. | Couvert à l’API ; pas de test UI spécifique au champ vide. |
| Offre non publiée / inexistante | `applications.test.ts`, « refuse une offre non publiée et une offre inexistante » : 409 `OFFER_NOT_PUBLISHED`, 404 `OFFER_NOT_FOUND`. | Couvert |
| Profil non étudiant ou sans session | `applications.test.ts` : création par admin 403 ; consultation sans jeton 401 et admin 403 `FORBIDDEN`. | Couvert pour ces profils testés |
| Retirer sa candidature en cours | `applications.test.ts`, « retire une candidature en cours » : 200 `WITHDRAWN`. `frontend/tests/ApplicationsPage.test.tsx` vérifie le POST, la mise à jour simulée et la disparition du bouton. | Couvert |
| Retirer une candidature traitée | `applications.test.ts`, test paramétré « refuse le retrait d'une candidature… » : 409 `APPLICATION_ALREADY_PROCESSED` pour `SELECTED` et `REJECTED`. | Couvert |
| Retirer la candidature d’un autre | `applications.test.ts`, « ne révèle pas et ne retire pas la candidature d'un autre étudiant » : 404 `APPLICATION_NOT_FOUND`. | Couvert |
| Liste personnelle, statuts et libellés | `applications.test.ts`, « retourne seulement les candidatures de l'étudiant connecté… » : ids exactement ceux de l’étudiant. Test ajouté « retourne les quatre statuts… » : statut attendu pour quatre comptes. `ApplicationsPage.test.tsx` vérifie les libellés français. | Couvert par assertions API/UI |
| Route UI ouverte directement par un autre profil | `NavBar.test.tsx` vérifie seulement la visibilité du lien ; le contrôle API des droits est testé séparément. Pas de test de navigation directe. | Partiel |
| Limites du message | Test ajouté « accepte un message long sans limite métier arbitraire » : 4 096 caractères retournés sans troncature. Cela ne prouve pas l’absence de toute limite de transport. | Couvert pour la longueur testée |

La traçabilité distingue également les validations de format (400), les erreurs de retrait (409), et les limites UI. Les tests de seed/migrations ou du filtre des offres ne sont pas présentés comme preuves d’EF-32/EF-33 lorsqu’ils ne testent pas ces comportements.

### Modifications et vérifications

Dans [`backend/tests/applications.test.ts`](../backend/tests/applications.test.ts), tests ajoutés ou renforcés :

- assertion que la liste d’un étudiant ne contient exactement que ses propres ids — échouerait si une candidature d’un autre étudiant était incluse ;
- vérification des quatre statuts via l’API ;
- refus du retrait des candidatures `SELECTED` et `REJECTED` ;
- contrôle de session et de rôle étudiant sur le retrait ;
- message de 4 096 caractères retourné sans troncature.

Commandes exécutées :

- `npm run test -w backend -- tests/applications.test.ts` — réussi, 19 tests ;
- `npm run check` — réussi : lint et TypeScript backend/frontend ; backend, 10 fichiers et 133 tests ; frontend, 8 fichiers et 52 tests ; builds backend et frontend.
- Vérification de la matrice HTML : 17 cas, liens de sources existants, filtres et recherche fonctionnels.

Aucune recette manuelle dans un navigateur n’a été réalisée. Les tests frontend utilisent des réponses `fetch` simulées ; le test long vérifie une seule taille concrète. Ces limites ne sont pas masquées par le succès de `npm run check`.

### Audit des guides face à Web 2

Audit fondé sur les supports PDF Web 2 fournis (nom du support et numéro de diapositive) :

- Séance 06, p. 2–3 : rôles client (interface) et serveur (métier, données, sécurité) — repris dans `AGENTS.md` et `docs/architecture.md` ;
- Séance 04, p. 2, 4–5, 10–12 : REST, méthodes HTTP et statuts — repris dans `backend/API.md` ;
- Séances 08, 13–15 : composants, props, état et routes — correspondance avec l’organisation frontend ;
- Séances 03, 12, 16, 19–20 : middlewares, formulaires, fetch/erreurs, JWT et secrets — correspondance partielle ou consignes à préciser.

Écarts proposés : documenter l’ordre des middlewares et le placement de l’error handler ; préciser les formulaires contrôlés, les rejets réseau et l’exposition/sensibilité d’un JWT ; expliciter les annotations TypeScript si elles sont attendues comme convention du projet. Aucun support fourni ne permet d’attribuer au cours une attente explicite sur l’accessibilité ou les tests automatisés. Les guides n’ont pas été modifiés.

### Optionnel — senseur d’architecture

Proposition non implémentée : un test Vitest qui analyse les fichiers `backend/src/services/` avec l’AST TypeScript et échoue si un service importe `Request` ou `Response` depuis Express. Il s’exécuterait dans `npm test`/`npm run check` et signalerait fichier, ligne et symbole. Exemple : `import type { Request } from "express"` dans un service. Limites : ne détecterait pas tous les couplages indirects ; petit coût de maintenance AST, non mesuré.
