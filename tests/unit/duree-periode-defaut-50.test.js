import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// =======================================================================
// DURÉE DE PÉRIODE — le défaut est 50 minutes, et il n'existe qu'une fois
// =======================================================================
//
// Demande de Grégoire, 22 août 2026 : « je voudrais que par défaut elle soit
// de 50 minutes ». Ses périodes durent 50 minutes ; l'app repliait sur 55.
//
// Le défaut vivait en littéral `55` dans QUATORZE sites de calcul répartis sur
// neuf fichiers, plus une option `selected` d'index.html — soit quinze
// occasions de diverger. Il vit désormais une seule fois :
// DUREE_PERIODE_DEFAUT (js/horaire.js), exposée en window pour les modules qui
// se défendent contre l'absence de horaire.js.
//
// Origine du besoin : retour terrain du 21 août (porte 1.1) — « la durée de la
// période était à 55 minutes alors que je l'avais réglée à 50 ». Mécanisme :
// obtenirDureePeriode() replie sur le littéral quand le trimestre courant ne
// déclare aucune valeur, et la migration #464 ne recopie l'ancienne valeur nue
// que vers les trimestres qui existaient AU MOMENT de la migration. Un
// trimestre créé après retombait donc sur le défaut.
//
// ⚠ Les `55` de la NOTATION (plafondVerrou, grande_difficulte, seuils
// d'échelle) sont des notes, pas des minutes : ils ne sont pas concernés, et le
// cliquet ci-dessous ne les regarde pas.

function lire(rel) {
    return readFileSync(path.join(racineProjet, rel), 'utf8');
}

describe('durée de période · le défaut vaut 50', () => {
    it('DUREE_PERIODE_DEFAUT est 50 et gouverne obtenirDureePeriode()', () => {
        const win = chargerScript('js/horaire.js', {
            db: { getSync: (k, d) => d, setSync: () => {} },
            cle: (n) => 'a2026_' + n
        });

        expect(win.DUREE_PERIODE_DEFAUT).toBe(50);
        // aucune valeur enregistrée → le défaut s'applique
        expect(win.obtenirDureePeriode()).toBe(50);
    });

    it('une valeur enregistrée n\'est JAMAIS écrasée par le défaut', () => {
        const stores = { a2026_dureePeriode: 75 };
        const win = chargerScript('js/horaire.js', {
            db: {
                getSync: (k, d) => (k in stores ? stores[k] : d),
                setSync: (k, v) => { stores[k] = v; }
            },
            cle: (n) => 'a2026_' + n
        });

        expect(win.obtenirDureePeriode()).toBe(75);
    });

    it('⚠ #540 lot E3 · la durée de période ne s\'ÉCRIT plus — elle ne se règle plus', () => {
        // Ce cas éprouvait `definirDureePeriode`. Le setter et son select ont été retirés
        // le 26 août : le champ n'existait que comme pont entre deux unités (heures
        // d'horloge à l'horaire, périodes à la présence), et un ratio est invariant par
        // unité — il ne servait donc pas à calculer l'assiduité. Depuis E1, chaque séance
        // porte son nombre de périodes.
        //
        // La LECTURE subsiste, pour relire le champ `heures` d'anciennes présences que la
        // saisie n'écrit plus : c'est un paramètre de désérialisation, pas un réglage. Ce
        // cas garde donc son objet en le retournant — il vérifie qu'aucun chemin ne
        // réécrit cette clé.
        const win = chargerScript('js/horaire.js', {
            db: { getSync: (k, d) => d, setSync: () => {} },
            cle: (n) => 'a2026_' + n
        });
        expect(typeof win.definirDureePeriode, 'le setter ne doit pas revenir').toBe('undefined');
        expect(typeof win.obtenirDureePeriode, 'la lecture reste, pour les données d\'avant').toBe('function');
    });
});

describe('durée de période · le défaut n\'existe qu\'à un seul endroit', () => {
    it('CLIQUET · aucun littéral 55 ne subsiste dans un calcul de durée', () => {
        // Toute ligne qui parle de dureePeriode ET porte un 55 est une
        // divergence : le défaut doit passer par DUREE_PERIODE_DEFAUT.
        const sortie = execFileSync('bash', ['-c',
            'grep -rn "dureePeriode" js/ --include="*.js" | grep -v "_archives" | grep -E "(\\||:|/|\\*) *55\\b" || true'
        ], { encoding: 'utf8', cwd: racineProjet }).trim();

        expect(
            sortie,
            `Un défaut de durée de période est réapparu en littéral :\n${sortie}\n` +
            `Fix : passer par DUREE_PERIODE_DEFAUT (js/horaire.js).`
        ).toBe('');
    });

    it('CLIQUET · aucune conversion heures↔périodes ne divise par 55 en dur', () => {
        // Ces conversions ignoraient le réglage : régler 50 ne changeait rien
        // à l'affichage des séances ni au total « per./semaine ».
        const sortie = execFileSync('bash', ['-c',
            'grep -rnE "(/ *55\\)|\\* *55\\) */ *60)" js/ --include="*.js" | grep -v "_archives" || true'
        ], { encoding: 'utf8', cwd: racineProjet }).trim();

        expect(
            sortie,
            `Une conversion heures/périodes divise encore par 55 en dur :\n${sortie}\n` +
            `Fix : lire la durée configurée (obtenirDureePeriode / dureePeriodeCourante).`
        ).toBe('');
    });

    it('⚠ #540 lot E3 · le sélecteur a DISPARU de l\'écran', () => {
        // Il présélectionnait 50 depuis le 22 août. Il n'existe plus : régler une durée
        // de période n'a plus de sens une fois que chaque séance porte ses périodes.
        // Ce cas veille à ce qu'il ne revienne pas — le remettre ressusciterait le pont
        // entre deux unités que le lot E a démonté.
        const html = lire('index.html');
        expect(html, 'le réglage de durée de période est revenu').not.toContain('id="v2-dureePeriode"');
        expect(html).not.toContain('Durée d\'une période');
    });
});
