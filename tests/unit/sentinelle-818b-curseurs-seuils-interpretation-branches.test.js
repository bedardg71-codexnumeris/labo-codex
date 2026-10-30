import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

// #818 suite (10 sept. 2026) — LES TROIS CURSEURS NE PILOTAIENT RIEN.
//
// CE QUI A ÉTÉ MESURÉ, en allant écrire l'entrée de glossaire que Grégoire
// venait d'arbitrer. Les curseurs « Fragile / Acceptable / Bon » de
// Labo > Outils d'observation écrivaient `fragile`, `acceptable` et `bon` À
// PLAT, à la racine de `seuilsInterpretation`. Les consommateurs —
// `etudiants.js` (couleur des indices) et `profil-etudiant-helpers.js`
// (interprétation de A et de C) — lisent la branche `interpretation`.
// Rien ne reliait les deux, et `fusionnerAvecDefauts` ne parcourt que les clés
// du modèle : les clés plates ne figuraient même pas dans l'objet rendu.
//
// Le panneau relisait ses propres curseurs en direct (`db.getSync` brut) : ils
// gardaient la valeur posée et la remontraient. Le réglage SEMBLAIT tenir.
// Et les défauts coïncident (70/80/85), ce qui rendait le défaut invisible tant
// que personne ne bougeait un curseur.
//
// ⚠ Les deux vocabulaires nomment la MÊME frontière par des côtés opposés :
// « Fragile 70 » = « sous 70, c'est fragile » ; `acceptable: 0.70` = « à partir
// de 70, c'est acceptable ». Ce n'est pas un décalage, c'est la même borne vue
// par en dessous ou par en dessus.
//
// Break-tests (faits rougir AVANT de faire confiance à ce banc) :
//   1. retirer l'appel à `migrerSeuilsPlats` → cas 1 et 2 rougissent.
//   2. remettre l'écriture plate dans `preferences-v2.js` → cas 5 rougit.
//   3. faire pointer `fragile` vers `excellent` dans la table → cas 1 rougit.
//   4. faire relire les clés plates au panneau → cas 6 rougit.

function monter(etatInitial) {
    const store = etatInitial === undefined ? {} : { seuilsInterpretation: etatInitial };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async () => null, set: async () => {}
    };
    const win = chargerScript('js/interpretation-config.js', { db });
    return { win, store };
}

function lireCodeSansCommentaires(chemin) {
    return readFileSync(path.join(racine, chemin), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((l) => !/^\s*\/\//.test(l))
        .join('\n');
}

describe('#818 suite · les curseurs d\'interprétation atteignent enfin les calculs', () => {

    it('1. un réglage laissé à plat est repris dans la branche que les calculs lisent', () => {
        // Trois valeurs volontairement éloignées des défauts (70/80/85).
        const { win } = monter({ fragile: 0.55, acceptable: 0.66, bon: 0.77 });
        expect(win.obtenirSeuil('interpretation.acceptable'), '« Fragile » n\'atteint pas `acceptable`').toBe(0.55);
        expect(win.obtenirSeuil('interpretation.bon'), '« Acceptable » n\'atteint pas `bon`').toBe(0.66);
        expect(win.obtenirSeuil('interpretation.excellent'), '« Bon » n\'atteint pas `excellent`').toBe(0.77);
    });

    it('2. les clés plates ne survivent pas à côté : une seule vérité est persistée', () => {
        const { win, store } = monter({ fragile: 0.55, acceptable: 0.66, bon: 0.77 });
        win.obtenirSeuil('interpretation.acceptable'); // déclenche le chargement
        const persiste = store.seuilsInterpretation;
        for (const plat of ['fragile', 'acceptable', 'bon']) {
            expect(
                Object.prototype.hasOwnProperty.call(persiste, plat),
                `la clé plate « ${plat} » a survécu : deux vérités pour un même réglage`
            ).toBe(false);
        }
        expect(persiste.interpretation).toEqual({ excellent: 0.77, bon: 0.66, acceptable: 0.55 });
    });

    it('3. les autres seuils du même objet ne sont pas emportés par la reprise', () => {
        const { win, store } = monter({ fragile: 0.55, defiSpecifique: 0.62, idme: { maitrise: 0.9 } });
        expect(win.obtenirSeuil('defiSpecifique')).toBe(0.62);
        // 30 oct. 2026 : `idme` est sorti du modèle, plus personne ne le lit ; il reste dans l'objet enregistré (tarir n'est pas réparer).
        expect(win.chargerSeuilsInterpretation().idme).toEqual({ maitrise: 0.9 });
        expect(store.seuilsInterpretation.idme).toEqual({ maitrise: 0.9 });
        // Les branches absentes retombent sur le modèle, pas sur du vide.
        expect(win.obtenirSeuil('interpretation.bon')).toBe(win.SEUILS_PAR_DEFAUT.interpretation.bon);
    });

    it('4. sans clé plate, rien ne bouge — la reprise ne réécrit pas pour rien', () => {
        const complet = JSON.parse(JSON.stringify(
            chargerScript('js/interpretation-config.js', {
                db: { getSync: () => null, setSync: () => {}, get: async () => null, set: async () => {} }
            }).SEUILS_PAR_DEFAUT
        ));
        const { win, store } = monter(complet);
        const avant = JSON.stringify(store.seuilsInterpretation);
        win.obtenirSeuil('interpretation.bon');
        expect(JSON.stringify(store.seuilsInterpretation), 'une écriture a eu lieu sans raison').toBe(avant);
    });

    it('5. le panneau ÉCRIT dans la branche, et ne repose plus de clé plate', () => {
        const code = lireCodeSansCommentaires('js/preferences-v2.js');
        expect(code, 'le panneau n\'écrit pas `interpretation.acceptable`').toMatch(/seuils\.interpretation\.acceptable\s*=/);
        expect(code, 'le panneau n\'écrit pas `interpretation.bon`').toMatch(/seuils\.interpretation\.bon\s*=/);
        expect(code, 'le panneau n\'écrit pas `interpretation.excellent`').toMatch(/seuils\.interpretation\.excellent\s*=/);
        for (const plat of ['fragile', 'acceptable', 'bon']) {
            expect(
                new RegExp(`seuils\\.${plat}\\s*=`).test(code),
                `le panneau repose la clé plate « ${plat} »`
            ).toBe(false);
        }
    });

    it('6. le panneau RELIT la source, pas ses propres clés plates', () => {
        const code = lireCodeSansCommentaires('js/preferences-v2.js');
        for (const [id, chemin] of [
            ['v2-seuil-fragile', 'interpretation.acceptable'],
            ['v2-seuil-acceptable', 'interpretation.bon'],
            ['v2-seuil-bon', 'interpretation.excellent']
        ]) {
            const nom = id.replace('v2-seuil-', '');
            const motif = new RegExp(`${id}[\\s\\S]{0,220}?obtenirSeuil\\(\\s*['"]${chemin.replace('.', '\\.')}['"]\\s*\\)`);
            expect(motif.test(code), `le curseur « ${nom} » ne lit pas ${chemin}`).toBe(true);
        }
    });
});
