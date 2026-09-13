/* ===============================================================================
   MODULE : Générateur de profils-types (#326 R2 — banc de décision)
   ───────────────────────────────────────────────────────────────────────────
   PUR, DÉTERMINISTE, lecture seule, testable sans DOM ni stockage.

   RÔLE (RELAIS-326 §4.2/§4.8) : produire un CORPUS fictif réaliste pour le banc de
   décision, DÉRIVÉ de l'échelle de performance de l'utilisateur. La décision « quelle
   pratique adopter ? » se prend AVANT que les élèves produisent → les profils fictifs
   sont le défaut, pas un repli. La qualité des profils EST la qualité de la décision.

   DÉCISIONS ACTÉES (§4.8) :
   - Nombre de profils = nombre de NIVEAUX de l'échelle (2/3/4/5…) → « parle l'échelle
     de l'utilisateur » (pas une IDME à 4 niveaux codée en dur).
   - Trajectoires ANCRÉES NON PLATES (variance + évolution) — un profil plat « un par
     niveau » sous-révèle ce qui distingue les pratiques (elles divergent sur les
     TRAJECTOIRES). On ajoute donc 1 profil « irrégulier » transversal (maîtrise
     tardive) = le cas où SOM et PAN divergent le plus.
   - v1 = profils générés FIXES (déterministes, non modifiables). Remplacer un profil
     par un parcours réel viendra plus tard.
   - Scénarios de REPRISE inclus (sur des exercices, JAMAIS sur la terminale) — sinon
     la distinction « jetons sur exercices, pas sur les terminales » reste invisible (§2).

   SORTIE : { profils, productions, evaluations } — forme calée sur les enregistrements
   réels (cf. pack-demo-10.js) pour être consommée TELLE QUELLE par le moteur via
   l'injection mémoire de simulerIndices (#326 R2/Étape 2).

   ⚠️ Le corpus produit des productions de type 'artefact-portfolio' (+ 1 'terminale') :
   fidèle pour STD/SOM. SPE compte par type de travaux (family-specific) → résultat
   approximatif sur un corpus générique ; DEN n'est pas simulable (jugement). C'est
   cohérent avec la posture pluraliste : le banc montre, il ne classe pas.
   =============================================================================== */
(function () {
    'use strict';

    var JOUR_MS = 86400000;

    // Oscillation déterministe autour du niveau d'ancrage (variance, jamais plate).
    // Clampée aux bornes : aux niveaux extrêmes, l'oscillation se replie vers l'intérieur.
    var DELTA = [0, -1, 1, 0, 1, -1, 0, 1, -1, 0];

    function _clamp(x, min, max) { return x < min ? min : (x > max ? max : x); }

    // Pourcentage d'un niveau — ROBUSTE aux variantes de champ selon l'origine de
    // l'échelle (#326, fix 17 juin) : `valeurCalcul` (echellesTemplates démo/réel),
    // `valeur` (echelles.js), `valeur_pourcentage` (pratiques embarquées). Repli :
    // milieu de [min,max]. null si rien d'exploitable. (Sans ça, noteFinale=null →
    // SOM/STD filtrent les évals → toutes les notes du banc tombent à 0.)
    function _pct(niv) {
        if (!niv || typeof niv !== 'object') return null;
        var cands = [niv.valeurCalcul, niv.valeur, niv.valeur_pourcentage, niv.pourcentage, niv.valeurMax];
        for (var i = 0; i < cands.length; i++) { if (typeof cands[i] === 'number') return cands[i]; }
        if (typeof niv.min === 'number' && typeof niv.max === 'number') return Math.round((niv.min + niv.max) / 2);
        return null;
    }

    function _niveauxTries(echelle) {
        if (!echelle || !Array.isArray(echelle.niveaux) || echelle.niveaux.length < 2) return null;
        return echelle.niveaux.slice().sort(function (a, b) {
            var oa = (a && a.ordre != null) ? a.ordre : (_pct(a) != null ? _pct(a) : 0);
            var ob = (b && b.ordre != null) ? b.ordre : (_pct(b) != null ? _pct(b) : 0);
            return oa - ob;
        });
    }

    function _dateISO(base, k, cadenceJours) {
        return new Date(base + k * cadenceJours * JOUR_MS).toISOString();
    }

    // Trajectoire d'un profil ancré sur le niveau d'index `a` : oscille autour de `a`.
    function _trajectoireAncree(a, nb, nbNiveaux) {
        var t = [];
        for (var k = 0; k < nb; k++) t.push(_clamp(a + DELTA[k % DELTA.length], 0, nbNiveaux - 1));
        return t;
    }

    // Trajectoire « irrégulière » : départ bas, maîtrise démontrée tardivement (le cas
    // où SOM — qui verrouille la performance précoce — et PAN — qui regarde l'arrivée —
    // divergent le plus). Monotone croissante, lente au début (frac^1.7).
    function _trajectoireIrreguliere(nb, nbNiveaux) {
        var t = [];
        for (var k = 0; k < nb; k++) {
            var frac = (nb <= 1) ? 1 : k / (nb - 1);
            t.push(_clamp(Math.round(Math.pow(frac, 1.7) * (nbNiveaux - 1)), 0, nbNiveaux - 1));
        }
        return t;
    }

    function _evalsPourProfil(da, trajectoire, productions, niveaux, baseDate, cadence, coursId, echelleId) {
        var evals = [];
        for (var k = 0; k < productions.length; k++) {
            var niv = niveaux[trajectoire[k]];
            evals.push({
                id: 'SIMEVAL_' + da + '_' + k,
                etudiantDA: da,
                productionId: productions[k].id,
                productionNom: productions[k].nom,
                echelleId: echelleId,
                niveauFinal: niv.code,
                noteFinale: _pct(niv),
                dateEvaluation: _dateISO(baseDate, k, cadence),
                statutRemise: 'evalue',
                statutIntegrite: 'recevable',
                coursId: coursId
            });
        }
        // Scénario de reprise : sur un EXERCICE précoce (index 1 si ce n'est pas la
        // terminale), une 1ʳᵉ tentative faible remplacée par une reprise améliorée.
        // Jamais sur la terminale (dernière production) → rend visible « reprise sur
        // les exercices, pas sur les terminales » (§2). L'original est marqué remplacé
        // (exclu par _evalsProfil du moteur) ; la reprise (plus récente) est retenue.
        var kReprise = 1;
        if (productions.length > 2 && productions[kReprise].type !== 'terminale') {
            var orig = evals[kReprise];
            var nivOrig = trajectoire[kReprise];
            var nivReprise = _clamp(nivOrig + 1, 0, niveaux.length - 1);
            if (nivReprise !== nivOrig) {
                orig.remplaceeParId = 'SIMEVAL_' + da + '_' + kReprise + '_r';
                var niv = niveaux[nivReprise];
                evals.push({
                    id: 'SIMEVAL_' + da + '_' + kReprise + '_r',
                    etudiantDA: da,
                    productionId: productions[kReprise].id,
                    productionNom: productions[kReprise].nom,
                    echelleId: echelleId,
                    niveauFinal: niv.code,
                    noteFinale: _pct(niv),
                    // Reprise datée après la dernière production (fin de parcours).
                    dateEvaluation: _dateISO(baseDate, productions.length + 1, cadence),
                    statutRemise: 'evalue',
                    statutIntegrite: 'recevable',
                    estReprise: true,
                    coursId: coursId
                });
            }
        }
        return evals;
    }

    /**
     * Génère un corpus fictif déterministe à partir d'une échelle.
     * @param {object} echelle - { niveaux: [{ code, label, valeur_pourcentage, ordre }] }
     * @param {object} [options] - { nbArtefacts=8, dateDebut, cadenceJours=7, coursId }
     * @returns {{profils:Array, productions:Array, evaluations:Array}}
     *   profils : [{ da, label, contexte, niveauAncrage|null }]
     *   productions : [{ id, nom, type, ponderation }] (dont 1 'terminale' en dernier)
     *   evaluations : enregistrements compatibles moteur (etudiantDA, productionId,
     *                 niveauFinal, noteFinale, dateEvaluation, remplaceeParId…).
     *   Repli neutre : échelle invalide → { profils:[], productions:[], evaluations:[] }.
     */
    function genererCorpus(echelle, options) {
        var o = options || {};
        var niveaux = _niveauxTries(echelle);
        if (!niveaux) return { profils: [], productions: [], evaluations: [] };

        var N = niveaux.length;
        var nbArtefacts = Math.max(8, parseInt(o.nbArtefacts, 10) || 8);
        var cadence = parseInt(o.cadenceJours, 10) || 7;
        var coursId = o.coursId || 'comparateur-sim';
        var baseDate = o.dateDebut ? new Date(o.dateDebut).getTime() : new Date('2025-09-08T15:00:00.000Z').getTime();
        // echelleId stampé sur les évaluations → la résolution du niveau (colonne
        // « Niveau atteint », récit) retrouve l'échelle dans echellesTemplates.
        var echelleId = echelle.id || echelle.echelle_id || o.echelleId || null;

        // Corpus de productions PARTAGÉ : (nbArtefacts-1) exercices + 1 terminale.
        var productions = [];
        for (var i = 0; i < nbArtefacts; i++) {
            var estTerminale = (i === nbArtefacts - 1);
            productions.push({
                id: 'SIMPROD_' + i,
                nom: estTerminale ? 'Évaluation terminale' : ('Artefact ' + (i + 1)),
                type: estTerminale ? 'terminale' : 'artefact-portfolio',
                ponderation: 1
            });
        }

        var profils = [];
        var evaluations = [];

        // N profils ancrés, un par niveau (du plus bas au plus haut).
        // ⚠️ Le DA DOIT faire 7 caractères : tout le moteur garde `da.length !== 7`
        // (cf. pratique-*.js) → un DA non conforme rend une note nulle. Format
        // 'SIM' + 4 chiffres (comme 'DEMO0xx' = 7 car.).
        for (var a = 0; a < N; a++) {
            var da = 'SIM' + String(a).padStart(4, '0');
            var nom = (niveaux[a] && niveaux[a].label) ? niveaux[a].label : (niveaux[a] && niveaux[a].code) || ('Niveau ' + (a + 1));
            profils.push({
                da: da,
                label: 'Surtout « ' + nom + ' »',
                contexte: 'Élève qui se situe surtout au niveau « ' + nom + ' », avec des variations d’une production à l’autre.',
                niveauAncrage: niveaux[a] ? niveaux[a].code : null
            });
            evaluations = evaluations.concat(
                _evalsPourProfil(da, _trajectoireAncree(a, nbArtefacts, N), productions, niveaux, baseDate, cadence, coursId, echelleId)
            );
        }

        // + 1 profil irrégulier (maîtrise tardive) — transversal. DA 7 car. également.
        var daIrr = 'SIM0099';
        profils.push({
            da: daIrr,
            label: 'Parcours irrégulier',
            contexte: 'Départ difficile sur les premières productions, puis maîtrise clairement démontrée en fin de parcours.',
            niveauAncrage: null
        });
        evaluations = evaluations.concat(
            _evalsPourProfil(daIrr, _trajectoireIrreguliere(nbArtefacts, N), productions, niveaux, baseDate, cadence, coursId, echelleId)
        );

        return { profils: profils, productions: productions, evaluations: evaluations };
    }

    var api = { genererCorpus: genererCorpus };
    if (typeof window !== 'undefined') window.ProfilsTypesGenerateur = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
