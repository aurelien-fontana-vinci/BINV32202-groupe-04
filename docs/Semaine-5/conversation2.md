User: Semaine 10 — MCP et tests end-to-end avec
Playwright
Objectif de la séance
— Comprendre le rôle de MCP et la différence entre un serveur MCP local et distant.
— Utiliser un serveur MCP avec GitHub Copilot dans VS Code.
— Vérifier une fonctionnalité de l’application en pilotant un navigateur avec Playwright
MCP.
— Générer des tests end-to-end automatisés avec Playwright Test, sans passer par MCP.
— Comparer une vérification interactive par l’agent et des tests reproductibles.
1. Préparer deux scénarios de tests end-to-end
En semaine 9, vous avez développé la recherche d’offres par titre (EF-30), examiné des tests
en privilégiant l’API et essayé la recherche dans le navigateur. Les séances précédentes ne
demandaient pas de tests end-to-end automatisés. Vous allez maintenant en créer : ces tests
end-to-end (E2E) passent par l’interface et vérifient le fonctionnement de l’application dans
son ensemble.
Relisez les règles de recherche de la semaine 9 et retrouvez les cas essayés dans votre bilan
docs/semaine-4.md, ainsi que les tests préparés à cette occasion. Choisissez deux cas qui
peuvent être vérifiés depuis l’interface ; précisez-les ou complétez-les si nécessaire :
— Un cas nominal : le comportement attendu dans une situation courante.
— Un cas limite ou particulier : par exemple une recherche sans résultat.
Pour chacun, précisez l’état initial (y compris les données nécessaires), les actions à effectuer
dans l’interface et le résultat observable attendu. Ne vous contentez pas de « la fonctionnalité
marche ».
Numérotez-les scénario 1 et scénario 2. Par exemple :
1
Numéro Scénario
Actions dans
l’interface Résultat attendu
1 Recherche avec
résultat
Saisir un mot présent
dans le titre d’une
offre publiée
Seules les offres
correspondantes et
visibles sont affichées
2 Recherche sans
résultat
Saisir un texte qui ne
correspond à aucune
offre
Aucune offre
correspondante n’est
affichée
Créez le répertoire e2e/recherche-offres/ à la racine du projet et décrivez les deux scénarios
numérotés dans e2e/recherche-offres/scenarios.md. L’exemple ci-dessus ne précise pas
tout l’état initial : indiquez notamment le rôle utilisé, les offres nécessaires et leur visibilité.
Adaptez les résultats aux règles de la semaine 9 et à vos choix documentés. Définissez-les avant
de demander à Copilot d’exécuter ou de générer les tests.
Ce répertoire regroupera les scénarios et les tests automatisés de cette fonctionnalité. Pour
d’autres fonctionnalités, vous pourrez créer d’autres sous-répertoires dans e2e/.
2. Tester un scénario avec Playwright MCP
Comprendre ce que l’on installe
MCP (Model Context Protocol) est un protocole permettant à une application utilisant un
LLM de découvrir et d’appeler les outils exposés par un serveur MCP. Dans cette séance :
— Client MCP : GitHub Copilot dans VS Code, en mode Agent.
— Serveur MCP local : Playwright MCP, lancé par vos soins sur votre machine et
accessible à Copilot par HTTP sur localhost.
— Outils : navigation, clics, saisie de texte et consultation de l’état d’une page web.
HTTP ne signifie pas nécessairement que le serveur est distant : ici, il tourne sur votre machine.
Un serveur MCP peut aussi être distant, par exemple pour accéder à des données ou à un
service externe. Il peut alors demander une authentification ; celui de Playwright utilisé ici n’en
demande pas.
MCP n’est pas indispensable pour piloter un navigateur : on peut aussi écrire du code Playwright.
Son intérêt ici est de rendre les actions du navigateur directement disponibles sous forme d’outils
pour l’agent.
2
Démarrer le serveur et connecter Copilot
Ouvrez le dossier racine de votre projet dans VS Code, comme lors des séances précédentes.
Dans un terminal, à la racine du projet, lancez vous-mêmes le serveur :
npx -y @playwright/mcp@latest --isolated --port 8931
Laissez ce terminal ouvert pendant l’activité. Le premier lancement peut nécessiter le téléchar-
gement du paquet ou d’un navigateur. L’option --isolated utilise un profil de navigateur
isolé : la connexion et les cookies ne sont pas conservés après la fermeture de la session.
Le serveur et le navigateur sont démarrés par votre terminal, en dehors de la sandbox de
Copilot : ils disposent des accès de votre compte utilisateur. Copilot reste soumis à sa propre
sandbox. Le serveur écoute sur localhost : ne l’exposez pas sur le réseau.
Pour une session Copilot récente, créez le fichier .mcp.json à la racine du projet (pas dans
frontend/ ni dans .vscode/) :
{
"mcpServers": {
"playwright": {
"type": "http",
"url": "http://localhost:8931/mcp",
"tools": ["*"]
}
}
}
Enregistrez le fichier et lancer un chat. VS Code se connecte au serveur déjà lancé dans le
terminal. Acceptez, si nécessaire, les demandes de confiance ou d’autorisation.
Pour vérifier la configuration, ouvrez la palette de commandes (Ctrl+Shift+P, ou Cmd+Shift+P
sur Mac) et lancez MCP : List Servers, ou ouvrez Chat : Open Customizations, puis
MCP Servers. Recherchez playwright dans le contexte de la session Copilot et vérifiez que
ses outils sont disponibles dans le chat. L’exécution d’un appel Playwright dans l’étape suivante
confirme que la connexion fonctionne.
Si la connexion échoue, vérifiez que le terminal du serveur est toujours ouvert, que le port est
bien 8931 dans la commande et dans l’URL, et consultez les messages du terminal. Si le serveur
n’apparaît pas, vérifiez le nom et l’emplacement du fichier, son JSON et le dossier ouvert dans
VS Code. Les intitulés et options peuvent varier selon la version de VS Code.
Si une configuration .mcp.json existe déjà, ajoutez l’entrée playwright dans mcpServers sans
supprimer les autres serveurs. Si une entrée playwright en stdio existe déjà, remplacez-la par
3
l’entrée HTTP ci-dessus pour éviter un doublon. L’ancien fichier .vscode/mcp.json utilise la
clé servers : ne mélangez pas les deux formats.
Lancez votre backend et votre frontend avec les commandes habituelles du projet. Vérifiez
vous-même que l’application est accessible dans un navigateur avant de poursuivre.
Exécuter le scénario
Choisissez l’un des deux scénarios et indiquez son numéro dans la demande à Copilot. Par
exemple, pour le scénario 1 :
Utilise les outils du serveur Playwright MCP pour exécuter le scénario 1
décrit dans e2e/recherche-offres/scenarios.md.
Ouvre l'application en local, réalise les actions dans l'interface et
vérifie les résultats attendus. Ne modifie pas le code de l'application
et ne génère pas de script de test.
À la fin, indique les actions réellement effectuées, les observations
et les écarts éventuels avec le scénario.
Observez les appels d’outils dans la conversation : par exemple browser_navigate,
browser_snapshot, browser_click ou browser_type. Repérez pour au moins deux appels
l’outil utilisé et les informations renvoyées à l’agent.
Vérifiez le résultat dans l’application. Une affirmation de Copilot ne suffit pas : il faut
constater que le navigateur a été piloté et que les observations correspondent au scénario. Si
un problème apparaît, documentez-le ; ne demandez pas immédiatement à Copilot de masquer
l’échec en modifiant l’application.
Une fois l’exploration terminée, arrêtez le serveur MCP avec Ctrl+C dans le terminal où vous
l’avez lancé. Vous n’en aurez pas besoin pour la suite.
3. Générer des tests automatisés avec Playwright Test
Cette fois, nous voulons des scripts de tests versionnés et réexécutables sans agent IA. Cela
peut-être utile pour mettre ces tests dans un chaîne CI/CD, ou tout simplement pour être sûr
de toujours rééxécuter les même test sans avoir une interprétation probabiliste de l’IA. Il ne
faut pas utiliser MCP pour cette activité.
4
Installer Playwright Test
Placez-vous à la racine du projet et exécutez :
npm init playwright@latest
Choisissez TypeScript, installez le navigateur nécessaire et indiquez e2e comme répertoire
des tests. Conservez playwright.config.ts à la racine. Si Playwright Test est déjà présent,
réutilisez l’installation existante : n’écrasez pas sa configuration.
Vérifiez dans playwright.config.ts que testDir pointe vers ./e2e. Les tests doivent cibler
l’URL locale réelle du frontend. Vous pouvez demander à Copilot de configurer baseURL et, si
c’est adapté au projet, webServer pour démarrer automatiquement le frontend. Assurez-vous
aussi que le backend est démarré et que les données nécessaires sont disponibles.
Créer et lancer les tests
Demandez à Copilot de générer les tests pour les deux scénarios :
À partir des scénarios 1 et 2 de e2e/recherche-offres/scenarios.md,
génère des tests end-to-end avec Playwright Test et TypeScript dans
e2e/recherche-offres/recherche-offres.spec.ts.
Indique le numéro du scénario dans le nom de chaque test.
N'utilise pas MCP : produis des fichiers de test classiques.
Les tests doivent passer par l'interface utilisateur, vérifier les
résultats avec des assertions explicites et utiliser des sélecteurs
robustes. Prévois des données de test maîtrisées pour que les tests
soient répétables et ne dépendent pas de leur ordre d'exécution.
Exécute les tests. Si un test échoue, explique d'abord si le problème
vient du test, de sa configuration ou de l'application. Ne modifie pas
le code applicatif sans mon accord.
Examinez les fichiers générés. Pour chaque scénario, identifiez les actions et les assertions
qui vérifient les résultats attendus. Une suite de clics sans assertion pertinente n’est pas un test
suffisant.


peux tu me confoimé que tout ceci a bien été fait 

Copilot: Requested chat rename
Completed with input: {
  "title": "Vérifier les tests E2E",
  "automatic": true
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\e2e\\recherche-offres\\scenarios.md"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\e2e\\recherche-offres\\scenariosIA.md"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\playwright.config.ts"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\package.json"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\docs\\Semaine-4\\Bilan.md"
}

"Read" failed
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\e2e\\recherche-offres\\recherche-offres.spec.ts"
}
Tool execution failed: Path does not exist

Les scénarios et la configuration existent, mais le fichier de tests attendu n’apparaît pas au chemin prévu. Je vérifie les autres éléments E2E et les traces de la séance pour distinguer ce qui est réellement terminé de ce qui reste à faire.

Find files matching `e2e/**/*`

Search for `Playwright|MCP|scénario|scenario|recherche-offres|browser_navigate|browser_sn...`

Ran terminal command: git status --short; Get-ChildItem -Force -Name .mcp.json, .vscode\mcp.json, playwright.config.ts, e2e\recherche-offres\recherche-offres.spec.ts -ErrorAction SilentlyContinue;
Tool execution failed with exit code 1

Read , lines 88 to 122
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\docs\\Semaine-5\\conversation1.md",
  "view_range": [
    88,
    122
  ]
}

Read , lines 150 to 260
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\docs\\Semaine-5\\conversation1.md",
  "view_range": [
    150,
    260
  ]
}

Read , lines 290 to 371
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\docs\\Semaine-5\\conversation1.md",
  "view_range": [
    290,
    371
  ]
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\.mcp.json"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\e2e\\example.spec.ts"
}

Non, **tout n’a pas été fait**.

- **Scénarios : partiellement fait.** `scenarios.md` contient deux scénarios numérotés avec des actions et des résultats attendus, mais ne précise pas l’état initial demandé (rôle et offres nécessaires). `scenariosIA.md` contient davantage de détails, mais ses scénarios ne correspondent pas exactement à ceux de `scenarios.md`.
- **Configuration MCP : présente, exécution non confirmée.** `.mcp.json` déclare bien Playwright en HTTP sur `localhost:8931`. Toutefois, le bilan de séance indique que le scénario n’a pas été exécuté : l’accès à l’application locale était bloqué et aucune observation dans le navigateur n’a été faite. Voir `conversation1.md`.
- **Tests Playwright Test : non terminés.** Playwright est dans les dépendances et `playwright.config.ts` cible `./e2e`, mais le fichier demandé `e2e/recherche-offres/recherche-offres.spec.ts` est absent. Le seul test présent est l’exemple Playwright par défaut, qui teste `playwright.dev` dans `example.spec.ts`. Je n’ai donc trouvé aucun test automatisé de recherche ni de résultat d’exécution correspondant.

**Conclusion :** la base documentaire et la configuration MCP existent, mais l’exécution interactive MCP et les deux tests E2E reproductibles restent à réaliser.

User: À partir des scénarios 1 et 2 de e2e/recherche-offres/scenariosIA.md,
génère des tests end-to-end avec Playwright Test et TypeScript dans
e2e/recherche-offres/recherche-offres.spec.ts.
Indique le numéro du scénario dans le nom de chaque test.
N'utilise pas MCP : produis des fichiers de test classiques.
Les tests doivent passer par l'interface utilisateur, vérifier les
résultats avec des assertions explicites et utiliser des sélecteurs
robustes. Prévois des données de test maîtrisées pour que les tests
soient répétables et ne dépendent pas de leur ordre d'exécution.
Exécute les tests. Si un test échoue, explique d'abord si le problème
vient du test, de sa configuration ou de l'application. Ne modifie pas
le code applicatif sans mon accord.

Copilot: Read skill `test-driven-development`
Completed with input: {"skill":"test-driven-development"}

Je vais d’abord vérifier les scénarios, les parcours de connexion/catalogue et les données de démonstration pour écrire des tests UI reproductibles sans toucher au code applicatif. Ensuite, je les exécuterai et te présenterai leur résultat avant toute éventuelle modification de l’application.

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\.github\\skills\\obrasuperpowersmainskills-test-driven-development\\writing-good-tests.md"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\e2e\\recherche-offres\\scenariosIA.md"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\pages\\OffersPage.tsx"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\pages\\LoginPage.tsx"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\App.tsx"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\docs\\seed.md"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\backend\\API.md"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\playwright.config.ts"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\package.json"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\components\\SearchField.tsx"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\components\\DemoUserGroup.tsx"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\components\\OfferTable.tsx"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\components\\NavBar.tsx"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\backend\\src\\db\\seed\\offersData.ts"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\backend\\src\\db\\seed\\peopleData.ts"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\vite.config.ts"
}

Ran terminal command: node --version; npm --version; Test-Path node_modules\@playwright\test; Test-Path backend\.env; Test-Path backend\data
Tool execution failed with exit code 1

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\hooks\\useOffers.ts"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\hooks\\useAuth.ts"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\components\\Layout.tsx"
}

Ran terminal command: npm.cmd --version; Test-Path node_modules\@playwright\test; Test-Path node_modules\playwright\browsers; Get-NetTCPConnection -State Listen -LocalPort 5173,3000 -ErrorAction SilentlyContinue | Select-Object LocalAddress,LocalPort,OwningProcess
Tool execution failed with exit code 1

Edit 

Ran terminal command: npx.cmd playwright test e2e\recherche-offres\recherche-offres.spec.ts --project=chromium --reporter=list
Tool execution failed with exit code 1

Ran terminal command: Get-Item e2e\recherche-offres\recherche-offres.spec.ts | Select-Object FullName,Length; npx.cmd playwright test --config=playwright.config.ts --list

Ran terminal command: npx.cmd playwright test --project=chromium --grep "Scénario" --reporter=list
Tool execution failed with exit code 1

Les deux tests sont bien découverts. Leur première exécution n’a pas atteint l’application : Playwright ne trouve pas Chromium dans cet environnement. Je tente l’installation du navigateur requis, puis je relancerai uniquement ces deux scénarios.

Ran terminal command: npx.cmd playwright install chromium
Tool execution failed with exit code 1

L’installation de Chromium a été bloquée par la politique réseau du sandbox (`EACCES` vers `cdn.playwright.dev`). Je ne tente pas de contournement. Je vérifie localement que le fichier est bien chargé par Playwright et qu’il ne contient pas d’erreur de format, puis je te donne le statut exact.

Ran terminal command: npx.cmd playwright test --list --project=chromium --grep "Scénario"; git diff --check -- e2e\recherche-offres\recherche-offres.spec.ts; git status --short -- e2e\recherche-offres\recherche-offres.spec.ts

J’ai créé les deux tests dans `recherche-offres.spec.ts`. Ils passent par l’interface, se connectent comme Lucas Dupont et utilisent des sélecteurs accessibles. Le scénario 1 vérifie le résultat attendu et l’absence de l’offre attribuée ; le scénario 2 vérifie l’absence de lignes et l’affichage du message d’état vide.

**Résultat des vérifications :**
- Playwright découvre bien les deux tests : `--list` les a listés.
- Leur exécution a échoué avant d’ouvrir l’application : Chromium n’est pas installé. La tentative d’installation a été bloquée par le sandbox (`EACCES` vers `cdn.playwright.dev`). L’échec vient donc de l’environnement de test, pas d’une assertion ni d’un défaut constaté dans l’application.
- L’application doit aussi être démarrée sur `localhost:5173` et utiliser les données de démonstration documentées. Les tests ne modifient pas les données ; pour retrouver le jeu initial, la réinitialisation de la base est nécessaire et affecte la base locale.

Je n’ai pas modifié le code applicatif. Pour relancer les tests, il faudra autoriser le téléchargement depuis `cdn.playwright.dev` dans la politique réseau du sandbox, puis installer Chromium.

Valides-tu ces deux tests et leurs assertions ? J’attendrai ta validation avant toute modification du code applicatif.

User: mes tests verifient t'il les deux scenarios ?

Copilot: Oui, les deux scénarios sont bien couverts par `recherche-offres.spec.ts` :

1. **Recherche avec résultat** : vérifie qu’une seule offre apparaît, que c’est celle attendue, et que l’offre attribuée n’est pas affichée.
2. **Recherche sans résultat** : vérifie qu’aucune ligne d’offre n’apparaît et que le message « Aucune offre ne correspond à votre recherche. » est visible.

Les tests sont écrits, mais je n’ai pas pu confirmer qu’ils passent : Chromium manque et son téléchargement a été bloqué par le sandbox.

User: Choisissez un des tests automatisés. Introduisez temporairement un défaut simple dans le
code de l’application (par exemple, désactiver le filtrage de la recherche). Relancez le test :
il doit échouer à cause du défaut introduit, et non d’une erreur de configuration ou de
connexion.
Restaurez ensuite le code initial et relancez le test : il doit réussir à nouveau. Ne conservez pas
le défaut dans votre PR.

Copilot: Je ne peux pas faire cette vérification de façon fiable pour l’instant : les tests de `recherche-offres.spec.ts` n’ont pas encore démarré Chromium. Son téléchargement a été refusé par le sandbox (`EACCES` vers `cdn.playwright.dev`).

Sans exécution de référence réussie, un échec après mutation ne permettrait pas de distinguer le défaut injecté d’un problème d’environnement. Je n’ai donc pas touché au code de l’application. Il faut autoriser l’accès réseau du sandbox à `cdn.playwright.dev` — ou rendre Chromium disponible — puis je pourrai vérifier le cycle **test réussi → défaut détecté → code restauré et test réussi**.

User: change le code je lancerai les test 

Copilot: D’accord. Je vais introduire un défaut temporaire ciblé sur le filtrage par titre, sans toucher aux autres fichiers, pour que tu puisses lancer le scénario 1. Je garde en tête qu’il faudra restaurer ce changement après ta vérification.

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\frontend\\src\\services\\offers.service.ts"
}

Read 
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\backend\\src\\repositories\\offers.repository.ts"
}

Ran terminal command: git diff -- frontend/src/services/offers.service.ts backend/src/repositories/offers.repository.ts

Edit 

Read , lines 31 to 45
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\backend\\src\\repositories\\offers.repository.ts",
  "view_range": [
    31,
    45
  ]
}

Read , lines 42 to 50
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\backend\\src\\repositories\\offers.repository.ts",
  "view_range": [
    42,
    50
  ]
}

J’ai introduit le défaut temporaire dans `offers.repository.ts` : le filtre par titre est désactivé (`pattern: null`). Avec l’application démarrée et les données de démonstration initialisées, le scénario 1 devrait échouer sur l’assertion qui attend une seule offre.

Tu peux le lancer avec :

```powershell
npx playwright test --project=chromium --grep "Scénario 1"
```

Je ne l’ai pas exécuté ici, car Chromium n’est pas disponible dans le sandbox. Envoie-moi le résultat et je restaurerai le filtrage initial.

User: Répondez brièvement aux questions suivantes :
1. Que permet Playwright MCP dans la conversation avec l’agent ? Quelle action précise
avez-vous vu passer par un outil MCP ?
2. Qu’apportent les scripts Playwright Test que le compte rendu d’un test par MCP
n’apporte pas ?
3. Dans quel cas préféreriez-vous une exploration interactive avec MCP ? Dans quel cas
préféreriez-vous un test automatisé ?
Les deux approches sont complémentaires. MCP permet à l’agent d’interagir avec
l’application ; Playwright Test permet de conserver des vérifications exécutables
indépendamment de l’agent. Le serveur MCP ne remplace pas une suite de tests automati-
sés.

Copilot: 1. **Playwright MCP** donne à l’agent des outils pour piloter un navigateur et observer l’application. Dans notre session, aucune action navigateur MCP n’a abouti ; je ne peux donc pas en citer une comme observée. `browser_navigate` suivi de `browser_snapshot` serait un exemple, mais pas un fait de notre séance.
2. **Playwright Test** fournit des tests versionnés, reproductibles et exécutables sans agent, avec des assertions explicites. Un compte rendu MCP décrit une exploration ponctuelle, sans garantir qu’elle pourra être rejouée à l’identique.
3. Je choisirais **MCP** pour explorer une interface ou investiguer un comportement encore incertain ; un **test automatisé** pour vérifier régulièrement un parcours défini, notamment en CI.

**À noter :** le défaut temporaire du filtrage est encore présent dans `offers.repository.ts`.

User: peux tu revenir en arriere dans ce fichier

Copilot: Edit 
Completed with input: {"path":"A:\\HE_VINCI\\BINV32202-groupe-04\\backend\\src\\repositories\\offers.repository.ts"}
Tool execution failed

User: #attachment:bilan.md verifie l'ortjhographe et les tournures de phrases

Copilot: Je relis le bilan et corrige uniquement l’orthographe, la grammaire et les formulations, sans modifier le fond.

Read []()
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\docs\\Semaine-5\\bilan.md"
}

Edit []()

Read [](), lines 1 to 34
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\docs\\Semaine-5\\bilan.md",
  "view_range": [
    1,
    34
  ]
}

Read [](), lines 35 to 90
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\docs\\Semaine-5\\bilan.md",
  "view_range": [
    35,
    90
  ]
}

Read [](), lines 145 to 190
Completed with input: {
  "path": "A:\\HE_VINCI\\BINV32202-groupe-04\\docs\\Semaine-5\\bilan.md",
  "view_range": [
    145,
    190
  ]
}

Ran terminal command: git diff --check -- docs\Semaine-5\bilan.md
Tool execution failed with exit code 2

Edit []()

Ran terminal command: git diff --check -- docs\Semaine-5\bilan.md

J’ai corrigé l’orthographe, les accords et les formulations dans [bilan.md](), notamment la section MCP, la numérotation des réponses et la remarque sur Kali Linux. Le fond et les résultats rapportés sont conservés.

`git diff --check` ne signale plus d’erreur.