import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #531 (26 août 2026) — LE MODÈLE SE RELIT, ET LES CODES VIENNENT DE
// L'ÉCHELLE.
//
// Demande de Grégoire : télécharger un squelette de cartouche construit depuis la
// grille et l'échelle choisies, le faire remplir par une IA, le réimporter.
//
// ⚠⚠ CE QUI BLOQUAIT. Trois fonctions d'import lisaient le code de niveau avec
// une classe EN DUR, et pas la même :
//     importerCartoucheDepuisTxt  →  ([IDME0])   le zéro passe
//     importerCommentaires        →  ([IDME])    le zéro est REJETÉ
//     parserMarkdownCartouche     →  ([IDME])    le zéro est REJETÉ
// L'échelle de Grégoire est « 0-IDME (5 niv.) » : selon le bouton emprunté, ses
// commentaires de niveau 0 revenaient ou disparaissaient en silence. Un modèle
// livré sans corriger cela aurait été un fichier que l'application ne sait pas
// relire complètement.
//
// ⮕ CE QUE CE BANC TIENT : l'ALLER-RETOUR. Un modèle rempli doit se relire
// entièrement, sur une échelle quelconque — pas seulement sur IDME.

function monter() {
    const globaux = {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null),
              set: async () => {}, setSync: () => {} },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        alert: () => {}, confirm: () => true,
        notifications: { succes: () => {}, erreur: () => {}, info: () => {}, avertissement: () => {} },
        cartoucheActuel: null,
        calculerPourcentageComplete: async () => {},
        document: { getElementById: () => null, querySelector: () => null,
                    querySelectorAll: () => [], addEventListener() {},
                    createElement: () => ({ style: {}, classList: { add() {}, remove() {} } }) }
    };
    return chargerScript('js/cartouches.js', globaux);
}

const CRITERES = [
    { id: 'CR_1', nom: 'Structure' },
    { id: 'CR_2', nom: 'Rigueur' }
];

/* --------------------------------- A — les codes viennent de l'échelle */

describe('#531 · A — la lecture s\'adapte à l\'échelle, quelle qu\'elle soit', () => {

    it('A.a LE CAS DE GRÉGOIRE : le niveau « 0 » de son échelle 0-IDME est lu', () => {
        const win = monter();
        const niveaux = [{ code: '0' }, { code: 'I' }, { code: 'D' }, { code: 'M' }, { code: 'E' }];
        const lu = win.lireLigneCommentaire('**Structure (0)** : Rien de déposé.', niveaux);
        expect(lu, 'avant #531, la classe [IDME] rejetait le zéro').toBeTruthy();
        expect(lu.niveau).toBe('0');
        expect(lu.commentaire).toBe('Rien de déposé.');
    });

    it('A.b une échelle A/B/C/D est lue aussi — aucun chemin ne la lisait avant', () => {
        const win = monter();
        const niveaux = [{ code: 'A' }, { code: 'B' }, { code: 'C' }, { code: 'D' }];
        const lu = win.lireLigneCommentaire('**Rigueur (B)** : Bien, avec des écarts.', niveaux);
        expect(lu).toBeTruthy();
        expect(lu.niveau).toBe('B');
    });

    it('A.c LE PIÈGE DES CODES LONGS : « M+ » n\'est pas lu comme « M »', () => {
        // Un code peut faire trois caractères (maxlength="3"). Une classe [...]
        // aurait tronqué ; l'alternance est triée par longueur décroissante.
        const win = monter();
        const niveaux = [{ code: 'M' }, { code: 'M+' }];
        const lu = win.lireLigneCommentaire('**Structure (M+)** : Au-delà de la maîtrise.', niveaux);
        expect(lu.niveau).toBe('M+');
    });

    it('A.d un code contenant un caractère de regex est échappé', () => {
        const win = monter();
        expect(win.lireLigneCommentaire('**Structure (A.1)** : ok', [{ code: 'A.1' }]).niveau).toBe('A.1');
        // et « A.1 » ne doit pas se faire passer pour « AX1 »
        expect(win.lireLigneCommentaire('**Structure (AX1)** : ok', [{ code: 'A.1' }])).toBeNull();
    });

    it('A.e sans niveaux, on ne devine pas : la lecture rend null', () => {
        const win = monter();
        expect(win.lireLigneCommentaire('**Structure (I)** : ok', [])).toBeNull();
        expect(win.codesNiveauxPourLecture([])).toBeNull();
    });
});

/* ------------------------------- B — l'aller-retour, qui est tout l'enjeu */

describe('#531 · B — un modèle rempli se relit ENTIÈREMENT', () => {

    it('B.a LE CAS QUI PORTE LE SENS : écrire puis relire ne perd aucune case', () => {
        const win = monter();
        const niveaux = [{ code: '0' }, { code: 'I' }, { code: 'M' }];
        const commentaires = {
            'CR_1_0': 'Rien de déposé.',
            'CR_1_I': 'Le plan manque.',
            'CR_1_M': 'Structure claire.',
            'CR_2_0': 'Sans objet.',
            'CR_2_I': 'Des imprécisions.',
            'CR_2_M': 'Méthode respectée.'
        };
        // On écrit la matrice avec la MÊME fonction que le modèle et l'export.
        const texte = win.lignesMatriceCartouche(CRITERES, niveaux, commentaires).join('\n');
        const relu = win.parserMarkdownCartouche(texte, niveaux);

        // Le parseur indexe par NOM de critère en majuscules, pas par id.
        expect(relu['STRUCTURE_0']).toBe('Rien de déposé.');
        expect(relu['STRUCTURE_M']).toBe('Structure claire.');
        expect(relu['RIGUEUR_0'], 'le niveau 0 revient').toBe('Sans objet.');
        expect(Object.keys(relu), 'les six cases').toHaveLength(6);
    });

    it('B.b un modèle VIDE ne produit aucun commentaire fantôme', () => {
        const win = monter();
        const niveaux = [{ code: 'I' }, { code: 'M' }];
        const texte = win.lignesMatriceCartouche(CRITERES, niveaux, {}).join('\n');
        expect(texte, 'les lignes existent, prêtes à remplir').toContain('**Structure (I)** : ');
        expect(Object.keys(win.parserMarkdownCartouche(texte, niveaux)),
               'mais rien n\'est importé').toEqual([]);
    });

    it('B.c la structure est écrite UNE fois, partagée par le modèle et l\'export', () => {
        // Deux copies divergeraient, et un modèle qui ne se relit pas ne sert à
        // rien. C'est la couture que ce cas surveille.
        const win = monter();
        expect(typeof win.lignesMatriceCartouche).toBe('function');
        const lignes = win.lignesMatriceCartouche(CRITERES, [{ code: 'I' }], {});
        expect(lignes[0]).toBe('## Structure');
        expect(lignes.some(l => l === '---'), 'séparateur entre critères').toBe(true);
    });
});
