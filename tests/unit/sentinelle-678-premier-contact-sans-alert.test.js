import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #678 (12 oct. 2026) — LE PREMIER CONTACT SANS FENÊTRE QUI BLOQUE.
//
// Parcours (1) de la première chronique : créer un trimestre, créer un groupe-cours, prendre
// les présences. Remesuré : 40 `alert()` dans les huit fichiers du parcours. Les 23 qu'un geste
// atteint passent par les notifications de l'application (ou, pour le refus de supprimer un
// cours, qui énumère ce qui s'y rattache, par sa fenêtre d'information) ; mots gardés.
// Les 17 qui restaient sont NOMMÉS ici, fonction par fonction, avec leur raison (10 depuis le
// 14 oct. 2026 : les 7 de trimestre-v2-liste.js — « Clore », « Rouvrir », archiverTrimestreActif,
// gardés au moratoire de l'archivage #622 — sont partis avec la clôture de l'hiver 2026) :
//   trimestre-v2-cours.js ×5 — modifier/dupliquer un cours (aucun déclencheur, mesuré le 1er sept.
//     et remesuré) ; supprimerCoursV2 : garde de repli, ne parle que si cours.js manque ;
//   trimestre-v2-horaires.js ×3 — confirmerSeanceV2 : aucun appelant, et son bouton
//     `v2-btnConfirmerSeance` n'existe pas dans index.html ;
//   trimestre-v2-etudiants.js ×1 — sauvegarderGroupeEtudiantsV2 : aucun appelant ;
//   trimestre-v2-groupes-cours.js ×1 — ouvrirAideGroupeCours : aucun appelant.
// Un site qui gagne un déclencheur sort de cette liste et passe aux notifications.

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

/** Les `alert(` natifs d'un fichier, hors commentaires, chacun rattaché à sa fonction. */
function alertesParFonction(fichier) {
    const lignes = lire(fichier).split('\n');
    const parFonction = {};
    let fn = '(module)';
    for (const ligne of lignes) {
        const m = /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/.exec(ligne);
        if (m) fn = m[1];
        if (/^\s*(\/\/|\*)/.test(ligne)) continue;
        const n = (ligne.match(/(^|[^.\w])alert\(/g) || []).length;
        if (n) parFonction[fn] = (parFonction[fn] || 0) + n;
    }
    return parFonction;
}

describe('#678 · A — les alertes restantes du parcours sont toutes nommées', () => {
    const ATTENDU = {
        'js/cours.js': {},
        'js/trimestre-v2-init.js': {},
        'js/saisie-presences.js': {},
        'js/trimestre-v2-liste.js': {},
        'js/trimestre-v2-cours.js': { supprimerCoursV2: 1, modifierCoursSelectionneV2: 2, dupliquerCoursSelectionneV2: 2 },
        'js/trimestre-v2-horaires.js': { confirmerSeanceV2: 3 },
        'js/trimestre-v2-etudiants.js': { sauvegarderGroupeEtudiantsV2: 1 },
        'js/trimestre-v2-groupes-cours.js': { ouvrirAideGroupeCours: 1 }
    };
    for (const [fichier, attendu] of Object.entries(ATTENDU)) {
        it(`${fichier} : ${Object.keys(attendu).length ? 'seulement ' + Object.keys(attendu).join(', ') : 'aucun alert()'}`, () => {
            expect(alertesParFonction(fichier)).toEqual(attendu);
        });
    }

    it('les fonctions gardées pour « aucun appelant » n\'en ont toujours pas', () => {
        const fichiers = readdirSync(path.join(RACINE, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f);
        const lignes = fichiers.concat(['index.html']).flatMap((f) => lire(f).split('\n'))
            .filter((l) => !/^\s*(\/\/|\*)/.test(l));
        for (const nom of ['confirmerSeanceV2', 'sauvegarderGroupeEtudiantsV2', 'ouvrirAideGroupeCours']) {
            const appels = lignes.filter((l) => new RegExp('\\b' + nom + '\\b').test(l))
                .filter((l) => !new RegExp('function ' + nom + '\\b|window\\.' + nom + '\\s*=').test(l));
            expect(appels, nom + ' a gagné un appelant : convertir son alert()').toEqual([]);
        }
        expect(lire('index.html')).not.toContain('v2-btnConfirmerSeance');
    });
});

describe('#678 · B — un geste du parcours parle par les notifications', () => {
    function charger() {
        const vus = [];
        const win = chargerScript('js/cours.js', {
            db: { get: async () => [], getSync: () => [], set: async () => {}, setSync() {}, modifier: async () => undefined },
            echapperHtml: (s) => String(s),
            notifications: {
                succes: (m, d) => vus.push(['succes', m, d]), erreur: (m, d) => vus.push(['erreur', m, d]),
                info: (m, d) => vus.push(['info', m, d]), warning: (m, d) => vus.push(['warning', m, d])
            },
            alert: () => { throw new Error('alert() natif appelé (#678)'); }
        });
        return { win, vus };
    }

    // #1159 (lot 6, 25 oct. 2026) — B.a retiré avec son geste : `partagerCours` (« Déposer dans les cours
    // disponibles ») est parti.

    // #1159 (verdict du lot 6, § 2.1) — réancré : plus aucune notification de la bibliothèque des cours ne
    // dit « ta sélection » ; « Exporter tous mes cours » sans cours dit « Aucun cours à exporter. ».
    it('B.b exporter tous les cours, sans cours : notification d\'information', async () => {
        const { win, vus } = charger();
        await win.partagerTousLesCours();
        expect(vus).toEqual([['info', 'Aucun cours à exporter.', undefined]]);
    });
});
