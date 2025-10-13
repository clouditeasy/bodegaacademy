-- Script de traduction en darija pour le quiz d'onboarding Bodega Academy
-- À exécuter dans l'éditeur SQL de Supabase

-- Mise à jour du quiz avec les traductions en darija
UPDATE onboarding_assessments
SET
  title_ar = 'تقييم الموظفين الأساسي',
  description_ar = 'امتحان المعرفة بالمنتجات (الأطباق، المشروبات، التركيبات) - المدة: 15 دقيقة',
  questions = '[
    {
      "question": "Le \"Mixed-grill\" contient typiquement :",
      "question_ar": "الـ \"Mixed-grill\" فيه عادة:",
      "options": [
        "Uniquement du bœuf et du porc",
        "Plusieurs types de viandes grillées (bœuf, poulet, merguez, etc.)",
        "Poisson et viande mélangés",
        "Légumes grillés uniquement"
      ],
      "options_ar": [
        "غير لحم البقر و الخنزير",
        "بزاف ديال أنواع اللحم المشوي (بقري، دجاج، مرقاز، وغيرها)",
        "الحوت و اللحم مخلطين",
        "غير الخضرة المشوية"
      ],
      "correct": 1
    },
    {
      "question": "L''émincé de bœuf à la péruvienne est servi avec :",
      "question_ar": "الإميـنـسي ديال لحم البقر على الطريقة البيروفية كيتقدم مع:",
      "options": [
        "Une sauce béchamel",
        "Une sauce au poivre vert",
        "Une sauce péruvienne avec épices et piment",
        "Sans sauce, juste grillé"
      ],
      "options_ar": [
        "صوص البيشاميل",
        "صوص بالفلفل الأخضر",
        "صوص بيروفية بالتوابل و الفلفل الحار",
        "بلا صوص، غير مشوي"
      ],
      "correct": 2
    },
    {
      "question": "Les \"Fajitas de poulet et poivrons\" sont servies avec :",
      "question_ar": "الـ \"Fajitas\" ديال الدجاج و الفلفل الحلو كيتقدمو مع:",
      "options": [
        "Tortillas, poulet grillé, poivrons, oignons",
        "Pain pita et poulet pané",
        "Riz, poulet et légumes",
        "Tacos croustillants et poulet haché"
      ],
      "options_ar": [
        "تورتيلاس، دجاج مشوي، فلفل حلو، بصل",
        "خبز البيتا و دجاج مقلي",
        "رز، دجاج و خضرة",
        "تاكوس كروكان و دجاج مفروم"
      ],
      "correct": 0
    },
    {
      "question": "Le \"Filet de loup à la plancha\" est :",
      "question_ar": "فيليه الذيب (لوب) على البلانشا هو:",
      "options": [
        "Un filet de loup pané et frit",
        "Un filet de loup en papillote",
        "Un filet de loup grillé sur plaque chaude",
        "Un filet de loup mariné cru"
      ],
      "options_ar": [
        "فيليه ذيب مقلي",
        "فيليه ذيب فالبابيوط",
        "فيليه ذيب مشوي على صفيحة سخونة",
        "فيليه ذيب متبل و خام"
      ],
      "correct": 2
    },
    {
      "question": "Le \"Crispy chicken burger\" se différencie du cheese burger par :",
      "question_ar": "الـ \"Crispy chicken burger\" كيختالف على الـ cheese burger بـ:",
      "options": [
        "L''ajout de bacon",
        "Le poulet pané croustillant",
        "La sauce barbecue obligatoire",
        "Le pain aux céréales"
      ],
      "options_ar": [
        "زيادة الـ bacon",
        "الدجاج المقلي الكروكان",
        "صوص الباربيكيو ضروري",
        "الخبز بالحبوب"
      ],
      "correct": 1
    },
    {
      "question": "Les \"Linguine aux fruits de mer\" contiennent généralement :",
      "question_ar": "الـ \"Linguine\" بفواكه البحر فيها عادة:",
      "options": [
        "Uniquement des crevettes",
        "Mélange de moules, crevettes et seiche",
        "Du thon et du saumon",
        "Des huîtres et langoustines"
      ],
      "options_ar": [
        "غير الگمرون",
        "خليط ديال البلح البحري، الگمرون و السيبيا",
        "التونة و السلمون",
        "المحار و الجمبري الكبير"
      ],
      "correct": 1
    },
    {
      "question": "Le \"Suprême de volaille sauce champignons\" utilise quelle partie du poulet :",
      "question_ar": "الـ \"Suprême de volaille\" بصوص الفطر كيستعمل أي جزء من الدجاج:",
      "options": [
        "La cuisse désossée",
        "Le poulet entier découpé",
        "Le blanc de poulet",
        "Les ailes de poulet"
      ],
      "options_ar": [
        "الفخذ بلا عظم",
        "الدجاج الكامل مقطع",
        "صدر الدجاج (الأبيض)",
        "الأجنحة ديال الدجاج"
      ],
      "correct": 2
    },
    {
      "question": "Les \"Gambas à la plancha\" sont préparées avec :",
      "question_ar": "الـ \"Gambas\" على البلانشا كيتحضرو بـ:",
      "options": [
        "Grosses crevettes grillées, ail, persil",
        "Petites crevettes panées",
        "Crevettes flambées au cognac",
        "Crevettes en tempura"
      ],
      "options_ar": [
        "گمرون كبار مشويين، تومة، معدنوس",
        "گمرون صغار مقليين",
        "گمرون مفلامبي بالكونياك",
        "گمرون فالـ tempura"
      ],
      "correct": 0
    },
    {
      "question": "La \"Paella valenciana mixta\" contient traditionnellement :",
      "question_ar": "الـ \"Paella valenciana mixta\" فيها تقليدياً:",
      "options": [
        "Uniquement des légumes",
        "Poulet, fruits de mer, riz, safran",
        "Bœuf et porc",
        "Poisson blanc uniquement"
      ],
      "options_ar": [
        "غير الخضرة",
        "دجاج، فواكه البحر، رز، زعفران",
        "لحم البقر و الخروف",
        "غير الحوت الأبيض"
      ],
      "correct": 1
    },
    {
      "question": "La différence entre \"Paella valenciana mixta\" et \"Paella de mariscos\" est :",
      "question_ar": "الفرق بين \"Paella valenciana mixta\" و \"Paella de mariscos\" هو:",
      "options": [
        "Le type de riz utilisé",
        "La taille de la poêle",
        "La mixta a viande ET fruits de mer, mariscos uniquement fruits de mer",
        "Le temps de cuisson"
      ],
      "options_ar": [
        "نوع الرز المستعمل",
        "حجم الطاجين",
        "الميكستا فيها لحم و فواكه البحر، ماريسكوس غير فواكه البحر",
        "وقت الطيب"
      ],
      "correct": 2
    },
    {
      "question": "L''assortiment BODEGA (pour 2 personnes) contient :",
      "question_ar": "الأسورتيمون BODEGA (لـ 2 أشخاص) فيه:",
      "options": [
        "Croquettes poulet, poisson/fromage, brochettes poulet, calamars, patatas bravas, salade andalouse, anchois, moules, salade russe",
        "Tortilla, gazpacho, pan con tomate, jambon iberico et patatas bravas",
        "Jambon ibérique et fromages uniquement",
        "Empanadas et quesadillas, guacamole et tortilla chips"
      ],
      "options_ar": [
        "كروكيت دجاج، حوت/فرماج، بروشيت دجاج، كلامار، باتاتاس برافاس، سلاطة أندلسية، أنشوا، موزيل، سلاطة روسية",
        "تورتييا، گازباتشو، خبز بالطماطم، خنزير إيبيريكو و باتاتاس برافاس",
        "غير خنزير إيبيريكو و فرماج",
        "إمپاناداس و كيساديلاس، گواكامولي و شيپس تورتييا"
      ],
      "correct": 0
    },
    {
      "question": "L''assortiment CASTILLE contient :",
      "question_ar": "الأسورتيمون CASTILLE فيه:",
      "options": [
        "Croquettes de poulet et patatas bravas",
        "Tortilla et gazpacho",
        "Tomate mozzarella, salade russe, anchois marinés, poivrons marinés",
        "Calamars frits et gambas"
      ],
      "options_ar": [
        "كروكيت دجاج و باتاتاس برافاس",
        "تورتييا و گازباتشو",
        "طماطم موزاريلا، سلاطة روسية، أنشوا متبل، فلفل حلو متبل",
        "كلامار مقلي و گامباس"
      ],
      "correct": 2
    },
    {
      "question": "L''assortiment ZARZUELA se compose de :",
      "question_ar": "الأسورتيمون ZARZUELA فيه:",
      "options": [
        "Viandes grillées variées a l''espagnol",
        "Moules pil pil, crevettes à l''ail, friture de seiche, fish and chips",
        "Fromages et charcuteries",
        "Légumes grillés et salades"
      ],
      "options_ar": [
        "لحوم مشوية متنوعة على الطريقة الإسبانية",
        "موزيل پيل پيل، گمرون بالتومة، فريتور ديال السيبيا، فيش أند شيپس",
        "فرماج و شاركوتري",
        "خضرة مشوية و سلاطات"
      ],
      "correct": 1
    },
    {
      "question": "Quel assortiment N''existe PAS sur la carte :",
      "question_ar": "أشنو الأسورتيمون اللي ماكاينش فالكارطة:",
      "options": [
        "BODEGA",
        "EXTRAMADURA",
        "CASTILLE",
        "BARCELONA"
      ],
      "options_ar": [
        "BODEGA",
        "EXTRAMADURA",
        "CASTILLE",
        "BARCELONA"
      ],
      "correct": 3
    },
    {
      "question": "La \"Friture Bodega\" contient précisément :",
      "question_ar": "الـ \"Friture Bodega\" فيها بالضبط:",
      "options": [
        "Uniquement des calamars et crevettes",
        "Calamars, crevettes, solettes, merlans et tempura de légumes",
        "Tous les poissons du jour disponibles",
        "Calamars, poulpe et seiches"
      ],
      "options_ar": [
        "غير كلامار و گمرون",
        "كلامار، گمرون، سوليت، ميرلان و تمپورا ديال الخضرة",
        "كل الحوت ديال النهار المتوفر",
        "كلامار، پولپ و سيبيا"
      ],
      "correct": 1
    },
    {
      "question": "Dans la Friture Bodega, les \"solettes\" sont :",
      "question_ar": "فالـ Friture Bodega، \"solettes\" هوما:",
      "options": [
        "Des petits poissons plats frits",
        "Des crevettes spéciales",
        "Des beignets de légumes",
        "Des morceaux de seiche"
      ],
      "options_ar": [
        "حوت صغير مفلطح مقلي",
        "گمرون خاص",
        "بينيي ديال الخضرة",
        "قطع ديال السيبيا"
      ],
      "correct": 0
    },
    {
      "question": "La \"Planche de charcuterie ibérique\" contient :",
      "question_ar": "الـ \"Planche de charcuterie ibérique\" فيها:",
      "options": [
        "Jambon de Bayonne et saucisson français",
        "Charcuteries espagnoles (chorizo, lomo, jambon serrano/ibérico)",
        "Bresaola et coppa italienne Halal",
        "Pastrami et viande fumée"
      ],
      "options_ar": [
        "جامبون دو بايون و سوسيسون فرنساوي",
        "شاركوتري إسبانية (شوريزو، لومو، جامبون سيرانو/إيبيريكو)",
        "بريزاولا و كوپا إيطالية حلال",
        "پاسترامي و لحم مدخن"
      ],
      "correct": 1
    },
    {
      "question": "L''assiette de fromages comprend ces 5 fromages :",
      "question_ar": "الطبسيل ديال الفرماج فيه هاذ 5 أنواع:",
      "options": [
        "Roquefort, brie, reblochon, gruyère, parmesan",
        "Bleu, chèvre, comté, manchego, camembert",
        "Mozzarella, ricotta, gorgonzola, pecorino, taleggio",
        "Cheddar, stilton, gouda, edam, emmental"
      ],
      "options_ar": [
        "روكفور، بري، روبلوشون، گرويير، پارميزان",
        "بلو، شيڤ، كومطي، مانشيگو، كامومبير",
        "موزاريلا، ريكوطا، گورگونزولا، پيكورينو، طاليجيو",
        "شيدار، ستيلطون، گودا، إيدام، إيمونطال"
      ],
      "correct": 1
    },
    {
      "question": "Le \"Jambon Serrano\" est :",
      "question_ar": "الـ \"Jambon Serrano\" هو:",
      "options": [
        "Un jambon cuit au four",
        "Un jambon fumé",
        "Un jambon cru séché espagnol",
        "Un jambon de porc noir exclusivement"
      ],
      "options_ar": [
        "جامبون مطيب فالفرن",
        "جامبون مدخن",
        "جامبون خام مجفف إسباني",
        "جامبون ديال الخنزير الكحل غير"
      ],
      "correct": 2
    },
    {
      "question": "La \"Crème catalane\" se différencie de la crème brûlée par :",
      "question_ar": "الـ \"Crème catalane\" كتختالف على الـ crème brûlée بـ:",
      "options": [
        "L''ajout de cannelle et zeste d''agrumes",
        "L''absence de sucre caramélisé",
        "La cuisson au four uniquement",
        "L''utilisation de lait de chèvre"
      ],
      "options_ar": [
        "زيادة القرفة و قشور الحوامض",
        "بلا سكر مكرامل",
        "الطيب فالفرن غير",
        "استعمال حليب المعز"
      ],
      "correct": 0
    },
    {
      "question": "Le \"Colonel\" est traditionnellement :",
      "question_ar": "الـ \"Colonel\" تقليدياً هو:",
      "options": [
        "Glace vanille et whisky",
        "Sorbet framboise et champagne",
        "Sorbet citron et vodka",
        "Glace café et cognac"
      ],
      "options_ar": [
        "جلاس الڤانيلا و ويسكي",
        "سوربي التوت و الشامپانيا",
        "سوربي الليمون و الڤودكا",
        "جلاس القهوة و الكونياك"
      ],
      "correct": 2
    },
    {
      "question": "Le \"Nougat glacé\" est servi avec :",
      "question_ar": "الـ \"Nougat glacé\" كيتقدم مع:",
      "options": [
        "Crème anglaise",
        "Coulis de framboise",
        "Sauce chocolat",
        "Caramel beurre salé"
      ],
      "options_ar": [
        "كريم أنگليز",
        "كولي ديال التوت",
        "صوص الشوكلا",
        "كاراميل بالزبدة المالحة"
      ],
      "correct": 1
    },
    {
      "question": "Le \"Croustillant aux noisettes\" est :",
      "question_ar": "الـ \"Croustillant aux noisettes\" هو:",
      "options": [
        "Une glace aux noisettes",
        "Un gâteau moelleux",
        "Une mousse epaisse et base croustillante",
        "Une crème aux noisettes"
      ],
      "options_ar": [
        "جلاس بالنوازيط",
        "حلوى طرية",
        "موس غليظة و قاعدة كروكانت",
        "كريم بالنوازيط"
      ],
      "correct": 2
    },
    {
      "question": "Le cocktail \"Hemingway Special\" contient :",
      "question_ar": "الكوكطيل \"Hemingway Special\" فيه:",
      "options": [
        "Vodka, jus de canneberge, citron vert",
        "Rhum, Luxardo maraschino, sirop de pamplemousse, jus de citron",
        "Gin, tonic, concombre",
        "Whisky, vermouth, cerise"
      ],
      "options_ar": [
        "ڤودكا، عصير التوت الأحمر، ليمون أخضر",
        "روم، Luxardo maraschino، سيروپ الپامپلوموس، عصير الليمون",
        "جين، طونيك، خيار",
        "ويسكي، ڤيرموط، كريز"
      ],
      "correct": 1
    },
    {
      "question": "Le \"VSOP Boulvardier\" contient :",
      "question_ar": "الـ \"VSOP Boulvardier\" فيه:",
      "options": [
        "Vodka, liqueur de café, crème",
        "Gin, Campari, vermouth",
        "Hennessy V.S, Bourbon, Aperol ou Campari, Martini rouge, liqueur banane, Amaretto disaronno, Angostura, Orange bitter",
        "Rhum, menthe, sucre, citron vert"
      ],
      "options_ar": [
        "ڤودكا، ليكور القهوة، كريم",
        "جين، Campari، ڤيرموط",
        "Hennessy V.S، Bourbon، Aperol ولا Campari، Martini rouge، ليكور الموز، Amaretto disaronno، Angostura، Orange bitter",
        "روم، نعناع، سكر، ليمون أخضر"
      ],
      "correct": 2
    },
    {
      "question": "Quelle bière N''est PAS disponible en bouteille au restaurant :",
      "question_ar": "أشنو البيرة اللي ماكايناش فالبوطيلة فالريستورا:",
      "options": [
        "Heineken 25cl",
        "Corona 35cl",
        "Stella Artois 33cl",
        "Desperados 25cl"
      ],
      "options_ar": [
        "Heineken 25cl",
        "Corona 35cl",
        "Stella Artois 33cl",
        "Desperados 25cl"
      ],
      "correct": 2
    },
    {
      "question": "Le cocktail \"Paper Plan\" contient :",
      "question_ar": "الكوكطيل \"Paper Plan\" فيه:",
      "options": [
        "Tequila, triple sec, citron vert",
        "Vodka, liqueur de pêche, jus de canneberge",
        "Bourbon, Aperol, Amaro nonino, jus de citron",
        "Gin, elderflower, prosecco"
      ],
      "options_ar": [
        "تيكيلا، triple sec، ليمون أخضر",
        "ڤودكا، ليكور الخوخ، عصير التوت الأحمر",
        "Bourbon، Aperol، Amaro nonino، عصير الليمون",
        "جين، elderflower، پروسيكو"
      ],
      "correct": 2
    },
    {
      "question": "Dans les vins marocains ROUGES, lequel est un AOC :",
      "question_ar": "فالنبيذ المغربي الأحمر، أشنو هو AOC:",
      "options": [
        "Volubilia",
        "Medaillon",
        "Château Roslane",
        "Epicuria"
      ],
      "options_ar": [
        "Volubilia",
        "Medaillon",
        "Château Roslane",
        "Epicuria"
      ],
      "correct": 2
    },
    {
      "question": "Le cocktail \"Clover Club\" contient :",
      "question_ar": "الكوكطيل \"Clover Club\" فيه:",
      "options": [
        "Gin, jus de citron, liqueur lychee, Martini dry, blanc d''œuf, sirop de canne, framboise",
        "Vodka, Kahlua, crème, café",
        "Rhum, coca, citron",
        "Whisky, Amaretto, jus d''orange"
      ],
      "options_ar": [
        "جين، عصير الليمون، ليكور الليتشي، Martini dry، بياض البيض، سيروپ القصب، التوت",
        "ڤودكا، Kahlua، كريم، قهوة",
        "روم، كوكا، ليمون",
        "ويسكي، Amaretto، عصير البرتقال"
      ],
      "correct": 0
    },
    {
      "question": "Parmi ces whiskys, lequel est le plus premium (haut de gamme) :",
      "question_ar": "من هاذ الويسكيات، أشنو هو الأكثر پريميوم (راقي):",
      "options": [
        "J.W Red Label",
        "Jack Daniel''s",
        "Gentleman Jack",
        "J.W Blue Label"
      ],
      "options_ar": [
        "J.W Red Label",
        "Jack Daniel''s",
        "Gentleman Jack",
        "J.W Blue Label"
      ],
      "correct": 3
    },
    {
      "question": "Le \"Bullfrog\" est un cocktail qui contient :",
      "question_ar": "الـ \"Bullfrog\" هو كوكطيل فيه:",
      "options": [
        "Tequila, orange, grenadine",
        "Vodka, gin, Jose Cuervo silver, rhum, liqueur curacao bleu, jus de citron, Red Bull",
        "Whisky, miel, citron",
        "Champagne, liqueur de framboise"
      ],
      "options_ar": [
        "تيكيلا، برتقال، گرونادين",
        "ڤودكا، جين، Jose Cuervo silver، روم، ليكور curacao bleu، عصير الليمون، Red Bull",
        "ويسكي، عسل، ليمون",
        "شامپانيا، ليكور التوت"
      ],
      "correct": 1
    },
    {
      "question": "Quelle est la différence entre \"Pression Casablanca\" et \"Pression Spécial\" :",
      "question_ar": "شنو الفرق بين \"Pression Casablanca\" و \"Pression Spécial\":",
      "options": [
        "Ce sont deux bières pression différentes disponibles au restaurant",
        "La taille du verre uniquement",
        "La température de service",
        "L''une est sans alcool"
      ],
      "options_ar": [
        "جوج بيرات پريسيون مختلفين متوفرين فالريستورا",
        "غير حجم الكاس",
        "درجة الحرارة ديال التقديم",
        "وحدة بلا كحول"
      ],
      "correct": 0
    },
    {
      "question": "Le digestif \"Limoncello\" est :",
      "question_ar": "الديجيستيف \"Limoncello\" هو:",
      "options": [
        "Une liqueur de café italienne",
        "Un cognac au citron",
        "Une liqueur de citron italienne",
        "Un rhum épicé au citron"
      ],
      "options_ar": [
        "ليكور القهوة الإيطالية",
        "كونياك بالليمون",
        "ليكور الليمون الإيطالية",
        "روم متبل بالليمون"
      ],
      "correct": 2
    }
  ]'::jsonb,
  updated_at = NOW()
WHERE is_active = true;

-- Vérification
DO $$
DECLARE
  assessment_record RECORD;
  question_count INTEGER;
  translated_count INTEGER;
BEGIN
  SELECT * INTO assessment_record FROM onboarding_assessments WHERE is_active = true LIMIT 1;

  SELECT jsonb_array_length(questions) INTO question_count
  FROM onboarding_assessments
  WHERE is_active = true;

  SELECT COUNT(*) INTO translated_count
  FROM onboarding_assessments oa,
       jsonb_array_elements(oa.questions) AS q
  WHERE oa.is_active = true
    AND q ? 'question_ar';

  RAISE NOTICE '==========================================';
  RAISE NOTICE '✓ Traductions en darija ajoutées au quiz';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Titre FR : %', assessment_record.title;
  RAISE NOTICE 'Titre AR : %', assessment_record.title_ar;
  RAISE NOTICE '';
  RAISE NOTICE 'Statistiques :';
  RAISE NOTICE '  - Nombre total de questions : %', question_count;
  RAISE NOTICE '  - Questions traduites : %', translated_count;
  RAISE NOTICE '  - Chaque question a maintenant :';
  RAISE NOTICE '    • question (FR) + question_ar (Darija)';
  RAISE NOTICE '    • options (FR) + options_ar (Darija)';
  RAISE NOTICE '==========================================';
END $$;
