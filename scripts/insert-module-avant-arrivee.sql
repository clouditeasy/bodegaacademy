-- Script SQL pour insérer le Module 1 - Avant l'Arrivée dans le parcours Tronc Commun
-- À exécuter dans votre console Supabase SQL Editor

-- 1. Récupérer l'ID du parcours "Tronc Commun" (à utiliser dans l'étape suivante)
-- SELECT id FROM training_paths WHERE name = 'Tronc Commun';

-- 2. Insérer le nouveau module
-- IMPORTANT: Remplacez 'VOTRE_USER_ID_ADMIN' par votre ID utilisateur admin
-- IMPORTANT: Remplacez 'TRAINING_PATH_ID' par l'ID du parcours Tronc Commun obtenu ci-dessus

INSERT INTO modules (
  id,
  title,
  description,
  content,
  quiz_questions,
  created_by,
  is_active,
  training_path_id,
  is_mandatory,
  order_index,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Module 1 - Avant l''Arrivée du Client',
  'Formation sur la gestion des réservations téléphoniques et la préparation de l''environnement. Apprenez les standards téléphoniques, le script de réservation et la préparation de l''espace.',
  '
  <div class="module-content">
    <h2>📞 Module 1 : Avant l''Arrivée du Client</h2>
    <h3>Réservation & Pré-accueil</h3>

    <div class="section">
      <h3>💡 Pourquoi cette étape est cruciale ?</h3>
      <p>Le premier contact téléphonique et l''état des lieux créent la <strong>première impression</strong>.
      Avant même que le client franchisse la porte, il se fait déjà une idée de La Bodega.
      Cette étape détermine si le client viendra avec enthousiasme ou avec appréhension.</p>
    </div>

    <div class="section">
      <h3>📞 1. Réservation Téléphonique</h3>

      <h4>Standards Téléphoniques (10 points)</h4>
      <ul>
        <li>✓ Répondre en <strong>moins de 3 sonneries</strong></li>
        <li>✓ Dire : "La Bodega, bonsoir, [Prénom] à votre service"</li>
        <li>✓ Poser 3 questions : jour / heure / nombre de personnes</li>
        <li>✓ Reformuler la réservation complète</li>
        <li>✓ Demander le numéro de téléphone du client</li>
        <li>✓ Proposer une ambiance : "en salle ?" "près de la scène ?"</li>
      </ul>

      <h4>⚠ Ton & Attitude (Critique)</h4>
      <ul>
        <li>✓ Voix chaleureuse et souriante (oui, ça s''entend !)</li>
        <li>✓ Énergie positive qui reflète l''ambiance Bodega</li>
        <li>✓ Écoute active : répéter pour confirmer</li>
        <li>✓ Terminer par : "À très bientôt à La Bodega !"</li>
      </ul>

      <h4>📝 Script Standard - À Mémoriser</h4>
      <div class="script-box">
        <p><strong>Vous :</strong> "La Bodega, bonsoir ! [Prénom] à votre service."</p>
        <p><strong>Client :</strong> "Bonjour, je voudrais réserver..."</p>
        <p><strong>Vous :</strong> "Avec plaisir ! C''est pour quel jour et à quelle heure ?"</p>
        <p><strong>Client :</strong> "Vendredi à 20h."</p>
        <p><strong>Vous :</strong> "Parfait ! Et vous serez combien de personnes ?"</p>
        <p><strong>Client :</strong> "4 personnes."</p>
        <p><strong>Vous :</strong> "Super ! Donc je note : vendredi à 20h pour 4 personnes. Vous préférez une table en salle ou près de la scène pour profiter de l''ambiance ?"</p>
        <p><strong>Vous :</strong> "Et je peux avoir votre numéro de téléphone s''il vous plaît ?"</p>
        <p><strong>Vous :</strong> "C''est parfait Monsieur/Madame [Nom], on vous attend vendredi à 20h. À très bientôt à La Bodega !"</p>
      </div>
    </div>

    <div class="section">
      <h3>🏠 2. Préparation de l''Environnement</h3>

      <h4>Extérieur (8 points)</h4>
      <ul>
        <li>✓ Enseigne allumée et visible</li>
        <li>✓ Parking propre et accueillant</li>
        <li>✓ Entrée dégagée et propre</li>
        <li>✓ Menu affiché à l''extérieur (propre, à jour)</li>
        <li>✓ Plantes en bonne santé</li>
      </ul>

      <h4>Intérieur (12 points)</h4>
      <ul>
        <li>✓ Toilettes propres et approvisionnées (savon, papier)</li>
        <li>✓ Température agréable (ni trop chaud, ni trop froid)</li>
        <li>✓ Éclairage fonctionnel, ambiance adaptée</li>
        <li>✓ Musique ajustée : volume et style Bodega</li>
        <li>✓ Tables propres avec tous les accessoires</li>
        <li>✓ Sol propre, sans débris</li>
      </ul>
    </div>

    <div class="section">
      <h3>🔑 Points Clés à Retenir</h3>
      <ul>
        <li>⚡ <strong>Réactivité :</strong> Moins de 3 sonneries, c''est non négociable. Le client ne doit jamais attendre.</li>
        <li>😊 <strong>Sourire vocal :</strong> On entend votre sourire au téléphone. Souriez en décrochant !</li>
        <li>🎯 <strong>Précision :</strong> Toujours reformuler pour éviter les erreurs de réservation.</li>
        <li>🏠 <strong>Routine quotidienne :</strong> Inspection complète avant chaque service (checklist mentale).</li>
      </ul>
    </div>

    <div class="section">
      <h3>🎓 Coaching Flash - Jeu de Rôle Téléphone</h3>
      <p><strong>Durée :</strong> 10 minutes</p>
      <p><strong>Objectif :</strong> Maîtriser le script téléphonique et développer les réflexes.</p>

      <h4>📋 Exercice Pratique</h4>
      <ol>
        <li><strong>Étape 1 :</strong> Former des binômes (un client / un serveur)</li>
        <li><strong>Étape 2 :</strong> Chaque binôme joue 2 scénarios (réservation simple + réservation compliquée)</li>
        <li><strong>Étape 3 :</strong> Observer : ton de voix, rapidité, précision, reformulation</li>
        <li><strong>Étape 4 :</strong> Feedback croisé : qu''est-ce qui était bien ? Qu''est-ce qui peut s''améliorer ?</li>
        <li><strong>Étape 5 :</strong> Inverser les rôles et recommencer</li>
      </ol>

      <p><strong>💡 Conseil Manager :</strong> Chronométrez le temps de réponse et notez la fluidité du script.
      L''objectif est que chacun puisse prendre un appel les yeux fermés.</p>
    </div>

    <div class="section kpi">
      <h3>📊 KPI - Indicateur de Performance</h3>
      <p class="kpi-value">&gt; 90%</p>
      <p>Taux de réservations bien notées par les clients mystères<br>
      (Script respecté + Réponse &lt; 3 sonneries + Reformulation)</p>
    </div>
  </div>
  ',
  '[
    {
      "question": "Combien de sonneries maximum avant de répondre au téléphone ?",
      "options": ["1 sonnerie", "3 sonneries", "5 sonneries", "Ça dépend de la situation"],
      "correct": 1
    },
    {
      "question": "Quelle est la formule d''accueil téléphonique correcte ?",
      "options": ["\"Allô, oui ?\"", "\"Bonjour, La Bodega\"", "\"La Bodega, bonsoir, [Prénom] à votre service\"", "\"Restaurant La Bodega, que puis-je faire pour vous ?\""],
      "correct": 2
    },
    {
      "question": "Quelles sont les 3 questions essentielles pour une réservation ?",
      "options": ["Nom, nombre de personnes, budget", "Jour, heure, nombre de personnes", "Heure, régime alimentaire, occasion", "Nom, téléphone, adresse"],
      "correct": 1
    },
    {
      "question": "Pourquoi doit-on reformuler la réservation au client ?",
      "options": ["Pour montrer qu''on l''a bien compris", "Pour éviter les erreurs", "Pour confirmer tous les détails", "Toutes ces réponses"],
      "correct": 3
    },
    {
      "question": "Que doit-on proposer au client lors de la réservation ?",
      "options": ["Le menu du jour", "Un choix d''ambiance (en salle ou près de la scène)", "Une réduction", "Rien, juste prendre la réservation"],
      "correct": 1
    },
    {
      "question": "Quel est le ton de voix à adopter au téléphone ?",
      "options": ["Professionnel et neutre", "Chaleureux et souriant", "Rapide et efficace", "Formel et distant"],
      "correct": 1
    },
    {
      "question": "Combien de points vaut la checklist des standards téléphoniques ?",
      "options": ["5 points", "8 points", "10 points", "12 points"],
      "correct": 2
    },
    {
      "question": "Que doit-on vérifier à l''extérieur avant le service ?",
      "options": ["Seulement le parking", "Enseigne, parking, entrée, menu, plantes", "Uniquement l''enseigne", "Rien, l''extérieur n''est pas important"],
      "correct": 1
    },
    {
      "question": "Combien de points vaut la préparation de l''intérieur ?",
      "options": ["8 points", "10 points", "12 points", "15 points"],
      "correct": 2
    },
    {
      "question": "Quel est le KPI visé pour les réservations téléphoniques ?",
      "options": ["> 70%", "> 80%", "> 90%", "100%"],
      "correct": 2
    }
  ]'::jsonb,
  '362a8d76-420d-4236-8d35-6cb20da4ab30', -- ID de l'admin
  true,
  'tronc-commun', -- ID du parcours Tronc Commun
  true,
  2, -- order_index : deuxième module du parcours
  NOW(),
  NOW()
);

-- 3. Vérifier que le module a bien été créé
SELECT id, title, training_path_id, order_index, is_active
FROM modules
WHERE title LIKE '%Avant l''Arrivée%';

-- 4. (Optionnel) Si vous voulez ajouter le fichier HTML complet comme ressource
-- Vous pouvez uploader le fichier Module_1_Avant_Arrivee.html dans Supabase Storage
-- et ajouter l'URL dans le champ presentation_url du module
