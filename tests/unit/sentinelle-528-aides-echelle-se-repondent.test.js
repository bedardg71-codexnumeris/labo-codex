import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');

// Sentinelle #528 (26 août 2026) — LES DEUX AIDES DE L'ÉCHELLE SE RÉPONDENT.
//
// Demande de Grégoire, en préparant un tutoriel : « comment expliquerais-tu la
// nuance entre les plages et la note ponctuelle à quelqu'un qui monte sa
// première échelle ? »
//
// Les deux aides EXISTAIENT, et chacune décrivait son champ sans mentionner
// l'autre : « plage de pourcentages » d'un côté, « valeur numérique fixe » de
// l'autre. Quelqu'un qui ouvrait l'une ne voyait jamais la relation — et c'est la
// relation qui manquait, pas la définition.
//
// ⚠ CE QUE CE BANC TIENT : que les deux continuent de se répondre. Une aide
// réécrite seule, un jour, redeviendrait une définition isolée — et le tutoriel
// expliquerait alors quelque chose que l'écran tait.

function bloc(source, cle) {
    const i = source.indexOf(`'${cle}': {`);
    if (i < 0) return null;
    return source.slice(i, source.indexOf("\n    '", i + 10));
}

describe('#528 · les deux aides de l\'échelle forment une paire', () => {
    const popup = lire('js/accompagnement-contenu-popup.js');

    it('A. chacune renvoie explicitement à l\'autre', () => {
        const plage = bloc(popup, 'echelle-plage-notes');
        const valeur = bloc(popup, 'echelle-valeur-ponctuelle');
        expect(plage, 'aide de la plage trouvée').toBeTruthy();
        expect(valeur, 'aide de la valeur ponctuelle trouvée').toBeTruthy();
        expect(plage, 'la plage doit renvoyer à sa jumelle').toContain('echelle-valeur-ponctuelle');
        expect(valeur, 'et réciproquement').toContain('echelle-plage-notes');
    });

    it('B. LE POINT QUI PORTE LE SENS : les deux sens de traduction sont dits', () => {
        const plage = bloc(popup, 'echelle-plage-notes');
        const valeur = bloc(popup, 'echelle-valeur-ponctuelle');
        // « ce pourcentage, c'est quel niveau ? » ↔ « ce niveau, ça vaut combien ? »
        expect(plage).toMatch(/c’est quel niveau/);
        expect(valeur).toMatch(/ça vaut combien/);
    });

    it('C. le même exemple dans les deux : 75 à 89', () => {
        // Deux exemples différents obligeraient le lecteur à faire lui-même le
        // rapprochement — c'est précisément ce qu'on lui épargne.
        expect(bloc(popup, 'echelle-plage-notes')).toContain('75');
        expect(bloc(popup, 'echelle-valeur-ponctuelle')).toContain('75');
    });

    it('D. le piège du milieu de plage est nommé, pas seulement évité', () => {
        // Le code ne le fait plus (#527) ; l'utilisateur, lui, y pensera.
        const valeur = bloc(popup, 'echelle-valeur-ponctuelle');
        expect(valeur, 'le milieu est un calcul, pas un jugement').toMatch(/calcul, pas un jugement/);
    });

    it('E. le survol dit la relation, pas seulement la définition', () => {
        const hover = lire('js/accompagnement-contenu-hover.js');
        const i = hover.indexOf("'cn-echelle-valeur-ponctuelle'");
        const texte = hover.slice(i, i + 400);
        expect(texte, 'il doit mentionner la plage').toMatch(/plage/i);
    });

    it('F. l\'écran et le skill disent la même chose', () => {
        // Le skill porte l'invariant (§7 bis), les aides le rendent lisible. Si
        // l'un des deux part sans l'autre, le tutoriel et l'application divergent.
        const skill = lire('.claude/skills/pratiques-notation/SKILL.md');
        expect(skill).toContain('conversions inverses');
        expect(bloc(popup, 'echelle-valeur-ponctuelle')).toMatch(/question inverse/);
    });
});
