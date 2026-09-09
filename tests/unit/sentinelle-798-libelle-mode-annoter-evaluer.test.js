/**
 * SENTINELLE #798 — LE BOUTON DIT LE MODE OÙ L'ON EST.
 *
 * Rapport testeur du 9 septembre 2026 : « Parfois le bouton Annoter/Évaluer/
 * Modifier ne se met pas à jour en fonction de la page. Ici le bouton affiche
 * Évaluer alors que nous sommes en mode Annotation. »
 *
 * Mesuré : `modeCourant` et le libellé du bouton étaient DEUX vérités. Le
 * libellé ne s'écrivait qu'à deux endroits (la création du menu, et
 * `basculerMode`), tandis que SIX chemins remettaient `modeCourant` à
 * « annoter » sans rien dire au bouton — retour sur l'onglet Annoter avec un
 * fichier déjà ouvert, ouverture d'un fichier depuis un badge
 * (`_apresOuvertureFichier`), reprise du dernier fichier de session,
 * réinitialisation après navigation, fermeture du mode évaluation, restauration
 * de session. (Les deux dernières écritures du mode vivent dans `basculerMode`,
 * qui posait déjà le libellé : c'est pourquoi le défaut n'apparaissait qu'en
 * arrivant par la navigation.) C'est le trajet du
 * rapport : Labo → Cadre → Annoter et évaluer → clic sur un badge d'élève.
 *
 * Remède : `_setModeCourant` est le seul point d'écriture, et il dérive le
 * libellé. Ce que la sentinelle verrouille, c'est cette unicité — pas une
 * énumération de chemins, qui serait périmée au prochain refactor.
 *
 * Break-test attendu : réintroduire une assignation directe de `modeCourant`
 * → l'essai « point d'écriture unique » rougit ; retirer le rafraîchissement
 * du libellé dans `_setModeCourant` → l'essai 1 rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ui = readFileSync(path.join(racine, 'js', 'travaux-ui.js'), 'utf8');

describe('#798 · le libellé du bouton dérive du mode', () => {
    it('_setModeCourant écrit le mode ET rafraîchit le libellé', () => {
        const debut = ui.indexOf('function _setModeCourant(');
        expect(debut, '_setModeCourant existe').toBeGreaterThan(-1);
        const corps = ui.slice(debut, ui.indexOf('\n    }', debut));
        expect(corps).toMatch(/modeCourant = /);
        expect(corps).toContain('_rafraichirLabelBtnActions()');
    });

    it('le libellé se lit sur modeCourant, il ne se passe plus en paramètre', () => {
        const debut = ui.indexOf('function _rafraichirLabelBtnActions(');
        expect(debut).toBeGreaterThan(-1);
        const corps = ui.slice(debut, ui.indexOf('\n    }', debut));
        expect(corps).toContain("getElementById('travaux-btn-actions')");
        expect(corps).toMatch(/modeCourant === 'evaluer' \? 'Évaluer' : 'Annoter'/);
        // L'ancienne API paramétrée est PARTIE (zéro-dette) : c'est elle qui
        // permettait à un appelant d'annoncer un mode qui n'était pas le vrai.
        expect(ui).not.toContain('_majLabelBtnActions');
    });

    it('point d\'écriture unique : aucune assignation directe de modeCourant', () => {
        // La déclaration (`let modeCourant = 'annoter'`) ne compte pas : c'est
        // la valeur de départ, pas un changement de mode en cours de route.
        const assignations = [...ui.matchAll(/(?<![\w.])modeCourant\s*=\s*[^=]/g)]
            .filter(m => !/let\s+modeCourant\s*=\s*$/.test(ui.slice(Math.max(0, m.index - 20), m.index + 14)));
        // Une seule : celle qui vit DANS _setModeCourant.
        expect(assignations).toHaveLength(1);
        const debut = ui.indexOf('function _setModeCourant(');
        const fin = ui.indexOf('\n    }', debut);
        expect(assignations[0].index).toBeGreaterThan(debut);
        expect(assignations[0].index).toBeLessThan(fin);
    });

    it('les chemins de navigation passent bien par le point unique', () => {
        // Le bouton peut aussi être recréé APRÈS le dernier changement de mode :
        // le menu reprend alors le mode courant au lieu d'un libellé figé.
        const debut = ui.indexOf('function _configurerDropdownActions(');
        const corps = ui.slice(debut, ui.indexOf('\n    }', debut));
        expect(corps).toContain('_rafraichirLabelBtnActions()');
        // Et le HTML du bouton ne prétend rien : il naît neutre.
        expect(ui).toContain('id="travaux-btn-actions">Actions &#x25BE;</button>');
        expect((ui.match(/_setModeCourant\('annoter'\)/g) || []).length).toBeGreaterThanOrEqual(6);
    });
});
