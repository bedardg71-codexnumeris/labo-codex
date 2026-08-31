/* ============================================================================
   #454 — RETROUVER SOUS QUEL NOM VIT AUJOURD'HUI UNE GRILLE RENUMÉROTÉE
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   ── LE PROBLÈME ─────────────────────────────────────────────────────────────
   Le dry-run de #453 (11 août) a montré que 10 artefacts H26 citent des
   identifiants de grilles qui n'existent NULLE PART. Trois identifiants
   seulement, pour dix artefacts :
       grille_1770742838756_23q82vbsk   → artefacts 1, 3, 5, 8, 9
       grille_1772187755149_uq1oiiafa   → artefacts 2, 4, 7
       GRILLE1759529438501              → artefacts 6, 10
   Les grilles existent toujours — sous d'autres identifiants (#454). Reste à
   savoir LAQUELLE est laquelle. Réassigner au hasard mettrait de mauvais
   critères sur de vraies évaluations : ce serait pire que le vide.

   ── CE QUI PERMET DE TRANCHER, ET CE N'EST PAS UNE RESSEMBLANCE DE TITRES ───
   Chaque cartouche recopie les critères de SA grille au moment de sa création
   (`cartouches.js:417`) :
       criteres: criteres.map(c => ({ id: c.id, nom: c.nom }))
   Le magasin `cartouches_{ancienId}` a survécu à la renumérotation — il porte
   l'ancien identifiant dans son NOM de clé. Il contient donc **l'empreinte de
   la grille disparue** : les identifiants ET les noms de ses critères.

   ⮕ Si les identifiants de CRITÈRES se retrouvent tels quels dans une grille
   vivante, ce n'est plus une ressemblance : c'est la MÊME grille, renumérotée
   au niveau de la grille mais pas de ses critères. **Preuve, pas indice.**
   ⮕ Si seuls les NOMS concordent, c'est un indice sérieux — rapporté comme
   tel, et clairement distingué du cas précédent.

   ⚠ CE SCRIPT NE DÉCIDE RIEN. Il classe les candidates et dit sur quoi repose
   chaque rapprochement. C'est Grégoire qui reconnaît sa grille — pas un score.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await identifier454()`
   Repère : le rapport commence par « ==== #454 · grilles fantômes ».
   ========================================================================= */

(function () {
    'use strict';

    const VERSION_OUTIL = 'r2 · 11 août 2026 (démo écartée · même trimestre priorisé)';

    function nomDe(o) {
        if (!o || typeof o !== 'object') return '(sans nom)';
        return String(o.nom || o.titre || o.libelle || '(sans nom)');
    }

    async function lire(cle) {
        try { return await db.get(cle); } catch (e) { return null; }
    }

    async function toutesLesCles() {
        const vues = new Set();
        try {
            const k = await db.keys();
            for (let i = 0; i < k.length; i++) vues.add(k[i]);
        } catch (e) { /* IDB indisponible */ }
        for (let j = 0; j < localStorage.length; j++) vues.add(localStorage.key(j));
        return Array.from(vues);
    }

    function normaliser(s) {
        return String(s === null || s === undefined ? '' : s)
            .toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')   // accents
            .replace(/\s+/g, ' ').trim();
    }

    function recouvrement(a, b) {
        if (!a.size || !b.size) return 0;
        let n = 0;
        for (const x of a) if (b.has(x)) n++;
        return n / Math.max(a.size, b.size);
    }

    async function identifier454() {
        const out = [];
        const L = (m) => out.push(m);
        L('==== #454 · grilles fantômes · LECTURE SEULE ====');
        L('     outil ' + VERSION_OUTIL);

        const cles = await toutesLesCles();

        // ── Toutes les grilles VIVANTES, par magasin ────────────────────────
        const vivantes = [];            // { id, nom, cle, prefixe, idsCriteres:Set, nomsCriteres:Set }
        const idsVivants = new Set();   // ⚠ INCLUT la démo : une grille de démo
                                        // reste « vivante » pour décider si un
                                        // magasin est orphelin. Elle est écartée
                                        // plus bas des CANDIDATES seulement.
        let ecartesDemo = 0;
        for (const c of cles) {
            if (!/grillesTemplates$|bibliothequeGrilles$/.test(c)) continue;
            const liste = await lire(c);
            if (!Array.isArray(liste)) continue;
            for (const g of liste) {
                if (!g || !g.id) continue;
                idsVivants.add(g.id);
                // ⚠ UNE GRILLE DE DÉMONSTRATION N'EST JAMAIS LA RÉPONSE. Le
                // premier jet les proposait à égalité de preuve — et comme le
                // pack démo est une COPIE du vrai matériel, ses critères
                // portent les mêmes identifiants : elle sortait donc « PREUVE ».
                // Réassigner un artefact réel à une grille de démo, c'est
                // relier le travail des étudiants à du matériel jetable.
                if (c.indexOf('demo') === 0) { ecartesDemo++; continue; }
                const crit = Array.isArray(g.criteres) ? g.criteres : [];
                vivantes.push({
                    id: g.id, nom: nomDe(g), cle: c,
                    prefixe: c.indexOf('_') !== -1 ? c.split('_')[0] : '(global)',
                    idsCriteres: new Set(crit.map((x) => x && x.id).filter(Boolean)),
                    nomsCriteres: new Set(crit.map((x) => normaliser(x && x.nom)).filter(Boolean))
                });
            }
        }
        L('Grilles vivantes retenues comme candidates : ' + vivantes.length
          + (ecartesDemo ? '   (' + ecartesDemo + ' écartée(s) : pack démo)' : ''));

        // ── Les magasins de cartouches dont la grille n'existe plus ─────────
        // ⚠ S5/#623 — le magasin vit sous `<trimestreId>_cartouches_<grilleId>`,
        // plus sous la clé nue. Le test ancré `indexOf(…) !== 0` ne trouvait plus
        // aucune clé : ce script d'IDENTIFICATION concluait « aucune grille
        // fantôme », soit précisément le contraire de ce qu'il existe pour dire.
        // Mesuré : 2 clés avant S5, 0 après. R1 : on balaie tous les trimestres.
        const RE_CARTOUCHES = /^(?:([ahe]\d{4}|demo)_)?cartouches_(.+)$/;
        const fantomes = [];
        for (const c of cles) {
            const m = typeof c === 'string' ? c.match(RE_CARTOUCHES) : null;
            if (!m) continue;
            const trimestreDeLaCle = m[1] || null;   // null ⇒ clé NUE (résidu pré-S5)
            const idGrille = m[2];
            if (idsVivants.has(idGrille)) continue;         // grille bien vivante
            const cartes = await lire(c);
            if (!Array.isArray(cartes) || !cartes.length) continue;

            const idsCriteres = new Set();
            const nomsCriteres = new Set();
            const niveaux = new Set();
            const echelles = new Set();
            for (const ct of cartes) {
                if (!ct) continue;
                for (const cr of (Array.isArray(ct.criteres) ? ct.criteres : [])) {
                    if (cr && cr.id) idsCriteres.add(cr.id);
                    if (cr && cr.nom) nomsCriteres.add(normaliser(cr.nom));
                }
                for (const n of (Array.isArray(ct.niveaux) ? ct.niveaux : [])) {
                    if (n && n.code) niveaux.add(String(n.code));
                }
                if (ct.echelleId) echelles.add(ct.echelleId);
            }
            // R1 · NOMMER OÙ. Le critère d'orphelinat reste volontairement GLOBAL
            // (`idsVivants` agrège tous les magasins de grilles, voir plus haut) :
            // une grille vivante dans un trimestre suffit à ne pas déclarer son
            // magasin orphelin. S5/#623 rendrait défendable un critère PAR
            // trimestre — un magasin h2026 dont la grille ne vit qu'en a2025 —
            // mais ce serait un changement de définition, pas un routage de clé.
            // Le trimestre est donc RAPPORTÉ, et la décision laissée à qui lit.
            fantomes.push({
                cle: c, idGrille: idGrille, trimestre: trimestreDeLaCle,
                cartouches: cartes.map(nomDe),
                idsCriteres: idsCriteres, nomsCriteres: nomsCriteres,
                niveaux: [...niveaux], echelles: [...echelles]
            });
        }

        if (!fantomes.length) {
            L('');
            L('✓ Aucun magasin de cartouches orphelin : aucune grille fantôme à retrouver.');
            console.log(out.join('\n'));
            return { fantomes: 0 };
        }

        // ── Qui cite ces fantômes ? (productions ET évaluations) ────────────
        const citations = new Map();    // idGrille → Set(description)
        const trimestreCitant = new Map();  // idGrille → Set(préfixe de trimestre)
        const ajouterCitation = (id, quoi, prefixe) => {
            if (!citations.has(id)) citations.set(id, new Set());
            citations.get(id).add(quoi);
            if (prefixe) {
                if (!trimestreCitant.has(id)) trimestreCitant.set(id, new Set());
                trimestreCitant.get(id).add(prefixe);
            }
        };
        for (const c of cles) {
            if (c.indexOf('demo') === 0) continue;
            const estProd = /(^|_)productions?$/.test(c);
            const estEval = /evaluationsSauvegardees$/.test(c);
            if (!estProd && !estEval) continue;
            const liste = await lire(c);
            if (!Array.isArray(liste)) continue;
            for (const item of liste) {
                if (!item || !item.grilleId) continue;
                if (idsVivants.has(item.grilleId)) continue;
                ajouterCitation(item.grilleId, c + (estProd ? ' → ' + nomDe(item) : ' (évaluations)'),
                                c.indexOf('_') !== -1 ? c.split('_')[0] : null);
            }
        }

        // ── Pour chaque fantôme : son empreinte, puis les candidates ────────
        const bilan = [];
        for (const f of fantomes) {
            L('');
            L('════ FANTÔME : ' + f.idGrille);
            L('  magasin survivant : ' + f.cle
              + (f.trimestre ? '   [trimestre ' + f.trimestre + ']'
                             : '   [⚠ CLÉ NUE — régime pré-S5, non migrée]'));
            L('  cartouches gardées (' + f.cartouches.length + ') : ' + f.cartouches.join(' · '));
            L('  critères de la grille disparue (' + f.nomsCriteres.size + ') : '
              + [...f.nomsCriteres].join(' · '));
            if (f.niveaux.length) L('  niveaux de l\'échelle utilisée : ' + f.niveaux.join(' '));
            if (f.echelles.length) L('  échelle citée par les cartouches : ' + f.echelles.join(' · '));
            const cite = citations.get(f.idGrille);
            L('  cité par : ' + (cite ? [...cite].join(' | ') : '(personne — trace seule)'));

            // ⚠ LE TRIMESTRE QUI CITE COMMANDE LE CLASSEMENT. Une grille d'A25
            // n'est PAS la réponse pour un artefact d'H26, même si ses critères
            // portent les mêmes identifiants — c'est justement le cas, puisque
            // la grille H26 descend de celle d'A25. Le premier jet ignorait ce
            // point et recommandait des grilles d'A25 pour des artefacts d'H26 :
            // exactement la contamination inter-trimestre qu'on combat (#340).
            const trims = trimestreCitant.get(f.idGrille);
            const memeTrimestre = (v) => (trims && trims.has(v.prefixe) ? 1 : 0);

            const candidates = vivantes.map((v) => ({
                v: v,
                parId: recouvrement(f.idsCriteres, v.idsCriteres),
                parNom: recouvrement(f.nomsCriteres, v.nomsCriteres),
                chezSoi: memeTrimestre(v)
            })).filter((c) => c.parId > 0 || c.parNom > 0)
              .sort((a, b) => (b.parId - a.parId) || (b.chezSoi - a.chezSoi) || (b.parNom - a.parNom));
            if (trims && trims.size) L('  trimestre qui cite ce fantôme : ' + [...trims].join(', '));

            if (!candidates.length) {
                L('  ⮕ AUCUNE grille vivante ne partage un critère avec elle.');
                L('    Le contenu de cette grille n\'a peut-être pas survécu ailleurs.');
                bilan.push({ fantome: f.idGrille, meilleure: '(aucune)', preuve: '—' });
                continue;
            }

            L('  ── candidates, la plus probable en premier :');
            for (const c of candidates.slice(0, 5)) {
                const preuve = c.parId === 1 ? '★ MÊMES identifiants de critères — PREUVE'
                    : c.parId > 0 ? '◆ identifiants de critères partagés (' + Math.round(c.parId * 100) + ' %)'
                    : '· noms de critères seulement (' + Math.round(c.parNom * 100) + ' %) — INDICE';
                L('     ' + preuve + (c.chezSoi ? '   ✓ MÊME TRIMESTRE' : '   ⚠ autre trimestre'));
                L('       « ' + c.v.nom +' »  [' + c.v.cle + ' · ' + c.v.id + ']');
            }
            const t = candidates[0];
            const alerte = (trims && trims.size && !t.chezSoi)
                ? '  ⚠ la meilleure candidate vit dans un AUTRE trimestre que les artefacts'
                  + ' qui la citent — vérifie avant de réassigner.' : '';
            bilan.push({
                fantome: f.idGrille,
                meilleure: t.v.nom + ' [' + t.v.id + ']' + (t.chezSoi ? '' : '  ⚠ autre trimestre'),
                preuve: (t.parId === 1 ? 'PREUVE (identifiants de critères identiques)'
                      : t.parId > 0 ? 'FORTE (' + Math.round(t.parId * 100) + ' % d\'identifiants communs)'
                      : 'INDICE (' + Math.round(t.parNom * 100) + ' % de noms communs)') + alerte
            });
        }

        L('');
        L('==== RÉCAPITULATIF ====');
        bilan.forEach((b) => L('  ' + b.fantome + '\n     ⮕ ' + b.meilleure + '\n       ' + b.preuve));
        L('');
        L('⚠ CE SCRIPT NE DÉCIDE RIEN, et il ne faut pas le laisser décider.');
        L('  « PREUVE » veut dire que les critères portent les MÊMES identifiants :');
        L('  c\'est la même grille, renumérotée au niveau de la grille seulement.');
        L('  « INDICE » ne repose que sur des noms — deux grilles différentes peuvent');
        L('  parfaitement nommer leurs critères pareil. À toi de reconnaître la tienne.');
        L('');
        L('⚠ Rien n\'a été modifié. Et ⚠⚠ NE SUPPRIME PAS ces magasins orphelins :');
        L('  ce sont les seuls témoins de l\'ancien identifiant.');
        console.log(out.join('\n'));
        return { fantomes: fantomes.length, bilan: bilan };
    }

    window.identifier454 = identifier454;
    console.log('#454 chargé — outil ' + VERSION_OUTIL + '. Tape :  await identifier454()');
})();
