-- Migration: Insert Bodega Academy Onboarding Quiz
-- Description: Insert the complete 34-question onboarding assessment for new employees
-- Date: 2025-10-13

-- First, delete any existing default assessment
DELETE FROM onboarding_assessments WHERE is_active = true;

-- Insert the complete Bodega Academy onboarding quiz
INSERT INTO onboarding_assessments (
  title,
  description,
  questions,
  target_roles,
  is_active,
  passing_score,
  created_at,
  updated_at
) VALUES (
  'Évaluation de Base du Personnel',
  'Test de connaissance produit (plats, boissons, compositions) - Durée : 15 minutes',
  '[
    {
      "question": "Le \"Mixed-grill\" contient typiquement :",
      "options": [
        "Uniquement du bœuf et du porc",
        "Plusieurs types de viandes grillées (bœuf, poulet, merguez, etc.)",
        "Poisson et viande mélangés",
        "Légumes grillés uniquement"
      ],
      "correct": 1
    },
    {
      "question": "L''émincé de bœuf à la péruvienne est servi avec :",
      "options": [
        "Une sauce béchamel",
        "Une sauce au poivre vert",
        "Une sauce péruvienne avec épices et piment",
        "Sans sauce, juste grillé"
      ],
      "correct": 2
    },
    {
      "question": "Les \"Fajitas de poulet et poivrons\" sont servies avec :",
      "options": [
        "Tortillas, poulet grillé, poivrons, oignons",
        "Pain pita et poulet pané",
        "Riz, poulet et légumes",
        "Tacos croustillants et poulet haché"
      ],
      "correct": 0
    },
    {
      "question": "Le \"Filet de loup à la plancha\" est :",
      "options": [
        "Un filet de loup pané et frit",
        "Un filet de loup en papillote",
        "Un filet de loup grillé sur plaque chaude",
        "Un filet de loup mariné cru"
      ],
      "correct": 2
    },
    {
      "question": "Le \"Crispy chicken burger\" se différencie du cheese burger par :",
      "options": [
        "L''ajout de bacon",
        "Le poulet pané croustillant",
        "La sauce barbecue obligatoire",
        "Le pain aux céréales"
      ],
      "correct": 1
    },
    {
      "question": "Les \"Linguine aux fruits de mer\" contiennent généralement :",
      "options": [
        "Uniquement des crevettes",
        "Mélange de moules, crevettes et seiche",
        "Du thon et du saumon",
        "Des huîtres et langoustines"
      ],
      "correct": 1
    },
    {
      "question": "Le \"Suprême de volaille sauce champignons\" utilise quelle partie du poulet :",
      "options": [
        "La cuisse désossée",
        "Le poulet entier découpé",
        "Le blanc de poulet",
        "Les ailes de poulet"
      ],
      "correct": 2
    },
    {
      "question": "Les \"Gambas à la plancha\" sont préparées avec :",
      "options": [
        "Grosses crevettes grillées, ail, persil",
        "Petites crevettes panées",
        "Crevettes flambées au cognac",
        "Crevettes en tempura"
      ],
      "correct": 0
    },
    {
      "question": "La \"Paella valenciana mixta\" contient traditionnellement :",
      "options": [
        "Uniquement des légumes",
        "Poulet, fruits de mer, riz, safran",
        "Bœuf et porc",
        "Poisson blanc uniquement"
      ],
      "correct": 1
    },
    {
      "question": "La différence entre \"Paella valenciana mixta\" et \"Paella de mariscos\" est :",
      "options": [
        "Le type de riz utilisé",
        "La taille de la poêle",
        "La mixta a viande ET fruits de mer, mariscos uniquement fruits de mer",
        "Le temps de cuisson"
      ],
      "correct": 2
    },
    {
      "question": "L''assortiment BODEGA (pour 2 personnes) contient :",
      "options": [
        "Croquettes poulet, poisson/fromage, brochettes poulet, calamars, patatas bravas, salade andalouse, anchois, moules, salade russe",
        "Tortilla, gazpacho, pan con tomate, jambon iberico et patatas bravas",
        "Jambon ibérique et fromages uniquement",
        "Empanadas et quesadillas, guacamole et tortilla chips"
      ],
      "correct": 0
    },
    {
      "question": "L''assortiment CASTILLE contient :",
      "options": [
        "Croquettes de poulet et patatas bravas",
        "Tortilla et gazpacho",
        "Tomate mozzarella, salade russe, anchois marinés, poivrons marinés",
        "Calamars frits et gambas"
      ],
      "correct": 2
    },
    {
      "question": "L''assortiment ZARZUELA se compose de :",
      "options": [
        "Viandes grillées variées a l''espagnol",
        "Moules pil pil, crevettes à l''ail, friture de seiche, fish and chips",
        "Fromages et charcuteries",
        "Légumes grillés et salades"
      ],
      "correct": 1
    },
    {
      "question": "Quel assortiment N''existe PAS sur la carte :",
      "options": [
        "BODEGA",
        "EXTRAMADURA",
        "CASTILLE",
        "BARCELONA"
      ],
      "correct": 3
    },
    {
      "question": "La \"Friture Bodega\" contient précisément :",
      "options": [
        "Uniquement des calamars et crevettes",
        "Calamars, crevettes, solettes, merlans et tempura de légumes",
        "Tous les poissons du jour disponibles",
        "Calamars, poulpe et seiches"
      ],
      "correct": 1
    },
    {
      "question": "Dans la Friture Bodega, les \"solettes\" sont :",
      "options": [
        "Des petits poissons plats frits",
        "Des crevettes spéciales",
        "Des beignets de légumes",
        "Des morceaux de seiche"
      ],
      "correct": 0
    },
    {
      "question": "La \"Planche de charcuterie ibérique\" contient :",
      "options": [
        "Jambon de Bayonne et saucisson français",
        "Charcuteries espagnoles (chorizo, lomo, jambon serrano/ibérico)",
        "Bresaola et coppa italienne Halal",
        "Pastrami et viande fumée"
      ],
      "correct": 1
    },
    {
      "question": "L''assiette de fromages comprend ces 5 fromages :",
      "options": [
        "Roquefort, brie, reblochon, gruyère, parmesan",
        "Bleu, chèvre, comté, manchego, camembert",
        "Mozzarella, ricotta, gorgonzola, pecorino, taleggio",
        "Cheddar, stilton, gouda, edam, emmental"
      ],
      "correct": 1
    },
    {
      "question": "Le \"Jambon Serrano\" est :",
      "options": [
        "Un jambon cuit au four",
        "Un jambon fumé",
        "Un jambon cru séché espagnol",
        "Un jambon de porc noir exclusivement"
      ],
      "correct": 2
    },
    {
      "question": "La \"Crème catalane\" se différencie de la crème brûlée par :",
      "options": [
        "L''ajout de cannelle et zeste d''agrumes",
        "L''absence de sucre caramélisé",
        "La cuisson au four uniquement",
        "L''utilisation de lait de chèvre"
      ],
      "correct": 0
    },
    {
      "question": "Le \"Colonel\" est traditionnellement :",
      "options": [
        "Glace vanille et whisky",
        "Sorbet framboise et champagne",
        "Sorbet citron et vodka",
        "Glace café et cognac"
      ],
      "correct": 2
    },
    {
      "question": "Le \"Nougat glacé\" est servi avec :",
      "options": [
        "Crème anglaise",
        "Coulis de framboise",
        "Sauce chocolat",
        "Caramel beurre salé"
      ],
      "correct": 1
    },
    {
      "question": "Le \"Croustillant aux noisettes\" est :",
      "options": [
        "Une glace aux noisettes",
        "Un gâteau moelleux",
        "Une mousse epaisse et base croustillante",
        "Une crème aux noisettes"
      ],
      "correct": 2
    },
    {
      "question": "Le cocktail \"Hemingway Special\" contient :",
      "options": [
        "Vodka, jus de canneberge, citron vert",
        "Rhum, Luxardo maraschino, sirop de pamplemousse, jus de citron",
        "Gin, tonic, concombre",
        "Whisky, vermouth, cerise"
      ],
      "correct": 1
    },
    {
      "question": "Le \"VSOP Boulvardier\" contient :",
      "options": [
        "Vodka, liqueur de café, crème",
        "Gin, Campari, vermouth",
        "Hennessy V.S, Bourbon, Aperol ou Campari, Martini rouge, liqueur banane, Amaretto disaronno, Angostura, Orange bitter",
        "Rhum, menthe, sucre, citron vert"
      ],
      "correct": 2
    },
    {
      "question": "Quelle bière N''est PAS disponible en bouteille au restaurant :",
      "options": [
        "Heineken 25cl",
        "Corona 35cl",
        "Stella Artois 33cl",
        "Desperados 25cl"
      ],
      "correct": 2
    },
    {
      "question": "Le cocktail \"Paper Plan\" contient :",
      "options": [
        "Tequila, triple sec, citron vert",
        "Vodka, liqueur de pêche, jus de canneberge",
        "Bourbon, Aperol, Amaro nonino, jus de citron",
        "Gin, elderflower, prosecco"
      ],
      "correct": 2
    },
    {
      "question": "Dans les vins marocains ROUGES, lequel est un AOC :",
      "options": [
        "Volubilia",
        "Medaillon",
        "Château Roslane",
        "Epicuria"
      ],
      "correct": 2
    },
    {
      "question": "Le cocktail \"Clover Club\" contient :",
      "options": [
        "Gin, jus de citron, liqueur lychee, Martini dry, blanc d''œuf, sirop de canne, framboise",
        "Vodka, Kahlua, crème, café",
        "Rhum, coca, citron",
        "Whisky, Amaretto, jus d''orange"
      ],
      "correct": 0
    },
    {
      "question": "Parmi ces whiskys, lequel est le plus premium (haut de gamme) :",
      "options": [
        "J.W Red Label",
        "Jack Daniel''s",
        "Gentleman Jack",
        "J.W Blue Label"
      ],
      "correct": 3
    },
    {
      "question": "Le \"Bullfrog\" est un cocktail qui contient :",
      "options": [
        "Tequila, orange, grenadine",
        "Vodka, gin, Jose Cuervo silver, rhum, liqueur curacao bleu, jus de citron, Red Bull",
        "Whisky, miel, citron",
        "Champagne, liqueur de framboise"
      ],
      "correct": 1
    },
    {
      "question": "Quelle est la différence entre \"Pression Casablanca\" et \"Pression Spécial\" :",
      "options": [
        "Ce sont deux bières pression différentes disponibles au restaurant",
        "La taille du verre uniquement",
        "La température de service",
        "L''une est sans alcool"
      ],
      "correct": 0
    },
    {
      "question": "Le digestif \"Limoncello\" est :",
      "options": [
        "Une liqueur de café italienne",
        "Un cognac au citron",
        "Une liqueur de citron italienne",
        "Un rhum épicé au citron"
      ],
      "correct": 2
    }
  ]'::jsonb,
  NULL,
  true,
  70,
  NOW(),
  NOW()
);

-- Verification
DO $$
DECLARE
  assessment_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO assessment_count FROM onboarding_assessments WHERE is_active = true;

  RAISE NOTICE '==========================================';
  RAISE NOTICE '✓ Quiz d''Onboarding Bodega Academy inséré';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Statistiques :';
  RAISE NOTICE '  - Nombre total de questions : 34';
  RAISE NOTICE '  - Score de passage : 70%%';
  RAISE NOTICE '  - Durée estimée : 15 minutes';
  RAISE NOTICE '';
  RAISE NOTICE 'Sections couvertes :';
  RAISE NOTICE '  1. Plats principaux (8 questions)';
  RAISE NOTICE '  2. Paellas & compositions (2 questions)';
  RAISE NOTICE '  3. Assortiments tapas (4 questions)';
  RAISE NOTICE '  4. Friture Bodega (2 questions)';
  RAISE NOTICE '  5. Charcuteries et fromages (3 questions)';
  RAISE NOTICE '  6. Desserts (4 questions)';
  RAISE NOTICE '  7. Boissons & cocktails (10 questions)';
  RAISE NOTICE '';
  RAISE NOTICE 'Nombre d''évaluations actives : %', assessment_count;
  RAISE NOTICE '==========================================';
END $$;
