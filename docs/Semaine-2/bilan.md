# L'ia a utilisé 4% (9.4/200 credit) durant la séance

# Lors de la confection du plan, copilot ne nous a posé que 2 questions:
- Comment gerer les retrait de candidature. On a decider de rendre un retrait de candidature definitif. lorsqu'un etudiant retire sa candidature, il ne peut plus postuler pour cette offre. 


- ajouter une limite metier arbitraire. On a decider de ne pas en ajouter. Le champ accepte une chaîne sans longueur maximale définie par l’application.

# Resultat: 
- Tout fonctionne correctement. Au debut certains elements nous parraissaient un peu bizare (comme des noms de fichiers ou de types) mais au final tout fonctionne correcttement. 

- Dans le backend, ces fichiers ont ete créer : un controller, un mapper, un models, un repositories, un service et un fichier de migration dans lequel il cree le table de candidature. 
=> il suit donc l'architecture du projet.

- Dans le frontend, un hook, un model, une page, un service et un fichier de test ont ete crée.
La navbar et la table des offres ont etée modifiée ainsi que le guards et le labels. la route a aussi ete ajoutée dans app.tsx.

# Validation fonctionnelle: 
- Tout fonctionne correctement. En tant qu'etudiant, on peut postuler avec ou sans message. On peut annuler une candidature. Les entreprises ne peuvent pas encore voir les candidature et donc pas les messages.

# Qualité 
- A premiere vue on s'est pose des question par rapport au code fourni mais en fait il est de qualite. il a une structure similaire a celui du projet. 

# Tests et commandes
- Commande exécutée à la racine :
npm run check — réussi


Cette commande a exécuté lint, vérification TypeScript, tests et builds. Résultat : 
**10 fichiers backend et 129 tests réussis ; 8 fichiers frontend et 52 tests réussis ; builds backend et frontend réussis**. Exemple de comportement couvert : une deuxième candidature pour une offre reste refusée après le retrait de la première.