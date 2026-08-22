/* ============================================================================
   PRODUCTIONS — doublons, et « je ne vois pas mes ajouts »
   ----------------------------------------------------------------------------
   LECTURE SEULE. Ce fichier n'écrit rien, ne supprime rien, ne répare rien.
   Il compte, il compare, il rapporte.

   POURQUOI IL EXISTE
   Le 22 août 2026, Grégoire signale deux choses dans la bibliothèque de
   productions : « ajouter à ma sélection » paraissait sans effet, et il ne
   voit pas ses ajouts dans sa sélection ni dans sa barre latérale.

   La première a été trouvée et corrigée en 1.91.6 : la liste des « disponibles »
   excluait par identifiant NU, alors que l'ajout crée une COPIE avec un
   identifiant neuf. L'original restait donc listé, à l'identique, et chaque
   nouveau clic empilait un exemplaire de plus, en silence.

   La seconde n'a PAS pu être reproduite en session : sur le code corrigé, le
   flux complet (importer depuis un autre trimestre, puis ajouter à sa
   sélection) fait bien passer la sélection de (1) à (2) et remplit la barre
   latérale. Il faut donc regarder les VRAIES données pour trancher, au lieu de
   deviner. C'est tout l'objet de la partie A.

   CE QU'IL FAUT SAVOIR POUR LIRE LE RAPPORT

   · « Importer » (depuis un autre trimestre) et « Ajouter à ma sélection » ne
     font PAS la même chose. Importer dépose la production dans la BIBLIOTHÈQUE
     partagée ; c'est « Ajouter à ma sélection » qui la fait entrer dans ton
     cours et dans la barre latérale. Un import seul ne fait donc jamais bouger
     le compteur « Productions dans ta sélection » : ce n'est pas un défaut,
     c'est un parcours en deux temps.

   · Deux productions de même nom ne sont pas forcément un défaut : tu peux
     légitimement avoir deux artefacts homonymes. Ce qui accuse une duplication
     accidentelle, c'est un groupe de même nom dont les exemplaires descendent
     du MÊME original (même `idOriginal`). Le rapport distingue les deux.

   USAGE — console du navigateur, dans l'onglet de l'app :
     1. coller CE FICHIER EN ENTIER, Entrée ;
     2. taper :  await diagProductions()

   Repère : le rapport commence par « ==== PRODUCTIONS · doublons + visibilité ·
   LECTURE SEULE ». S'il ne s'affiche pas, le fichier n'est pas passé (un script
   se colle en entier, la commande s'appelle APRÈS).
   ========================================================================= */

(function () {
    'use strict';

    const LIGNE = '─'.repeat(74);

    function normaliserTitre(t) {
        return String(t || '').trim().toLowerCase().replace(/\s+/g, ' ');
    }

    // Reproduit la règle d'affichage de l'app, sans dépendre de son chargement.
    function estDemo(item) {
        if (!item) return false;
        if (item.isDemo === true) return true;
        return item.auteur === 'Demo Labo Codex';
    }

    function modeDemoActif() {
        try {
            if (window.BibliothequeUI && typeof BibliothequeUI.modeDemoActif === 'function') {
                return BibliothequeUI.modeDemoActif();
            }
        } catch (e) { /* on retombe sur la lecture directe */ }
        try { return localStorage.getItem('demo-actif') === 'true'; } catch (e) { return false; }
    }

    function grouperParTitre(liste) {
        const groupes = new Map();
        liste.forEach(p => {
            const t = normaliserTitre(p.titre || p.nom);
            if (!groupes.has(t)) groupes.set(t, []);
            groupes.get(t).push(p);
        });
        return [...groupes.entries()].filter(([, items]) => items.length > 1);
    }

    async function diagProductions() {
        console.log('==== PRODUCTIONS · doublons + visibilité · LECTURE SEULE ====');

        // --- Contexte, pour écarter d'emblée le « build en retard » ---
        const version = window.VERSION_MAJEURE || '(inconnue)';
        const build = window.BUILD_ID || '(inconnu)';
        const correctifPresent = typeof window.DUREE_PERIODE_DEFAUT !== 'undefined';
        console.log('Version chargée : ' + version + '  ·  build ' + build);
        if (!correctifPresent) {
            console.warn('⚠ Cette page semble ANTÉRIEURE à 1.91.4. Fais `git pull` et recharge à fond :');
            console.warn('  sans cela, tout ce qui suit décrit l\'état d\'AVANT les correctifs.');
        }

        const cleProd = (typeof cle === 'function') ? cle('productions') : null;
        if (!cleProd) {
            console.error('La fonction cle() n\'est pas disponible : es-tu bien dans l\'onglet de l\'app ?');
            return;
        }
        const trimestre = (typeof db !== 'undefined' && db.getSync) ? db.getSync('trimestreActif', '(aucun)') : '(inconnu)';
        console.log('Trimestre actif : ' + trimestre + '   (clé lue : ' + cleProd + ')');
        console.log('Mode démo : ' + (modeDemoActif() ? 'ACTIF' : 'inactif'));
        console.log(LIGNE);

        const productions = (await db.get(cleProd)) || [];
        const biblio = (await db.get('bibliothequeProductions')) || [];

        /* ------------------------------------------------------------------
           A. VISIBILITÉ — pourquoi un ajout n'apparaît pas
           ------------------------------------------------------------------ */
        console.log('A. VISIBILITÉ DANS TA SÉLECTION ET TA BARRE LATÉRALE');
        console.log('   Total de productions dans ce trimestre : ' + productions.length);

        const demoActif = modeDemoActif();
        const masquees = [];
        let visibles = 0;

        productions.forEach(p => {
            const motifs = [];
            // les deux seuls filtres appliqués par l'app (sidebar ET sélection)
            if (p.dansBibliotheque === false) {
                motifs.push('RETIRÉE de la sélection (dansBibliotheque = false)');
            }
            if (!demoActif && estDemo(p)) {
                motifs.push('comptée comme DÉMO' +
                    (p.isDemo === true ? ' (isDemo = true)' : ' (auteur = "Demo Labo Codex")') +
                    ' et le mode démo est inactif');
            }
            if (motifs.length) {
                masquees.push({ p, motifs });
            } else {
                visibles++;
            }
        });

        console.log('   Visibles : ' + visibles + '   ·   Masquées : ' + masquees.length);

        if (masquees.length === 0) {
            console.log('   ⮕ Aucune production masquée. Si un ajout reste invisible malgré ça,');
            console.log('     le problème n\'est PAS un filtre de données : envoie-moi ce rapport.');
        } else {
            console.log('   ⮕ Ces productions existent dans tes données mais ne s\'affichent pas :');
            masquees.forEach(({ p, motifs }) => {
                console.log('     · « ' + (p.titre || p.nom || 'Sans titre') + ' »  [' + p.id + ']');
                motifs.forEach(m => console.log('         motif : ' + m));
                if (p.dansBibliotheque === false) {
                    console.log('         geste : ouvre la bibliothèque, elle est dans « disponibles à ajouter ».');
                }
            });
        }
        console.log(LIGNE);

        /* ------------------------------------------------------------------
           B. DOUBLONS DANS TON COURS
           ------------------------------------------------------------------ */
        console.log('B. DOUBLONS DANS TES PRODUCTIONS (trimestre actif)');
        const groupesCours = grouperParTitre(productions);

        if (groupesCours.length === 0) {
            console.log('   Aucun groupe de même nom. Rien à trancher ici.');
        } else {
            groupesCours.forEach(([titre, items]) => {
                // vraies copies = même ascendance (idOriginal), ou id identique
                const parOrigine = new Map();
                items.forEach(p => {
                    const souche = p.idOriginal || p.id;
                    if (!parOrigine.has(souche)) parOrigine.set(souche, []);
                    parOrigine.get(souche).push(p);
                });
                const vraisDoublons = [...parOrigine.values()].filter(g => g.length > 1);

                console.log('   « ' + (items[0].titre || titre) + ' » — ' + items.length + ' exemplaires');
                items.forEach(p => {
                    console.log('       ' + p.id +
                        (p.idOriginal ? '   ← copie de ' + p.idOriginal : '   (original)') +
                        (p.dateImport ? '   importée le ' + String(p.dateImport).slice(0, 10) : '') +
                        (p.dansBibliotheque === false ? '   [retirée de la sélection]' : ''));
                });
                if (vraisDoublons.length) {
                    const aRetirer = vraisDoublons.reduce((n, g) => n + g.length - 1, 0);
                    console.log('       ⮕ VRAIES COPIES : ' + aRetirer + ' exemplaire(s) en trop (même ascendance).');
                } else {
                    console.log('       ⮕ Ascendances différentes : homonymes probablement légitimes.');
                }
            });
        }
        console.log(LIGNE);

        /* ------------------------------------------------------------------
           C. DOUBLONS DANS LA BIBLIOTHÈQUE PARTAGÉE
           ------------------------------------------------------------------ */
        console.log('C. DOUBLONS DANS LA BIBLIOTHÈQUE PARTAGÉE');
        console.log('   Total en bibliothèque : ' + biblio.length);
        const groupesBiblio = grouperParTitre(biblio);
        if (groupesBiblio.length === 0) {
            console.log('   Aucun groupe de même nom.');
        } else {
            groupesBiblio.forEach(([titre, items]) => {
                console.log('   « ' + (items[0].titre || titre) + ' » — ' + items.length + ' exemplaires');
                items.forEach(p => console.log('       ' + p.id +
                    (p.dateAjoutBiblio ? '   ajoutée le ' + String(p.dateAjoutBiblio).slice(0, 10) : '')));
            });
        }
        console.log(LIGNE);

        /* ------------------------------------------------------------------
           D. RÉSUMÉ
           ------------------------------------------------------------------ */
        const enTrop = groupesCours.reduce((total, [, items]) => {
            const parOrigine = new Map();
            items.forEach(p => {
                const souche = p.idOriginal || p.id;
                parOrigine.set(souche, (parOrigine.get(souche) || 0) + 1);
            });
            return total + [...parOrigine.values()].reduce((n, c) => n + Math.max(0, c - 1), 0);
        }, 0);

        /* ------------------------------------------------------------------
           E. OÙ SONT PASSÉES MES PRODUCTIONS ? (toutes les clés)
           ------------------------------------------------------------------ */
        console.log('E. TOUTES LES COLLECTIONS DE PRODUCTIONS DU STOCKAGE');
        console.log('   (si un ajout a atterri ailleurs, il apparaît ici)');
        let toutesCles = [];
        try {
            toutesCles = (await db.keys()) || [];
        } catch (e) {
            console.warn('   db.keys() indisponible : ' + (e && e.message));
        }
        const clesProd = toutesCles.filter(k => /(^|_)productions$/.test(k) || k === 'bibliothequeProductions');
        for (const k of clesProd) {
            const v = (await db.get(k)) || [];
            const n = Array.isArray(v) ? v.length : '(pas un tableau)';
            console.log('   ' + k + ' : ' + n);
            if (Array.isArray(v) && v.length && v.length <= 20) {
                v.forEach(x => console.log('       · ' + (x.titre || x.nom || '(sans titre)') + '  [' + x.id + ']'));
            }
        }
        console.log(LIGNE);

        /* ------------------------------------------------------------------
           F. LA GARDE #340 BLOQUE-T-ELLE TES AJOUTS ?
           ------------------------------------------------------------------
           Une garde d'écriture refuse d'enregistrer un tableau de productions
           qui n'appartiendrait pas au trimestre visé. Quand elle refuse, elle
           écrit « [DB][GARDE #340] Écriture BLOQUÉE » dans la console — mais
           l'app affiche quand même « ajoutée à ton cours ! ». C'est le seul
           mécanisme connu qui produit exactement ce symptôme.
           ------------------------------------------------------------------ */
        console.log('F. GARDE D\'ÉCRITURE #340 — peut-elle refuser tes ajouts ?');
        const cours = (typeof db.getSync === 'function') ? (db.getSync('cours', []) || []) : [];
        console.log('   Fiches de cours connues : ' + cours.length);

        if (cours.length === 0) {
            console.log('   ⮕ Aucune fiche de cours : la garde ne s\'active jamais. Elle est hors de cause.');
        } else {
            const map = {};
            cours.forEach(c => { if (c && c.id && c.trimestreId) map[c.id] = c.trimestreId; });

            let natifs = 0, etrangers = 0, neutres = 0;
            productions.forEach(p => {
                if (!p.coursId) { neutres++; return; }
                const tr = map[p.coursId];
                if (!tr) { neutres++; return; }
                if (tr === trimestre) natifs++; else etrangers++;
            });

            console.log('   Dans ' + cleProd + ' : ' + natifs + ' native(s), ' +
                etrangers + ' étrangère(s), ' + neutres + ' neutre(s) (sans cours résolvable)');

            if (natifs > 0) {
                console.log('   ⮕ Au moins une production NATIVE est présente : la garde AUTORISE');
                console.log('     toutes les écritures. Elle est hors de cause.');
            } else {
                console.log('   ⚠ AUCUNE production native. Dans cet état, la garde REFUSE toute');
                console.log('     écriture d\'un tableau contenant 2 productions étrangères ou plus —');
                console.log('     et l\'app affiche quand même un message de succès.');
                console.log('     ⮕ C\'est le suspect n°1 de « mes ajouts n\'apparaissent pas ».');
                console.log('     Vérifie : reclique « Ajouter à ma sélection » et cherche dans la');
                console.log('     console une ligne rouge « [DB][GARDE #340] Écriture BLOQUÉE ».');
            }
        }
        console.log(LIGNE);

        /* ------------------------------------------------------------------
           G. IDENTIFIANTS PARTAGÉS ENTRE COLLECTIONS
           ------------------------------------------------------------------
           Deux collections qui portent les MÊMES identifiants ne sont pas
           forcément un défaut : « Importer » dépose une production dans la
           bibliothèque en CONSERVANT son identifiant, donc le recouvrement
           entre un trimestre et la bibliothèque est normal.

           Ce qui n'est PAS normal, c'est qu'un même identifiant porte deux
           TITRES différents selon la collection : l'un des deux a été renommé
           après la copie, et plus rien ne dit lequel fait foi.
           ------------------------------------------------------------------ */
        console.log('G. IDENTIFIANTS PARTAGÉS ENTRE COLLECTIONS');

        const collections = {};
        for (const k of clesProd) {
            const v = (await db.get(k)) || [];
            if (Array.isArray(v)) collections[k] = v;
        }

        const noms = Object.keys(collections);
        let divergences = 0;
        for (let i = 0; i < noms.length; i++) {
            for (let j = i + 1; j < noms.length; j++) {
                const A = collections[noms[i]], B = collections[noms[j]];
                const parId = new Map(B.map(x => [x.id, x]));
                const communs = A.filter(x => parId.has(x.id));
                if (communs.length === 0) continue;

                console.log('   ' + noms[i] + '  ∩  ' + noms[j] + '  : ' +
                    communs.length + ' identifiant(s) en commun');

                communs.forEach(a => {
                    const b = parId.get(a.id);
                    const ta = (a.titre || a.nom || ''), tb = (b.titre || b.nom || '');
                    if (normaliserTitre(ta) !== normaliserTitre(tb)) {
                        divergences++;
                        console.log('       ⚠ MÊME id, TITRES DIFFÉRENTS  [' + a.id + ']');
                        console.log('           ' + noms[i] + ' : « ' + ta + ' »');
                        console.log('           ' + noms[j] + ' : « ' + tb + ' »');
                    }
                });
            }
        }
        if (divergences === 0) {
            console.log('   Aucune divergence de titre sur un identifiant partagé.');
        } else {
            console.log('   ⮕ ' + divergences + ' divergence(s) : un renommage n\'a pas suivi la copie.');
        }

        // Sens de la copie + nature des items du trimestre a2025 (pack démo ?)
        console.log('');
        console.log('   NATURE DES ITEMS (pour distinguer une vraie donnée d\'une copie du pack démo)');
        noms.forEach(k => {
            const v = collections[k];
            if (!v.length) return;
            const nDemo = v.filter(estDemo).length;
            const dates = v.map(x => x.dateCreation || x.dateModification || x.dateAjoutBiblio || x.dateImport)
                .filter(Boolean).sort();
            console.log('   ' + k + ' : ' + v.length + ' item(s), ' + nDemo + ' marqué(s) démo' +
                (dates.length ? '  · dates ' + String(dates[0]).slice(0, 10) + ' → ' + String(dates[dates.length - 1]).slice(0, 10)
                              : '  · aucune date'));
        });
        console.log('   ⮕ « marqué démo » = isDemo:true ou auteur « Demo Labo Codex ». L\'estampille');
        console.log('     isDemo n\'existe que depuis le 21 août 2026 : des items démo SEMÉS AVANT');
        console.log('     cette date ne la portent pas et sont donc indiscernables de tes vraies');
        console.log('     productions. Les dates aident alors à trancher le sens de la copie.');
        console.log(LIGNE);

        /* ------------------------------------------------------------------
           H. LE TEST DÉCISIF — tes évaluations pointent-elles vers ces
              productions ?
           ------------------------------------------------------------------
           Savoir qu'une collection porte les identifiants du pack démo ne dit
           PAS qui a copié qui : le pack a pu être authoré depuis un vrai cours.

           Ce qui tranche, c'est le TRAVAIL DES ÉTUDIANTS. Chaque évaluation
           enregistrée porte un `productionId`. Si les évaluations d'un
           trimestre pointent vers les productions de ce trimestre, ces
           productions sont bien celles sur lesquelles tu as évalué — quelle
           que soit l'origine de leurs identifiants, il n'y a rien à réparer.
           Si elles pointent ailleurs, les productions ont été remplacées et
           les évaluations sont orphelines.
           ------------------------------------------------------------------ */
        console.log('H. TES ÉVALUATIONS POINTENT-ELLES VERS CES PRODUCTIONS ?');

        var trimestresListe = db.getSync('trimestres', []) || [];
        let auMoinsUn = false;

        for (const t of trimestresListe) {
            if (!t || !t.id) continue;
            const evals = (await db.get(t.id + '_evaluationsSauvegardees')) || [];
            if (!Array.isArray(evals) || evals.length === 0) continue;
            auMoinsUn = true;

            const prods = collections[t.id + '_productions'] || [];
            const idsProds = new Set(prods.map(x => x.id));

            const refs = evals.map(e => e && e.productionId).filter(Boolean);
            const resolues = refs.filter(id => idsProds.has(id));
            const orphelines = refs.filter(id => !idsProds.has(id));
            const idsOrphelins = [...new Set(orphelines)];

            console.log('   ' + t.id + ' : ' + evals.length + ' évaluation(s), ' +
                refs.length + ' avec production · ' + resolues.length + ' résolue(s), ' +
                orphelines.length + ' orpheline(s)');

            if (idsOrphelins.length) {
                console.log('       ⚠ productions RÉFÉRENCÉES MAIS ABSENTES de ' + t.id + '_productions :');
                idsOrphelins.slice(0, 12).forEach(id => console.log('           ' + id));
                if (idsOrphelins.length > 12) console.log('           … et ' + (idsOrphelins.length - 12) + ' autre(s)');
                console.log('       ⮕ les productions de ce trimestre ne sont PAS celles sur');
                console.log('         lesquelles tu as évalué : elles ont été remplacées.');
            } else if (refs.length) {
                console.log('       ✓ Toutes les évaluations retrouvent leur production.');
                console.log('         ⮕ Ces productions sont bien les tiennes. Rien à réparer ici,');
                console.log('           même si leurs identifiants se retrouvent dans le pack démo.');
            }
        }

        if (!auMoinsUn) {
            console.log('   Aucune évaluation enregistrée : ce test ne peut rien trancher.');
        }
        console.log(LIGNE);

        console.log('D. RÉSUMÉ');
        console.log('   Productions du trimestre : ' + productions.length +
            '  (visibles ' + visibles + ', masquées ' + masquees.length + ')');
        console.log('   Exemplaires en trop, de même ascendance : ' + enTrop);
        console.log('   Bibliothèque partagée : ' + biblio.length + ' production(s)');
        console.log('');
        console.log('   RIEN N\'A ÉTÉ MODIFIÉ. Copie ce rapport et renvoie-le-moi :');
        console.log('   je te préparerai la suppression ciblée, exemplaire par exemplaire.');
        console.log('==== fin du relevé ====');

        // Objet exploitable si tu préfères me le coller en JSON :
        //   copy(JSON.stringify(window.__diagProd))
        window.__diagProd = {
            version, build, trimestre,
            total: productions.length, visibles,
            masquees: masquees.map(({ p, motifs }) => ({ id: p.id, titre: p.titre, motifs })),
            doublonsCours: groupesCours.map(([, items]) => items.map(p => ({
                id: p.id, titre: p.titre, idOriginal: p.idOriginal || null
            }))),
            doublonsBiblio: groupesBiblio.map(([, items]) => items.map(p => ({ id: p.id, titre: p.titre }))),
            enTrop, totalBiblio: biblio.length
        };
        console.log('(détail complet aussi dans window.__diagProd)');
    }

    window.diagProductions = diagProductions;
    console.log('Script chargé. Tape maintenant :  await diagProductions()');
})();
