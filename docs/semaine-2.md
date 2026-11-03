# Bilan — semaine 2 : candidatures étudiantes

## Choix de planification

- Le retrait est définitif : un étudiant ne peut pas recandidater à la même offre après avoir retiré sa candidature.
- Le message de candidature est facultatif et n’a pas de limite de longueur définie par l’application.
- Le travail couvre la candidature, la consultation de ses candidatures et le retrait d’une candidature en cours. La sélection par une entreprise, la création d’un stage et les autres fonctionnalités hors périmètre restent à faire.

## Résultat et limites

Un étudiant peut candidater à une offre publiée, consulter ses candidatures et retirer celles qui sont « En cours ». Les statuts sont affichés en français. L’API limite les données à l’étudiant connecté et interdit de candidater à une offre non publiée ou déjà visée par une candidature, même retirée.

La table et les statuts de candidature existaient déjà, ainsi que des données de démonstration. La migration ajoute donc l’unicité permanente du couple offre–étudiant, sans recréer la table. Les entreprises ne disposent pas encore d’un parcours pour consulter les candidatures ou les messages. Les tests automatisés passent ; aucun essai manuel dans un navigateur n’a été réalisé pour ce bilan.

## Modifications

- **Backend** : ajout du contrôleur, service, repository, mapper et modèle de candidature, des routes API et d’une migration d’index unique. Les tests de contraintes et de migrations sont également complétés.
- **Frontend** : ajout du service, hook, modèle et page « Mes candidatures » ; adaptation de la page des offres, du tableau et de la navigation pour permettre de candidater ; ajout des libellés de statut et des tests associés.
- **Documentation** : mise à jour du README et de l’architecture pour décrire le parcours et les couches concernées.

Après lecture du plan, le schéma et les données de démonstration existants ont été réutilisés ; seule la contrainte d’unicité nécessaire a été ajoutée. Les vérifications d’identité et de transition restent côté serveur.

## Validation fonctionnelle

Les tests API vérifient notamment qu’un étudiant peut candidater avec ou sans message, qu’une offre non publiée et une candidature en doublon sont refusées, et qu’une candidature d’un autre étudiant ou déjà traitée ne peut pas être retirée. Les tests d’interface vérifient les quatre libellés (« En cours », « Retenue », « Non retenue », « Retirée »), le retrait uniquement pour une candidature en cours et la gestion d’une session expirée. Aucun échec n’a été observé lors de la validation ci-dessous ; aucune correction supplémentaire n’a été nécessaire à cette étape.

## Qualité, tests et commandes

Le parcours suit la séparation du projet entre contrôleur, service, repository et mapper. Les tests couvrent les droits et l’isolation des candidatures ; les tests backend utilisent SQLite en mémoire. La migration assure également l’unicité au niveau de la base. Aucun problème bloquant n’a été relevé par le lint, le contrôle TypeScript ou les tests.

Commande exécutée à la racine :

```text
npm run check — réussi
```

Cette commande a exécuté lint, vérification TypeScript, tests et builds. Résultat : **10 fichiers backend et 129 tests réussis ; 8 fichiers frontend et 52 tests réussis ; builds backend et frontend réussis**. Exemple de comportement couvert : une deuxième candidature pour une offre reste refusée après le retrait de la première.
