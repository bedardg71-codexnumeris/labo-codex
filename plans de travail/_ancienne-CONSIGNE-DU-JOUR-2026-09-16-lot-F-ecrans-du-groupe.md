# Consigne du jour – lot F des règles du dépistage : les écrans du groupe (#860, #828)

> Écrite le 16 septembre 2026, 20 h 40 (Toronto), sur `80b8a556` (`1.142.20` en ligne).
> Elle REMPLACE la précédente, archivée sous `_ancienne-CONSIGNE-DU-JOUR-2026-09-16-complement-lot-A-1.142.20.md`.

Mandat (Grégoire, 16 sept. 2026, soir) : lot F du chantier « Les règles du dépistage » (`plans de travail/CADRAGE-2026-09-16-regles-du-depistage.md`), « Les écrans du groupe » : #860 et #828, tranchés le 16 à 17 h 18 (lis la ligne « ✅ TRANCHÉ » sous chaque fiche). **Le libellé du filtre est validé par Grégoire ce soir : « A ou C < 70% »** (aujourd'hui « A+C < 65% »).

## 1 · Le filtre de Suivi du groupe › Détails (#828)

- Le bouton `{ id: 'M', label: 'A+C < 65%' }` (`js/tableau-bord-apercu.js`, vers 427) devient « A ou C < 70% ». Le filtre retient l'élève dont l'assiduité OU la complétion est sous la borne « critique » du profil : `BORNES_MOBILISATION.critique` (`js/contexte-qualification.js`, 0,7, exporté sur window). **Le 70 du libellé se lit à cette même source**, jamais recopié : si la borne change, le bouton suit.
- `appliquerFiltres` (vers 323) filtre aujourd'hui `e.M >= 65` ; le tri d'urgence (vers 345) lit `65 - e.M`. Les deux passent à la règle A OU C. ⚠ Un A ou un C absent (null, non constructible, barre vide de #830) ne doit pas passer pour « sous 70 » : en JavaScript, `null < 70` est vrai. Garde de lecture comme celle du filtre P (G-4, #749 : on filtre sur ce qui est MONTRÉ).
- L'identifiant `'M'` : garde-le ou renomme-le, c'est technique ; mesure d'abord s'il est écrit quelque part (préférence, stockage) et dis ce que tu as choisi.

## 2 · Les bandes d'échelle sous les courbes du groupe (#860)

- Retirer les zones (et les lignes pointillées et étiquettes que `pluginEtiquettesZones` dessine avec elles) de deux graphiques : (a) les courbes du groupe, indice P (`creerGraphiqueGroupeSpaghettiACP`) ; (b) les trajectoires en mode « Note finale » (`creerGraphiqueTrajectoiresProduction`). Motif : la décision de Grégoire du 13 sept. (1.140.7, graphique des indices du profil) – un pourcentage agrégé ne se situe pas dans une échelle de performance. Retirer, pas réparer.
- ⛔ **Hors fiche, à ne pas toucher** : le mode « Habiletés » des trajectoires et le graphique par critère (#752), qui lisent l'échelle de LEURS évaluations.
- Code mort à retirer avec (fiche #860, grep du 13 sept., à remesurer) : `creerAnnotationsZones` et `creerAnnotationsZonesIDME` sans appelant. Si `ZONES_IDME` et le repli de `genererZonesDepuisEchelle` n'ont plus de lecteur vivant après le retrait, ils partent aussi ; sinon, dis qui les lit encore.
- **L'Aide des trajectoires** (`index.html`, vers 7585) : « Les lignes pointillées aux seuils 65 % (D), 75 % (M), 85 % (E) viennent de l'échelle de notation utilisée. Les zones colorées en arrière-plan correspondent aux niveaux IDME (ou personnalisés). » Elle devient fausse pour « Note finale ». **Ces mots, les collègues les lisent : propose-les à Grégoire avant de les figer.** Texte de départ de Cowork, à vérifier contre ce que l'écran dessine après ton retrait : « En mode Habiletés, les lignes pointillées et les zones colorées viennent de l'échelle de tes évaluations. Le mode Note finale n'en affiche pas. » Cherche aussi (grep) une aide ou une légende qui décrit les zones des courbes du groupe (a).

## Preuve

- Une sentinelle qui exécute `appliquerFiltres` réel sur un groupe de banc : A 65 / C 90 retenu et A 90 / C 65 retenu (l'ancienne règle, M ≥ 65, écartait les deux) ; A 72 / C 72 écarté ; A 60 / C 80 retenu (M = 70 : l'ancienne règle l'écartait) ; A absent / C 90 écarté ; libellé lu à la borne (mute la borne, le libellé change). Pour les graphiques : les deux configurations Chart.js n'ont plus de zones ni de lignes de seuil, et le mode « Habiletés » les garde.
- Break-test : chaque assertion neuve rougit sous sa mutation (ancienne règle M remise, 70 recopié en dur, garde du A absent retirée, zones remises sur (a) puis sur (b), zones retirées du mode Habiletés). Cowork en posera d'autres à la relecture.
- Vitest depuis `tests/`, puis le verdict Playwright sur le commit final, Cowork fermé. **Porte terrain : aucune attendue** – une machine juge la configuration des graphiques. Si le bouton « A ou C < 70% » se casse sur deux lignes à 768 px sous WebKit, dis-le au lieu d'ouvrir une porte.

## Livraison

Patch `1.142.21` par `scripts/release.mjs`. Phrase de « Nouvelles » : propose-la à Grégoire avec le texte de l'Aide, dans le même message. Puis `OU-EN-EST-ON.md` (phrase « vérifié comment »), `RELAIS.md`, #860 et #828 cochées avec leur disposition, le lot F marqué livré dans le cadrage, le markdown du tri. Toute trouvaille reçoit l'une des trois issues ; « inscrire et continuer » est le défaut. Commite aussi les fichiers de Cowork : `RELAIS.md` (ajout de 20 h 37), `plans de travail/CONSIGNE-DU-JOUR.md`, `plans de travail/_ancienne-CONSIGNE-DU-JOUR-2026-09-16-complement-lot-A-1.142.20.md`. Push par `scripts/pousser.sh`, puis signale à Cowork que c'est poussé.
