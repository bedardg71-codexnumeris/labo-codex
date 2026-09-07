/**
 * SENTINELLE #755 — AUCUNE SOURCE `js/` N'EST LUE COMME UN FICHIER BINAIRE.
 *
 * `js/travaux-archivage.js` écrivait sa plage de caractères de contrôle EN CLAIR
 * dans une expression régulière : les octets 0x00 à 0x1F et 0x7F étaient
 * réellement présents dans le fichier. Conséquences mesurées :
 *   · `git diff` rendait « Bin 35090 -> 36556 bytes » — aucune relecture possible
 *     (déjà relevé au #566, le 29 août, sans que la cause soit vue) ;
 *   · `grep` n'y trouvait rien sans `-a`, `git grep` répondait « Binary file … ».
 * Trouvé le 6 septembre 2026 en mesurant le PDF de l'élève : dix minutes passées
 * à croire l'export Léa absent du code, parce que l'outil de recherche mentait.
 *
 * Un fichier source qu'on ne peut ni relire en diff ni chercher au grep est une
 * zone aveugle — pour une session comme pour une relecture croisée.
 *
 * Deux bords :
 *   A — aucune source de `js/` ni de `scripts/` n'en porte (mesuré en chemin : le même
 *       défaut vivait à `scripts/reparation-448-doublons-import.js:410`, un NUL brut
 *       écrit dans un littéral ; `libs/` est hors garde, ce sont des tierces minifiées) ;
 *   B — le comportement n'a pas bougé : `_assainirSegmentChemin` retire toujours
 *       exactement les mêmes caractères, et ne touche à rien d'autre.
 *
 * BREAK-TEST attendu : réécrire la plage en octets réels (`\x00-\x1F` remplacé
 * par les caractères eux-mêmes) → A rougit en nommant le fichier et la ligne.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

/**
 * Les sources que NOUS écrivons : `js/` et `scripts/`. `libs/` en est exclu —
 * jspdf, jszip et pdf.worker sont des bibliothèques tierces minifiées, elles
 * portent légitimement des octets de contrôle et nous ne les relisons pas.
 */
function sourcesDuProjet(acc = []) {
    for (const racine of ['js', 'scripts']) {
        (function parcourir(dossier) {
            for (const entree of readdirSync(dossier, { withFileTypes: true })) {
                const complet = path.join(dossier, entree.name);
                if (entree.isDirectory()) parcourir(complet);
                else if (/\.(js|mjs)$/.test(entree.name)) acc.push(complet);
            }
        })(path.join(racineProjet, racine));
    }
    return acc;
}

/** Tout octet de contrôle sauf tabulation (0x09), saut de ligne (0x0A) et retour chariot (0x0D). */
function octetsDeControle(tampon) {
    const trouves = [];
    let ligne = 1;
    for (const octet of tampon) {
        if (octet === 0x0A) { ligne++; continue; }
        if (octet < 0x20 && octet !== 0x09 && octet !== 0x0D) trouves.push({ ligne, octet });
        else if (octet === 0x7F) trouves.push({ ligne, octet });
    }
    return trouves;
}

describe('#755 · A — les sources restent du texte', () => {
    it('aucune source de js/ ni de scripts/ ne porte d\'octet de contrôle brut', () => {
        const coupables = [];
        for (const fichier of sourcesDuProjet()) {
            const trouves = octetsDeControle(readFileSync(fichier));
            if (trouves.length) {
                const t = trouves[0];
                coupables.push(`${path.relative(racineProjet, fichier)} — ${trouves.length} octet(s), ` +
                    `le premier ligne ${t.ligne} (0x${t.octet.toString(16).padStart(2, '0').toUpperCase()})`);
            }
        }
        expect(
            coupables,
            'Ces sources portent des octets de contrôle en clair : git les diffe en « Bin »,\n' +
            'grep n\'y trouve rien sans -a. Écrire la plage en échappements (\\x00-\\x1F).\n  ' +
            coupables.join('\n  ')
        ).toEqual([]);
    });
});

describe('#755 · B — le nettoyage des noms de dossiers n\'a pas changé', () => {
    function assainir() {
        const win = chargerScript('js/travaux-archivage.js', {
            db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
            cle: (k) => 'test_' + k,
            echapperHtml: (s) => String(s == null ? '' : s),
            notifications: { succes() {}, erreur() {}, info() {}, warning() {} }
        }, { addEventListener: () => {}, removeEventListener: () => {} });
        return win.travauxArchivage._assainirSegmentChemin;
    }

    it('les caractères de contrôle sont retirés — les 33 d\'un coup', () => {
        const a = assainir();
        for (let code = 0; code <= 0x1F; code++) {
            const nom = 'Roy' + String.fromCharCode(code) + 'Anne';
            expect(a(nom), 'caractère 0x' + code.toString(16)).toBe('RoyAnne');
        }
        expect(a('Roy\x7FAnne')).toBe('RoyAnne');
    });

    it('et rien d\'autre ne l\'est : espace, accents et tiret survivent', () => {
        const a = assainir();
        expect(a('Roy-Tremblay Noémie 123456')).toBe('Roy-Tremblay Noémie 123456');
    });
});
