-- Script de traduction en darija pour le quiz Grillades et Plats Chauds
-- À exécuter dans l'éditeur SQL de Supabase

-- Question 1: Mixed-grill
UPDATE quiz_questions
SET question_ar = 'الـ "Mixed-grill" فيه عادة:'
WHERE question = 'Le "Mixed-grill" contient typiquement :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"غير لحم البقر و الخنزير"'
        ),
        '{1,text_ar}',
        '"بزاف ديال أنواع اللحم المشوي (بقري، دجاج، مرقاز، وغيرها)"'
      ),
      '{2,text_ar}',
      '"الحوت و اللحم مخلطين"'
    ),
    '{3,text_ar}',
    '"غير الخضرة المشوية"'
  )
WHERE question = 'Le "Mixed-grill" contient typiquement :';

-- Question 2: Émincé de bœuf à la péruvienne
UPDATE quiz_questions
SET question_ar = 'الإميـنـسي ديال لحم البقر على الطريقة البيروفية كيتقدم مع:'
WHERE question = 'L''émincé de bœuf à la péruvienne est servi avec :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"صوص البيشاميل"'
        ),
        '{1,text_ar}',
        '"صوص بالفلفل الأخضر"'
      ),
      '{2,text_ar}',
      '"صوص بيروفية بالتوابل و الفلفل الحار"'
    ),
    '{3,text_ar}',
    '"بلا صوص، غير مشوي"'
  )
WHERE question = 'L''émincé de bœuf à la péruvienne est servi avec :';

-- Question 3: Fajitas de poulet et poivrons
UPDATE quiz_questions
SET question_ar = 'الـ "Fajitas" ديال الدجاج و الفلفل الحلو كيتقدمو مع:'
WHERE question = 'Les "Fajitas de poulet et poivrons" sont servies avec :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"تورتيلاس، دجاج مشوي، فلفل حلو، بصل"'
        ),
        '{1,text_ar}',
        '"خبز البيتا و دجاج مقلي"'
      ),
      '{2,text_ar}',
      '"رز، دجاج و خضرة"'
    ),
    '{3,text_ar}',
    '"تاكوس كروكان و دجاج مفروم"'
  )
WHERE question = 'Les "Fajitas de poulet et poivrons" sont servies avec :';

-- Question 4: Filet de loup à la plancha
UPDATE quiz_questions
SET question_ar = 'فيليه الذيب (لوب) على البلانشا هو:'
WHERE question = 'Le "Filet de loup à la plancha" est :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"فيليه ذيب مقلي"'
        ),
        '{1,text_ar}',
        '"فيليه ذيب فالبابيوط"'
      ),
      '{2,text_ar}',
      '"فيليه ذيب مشوي على صفيحة سخونة"'
    ),
    '{3,text_ar}',
    '"فيليه ذيب متبل و خام"'
  )
WHERE question = 'Le "Filet de loup à la plancha" est :';

-- Question 5: Crispy chicken burger
UPDATE quiz_questions
SET question_ar = 'الـ "Crispy chicken burger" كيختالف على الـ cheese burger بـ:'
WHERE question = 'Le "Crispy chicken burger" se différencie du cheese burger par :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"زيادة الـ bacon"'
        ),
        '{1,text_ar}',
        '"الدجاج المقلي الكروكان"'
      ),
      '{2,text_ar}',
      '"صوص الباربيكيو ضروري"'
    ),
    '{3,text_ar}',
    '"الخبز بالحبوب"'
  )
WHERE question = 'Le "Crispy chicken burger" se différencie du cheese burger par :';

-- Question 6: Linguine aux fruits de mer
UPDATE quiz_questions
SET question_ar = 'الـ "Linguine" بفواكه البحر فيها عادة:'
WHERE question = 'Les "Linguine aux fruits de mer" contiennent généralement :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"غير الگمرون"'
        ),
        '{1,text_ar}',
        '"خليط ديال البلح البحري، الگمرون و السيبيا"'
      ),
      '{2,text_ar}',
      '"التونة و السلمون"'
    ),
    '{3,text_ar}',
    '"المحار و الجمبري الكبير"'
  )
WHERE question = 'Les "Linguine aux fruits de mer" contiennent généralement :';

-- Question 7: Suprême de volaille sauce champignons
UPDATE quiz_questions
SET question_ar = 'الـ "Suprême de volaille" بصوص الفطر كيستعمل أي جزء من الدجاج:'
WHERE question = 'Le "Suprême de volaille sauce champignons" utilise quelle partie du poulet :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"الفخذ بلا عظم"'
        ),
        '{1,text_ar}',
        '"الدجاج الكامل مقطع"'
      ),
      '{2,text_ar}',
      '"صدر الدجاج (الأبيض)"'
    ),
    '{3,text_ar}',
    '"الأجنحة ديال الدجاج"'
  )
WHERE question = 'Le "Suprême de volaille sauce champignons" utilise quelle partie du poulet :';

-- Question 8: Gambas à la plancha
UPDATE quiz_questions
SET question_ar = 'الـ "Gambas" على البلانشا كيتحضرو بـ:'
WHERE question = 'Les "Gambas à la plancha" sont préparées avec :';

UPDATE quiz_questions
SET
  answers = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          answers,
          '{0,text_ar}',
          '"گمرون كبار مشويين، تومة، معدنوس"'
        ),
        '{1,text_ar}',
        '"گمرون صغار مقليين"'
      ),
      '{2,text_ar}',
      '"گمرون مفلامبي بالكونياك"'
    ),
    '{3,text_ar}',
    '"گمرون فالـ tempura"'
  )
WHERE question = 'Les "Gambas à la plancha" sont préparées avec :';

-- Vérification: Afficher les questions avec traductions
SELECT
  id,
  question,
  question_ar,
  answers
FROM quiz_questions
WHERE question IN (
  'Le "Mixed-grill" contient typiquement :',
  'L''émincé de bœuf à la péruvienne est servi avec :',
  'Les "Fajitas de poulet et poivrons" sont servies avec :',
  'Le "Filet de loup à la plancha" est :',
  'Le "Crispy chicken burger" se différencie du cheese burger par :',
  'Les "Linguine aux fruits de mer" contiennent généralement :',
  'Le "Suprême de volaille sauce champignons" utilise quelle partie du poulet :',
  'Les "Gambas à la plancha" sont préparées avec :'
)
ORDER BY id;
