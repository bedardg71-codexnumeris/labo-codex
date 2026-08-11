/* ============================================================================
   #453 — POURQUOI « Aucune » DANS GRILLE / ÉCHELLE / CARTOUCHE ?
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   LE SYMPTÔME (Grégoire, 11 août 2026, capture à l'appui)
   Sur ses artefacts H26, les trois sélecteurs — Grille de critères, Échelle de
   performance, Cartouche de rétroaction — affichent tous « Aucune ». Et,
   plus tôt le même jour : les dates de remise de l'hiver étaient celles de
   l'automne précédent.

   LA CASCADE, LUE AU CODE (productions.js:778-783)
       selectGrille.value = prod.grilleId || '';
       if (prod.grilleId) await peuplerCartouchesProduction(prod.grilleId);
   Un `<select>` à qui on assigne un id ABSENT de ses options retombe
   silencieusement sur '' — c'est-à-dire « Aucune ». Et sans grille résolue,
   le sélecteur de cartouches n'est peuplé par rien.
   ⮕ **UNE SEULE référence cassée vide les TROIS sélecteurs.** Ce qu'on voit
   n'est donc pas trois pertes : c'est une perte, et deux conséquences.

   LES DEUX HYPOTHÈSES QUE CE SCRIPT SÉPARE

     H1 — CONTAMINATION INTER-TRIMESTRE (#340). `h2026_productions` aurait
       reçu le contenu d'`a2025_productions`. Alors les `grilleId` pointent
       vers des grilles d'A25, absentes du magasin H26 ⇒ « Aucune ». Et les
       dates d'échéance sont celles d'A25 ⇒ le premier symptôme du jour.
       **Une seule cause expliquerait TOUT, y compris les magasins de
       cartouches H26 rapportés à 0 citation ce matin.**

     H2 — RÉFÉRENCE VIDE. Les `grilleId` sont absents ou vides : la perte
       s'est produite à l'écriture, pas par substitution. Autre cause, autre
       correctif.

   ⮕ La différence se lit à UNE question : l'id référencé existe-t-il
   AILLEURS (dans un autre trimestre) ou NULLE PART ?

   ⚠ Ce script ne conclut pas à ta place. Il montre, pour chaque artefact, ce
   que la référence vise et où cette cible se trouve réellement.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await diag453()`
   Repère : le rapport commence par « ==== #453 · références des productions ».
   ========================================================================= */

(function () {
    'use strict';

    const VERSION_OUTIL = 'r1 · 11 août 2026';

    function nomDe(o) {
        if (!o || typeof o !== 'object') return '(sans nom)';
        return String(o.nom || o.titre || o.libelle || '(sans nom)');
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

    async function diag453() {
        const out = [];
        const L = (m) => out.push(m);
        L('==== #453 · références des productions · LECTURE SEULE ====');
        L('     outil ' + VERSION_OUTIL);

        const cles = await toutesLesCles();

        // ── Où vit chaque ressource, tous trimestres confondus ────────────
        const grilleOu = new Map();     // id → [clés]
        const echelleOu = new Map();
        const magasinsCartouches = new Set();

        for (const c of cles) {
            if (c.indexOf('cartouches_') === 0) { magasinsCartouches.add(c); continue; }
            let cible = null;
            if (/grillesTemplates$|bibliothequeGrilles$/.test(c)) cible = grilleOu;
            else if (/echellesTemplates$|bibliothequeEchelles$/.test(c)) cible = echelleOu;
            if (!cible) continue;
            let liste = null;
            try { liste = await db.get(c); } catch (e) { continue; }
            if (!Array.isArray(liste)) continue;
            for (const g of liste) {
                if (!g || !g.id) continue;
                if (!cible.has(g.id)) cible.set(g.id, []);
                cible.get(g.id).push({ cle: c, nom: nomDe(g) });
            }
        }

        // ── Quels trimestres, et quel est l'actif ? ───────────────────────
        let trimestres = [];
        try {
            const reg = await db.get('trimestres');
            if (Array.isArray(reg)) trimestres = reg.map((t) => t && (t.id || t.cle)).filter(Boolean);
        } catch (e) { /* laissé vide */ }
        L('Trimestres : ' + (trimestres.join(', ') || '(aucun)'));

        // ── Chaque magasin de productions ─────────────────────────────────
        // ⚠ LE PACK DÉMO EST ÉCARTÉ DU VERDICT, et c'est nécessaire : ses
        // 11 productions portent des références VIDES par construction. Au
        // premier essai, elles noyaient le compte et faisaient conclure
        // « références vides » sur un jeu parfaitement sain. Un diagnostic
        // qui compte les données de démonstration diagnostique la démo.
        const magasinsProd = cles.filter((c) => /(^|_)productions?$|productionsCours$/.test(c))
            .filter((c) => c.indexOf('demo_') !== 0 && c.indexOf('demo') !== 0);
        const ecartes = cles.filter((c) => /(^|_)productions?$|productionsCours$/.test(c))
            .filter((c) => c.indexOf('demo') === 0);
        if (ecartes.length) L('Écarté du verdict (pack démo) : ' + ecartes.join(', '));

        if (!magasinsProd.length) {
            L('⚠ Aucun magasin de productions RÉEL trouvé (hors démo).');
            console.log(out.join('\n'));
            return { magasins: 0 };
        }

        let totalCassees = 0, totalAilleurs = 0, totalVides = 0, totalSaines = 0;

        for (const cleProd of magasinsProd) {
            let liste = null;
            try { liste = await db.get(cleProd); } catch (e) { continue; }
            if (!Array.isArray(liste) || !liste.length) continue;

            // Préfixe de trimestre du magasin lu (h2026_productions → h2026)
            const prefixe = cleProd.indexOf('_') !== -1 ? cleProd.split('_')[0] : '(global)';

            const lignes = [];
            for (const p of liste) {
                const ligne = { artefact: nomDe(p), echeance: p.dateEcheance || '—' };

                for (const [champ, index, etiq] of [['grilleId', grilleOu, 'grille'],
                                                    ['echelleId', echelleOu, 'échelle']]) {
                    const id = p[champ];
                    if (!id) { ligne[etiq] = '(vide)'; totalVides++; continue; }
                    const ou = index.get(id);
                    if (!ou || !ou.length) {
                        ligne[etiq] = '⛔ INTROUVABLE · ' + id;
                        totalCassees++;
                        continue;
                    }
                    // ⚠ LA QUESTION QUI SÉPARE LES DEUX HYPOTHÈSES : la cible
                    // vit-elle dans le MÊME trimestre que la production ?
                    const memeTrimestre = ou.some((o) => o.cle.indexOf(prefixe + '_') === 0);
                    if (memeTrimestre) {
                        ligne[etiq] = '✓ ' + ou.find((o) => o.cle.indexOf(prefixe + '_') === 0).nom;
                        totalSaines++;
                    } else {
                        ligne[etiq] = '⚠ AILLEURS · ' + ou.map((o) => o.cle).join(' / ');
                        totalAilleurs++;
                    }
                }

                const cleCart = p.grilleId ? 'cartouches_' + p.grilleId : null;
                ligne.cartouches = !cleCart ? '—'
                    : (magasinsCartouches.has(cleCart) ? '✓ magasin présent' : '⛔ aucun magasin');
                lignes.push(ligne);
            }

            if (lignes.length) {
                L('\n— ' + cleProd + '  (' + lignes.length + ' artefacts)');
                console.table(lignes);
            }
        }

        L('\n==== BILAN ====');
        L('Références saines (même trimestre)     : ' + totalSaines);
        L('⚠ Références vers un AUTRE trimestre    : ' + totalAilleurs);
        L('⛔ Références INTROUVABLES partout      : ' + totalCassees);
        L('Références vides                        : ' + totalVides);
        L('');
        if (totalAilleurs > 0) {
            L('⮕ VERDICT — H1 : la cible existe, mais dans un AUTRE trimestre.');
            L('  C\'est la signature d\'une CONTAMINATION inter-trimestre (#340) :');
            L('  le magasin de productions porte le contenu d\'un autre trimestre.');
            L('  Ça expliquerait AUSSI les dates d\'échéance de l\'automne, et les');
            L('  magasins de cartouches H26 rapportés à 0 citation ce matin.');
            L('  ⮕ Une seule cause, trois symptômes.');
        } else if (totalCassees > 0) {
            L('⮕ VERDICT — H2 : les cibles n\'existent NULLE PART.');
            L('  Ce n\'est pas une substitution : les ressources ont disparu, ou');
            L('  les ids ont été réécrits. Autre cause, autre correctif.');
        } else if (totalVides > 0) {
            L('⮕ VERDICT — H2bis : les références sont VIDES.');
            L('  La perte s\'est produite à l\'écriture, pas par substitution.');
        } else {
            L('⮕ Aucune référence cassée. Le symptôme vient d\'ailleurs —');
            L('  m\'envoyer une capture de l\'artefact concerné ET ce rapport.');
        }
        L('');
        L('⚠ Rien n\'a été modifié. Copie ce rapport ENTIER avant toute décision.');
        console.log(out.join('\n'));
        return { saines: totalSaines, ailleurs: totalAilleurs, introuvables: totalCassees, vides: totalVides };
    }

    window.diag453 = diag453;
    console.log('#453 chargé — outil ' + VERSION_OUTIL + '. Tape :  await diag453()');
})();
