/**
 * Script de diagnostic des données
 * Exécuter dans la console du navigateur
 */

console.log('='.repeat(60));
console.log('DIAGNOSTIC DES DONNÉES - 31 décembre 2025');
console.log('='.repeat(60));

// 1. Trimestre actif
const trimestreActif = typeof obtenirTrimestreActif === 'function' ? obtenirTrimestreActif() : null;
console.log('\n📅 TRIMESTRE ACTIF:', trimestreActif);

const trimestreId = typeof obtenirTrimestreId === 'function' ? obtenirTrimestreId() : null;
console.log('   ID:', trimestreId);

// 2. Liste des trimestres
const trimestres = db.getSync('trimestres', []);
console.log('\n📋 TRIMESTRES ENREGISTRÉS:');
trimestres.forEach(t => {
    console.log(`   - ${t.id}: ${t.nom} ${t.actif ? '✅ ACTIF' : ''} ${t.archive ? '📁 ARCHIVÉ' : ''}`);
});

// 3. Cours actif
const infoCours = db.getSync('infoCours', null);
console.log('\n📚 COURS ACTIF (infoCours):', infoCours);

// 4. Liste des cours
const listeCours = db.getSync('listeCours', []);
console.log('\n📖 LISTE DES COURS:');
listeCours.forEach(c => {
    console.log(`   - ${c.id}: ${c.sigle} gr.${c.groupe} (trimestre: ${c.trimestreId})`);
});

// 5. Données étudiants - vérifier les différentes clés
console.log('\n👥 DONNÉES ÉTUDIANTS:');
const clesDonnees = [
    'groupeEtudiants',
    'a2025_groupeEtudiants',
    'demo_groupeEtudiants',
    'h2026_groupeEtudiants'
];
clesDonnees.forEach(cle => {
    const data = db.getSync(cle, null);
    if (data && Array.isArray(data)) {
        console.log(`   ${cle}: ${data.length} étudiants`);
        if (data.length > 0 && data.length <= 5) {
            data.forEach(e => console.log(`      - ${e.prenom} ${e.nom} (${e.da})`));
        }
    } else if (data) {
        console.log(`   ${cle}: (format non-tableau)`, typeof data);
    } else {
        console.log(`   ${cle}: NULL/VIDE`);
    }
});

// 6. Horaires
console.log('\n⏰ HORAIRES:');
const clesHoraire = [
    'horaireHebdo',
    'a2025_horaireHebdo',
    'demo_horaireHebdo'
];
clesHoraire.forEach(cle => {
    const data = db.getSync(cle, null);
    if (data && Array.isArray(data) && data.length > 0) {
        console.log(`   ${cle}:`, data.map(s => `${s.jour} ${s.debut}`).join(', '));
    } else if (data && typeof data === 'object') {
        console.log(`   ${cle}: (format objet)`, Object.keys(data));
    } else {
        console.log(`   ${cle}: NULL/VIDE`);
    }
});

// 7. Calendrier
console.log('\n📆 CALENDRIERS:');
const clesCal = [
    'calendrierComplet',
    'a2025_calendrierComplet',
    'demo_calendrierComplet'
];
clesCal.forEach(cle => {
    const data = db.getSync(cle, null);
    if (data && typeof data === 'object') {
        const nbJours = Object.keys(data).length;
        const joursCours = Object.values(data).filter(j => j.statut === 'cours').length;
        console.log(`   ${cle}: ${nbJours} jours, ${joursCours} jours de cours`);
    } else {
        console.log(`   ${cle}: NULL/VIDE`);
    }
});

// 8. Cadre calendrier
console.log('\n🗓️ CADRE CALENDRIER:');
const clesCadre = [
    'cadreCalendrier',
    'a2025_cadreCalendrier',
    'demo_cadreCalendrier'
];
clesCadre.forEach(cle => {
    const data = db.getSync(cle, null);
    if (data) {
        console.log(`   ${cle}:`, data.dateDebut || data.debutTrimestre, '→', data.finCours);
    } else {
        console.log(`   ${cle}: NULL/VIDE`);
    }
});

// 9. Test de la fonction cle()
console.log('\n🔑 TEST FONCTION cle():');
if (typeof cle === 'function') {
    console.log(`   cle('groupeEtudiants') = '${cle('groupeEtudiants')}'`);
    console.log(`   cle('horaireHebdo') = '${cle('horaireHebdo')}'`);
    console.log(`   cle('calendrierComplet') = '${cle('calendrierComplet')}'`);
} else {
    console.log('   ⚠️ Fonction cle() non disponible');
}

// 10. Mode application
console.log('\n🎭 MODE APPLICATION:', db.getSync('modeApplication', 'non défini'));

console.log('\n' + '='.repeat(60));
console.log('FIN DU DIAGNOSTIC');
console.log('='.repeat(60));
