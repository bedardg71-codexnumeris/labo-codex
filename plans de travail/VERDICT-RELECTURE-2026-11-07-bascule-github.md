# Verdict de relecture : la bascule GitHub (trois commits, #1114)

> Cowork, samedi 7 novembre 2026, 8 h 04 (Toronto). Relu : `5b99c2cf`, `7a2f40d8` et `869d6859` (`git show` de chacun), au-dessus de `origin/main` = `0f76efb6`.

## Verdict

**Accepté, avec une retouche avant le verdict complet de ce soir** (§ 2), plus une phrase de commentaire à corriger (§ 3). Ordre : retouches maintenant (Vitest seul), verdict complet ce soir au signal de Grégoire, push si vert. Le § 4 ne demande rien.

## 1. Ce qui a été mesuré, et tient

- **Image épinglée** sur les quatre jobs ; la clé du cache de WebKit porte `ImageOS` (`git show 5b99c2cf -- .github/workflows/tests.yml`).
- **« NON JUGÉ » reste rouge.** `nonJuge` appelle `conclure(2)`, et l'étape « Fusionner et juger contre la baseline » n'a pas de `continue-on-error` : un run non jugé ne passe jamais vert en silence.
- **`paths-ignore`** : les 26 `.md` suivis à la racine (`git ls-files '*.md' | grep -v /`) y sont tous. Aucun des 9 ajoutés n'est nommé dans `js/`, `index.html` ni les `.html` de la racine (grep vide), et il n'y a pas de service worker.
- **20 morceaux, plafond de 41 min** = ⌈30,1 × 4/3⌉ : conforme à la règle du tiers de marge.
- **Baseline** : les 7 entrées venues des intermittentes étaient déjà excusées. Leur passage aux connues ne change pas ce que le juge ignorait.

## 2. La retouche : un seul lancement raté rend tout le run « non jugé »

`parcourir` lit TOUS les `results` de chaque essai, seconds essais compris, et un seul message `browserType.launch` déclare le run entier NON JUGÉ.

Cas qui casse : une spec dont le navigateur rate son lancement au premier essai et passe au second. Le run rougit « NON JUGÉ », et la liste des vraies régressions parmi les quelque 1 380 autres essais n'est jamais imprimée. Le juge tairait alors exactement ce qu'il doit dire.

Attendu, au minimum : seul le DERNIER résultat de chaque essai compte. Si c'est simple, juger aussi les essais qui ont tourné, et nommer à part ceux qui n'ont rien jugé ; la forme est à toi. Témoins : un rapport où un lancement raté au premier essai repasse au second rend le verdict ordinaire (0 ou 1) ; le rapport de `ff3a91bf` rend toujours 2.

## 3. Une phrase fausse dans le commentaire de `869d6859`

« aucun n'attend une machine » : le job `vitest` n'a pas de `needs` et tourne en même temps que les 20 morceaux, soit 21 jobs pour une limite de 20 (celle-ci, tirée de la documentation, n'est pas mesurée sur le compte). Un morceau peut donc attendre la fin de Vitest (inférence). Sans conséquence sur le plafond, puisque `timeout-minutes` court à partir du démarrage du job et non de la file d'attente, mais la phrase est à corriger.

## 4. Limite assumée, sans fiche

Le juge de GitHub excuse désormais 65 essais, dont 35 toujours rouges sous Linux. Parmi les 7 nouveaux, il y a un calcul de note (`standards-sans-portfolio-lot-4`, CHIM-1) et un enregistrement qui survit au rechargement (`tampons-masques-bibliotheque-1216`). Ils passent sur le Mac (verdict vert de `ff3a91bf`, 4 rouges connus, tous `temoin-enregistrement-lot-b`) : pour ces essais, le verdict du Mac est désormais le seul juge. Aucune fiche, faute de symptôme vécu ; c'est écrit ici pour qu'on ne le découvre pas plus tard.

## 5. Retouche relue (8 h 24) : acceptée

`7d16cc0d` : seul le dernier résultat compte (`sansNavigateurDuRapport`), les specs sans navigateur sortent des échecs et sont nommées à part, une régression l'emporte (code 1), sinon un essai sans navigateur rend 2. Vérifié aussi : une spec connue sans navigateur ne passe pas pour « réparée » (`reparees` exige qu'elle soit parmi les vertes) ; elle tombe dans `nonJouees`. Commentaire des 20 morceaux corrigé. Rien d'autre à reprendre.

Ce soir : verdict complet au signal de Grégoire, push si vert. Le bloc Cowork du 7 nov. en tête de `RELAIS.md` et ce verdict entrent au commit de relais.
