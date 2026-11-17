Crédits en debut de séance : 18% 
Crédits en fin de séance: 28%

# Bilan — Semaine 4

## Audit des tests

| Cas vérifié | Test et assertion observée | Constat |
|---|---|---|
| Candidater à une offre non publiée | `backend/tests/applications.test.ts` vérifie `409` et `OFFER_NOT_PUBLISHED`. | Couvert |
| Retirer une candidature déjà traitée | Le test paramétré vérifie `409` et `APPLICATION_ALREADY_PROCESSED` pour les statuts retenue et non retenue. | Couvert |
| Consulter la liste personnelle | Le test compare les identifiants retournés exactement aux deux candidatures de l’étudiante connectée. | Couvert pour l’API |
| Retirer la candidature d’un autre étudiant | Le test vérifie `404` et `APPLICATION_NOT_FOUND`. Il ne relit pas la candidature pour confirmer qu’elle est restée en cours. | Refus couvert ; absence de modification pas explicitement vérifiée |
| Ouvrir directement `/candidatures` comme administrateur | Test ajouté dans `frontend/tests/App.test.tsx` : « Page introuvable » et aucune requête `/api/applications`. | Manque d’interface corrigé par le test |
| Recherche littérale contenant `%` ou `_` dans le titre | La requête SQL échappe ces caractères, mais aucun test API ne vérifie ce comportement. | Manque confirmé par l’audit complémentaire ; test à ajouter |

## TDD — Recherche par titre (EF-30)

Avant l’implémentation, le lot proposé vérifiait la casse et les espaces externes, la recherche d’une expression entière, l’ignorance d’une recherche vide, la combinaison avec la période et la visibilité des offres étudiantes, ainsi que l’état vide de l’interface. Ces cas correspondaient aux règles demandées ; je les ai validés avant l’implémentation.

Résultat rouge observé : `backend/tests/offers.test.ts` avait **3 échecs et 17 réussites** ; `frontend/tests/OffersPage.test.tsx` avait **2 échecs et 6 réussites**. Les échecs indiquaient l’absence du filtrage API et du champ de recherche. Après implémentation, les suites ciblées ont réussi : **20 tests backend** et **8 tests frontend**. L’audit final a relevé le cas non prévu des caractères jokers SQL (`%`, `_`) ; la recherche les échappe, mais cette garantie n’est pas encore couverte par un test.