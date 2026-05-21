import { describe, it, expect, beforeAll } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineJs = path.resolve(__dirname, '..', '..', 'js');

// Tests utils-notifications.js — Cat-B Track 4 chantier E (21 mai 2026).
//
// Le module expose window.notifications = { succes, erreur, info } comme
// source unique de vérité pour les notifications toast. Avant ce chantier,
// 3 implémentations canoniques (evaluation.js, groupe.js, trimestre.js) +
// 23 wrappers défensifs locaux + 4 cas spéciaux cohabitaient. utils-
// notifications.js les consolide en une seule API namespacée.
//
// Le module utilise textContent (pas innerHTML) — immunisé contre XSS
// sans dépendance à echapperHtml. Aucune contrainte d'ordre de chargement.

describe('utils-notifications · API publique', () => {
    let fauxWindow;

    beforeAll(() => {
        fauxWindow = chargerScript('js/utils-notifications.js');
    });

    it('expose window.notifications comme objet namespace', () => {
        expect(fauxWindow.notifications).toBeDefined();
        expect(typeof fauxWindow.notifications).toBe('object');
    });

    it('expose les 3 méthodes succes, erreur, info', () => {
        expect(typeof fauxWindow.notifications.succes).toBe('function');
        expect(typeof fauxWindow.notifications.erreur).toBe('function');
        expect(typeof fauxWindow.notifications.info).toBe('function');
    });

    it('chacune des 3 méthodes accepte (message) et (message, details)', () => {
        // Pas d'assertions sur le DOM (sandbox Node n'a pas de vrai document),
        // mais on vérifie qu'aucun appel ne plante avec les signatures attendues.
        expect(() => fauxWindow.notifications.succes('msg')).not.toThrow();
        expect(() => fauxWindow.notifications.succes('msg', 'détails')).not.toThrow();
        expect(() => fauxWindow.notifications.erreur('titre')).not.toThrow();
        expect(() => fauxWindow.notifications.erreur('titre', 'détails')).not.toThrow();
        expect(() => fauxWindow.notifications.info('msg')).not.toThrow();
        expect(() => fauxWindow.notifications.info('msg', 'détails')).not.toThrow();
    });

    it('coerce les arguments non-string sans planter (defense en profondeur)', () => {
        expect(() => fauxWindow.notifications.succes(null)).not.toThrow();
        expect(() => fauxWindow.notifications.succes(undefined, 42)).not.toThrow();
        expect(() => fauxWindow.notifications.erreur({ toString: () => 'obj' })).not.toThrow();
    });
});

describe('utils-notifications · Sentinelle statique (Cat-B Track 4 chantier E)', () => {
    // Sentinelle anti-régression : aucun module js/*.js ne doit définir une
    // fonction `afficherNotificationSucces` / `afficherNotificationErreur` /
    // `afficherNotification` / `afficherNotificationCopiee` / `afficherNotificationSuccesV2`
    // après la migration vers `window.notifications.X` (utils-notifications.js).
    //
    // Les wrappers défensifs dispersés (3 implémentations canoniques +
    // 23+ wrappers locaux + 4 cas spéciaux) ont été retirés pendant le
    // chantier E le 21 mai 2026. Si un commit réintroduit une définition,
    // ce test échoue et bloque la régression.

    const RE_DEFINITION = /^\s*function afficherNotification(?:Succes|Erreur|Copiee|SuccesV2)?\s*\(/m;

    function listerFichiersJs() {
        return readdirSync(racineJs)
            .filter(nom => nom.endsWith('.js'))
            .sort();
    }

    it('aucun module js/*.js ne définit une fonction afficherNotificationX', () => {
        const violations = [];
        for (const nom of listerFichiersJs()) {
            const contenu = readFileSync(path.join(racineJs, nom), 'utf8');
            const m = contenu.match(RE_DEFINITION);
            if (m) {
                const ligne = contenu.substring(0, m.index).split('\n').length;
                violations.push(`${nom}:${ligne} — ${m[0].trim()}`);
            }
        }
        expect(
            violations,
            `Régression Cat-B chantier E détectée :\n${violations.join('\n')}\n` +
            `Utiliser window.notifications.succes/erreur/info (utils-notifications.js) à la place.`
        ).toEqual([]);
    });
});
