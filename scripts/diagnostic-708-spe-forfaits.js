/* ============================================================================
   #708 — LE STOCK : COMBIEN DE PRATIQUES PAR SPÉCIFICATIONS SONT ÉCRITES EN « FORFAITS » ?
   ----------------------------------------------------------------------------
   LECTURE SEULE. N'écrit rien, ne répare rien, ne supprime rien.

   CE QU'ELLE MESURE, ET POURQUOI ELLE EXISTE.
   Jusqu'au 5 septembre 2026 (1.121.0), le moteur des spécifications ne lisait que
   `configuration.tableBundles` ; le gabarit « Modèle simple », l'éditeur de gabarit
   et l'ancien éditeur écrivent `configuration.forfaits`. Une pratique SPE configurée
   dans l'application rendait donc 0 % à toute la classe — « constructible », exportée
   « 0, final ». Le correctif #708 fait LIRE la forme « forfaits » à la lecture : rien
   n'est réécrit chez les gens (tarir n'est pas réparer). Cette sonde MESURE ce que ce
   correctif touche : pour chaque trimestre, les pratiques par spécifications, leur
   forme, les groupes-cours qui les pointent, et le nombre d'élèves concernés.

   TROIS FORMES, SÉPARÉES :
     1. « tableBundles » — la forme du moteur : calculait déjà (pack de démonstration) ;
     2. « forfaits » — la forme du gabarit et des éditeurs : rendait 0, calcule depuis #708 ;
     3. « ni l'un ni l'autre » — la forme de l'assistant (`modeleBundle` seul) : reste
        NON CONSTRUCTIBLE (null, « non constructible » à l'export) — à configurer.

   ⚠ ELLE NOMME LA CLÉ QUI A SERVI et lit chaque trimestre dans SON espace de noms
   (patron des sondes #674 et #697). Un zéro n'est une preuve d'absence que si des clés
   ont été lues : la sonde le dit.

   USAGE — dans la console de Safari, sur l'application ouverte :
       (coller le contenu de ce fichier, puis)
       await diag708()

   Repère : le rapport commence par « ==== #708 ».
   ========================================================================= */

(function () {
    'use strict';

    const VERSION_OUTIL = 'r1 · 5 septembre 2026 · D-3 de l\'audit de la pratique de notation';

    async function lire(cleBrute) {
        try { return await db.get(cleBrute); } catch (e) { return null; }
    }

    async function toutesLesCles() {
        const vues = new Set();
        try { (await db.keys()).forEach(k => vues.add(k)); } catch (e) { /* IDB indisponible */ }
        try { for (let j = 0; j < localStorage.length; j++) vues.add(localStorage.key(j)); } catch (e) { /* localStorage indisponible */ }
        return Array.from(vues);
    }

    function estSPE(p) {
        if (!p) return false;
        const type = p.type || (p.configuration && p.configuration.type) || (p.config && p.config.type);
        const methode = (p.calcul_note && p.calcul_note.methode) || (p.config && p.config.calcul_note && p.config.calcul_note.methode);
        return type === 'specifications' || methode === 'specifications';
    }

    function formeDe(p) {
        const cfg = (p && (p.configuration || p.config)) || {};
        if (Array.isArray(cfg.tableBundles) && Array.isArray(cfg.typesTravaux)) return 'tableBundles';
        if (Array.isArray(cfg.forfaits) && Array.isArray(cfg.typesTravaux)) return 'forfaits';
        return 'aucune';
    }

    async function diag708() {
        const lignes = [];
        const dire = (s) => { lignes.push(s); };
        dire('==== #708 — pratiques par spécifications : quelle forme, qui les pointe (' + VERSION_OUTIL + ') ====');

        const cles = await toutesLesCles();
        const clesPratiques = cles.filter(k => /(^|_)pratiquesConfigurables$/.test(k)).sort();
        if (clesPratiques.length === 0) {
            dire('⚠ Aucune clé *pratiquesConfigurables* lue : ce zéro ne prouve rien.');
            console.log(lignes.join('\n'));
            return { clesLues: [], pratiques: [] };
        }

        const total = { tableBundles: 0, forfaits: 0, aucune: 0 };
        const resultat = [];
        for (const clePratiques of clesPratiques) {
            const prefixe = clePratiques.replace(/pratiquesConfigurables$/, '');
            const pratiques = (await lire(clePratiques)) || [];
            const groupes = (await lire(prefixe + 'groupesCours')) || [];
            const etudiants = (await lire(prefixe + 'groupeEtudiants')) || [];
            const spe = (Array.isArray(pratiques) ? pratiques : []).filter(estSPE);
            dire('— clé « ' + clePratiques + ' » : ' + (Array.isArray(pratiques) ? pratiques.length : 0) + ' pratique(s), dont ' + spe.length + ' par spécifications');
            spe.forEach(p => {
                const forme = formeDe(p);
                total[forme]++;
                const pointeurs = (Array.isArray(groupes) ? groupes : []).filter(g => g && g.pratiqueId === p.id);
                const nbEleves = pointeurs.reduce((n, g) => n + (Array.isArray(etudiants) ? etudiants.filter(e => e && (e.coursId === g.id || !e.coursId)).length : 0), 0);
                const verdict = forme === 'tableBundles' ? 'calculait déjà'
                    : forme === 'forfaits' ? 'rendait 0 — CALCULE depuis #708, sans réécriture'
                    : 'NON CONSTRUCTIBLE (ni types ni forfaits) — à configurer dans le gabarit';
                dire('   · « ' + (p.nom || p.id) + ' » (' + p.id + ') — forme « ' + forme + ' » — pointée par ' + pointeurs.length + ' groupe(s)-cours, ' + nbEleves + ' élève(s) — ' + verdict);
                resultat.push({ cle: clePratiques, id: p.id, nom: p.nom, forme: forme, groupes: pointeurs.map(g => g.id), eleves: nbEleves });
            });
        }
        dire('— total : ' + total.tableBundles + ' en « tableBundles », ' + total.forfaits + ' en « forfaits », ' + total.aucune + ' sans forme calculable — sur ' + clesPratiques.length + ' clé(s) lue(s).');
        dire('Rien n\'a été écrit.');
        console.log(lignes.join('\n'));
        return { clesLues: clesPratiques, pratiques: resultat, total: total };
    }

    window.diag708 = diag708;
})();
