/* ============================================================================
   #453 — POURQUOI « Aucune » DANS GRILLE / ÉCHELLE / CARTOUCHE ?
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   LE SYMPTÔME (Grégoire, 11 août 2026, capture à l'appui)
   Sur ses artefacts H26, les trois sélecteurs — Grille de critères, Échelle de
   performance, Cartouche de rétroaction — affichent tous « Aucune ». Et,
   plus tôt le même jour : les dates de remise de l'hiver étaient celles de
   l'automne précédent.

   ── CE QUE LA PASSE r1 A DÉJÀ TRANCHÉ (relevé du 11 août) ────────────────────
     H1 — contamination inter-trimestre (#340) : **RÉFUTÉE**, 0 référence vers
       un autre trimestre.
     H2 — cibles disparues : **RÉFUTÉE**, 0 référence introuvable.
     Reste : 13 références saines, 31 champs VIDES, sur les DEUX magasins
       (a2025 ET h2026). Donc rien de propre à H26, rien lié à la reprise.

   ── ET LA CORRECTION QUE r1 SE DOIT À LUI-MÊME ───────────────────────────────
   r1 concluait « la perte s'est produite à l'écriture ». Il n'en savait rien :
   il mesurait **vide** et il concluait **perdu**. Or un artefact auquel on n'a
   jamais assigné de grille est vide, lui aussi, et légitimement. Un verdict qui
   dépasse sa mesure est un verdict faux — même quand il tombe juste.

   ── LA MÉCANIQUE SUSPECTE, LUE AU CODE (et qui efface sa propre trace) ───────
       productions.js:778   selectGrille.value = prod.grilleId || '';
       productions.js:988   const grilleId = grille ? grille.value : '';
   Un `<select>` à qui on assigne un id ABSENT de ses options retombe
   SILENCIEUSEMENT sur '' — « Aucune ». Ouvrir un artefact dans cet état,
   corriger un détail, enregistrer : le '' de l'AFFICHAGE devient le '' du
   DISQUE. Un repli d'affichage se transforme en perte définitive.
   ⮕ C'est pourquoi r1 ne voit plus rien de cassé : l'écriture a effacé la
   preuve de ce qui l'a causée. Il ne reste que le vide.

   ── CE QUE CETTE PASSE r2 MESURE : VIDE-PAR-PERTE ou VIDE-D'ORIGINE ? ────────
   Deux témoins vivent AILLEURS que dans le champ effacé, donc hors d'atteinte
   de ce chemin d'écriture :

     TÉMOIN 1 — LES ÉVALUATIONS. Chaque évaluation enregistre son PROPRE
       grilleId / echelleId (evaluation-chargement.js:593). Si la production est
       vide mais que ses évaluations nomment une grille, alors la production
       AVAIT cette grille. Décisif — et récupérable.

     TÉMOIN 2 — LA BIBLIOTHÈQUE (`bibliothequeProductions`, globale, hors
       trimestre). Le gabarit d'origine garde ses références ; la copie posée
       dans le trimestre porte `idOriginal` qui y remonte.

   ⚠ Ce script ne conclut pas à ta place, et il refuse de conclure quand il ne
   sait pas : un vide sans témoin est déclaré INDÉCIDABLE, pas « perdu ».

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. `await diag453()`
   Repère : le rapport commence par « ==== #453 · références des productions ».
   ========================================================================= */

(function () {
    'use strict';

    const VERSION_OUTIL = 'r2 · 11 août 2026 · passe témoins (évaluations + bibliothèque)';

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

    // ── LES TÉMOINS ─────────────────────────────────────────────────────────
    // Ce que les évaluations de CETTE production disent du champ demandé.
    // On écarte les évaluations remplacées : elles portent l'état d'AVANT une
    // reprise, et prendre leur parole ferait remonter un modèle périmé.
    function temoinEvaluations(evals, prod, champ) {
        const valeurs = new Set();
        for (const e of (evals || [])) {
            if (!e || e.remplaceeParId) continue;
            if (e.productionId !== prod.id) continue;
            if (e[champ]) valeurs.add(e[champ]);
        }
        if (valeurs.size === 1) return { valeur: [...valeurs][0], accord: true };
        if (valeurs.size > 1) return { valeur: [...valeurs][0], accord: false };
        return null;
    }

    // Le gabarit d'origine dans la bibliothèque partagée. Trois chemins de
    // rattachement, du plus sûr au moins sûr — on note lequel a servi, parce
    // qu'un rattachement PAR TITRE n'a pas la même valeur de preuve qu'un
    // rattachement par identifiant.
    function temoinBibliotheque(biblio, prod, champ) {
        if (!Array.isArray(biblio) || !biblio.length) return null;
        let e = prod.idOriginal ? biblio.find((b) => b && b.id === prod.idOriginal) : null;
        let voie = 'idOriginal';
        if (!e) { e = biblio.find((b) => b && b.id === prod.id); voie = 'id'; }
        if (!e && prod.titre) {
            const memeTitre = biblio.filter((b) => b && b.titre === prod.titre);
            if (memeTitre.length === 1) { e = memeTitre[0]; voie = 'titre'; }
        }
        if (!e || !e[champ]) return null;
        return { valeur: e[champ], voie: voie };
    }

    async function diag453() {
        const out = [];
        const L = (m) => out.push(m);
        L('==== #453 · références des productions · LECTURE SEULE ====');
        L('     outil ' + VERSION_OUTIL);

        const cles = await toutesLesCles();

        // ── Où vit chaque ressource, tous trimestres confondus ────────────
        const grilleOu = new Map();     // id → [{cle, nom}]
        const echelleOu = new Map();
        const magasinsCartouches = new Set();

        for (const c of cles) {
            if (c.indexOf('cartouches_') === 0) { magasinsCartouches.add(c); continue; }
            let cible = null;
            if (/grillesTemplates$|bibliothequeGrilles$/.test(c)) cible = grilleOu;
            else if (/echellesTemplates$|bibliothequeEchelles$/.test(c)) cible = echelleOu;
            if (!cible) continue;
            const liste = await lire(c);
            if (!Array.isArray(liste)) continue;
            for (const g of liste) {
                if (!g || !g.id) continue;
                if (!cible.has(g.id)) cible.set(g.id, []);
                cible.get(g.id).push({ cle: c, nom: nomDe(g) });
            }
        }

        let trimestres = [];
        const reg = await lire('trimestres');
        if (Array.isArray(reg)) trimestres = reg.map((t) => t && (t.id || t.cle)).filter(Boolean);
        L('Trimestres : ' + (trimestres.join(', ') || '(aucun)'));

        const biblio = (await lire('bibliothequeProductions')) || [];
        L('Bibliothèque partagée : ' + (Array.isArray(biblio) ? biblio.length : 0) + ' gabarits');

        // ⚠ LE PACK DÉMO EST ÉCARTÉ DU VERDICT, et c'est nécessaire : ses
        // 11 productions portent des références VIDES par construction. Au
        // premier essai, elles noyaient le compte et faisaient conclure
        // « références vides » sur un jeu parfaitement sain. Un diagnostic
        // qui compte les données de démonstration diagnostique la démo.
        const tousProd = cles.filter((c) => /(^|_)productions?$|productionsCours$/.test(c));
        const magasinsProd = tousProd.filter((c) => c.indexOf('demo') !== 0);
        const ecartes = tousProd.filter((c) => c.indexOf('demo') === 0);
        if (ecartes.length) L('Écarté du verdict (pack démo) : ' + ecartes.join(', '));

        if (!magasinsProd.length) {
            L('⚠ Aucun magasin de productions RÉEL trouvé (hors démo).');
            console.log(out.join('\n'));
            return { magasins: 0 };
        }

        let nSaines = 0, nAilleurs = 0, nIntrouvables = 0;
        let nPerdues = 0, nIndecidables = 0, nSansObjet = 0;
        const recuperables = [];

        for (const cleProd of magasinsProd) {
            const liste = await lire(cleProd);
            if (!Array.isArray(liste) || !liste.length) continue;

            // Préfixe de trimestre du magasin lu (h2026_productions → h2026)
            const prefixe = cleProd.indexOf('_') !== -1 ? cleProd.split('_')[0] : '(global)';
            const evals = (await lire(prefixe + '_evaluationsSauvegardees'))
                       || (await lire('evaluationsSauvegardees')) || [];

            const lignes = [];
            for (const p of liste) {
                if (!p || !p.id) continue;
                const ligne = {
                    artefact: nomDe(p),
                    type: p.type || '—',
                    echeance: p.dateEcheance || '—'
                };

                for (const [champ, index, etiq] of [['grilleId', grilleOu, 'grille'],
                                                    ['echelleId', echelleOu, 'échelle']]) {
                    const id = p[champ];

                    // ── Cas 1 : la référence est RENSEIGNÉE ──────────────
                    if (id) {
                        const ou = index.get(id);
                        if (!ou || !ou.length) {
                            ligne[etiq] = '⛔ INTROUVABLE · ' + id;
                            nIntrouvables++;
                            continue;
                        }
                        const chezSoi = ou.find((o) => o.cle.indexOf(prefixe + '_') === 0);
                        if (chezSoi) { ligne[etiq] = '✓ ' + chezSoi.nom; nSaines++; }
                        else {
                            ligne[etiq] = '⚠ AILLEURS · ' + ou.map((o) => o.cle).join(' / ');
                            nAilleurs++;
                        }
                        continue;
                    }

                    // ── Cas 2 : la référence est VIDE. Vide-d'origine ou
                    //    vide-par-perte ? C'est ici que les témoins parlent.
                    if (p.type === 'portfolio') {
                        // Un portfolio CONTENEUR ne s'évalue pas lui-même :
                        // son vide est normal, pas une perte.
                        ligne[etiq] = '— sans objet (portfolio)';
                        nSansObjet++;
                        continue;
                    }

                    const tEval = temoinEvaluations(evals, p, champ);
                    const tBib = temoinBibliotheque(biblio, p, champ);
                    const temoin = tEval || tBib;

                    if (!temoin) {
                        ligne[etiq] = '— vide · aucun témoin (indécidable)';
                        nIndecidables++;
                        continue;
                    }

                    const ou = index.get(temoin.valeur);
                    const chezSoi = ou && ou.find((o) => o.cle.indexOf(prefixe + '_') === 0);
                    const nomCible = chezSoi ? chezSoi.nom
                        : (ou && ou.length ? nomDe({ nom: ou[0].nom }) : '(cible absente)');
                    const source = tEval
                        ? ('évaluations' + (tEval.accord ? '' : ' ⚠ DÉSACCORD'))
                        : ('bibliothèque/' + tBib.voie);

                    ligne[etiq] = '⛔ PERDUE · ' + nomCible + ' · témoin ' + source;
                    nPerdues++;
                    recuperables.push({
                        magasin: cleProd,
                        artefact: nomDe(p),
                        productionId: p.id,
                        champ: champ,
                        valeurRetrouvee: temoin.valeur,
                        cible: nomCible,
                        presenteDansCeTrimestre: chezSoi ? 'oui' : 'NON',
                        temoin: source
                    });
                }

                const cleCart = p.grilleId ? 'cartouches_' + p.grilleId : null;
                ligne.cartouches = !cleCart ? '—'
                    : (magasinsCartouches.has(cleCart) ? '✓ magasin présent' : '⛔ aucun magasin');
                lignes.push(ligne);
            }

            if (lignes.length) {
                L('\n— ' + cleProd + '  (' + lignes.length + ' artefacts, '
                  + (Array.isArray(evals) ? evals.length : 0) + ' évaluations au dossier)');
                console.table(lignes);
            }
        }

        if (recuperables.length) {
            L('\n— RÉCUPÉRABLES : ce que les témoins permettent de rendre');
            console.table(recuperables);
        }

        L('\n==== BILAN ====');
        L('✓ Références saines (même trimestre)     : ' + nSaines);
        L('⚠ Références vers un AUTRE trimestre     : ' + nAilleurs);
        L('⛔ Références INTROUVABLES partout        : ' + nIntrouvables);
        L('⛔ Vides mais un TÉMOIN dit le contraire  : ' + nPerdues + '   ← perte avérée');
        L('— Vides sans témoin (indécidable)         : ' + nIndecidables);
        L('— Vides sans objet (portfolio conteneur)  : ' + nSansObjet);
        L('');

        if (nPerdues > 0) {
            L('⮕ VERDICT — PERTE AVÉRÉE sur ' + nPerdues + ' référence(s).');
            L('  Le champ est vide, mais tes évaluations (ou le gabarit d\'origine)');
            L('  nomment encore la ressource. Elle a donc bien été assignée, puis');
            L('  effacée. Le tableau « RÉCUPÉRABLES » ci-dessus dit quoi rendre,');
            L('  à quel artefact, et si la cible existe toujours dans ce trimestre.');
            L('  ⚠ Ne répare RIEN à la main : envoie-moi le rapport, l\'outil de');
            L('  réparation doit être écrit puis relu en dry-run, comme pour #448.');
        } else if (nIndecidables > 0) {
            L('⮕ VERDICT — INDÉCIDABLE, et c\'est un vrai résultat, pas un échec.');
            L('  Aucun témoin ne contredit le vide : ni évaluation, ni gabarit.');
            L('  Ces artefacts n\'ont peut-être JAMAIS eu de grille — auquel cas');
            L('  « Aucune » est l\'affichage exact de la vérité, et il n\'y a rien');
            L('  à réparer. Pour trancher il faut un témoin extérieur : une');
            L('  archive Codex antérieure. Dis-moi si tu en as une, et de quand.');
        } else if (nAilleurs > 0 || nIntrouvables > 0) {
            L('⮕ VERDICT — les références existent mais visent à côté. Voir le');
            L('  détail par magasin ci-dessus.');
        } else {
            L('⮕ Aucune anomalie mesurable. Le symptôme vient d\'ailleurs —');
            L('  m\'envoyer une capture de l\'artefact concerné ET ce rapport.');
        }
        L('');
        L('⚠ Rien n\'a été modifié. Copie ce rapport ENTIER avant toute décision.');
        console.log(out.join('\n'));
        return {
            saines: nSaines, ailleurs: nAilleurs, introuvables: nIntrouvables,
            perdues: nPerdues, indecidables: nIndecidables, sansObjet: nSansObjet
        };
    }

    window.diag453 = diag453;
    console.log('#453 chargé — outil ' + VERSION_OUTIL + '. Tape :  await diag453()');
})();
