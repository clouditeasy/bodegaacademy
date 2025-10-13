-- Script de traduction en darija pour les questions restantes du quiz
-- SECTION 2 (suite): PAELLA

-- Question 9: Paella valenciana mixta
UPDATE quiz_questions
SET question_ar = 'الـ "Paella valenciana mixta" فيها تقليدياً:'
WHERE question = 'La "Paella valenciana mixta" contient traditionnellement :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"غير الخضرة"'
        ),
        '{1,text_ar}',
        '"دجاج، فواكه البحر، رز، زعفران"'
      ),
      '{2,text_ar}',
      '"لحم البقر و الخروف"'
    ),
    '{3,text_ar}',
    '"غير الحوت الأبيض"'
  )
WHERE question = 'La "Paella valenciana mixta" contient traditionnellement :';

-- Question 10: Différence Paella mixta vs mariscos
UPDATE quiz_questions
SET question_ar = 'الفرق بين "Paella valenciana mixta" و "Paella de mariscos" هو:'
WHERE question = 'La différence entre "Paella valenciana mixta" et "Paella de mariscos" est :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"نوع الرز المستعمل"'
        ),
        '{1,text_ar}',
        '"حجم الطاجين"'
      ),
      '{2,text_ar}',
      '"الميكستا فيها لحم و فواكه البحر، ماريسكوس غير فواكه البحر"'
    ),
    '{3,text_ar}',
    '"وقت الطيب"'
  )
WHERE question = 'La différence entre "Paella valenciana mixta" et "Paella de mariscos" est :';

-- SECTION 3: ASSORTIMENTS TAPAS

-- Question 11: Assortiment BODEGA
UPDATE quiz_questions
SET question_ar = 'الأسورتيمون BODEGA (لـ 2 أشخاص) فيه:'
WHERE question = 'L''assortiment BODEGA (pour 2 personnes) contient :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"كروكيت دجاج، حوت/فرماج، بروشيت دجاج، كلامار، باتاتاس برافاس، سلاطة أندلسية، أنشوا، موزيل، سلاطة روسية"'
        ),
        '{1,text_ar}',
        '"تورتييا، گازباتشو، خبز بالطماطم، خنزير إيبيريكو و باتاتاس برافاس"'
      ),
      '{2,text_ar}',
      '"غير خنزير إيبيريكو و فرماج"'
    ),
    '{3,text_ar}',
    '"إمپاناداس و كيساديلاس، گواكامولي و شيپس تورتييا"'
  )
WHERE question = 'L''assortiment BODEGA (pour 2 personnes) contient :';

-- Question 12: Assortiment CASTILLE
UPDATE quiz_questions
SET question_ar = 'الأسورتيمون CASTILLE فيه:'
WHERE question = 'L''assortiment CASTILLE contient :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"كروكيت دجاج و باتاتاس برافاس"'
        ),
        '{1,text_ar}',
        '"تورتييا و گازباتشو"'
      ),
      '{2,text_ar}',
      '"طماطم موزاريلا، سلاطة روسية، أنشوا متبل، فلفل حلو متبل"'
    ),
    '{3,text_ar}',
    '"كلامار مقلي و گامباس"'
  )
WHERE question = 'L''assortiment CASTILLE contient :';

-- Question 13: Assortiment ZARZUELA
UPDATE quiz_questions
SET question_ar = 'الأسورتيمون ZARZUELA فيه:'
WHERE question = 'L''assortiment ZARZUELA se compose de :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"لحوم مشوية متنوعة على الطريقة الإسبانية"'
        ),
        '{1,text_ar}',
        '"موزيل پيل پيل، گمرون بالتومة، فريتور ديال السيبيا، فيش أند شيپس"'
      ),
      '{2,text_ar}',
      '"فرماج و شاركوتري"'
    ),
    '{3,text_ar}',
    '"خضرة مشوية و سلاطات"'
  )
WHERE question = 'L''assortiment ZARZUELA se compose de :';

-- Question 14: Assortiment inexistant
UPDATE quiz_questions
SET question_ar = 'أشنو الأسورتيمون اللي ماكاينش فالكارطة:'
WHERE question = 'Quel assortiment N''existe PAS sur la carte :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"BODEGA"'
        ),
        '{1,text_ar}',
        '"EXTRAMADURA"'
      ),
      '{2,text_ar}',
      '"CASTILLE"'
    ),
    '{3,text_ar}',
    '"BARCELONA"'
  )
WHERE question = 'Quel assortiment N''existe PAS sur la carte :';

-- SECTION 4: FRITURE BODEGA

-- Question 15: Friture Bodega contenu
UPDATE quiz_questions
SET question_ar = 'الـ "Friture Bodega" فيها بالضبط:'
WHERE question = 'La "Friture Bodega" contient précisément :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"غير كلامار و گمرون"'
        ),
        '{1,text_ar}',
        '"كلامار، گمرون، سوليت، ميرلان و تمپورا ديال الخضرة"'
      ),
      '{2,text_ar}',
      '"كل الحوت ديال النهار المتوفر"'
    ),
    '{3,text_ar}',
    '"كلامار، پولپ و سيبيا"'
  )
WHERE question = 'La "Friture Bodega" contient précisément :';

-- Question 16: Solettes définition
UPDATE quiz_questions
SET question_ar = 'فالـ Friture Bodega، "solettes" هوما:'
WHERE question = 'Dans la Friture Bodega, les "solettes" sont :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"حوت صغير مفلطح مقلي"'
        ),
        '{1,text_ar}',
        '"گمرون خاص"'
      ),
      '{2,text_ar}',
      '"بينيي ديال الخضرة"'
    ),
    '{3,text_ar}',
    '"قطع ديال السيبيا"'
  )
WHERE question = 'Dans la Friture Bodega, les "solettes" sont :';

-- SECTION 5: CHARCUTERIES ET FROMAGES

-- Question 17: Planche charcuterie ibérique
UPDATE quiz_questions
SET question_ar = 'الـ "Planche de charcuterie ibérique" فيها:'
WHERE question = 'La "Planche de charcuterie ibérique" contient :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"جامبون دو بايون و سوسيسون فرنساوي"'
        ),
        '{1,text_ar}',
        '"شاركوتري إسبانية (شوريزو، لومو، جامبون سيرانو/إيبيريكو)"'
      ),
      '{2,text_ar}',
      '"بريزاولا و كوپا إيطالية حلال"'
    ),
    '{3,text_ar}',
    '"پاسترامي و لحم مدخن"'
  )
WHERE question = 'La "Planche de charcuterie ibérique" contient :';

-- Question 18: Assiette fromages
UPDATE quiz_questions
SET question_ar = 'الطبسيل ديال الفرماج فيه هاذ 5 أنواع:'
WHERE question = 'L''assiette de fromages comprend ces 5 fromages :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"روكفور، بري، روبلوشون، گرويير، پارميزان"'
        ),
        '{1,text_ar}',
        '"بلو، شيڤ، كومطي، مانشيگو، كامومبير"'
      ),
      '{2,text_ar}',
      '"موزاريلا، ريكوطا، گورگونزولا، پيكورينو، طاليجيو"'
    ),
    '{3,text_ar}',
    '"شيدار، ستيلطون، گودا، إيدام، إيمونطال"'
  )
WHERE question = 'L''assiette de fromages comprend ces 5 fromages :';

-- Question 19: Jambon Serrano
UPDATE quiz_questions
SET question_ar = 'الـ "Jambon Serrano" هو:'
WHERE question = 'Le "Jambon Serrano" est :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"جامبون مطيب فالفرن"'
        ),
        '{1,text_ar}',
        '"جامبون مدخن"'
      ),
      '{2,text_ar}',
      '"جامبون خام مجفف إسباني"'
    ),
    '{3,text_ar}',
    '"جامبون ديال الخنزير الكحل غير"'
  )
WHERE question = 'Le "Jambon Serrano" est :';

-- SECTION 6: DESSERTS (DOUCEURS)

-- Question 20: Crème catalane
UPDATE quiz_questions
SET question_ar = 'الـ "Crème catalane" كتختالف على الـ crème brûlée بـ:'
WHERE question = 'La "Crème catalane" se différencie de la crème brûlée par :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"زيادة القرفة و قشور الحوامض"'
        ),
        '{1,text_ar}',
        '"بلا سكر مكرامل"'
      ),
      '{2,text_ar}',
      '"الطيب فالفرن غير"'
    ),
    '{3,text_ar}',
    '"استعمال حليب المعز"'
  )
WHERE question = 'La "Crème catalane" se différencie de la crème brûlée par :';

-- Question 22: Colonel
UPDATE quiz_questions
SET question_ar = 'الـ "Colonel" تقليدياً هو:'
WHERE question = 'Le "Colonel" est traditionnellement :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"جلاس الڤانيلا و ويسكي"'
        ),
        '{1,text_ar}',
        '"سوربي التوت و الشامپانيا"'
      ),
      '{2,text_ar}',
      '"سوربي الليمون و الڤودكا"'
    ),
    '{3,text_ar}',
    '"جلاس القهوة و الكونياك"'
  )
WHERE question = 'Le "Colonel" est traditionnellement :';

-- Question 23: Nougat glacé
UPDATE quiz_questions
SET question_ar = 'الـ "Nougat glacé" كيتقدم مع:'
WHERE question = 'Le "Nougat glacé" est servi avec :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"كريم أنگليز"'
        ),
        '{1,text_ar}',
        '"كولي ديال التوت"'
      ),
      '{2,text_ar}',
      '"صوص الشوكلا"'
    ),
    '{3,text_ar}',
    '"كاراميل بالزبدة المالحة"'
  )
WHERE question = 'Le "Nougat glacé" est servi avec :';

-- Question 24: Croustillant aux noisettes
UPDATE quiz_questions
SET question_ar = 'الـ "Croustillant aux noisettes" هو:'
WHERE question = 'Le "Croustillant aux noisettes" est :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"جلاس بالنوازيط"'
        ),
        '{1,text_ar}',
        '"حلوى طرية"'
      ),
      '{2,text_ar}',
      '"موس غليظة و قاعدة كروكانت"'
    ),
    '{3,text_ar}',
    '"كريم بالنوازيط"'
  )
WHERE question = 'Le "Croustillant aux noisettes" est :';

-- SECTION 7: BOISSONS - ALCOOLS, VINS, BIÈRES & COCKTAILS

-- Question 25: Hemingway Special
UPDATE quiz_questions
SET question_ar = 'الكوكطيل "Hemingway Special" فيه:'
WHERE question = 'Le cocktail "Hemingway Special" contient :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"ڤودكا، عصير التوت الأحمر، ليمون أخضر"'
        ),
        '{1,text_ar}',
        '"روم، Luxardo maraschino، سيروپ الپامپلوموس، عصير الليمون"'
      ),
      '{2,text_ar}',
      '"جين، طونيك، خيار"'
    ),
    '{3,text_ar}',
    '"ويسكي، ڤيرموط، كريز"'
  )
WHERE question = 'Le cocktail "Hemingway Special" contient :';

-- Question 26: VSOP Boulvardier
UPDATE quiz_questions
SET question_ar = 'الـ "VSOP Boulvardier" فيه:'
WHERE question = 'Le "VSOP Boulvardier" contient :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"ڤودكا، ليكور القهوة، كريم"'
        ),
        '{1,text_ar}',
        '"جين، Campari، ڤيرموط"'
      ),
      '{2,text_ar}',
      '"Hennessy V.S، Bourbon، Aperol ولا Campari، Martini rouge، ليكور الموز، Amaretto disaronno، Angostura، Orange bitter"'
    ),
    '{3,text_ar}',
    '"روم، نعناع، سكر، ليمون أخضر"'
  )
WHERE question = 'Le "VSOP Boulvardier" contient :';

-- Question 27: Bière non disponible
UPDATE quiz_questions
SET question_ar = 'أشنو البيرة اللي ماكايناش فالبوطيلة فالريستورا:'
WHERE question = 'Quelle bière N''est PAS disponible en bouteille au restaurant :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"Heineken 25cl"'
        ),
        '{1,text_ar}',
        '"Corona 35cl"'
      ),
      '{2,text_ar}',
      '"Stella Artois 33cl"'
    ),
    '{3,text_ar}',
    '"Desperados 25cl"'
  )
WHERE question = 'Quelle bière N''est PAS disponible en bouteille au restaurant :';

-- Question 28: Paper Plan
UPDATE quiz_questions
SET question_ar = 'الكوكطيل "Paper Plan" فيه:'
WHERE question = 'Le cocktail "Paper Plan" contient :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"تيكيلا، triple sec، ليمون أخضر"'
        ),
        '{1,text_ar}',
        '"ڤودكا، ليكور الخوخ، عصير التوت الأحمر"'
      ),
      '{2,text_ar}',
      '"Bourbon، Aperol، Amaro nonino، عصير الليمون"'
    ),
    '{3,text_ar}',
    '"جين، elderflower، پروسيكو"'
  )
WHERE question = 'Le cocktail "Paper Plan" contient :';

-- Question 29: Vin AOC marocain
UPDATE quiz_questions
SET question_ar = 'فالنبيذ المغربي الأحمر، أشنو هو AOC:'
WHERE question = 'Dans les vins marocains ROUGES, lequel est un AOC :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"Volubilia"'
        ),
        '{1,text_ar}',
        '"Medaillon"'
      ),
      '{2,text_ar}',
      '"Château Roslane"'
    ),
    '{3,text_ar}',
    '"Epicuria"'
  )
WHERE question = 'Dans les vins marocains ROUGES, lequel est un AOC :';

-- Question 30: Clover Club
UPDATE quiz_questions
SET question_ar = 'الكوكطيل "Clover Club" فيه:'
WHERE question = 'Le cocktail "Clover Club" contient :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"جين، عصير الليمون، ليكور الليتشي، Martini dry، بياض البيض، سيروپ القصب، التوت"'
        ),
        '{1,text_ar}',
        '"ڤودكا، Kahlua، كريم، قهوة"'
      ),
      '{2,text_ar}',
      '"روم، كوكا، ليمون"'
    ),
    '{3,text_ar}',
    '"ويسكي، Amaretto، عصير البرتقال"'
  )
WHERE question = 'Le cocktail "Clover Club" contient :';

-- Question 31: Whisky premium
UPDATE quiz_questions
SET question_ar = 'من هاذ الويسكيات، أشنو هو الأكثر پريميوم (راقي):'
WHERE question = 'Parmi ces whiskys, lequel est le plus premium (haut de gamme) :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"J.W Red Label"'
        ),
        '{1,text_ar}',
        '"Jack Daniel\'\'s"'
      ),
      '{2,text_ar}',
      '"Gentleman Jack"'
    ),
    '{3,text_ar}',
    '"J.W Blue Label"'
  )
WHERE question = 'Parmi ces whiskys, lequel est le plus premium (haut de gamme) :';

-- Question 32: Bullfrog
UPDATE quiz_questions
SET question_ar = 'الـ "Bullfrog" هو كوكطيل فيه:'
WHERE question = 'Le "Bullfrog" est un cocktail qui contient :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"تيكيلا، برتقال، گرونادين"'
        ),
        '{1,text_ar}',
        '"ڤودكا، جين، Jose Cuervo silver، روم، ليكور curacao bleu، عصير الليمون، Red Bull"'
      ),
      '{2,text_ar}',
      '"ويسكي، عسل، ليمون"'
    ),
    '{3,text_ar}',
    '"شامپانيا، ليكور التوت"'
  )
WHERE question = 'Le "Bullfrog" est un cocktail qui contient :';

-- Question 33: Différence pressions
UPDATE quiz_questions
SET question_ar = 'شنو الفرق بين "Pression Casablanca" و "Pression Spécial":'
WHERE question = 'Quelle est la différence entre "Pression Casablanca" et "Pression Spécial" :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"جوج بيرات پريسيون مختلفين متوفرين فالريستورا"'
        ),
        '{1,text_ar}',
        '"غير حجم الكاس"'
      ),
      '{2,text_ar}',
      '"درجة الحرارة ديال التقديم"'
    ),
    '{3,text_ar}',
    '"وحدة بلا كحول"'
  )
WHERE question = 'Quelle est la différence entre "Pression Casablanca" et "Pression Spécial" :';

-- Question 34: Limoncello
UPDATE quiz_questions
SET question_ar = 'الديجيستيف "Limoncello" هو:'
WHERE question = 'Le digestif "Limoncello" est :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"ليكور القهوة الإيطالية"'
        ),
        '{1,text_ar}',
        '"كونياك بالليمون"'
      ),
      '{2,text_ar}',
      '"ليكور الليمون الإيطالية"'
    ),
    '{3,text_ar}',
    '"روم متبل بالليمون"'
  )
WHERE question = 'Le digestif "Limoncello" est :';

-- Vérification finale
SELECT
  id,
  question,
  question_ar,
  answers
FROM quiz_questions
WHERE question IN (
  'La "Paella valenciana mixta" contient traditionnellement :',
  'La différence entre "Paella valenciana mixta" et "Paella de mariscos" est :',
  'L''assortiment BODEGA (pour 2 personnes) contient :',
  'L''assortiment CASTILLE contient :',
  'L''assortiment ZARZUELA se compose de :',
  'Quel assortiment N''existe PAS sur la carte :',
  'La "Friture Bodega" contient précisément :',
  'Dans la Friture Bodega, les "solettes" sont :',
  'La "Planche de charcuterie ibérique" contient :',
  'L''assiette de fromages comprend ces 5 fromages :',
  'Le "Jambon Serrano" est :',
  'La "Crème catalane" se différencie de la crème brûlée par :',
  'Le "Colonel" est traditionnellement :',
  'Le "Nougat glacé" est servi avec :',
  'Le "Croustillant aux noisettes" est :',
  'Le cocktail "Hemingway Special" contient :',
  'Le "VSOP Boulvardier" contient :',
  'Quelle bière N''est PAS disponible en bouteille au restaurant :',
  'Le cocktail "Paper Plan" contient :',
  'Dans les vins marocains ROUGES, lequel est un AOC :',
  'Le cocktail "Clover Club" contient :',
  'Parmi ces whiskys, lequel est le plus premium (haut de gamme) :',
  'Le "Bullfrog" est un cocktail qui contient :',
  'Quelle est la différence entre "Pression Casablanca" et "Pression Spécial" :',
  'Le digestif "Limoncello" est :'
)
ORDER BY id;
