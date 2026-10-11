import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #324 (lot 11, 11 oct. 2026) — LA LIGNE « REPRISES » DU COMPARATEUR, POUR UNE SOMMATIVE,
// DIT CE QUI S'APPLIQUE. Aligné sur #903 : le déclaratif `reprisesPermises` n'est lu par aucun calcul ;
// une reprise remplace la copie d'origine (`remplaceeParId`), quel que soit ce déclaratif. Avant, une
// sommative créée depuis #903 (sans le champ) lisait « Non permises », et une ancienne lisait
// « Limitées » ou « Illimitées » : trois promesses d'une règle que rien n'applique.
// Break-test : rétablir la lecture de `reprisesPermises` → rouge.

const globaux = { db: { getSync: (k, d) => (d !== undefined ? d : null), setSync() {} }, cle: (k) => k };
const win = chargerScript('js/pratiques/construction-attributs.js', globaux);
const ligneReprises = (config) => win.ConstructionAttributs.extraire(config).attributs.find(a => a.axe === 'reprises').valeur;
const PHRASE = 'La reprise prend la place de la copie d\'origine dans la note';

describe('#324 · Comparateur : la ligne « Reprises » d\'une sommative', () => {
    it.each([
        ['sans déclaratif (toute sommative créée depuis #903)', { type: 'sommative' }],
        ['ancien déclaratif « non »', { type: 'sommative', configuration: { reprisesPermises: 'non' } }],
        ['ancien déclaratif « limitees »', { type: 'sommative', configuration: { reprisesPermises: 'limitees' } }],
        ['ancien déclaratif « illimitees »', { type: 'sommative', reprisesPermises: 'illimitees' }]
    ])('%s : la même phrase', (_, config) => {
        expect(ligneReprises(config)).toBe(PHRASE);
    });

    it('les autres familles ne changent pas (dénotation : s.o.)', () => {
        expect(ligneReprises({ type: 'denotation' })).toBe('s.o.');
    });
});
