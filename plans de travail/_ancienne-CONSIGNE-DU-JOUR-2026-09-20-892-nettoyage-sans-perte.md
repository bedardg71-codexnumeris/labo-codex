# Consigne en attente – « Proposer un nettoyage » n'efface plus que ce qui est déjà exporté (#892)

> Écrite le 20 septembre 2026, 18 h 46 (Toronto), par Cowork.

> **Décision de Grégoire, 20 sept. au soir, en deux temps** : (1) le bouton cesse d'effacer sans retour – « je ne veux pas qu'on efface des données de façon irréversible » ; (2) il ne propose que les copies **déjà exportées**, et s'il n'y en a aucune, il n'efface RIEN et mène vers l'exportation. Écarté, avec son motif : passer par la corbeille – elle garde 30 jours puis vide, donc l'espace ne se libère qu'après, alors que le bouton ne paraît que lorsque l'espace manque déjà.
> **En attente** : elle part après le lot en cours. Au départ : archive `CONSIGNE-DU-JOUR.md` sous `_ancienne-CONSIGNE-DU-JOUR-<date>-<sujet>.md`, puis renomme ce fichier en `CONSIGNE-DU-JOUR.md`.
> **Condition de départ** : `git --no-optional-locks log origin/main` porte 1.151.5 (`19f21704`) ou plus récent. Aucune autre session n'écrit dans `js/`.
> ✅ **Les textes du §5 sont VALIDÉS par Grégoire le 20 sept. 2026, 18 h 48 (Toronto), tels quels** : « ok », sans retouche. Les poser mot pour mot ; aucun mot neuf à l'écran sans un nouveau passage par lui.

---

## 1 · Ce qui se passe aujourd'hui

`proposerNettoyage` (`js/travaux-ui.js`, ≈ l. 3712) trie les fichiers du groupe par date d'import, en prend **la moitié la plus ancienne**, demande un `confirm` natif (« Assure-toi d'avoir archivé ces fichiers ») puis appelle `nettoyerFichiersArchives` → blob, vignette et métadonnées effacés, **sans corbeille et sans vérifier que le fichier est sorti**. Le nom « archives » promet un tri sur `blobStatut === 'exporte'` qui n'a pas lieu. Les évaluations qui pointaient ces fichiers deviennent « sans fichier » pour Léa. Le bouton ne paraît qu'au-delà de 70 % du quota.

## 2 · Ce qui est attendu

1. **Le candidat au nettoyage est un fichier EXPORTÉ, point.** Critère mesuré : `blobStatut === 'exporte'` **et** `dateExport` présente. La moitié la plus ancienne cesse d'être le critère ; l'âge ne sert plus qu'à ordonner la liste.
2. ⚠ **Les marques d'export antérieures au 16 septembre 2026 ne sont pas fiables** : « Exporté » n'est posé que sur ce qui est réellement parti depuis 1.142.17, et le stock mal marqué chez les testeurs le reste (fiche #891). ⮕ Un fichier sans `dateExport` n'est JAMAIS proposé. Un fichier dont la `dateExport` précède le 16 septembre 2026 n'est pas proposé non plus, et le dis en une phrase à l'écran (§5). **Mesure d'abord** combien de fichiers du pack démo tombent dans chaque cas.
3. **Rien ne s'efface sans que la liste soit VUE.** Le `confirm` natif, qui ne montre rien, est remplacé par une liste nommant chaque fichier (élève, production, taille, date d'export) et le total libéré. Le geste est explicite, et la liste tient sur iPad.
4. **Aucun exporté ? Rien ne s'efface** : l'écran dit pourquoi et mène à « Exporter et archiver » (§5).
5. **Les évaluations qui pointent un fichier retiré** : mesure ce qu'elles deviennent après coup et dis-le dans la liste si le cas se présente – ne change pas leur sort dans ce lot.

## 3 · Arrêts

- Si `nettoyerFichiersArchives` est appelé ailleurs qu'ici : arrête-toi, nomme les appelants, ne change rien de leur côté.
- ⛔ Aucune suppression automatique, aucune purge, aucun raccourci « tout nettoyer ». Si la mesure montre qu'un chemin du lot pourrait effacer un fichier non exporté, arrête-toi : c'est la limite posée par Grégoire.
- Le seuil de 70 % ne bouge pas.

## 4 · Preuve

- Sentinelle sur la sélection : un fichier non exporté, un fichier « exporté » sans `dateExport`, un exporté du 10 septembre, un exporté d'hier → seul le dernier est proposé. Mutations : critère retombé sur « la moitié la plus ancienne », `dateExport` ignorée, borne du 16 septembre retirée → rouges.
- Banc WebKit par le vrai geste : quota forcé au-dessus du seuil, liste affichée, annulation → rien n'est supprimé ; confirmation → seuls les exportés partent, et le compte affiché correspond.
- Stock : aucune donnée réécrite hors des fichiers explicitement retirés.
- Patch par `scripts/release.mjs`. Entrée de « Nouvelles » : une ligne, proposée.

## 5 · Les textes validés (à poser tels quels)

**Quand il y a des copies exportées**

> **Libérer de l'espace.** Ces copies ont déjà été exportées : leur fichier existe ailleurs, sur ton ordinateur. Les retirer d'ici libère de l'espace tout de suite. Les copies qui n'ont pas encore été exportées ne sont jamais proposées.
> [liste : élève · production · taille · exportée le …]
> Bouton : « Retirer ces N copies (X Mo) »

**Quand il n'y en a aucune**

> **Rien à retirer sans risque.** Aucune copie de ce groupe n'a encore été exportée : les retirer les perdrait. Exporte-les d'abord dans « Exporter et archiver », puis reviens ici.

**Quand des copies portent une vieille marque d'export**

> N copies portent une marque d'exportation antérieure au 16 septembre 2026, que l'application ne garantit pas. Elles ne sont pas proposées : exporte-les de nouveau si tu veux les retirer.
