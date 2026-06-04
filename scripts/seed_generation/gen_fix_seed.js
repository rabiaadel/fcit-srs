const fs = require('fs');
const path = require('path');

// 1. Raw Student Data (from gen_students_seed.js)
const table1 = `
2025GEN001…000000030	أحمد محمد حسن	Ahmed Mohamed Hassan	M	30601152301010	Gharbia	Tanta	3.8	Excellent
2025GEN002…000000031	سارة خالد إبراهيم	Sara Khaled Ibrahim	F	30702202301020	Cairo	Nasr City	3.5	Very Good
2025GEN003…000000032	عمر محمود علي	Omar Mahmoud Ali	M	30605102301030	Alexandria	Smouha	2.9	Good
2025GEN004…000000033	نور أحمد سيد	Nour Ahmed Sayed	F	30709152301040	Giza	Dokki	4.0	Excellent
2025GEN005…000000034	محمد طارق منصور	Mohamed Tarek Mansour	M	30603202301050	Dakahlia	Mansoura	3.1	Very Good
2025GEN006…000000035	آية حسن كمال	Aya Hassan Kamal	F	30708012301060	Monufia	Shebin	3.6	Excellent
2025GEN007…000000036	يوسف عمرو خليل	Youssef Amr Khalil	M	30604052301070	Sharqia	Zagazig	2.4	Pass
2025GEN008…000000037	هنا إبراهيم ناصر	Hana Ibrahim Nasser	F	30710202301080	Kafr El Sheikh	Desouk	3.9	Excellent
2025GEN009…000000038	كريم وليد يوسف	Kareem Waleed Yousef	M	30602282301090	Qalyubia	Banha	2.8	Good
2025GEN010…000000039	دينا مصطفى رضوان	Dina Mostafa Radwan	F	30711032301100	Port Said	Port Fouad	3.4	Very Good
2025GEN011…000000040	حسن شريف زكي	Hassan Sherif Zaki	M	30607182301110	Ismailia	Fayed	2.1	Pass
2025GEN012…000000041	ملك ياسر عبد الله	Malak Yasser Abdallah	F	30701122301120	Suez	Arbaeen	3.7	Excellent
2025GEN013…000000042	زياد حاتم فوزي	Ziad Hatem Fawzy	M	30609252301130	Faiyum	Ibsheway	2.6	Good
2025GEN014…000000043	ندى عصام جلال	Nada Essam Galal	F	30706302301140	Beni Suef	Biba	3.2	Very Good
2025GEN015…000000044	مازن سامح عادل	Mazen Sameh Adel	M	30612052301150	Minya	Maghagha	2.3	Pass
2025GEN016…000000045	رنا جمال سعد	Rana Gamal Saad	F	30703142301160	Asyut	Manfalut	3.8	Excellent
2025GEN017…000000046	آسر ماجد نبيل	Aser Maged Nabil	M	30608222301170	Sohag	Girga	3.0	Very Good
2025GEN018…000000047	فرح هشام بهاء	Farah Hisham Bahaa	F	30705082301180	Qena	Qus	3.5	Very Good
2025GEN019…000000048	ياسين رامي فاروق	Yassin Ramy Farouk	M	30610192301190	Luxor	Esna	2.7	Good
2025GEN020…000000049	جنا بهاء مجدي	Jana Bahaa Magdy	F	30712252301200	Aswan	Edfu	3.9	Excellent
2025GEN021…000000050	علي وائل شكري	Ali Wael Shoukry	M	30602142301210	Red Sea	Hurghada	2.2	Pass
2025GEN022…000000051	شهد طارق حمدي	Shahd Tarek Hamdy	F	30707072301220	Matrouh	Dabaa	3.3	Very Good
2025GEN023…000000052	مروان إيهاب فتحي	Marwan Ehab Fathy	M	30611302301230	New Valley	Kharga	1.6	Warning
2025GEN024…000000053	حبيبة هاني شوقي	Habiba Hany Shawky	F	30704182301240	North Sinai	Arish	3.6	Excellent
2025GEN025…000000054	سيف الدين أيمن	Seif Eldin Ayman	M	30609092301250	South Sinai	Sharm	2.5	Good
`;

const table2 = `
2024GEN026…000000055	ليلى مدحت أمين	Laila Medhat Amin	F	30501152301260	Gharbia	Tanta	3.7	Excellent
2024GEN027…000000056	أدهم شادي جابر	Adham Shady Gaber	M	30402202301270	Cairo	Maadi	3.4	Very Good
2024GEN028…000000057	مريم سامي عثمان	Mariam Samy Othman	F	30505102301280	Alexandria	Montaza	2.8	Good
2024GEN029…000000058	طارق باسم رجب	Tarek Bassem Ragab	M	30409152301290	Giza	Haram	3.9	Excellent
2024GEN030…000000059	سلمى نبيل صلاح	Salma Nabil Salah	F	30503202301300	Dakahlia	Talkha	3.2	Very Good
2024GEN031…000000060	حازم فؤاد لطفي	Hazem Fouad Lotfy	M	30408012301310	Monufia	Ashmoun	2.4	Pass
2024GEN032…000000061	روان عماد الدين	Rawan Emad Eldin	F	30504052301320	Sharqia	Minya Qamh	3.8	Excellent
2024GEN033…000000062	يحيى كرم عبد ربه	Yahya Karam Abdrabbo	M	30410202301330	Kafr El Sheikh	Baltim	2.9	Good
2024GEN034…000000063	نورين أشرف حلمي	Noreen Ashraf Helmy	F	30502282301340	Qalyubia	Shubra	3.5	Very Good
2024GEN035…000000064	أنس ماهر عز الدين	Anas Maher Ezzeldin	M	30411032301350	Port Said	Zohour	2.1	Pass
2024GEN036…000000065	يمنى صلاح غانم	Yomna Salah Ghanem	F	30507182301360	Ismailia	Qassasin	3.6	Excellent
2024GEN037…000000066	براء عادل سراج	Baraa Adel Serag	M	30401122301370	Suez	Attaka	2.6	Good
2024GEN038…000000067	حنين رياض فكري	Haneen Riad Fekry	F	30509252301380	Faiyum	Tamiya	3.3	Very Good
2024GEN039…000000068	مصطفى بهاء قاسم	Mostafa Bahaa Kassem	M	30406302301390	Beni Suef	Nasser	2.3	Pass
2024GEN040…000000069	ريماس محمود زاهر	Remas Mahmoud Zaher	F	30512052301400	Minya	Samalut	3.9	Excellent
2024GEN041…000000070	ياسر حمدي عفيفي	Yasser Hamdy Afify	M	30403142301410	Asyut	Dairut	3.1	Very Good
2024GEN042…000000071	جودي ممدوح رشاد	Goudy Mamdouh Rashad	F	30508222301420	Sohag	Tahta	2.7	Good
2024GEN043…000000072	إياد عمرو توفيق	Eyad Amr Tawfik	M	30405082301430	Qena	Nag Hammadi	3.7	Excellent
2024GEN044…000000073	لوجين سامح حجاج	Logain Sameh Haggag	F	30510192301440	Luxor	Zainia	2.2	Pass
2024GEN045…000000074	شهاب وليد الباز	Shehab Waleed Elbaz	M	30412252301450	Aswan	Kom Ombo	3.4	Very Good
2024GEN046…000000075	ميان حسام عيسى	Mayan Hossam Eissa	F	30502142301460	Red Sea	Safaga	2.5	Good
2024GEN047…000000076	زين طارق الصاوي	Zein Tarek Elsawy	M	30407072301470	Matrouh	Siwa	3.8	Excellent
2024GEN048…000000077	تسنيم أيمن الفقي	Tasneem Ayman Elfeky	F	30511302301480	New Valley	Dakhla	3.0	Very Good
2024GEN049…000000078	عمار ياسر الشريف	Ammar Yasser Elsherif	M	30404182301490	North Sinai	Bir al-Abed	1.5	Warning
2024GEN050…000000079	رودينا هشام فؤاد	Rodina Hisham Fouad	F	30509092301500	South Sinai	Dahab	3.5	Very Good
2024GEN051…000000080	حمزة محمود جلال	Hamza Mahmoud Galal	M	30403032301510	Gharbia	Kafr El Zayat	2.8	Good
2024GEN052…000000081	بسملة خالد صفوت	Basmala Khaled Safwat	F	30506062301520	Cairo	Helwan	3.9	Excellent
2024GEN053…000000082	إسلام طارق مكرم	Eslam Tarek Makram	M	30411112301530	Alexandria	Borg El Arab	2.4	Pass
2024GEN054…000000083	كارما أحمد رامي	Karma Ahmed Ramy	F	30508082301540	Giza	Imbaba	3.6	Excellent
2024GEN055…000000084	عمران محمد فريد	Omran Mohamed Farid	M	30412122301550	Dakahlia	Aga	3.1	Very Good
`;

const table3 = `
2023CS001…000000085	شروق عادل صبحي	Shorouk Adel Sobhy	F	30301152301560	CS	Gharbia	3.8	Excellent
2023CS002…000000086	معاذ حسن الجندي	Moaz Hassan Elgendy	M	30202202301570	CS	Cairo	2.9	Good
2023CS003…000000087	رقية محمود النجار	Roqaya Mahmoud Elnaggar	F	30305102301580	CS	Alexandria	3.5	Very Good
2023CS004…000000088	براء إبراهيم عواد	Baraa Ibrahim Awad	M	30209152301590	CS	Giza	2.4	Pass
2023CS005…000000089	جنى مصطفى هلال	Gana Mostafa Helal	F	30303202301600	CS	Dakahlia	3.9	Excellent
2023CS006…000000090	صهيب عمرو هاشم	Sohaib Amr Hashem	M	30208012301610	CS	Monufia	3.2	Very Good
2023CS007…000000091	لميس طارق مدكور	Lamees Tarek Madkour	F	30304052301620	CS	Sharqia	2.7	Good
2023CS008…000000092	مروان سامي حلمي	Marwan Samy Helmy	M	30210202301630	CS	Kafr El Sheikh	3.7	Excellent
2023CS009…000000093	أروى وليد بركات	Arwa Waleed Barakat	F	30302282301640	CS	Qalyubia	2.2	Pass
2023CS010…000000094	ياسين هشام القاضي	Yassin Hisham Elkady	M	30211032301650	CS	Port Said	3.4	Very Good
2023IS001…000000095	حور محمد الشامي	Hoor Mohamed Elshamy	F	30307182301660	IS	Ismailia	3.6	Excellent
2023IS002…000000096	زياد عادل رضوان	Ziad Adel Radwan	M	30201122301670	IS	Suez	2.8	Good
2023IS003…000000097	ريناد حاتم زهران	Renad Hatem Zahran	F	30309252301680	IS	Faiyum	3.3	Very Good
2023IS004…000000098	يوسف ماهر العطار	Youssef Maher Elattar	M	30206302301690	IS	Beni Suef	2.5	Good
2023IS005…000000099	كارولين مجدي لبيب	Caroline Magdy Labib	F	30312052301700	IS	Minya	3.8	Excellent
2023IS006…000000100	مينا أشرف فوزي	Mina Ashraf Fawzy	M	30203142301710	IS	Asyut	2.9	Good
2023IS007…000000101	مارينا هاني نسيم	Marina Hany Naseem	F	30308222301720	IS	Sohag	3.5	Very Good
2023IS008…000000102	يحيى بهاء الملاح	Yahya Bahaa Elmallah	M	30205082301730	IS	Qena	1.7	Warning
2023IT001…000000103	نيرة باسم الصيفي	Naira Bassem Elsaify	F	30310192301740	IT	Luxor	3.9	Excellent
2023IT002…000000104	إياد سامح الشاذلي	Eyad Sameh Elshazly	M	30212252301750	IT	Aswan	3.1	Very Good
2023IT003…000000105	سيلين رامي الجيار	Celine Ramy Elgayar	F	30302142301760	IT	Red Sea	2.6	Good
2023IT004…000000106	فارس طارق زيدان	Fares Tarek Zeidan	M	30207072301770	IT	Matrouh	3.7	Excellent
2023IT005…000000107	تاليا عمرو درويش	Talia Amr Darwish	F	30311302301780	IT	New Valley	2.3	Pass
2023IT006…000000108	أنس محمود الديب	Anas Mahmoud Eldeeb	M	30204182301790	IT	North Sinai	3.4	Very Good
2023IT007…000000109	ريتاج هشام عثمان	Retag Hisham Othman	F	30309092301800	IT	South Sinai	3.0	Very Good
`;

const table4 = `
2022CS001…000000110	مهاب عادل سيف	Mohab Adel Seif	M	30001152301810	CS	Gharbia	3.8	Excellent
2022CS002…000000111	لجين حسن عبد الباقي	Logain Hassan Abdelbaky	F	30102202301820	CS	Cairo	2.9	Good
2022CS003…000000112	عمر مصطفى الدمرداش	Omar Mostafa Eldemerdash	M	30005102301830	CS	Alexandria	3.5	Very Good
2022CS004…000000113	روان طارق غالي	Rawan Tarek Ghaly	F	30109152301840	CS	Giza	2.4	Pass
2022CS005…000000114	سيف الدين ماهر	Seif Eldin Maher	M	30003202301850	CS	Dakahlia	3.9	Excellent
2022CS006…000000115	مريم عمرو حبيب	Mariam Amr Habib	F	30108012301860	CS	Monufia	3.2	Very Good
2022CS007…000000116	أحمد سامي أبو زيد	Ahmed Samy Abouzeid	M	30004052301870	CS	Sharqia	2.7	Good
2022CS008…000000117	شهد وليد الهواري	Shahd Waleed Elhawary	F	30110202301880	CS	Kafr El Sheikh	3.7	Excellent
2022IS001…000000118	علياء هشام الجوهري	Aliaa Hisham Elgohary	F	30102282301890	IS	Qalyubia	2.2	Pass
2022IS002…000000119	مروان بهاء الشيمي	Marwan Bahaa Elshimi	M	30011032301900	IS	Port Said	3.4	Very Good
2022IS003…000000120	نورهان باسم علام	Nourhan Bassem Allam	F	30107182301910	IS	Ismailia	3.6	Excellent
2022IS004…000000121	زياد طارق الطوخي	Ziad Tarek Eltoukhy	M	30001122301920	IS	Suez	2.8	Good
2022IS005…000000122	ملك عادل العقاد	Malak Adel Elakkad	F	30109252301930	IS	Faiyum	3.3	Very Good
2022IS006…000000123	ياسين حاتم القاضي	Yassin Hatem Elkady	M	30006302301940	IS	Beni Suef	2.5	Good
2022IT001…000000124	رنا مجدي المليجي	Rana Magdy Elmeligy	F	30112052301950	IT	Minya	3.8	Excellent
2022IT002…000000125	كريم أشرف السعيد	Kareem Ashraf Elsaeed	M	30003142301960	IT	Asyut	2.9	Good
2022IT003…000000126	سلمى هاني بدران	Salma Hany Badran	F	30108222301970	IT	Sohag	3.5	Very Good
2022IT004…000000127	آسر بهاء منصور	Aser Bahaa Mansour	M	30005082301980	IT	Qena	1.6	Warning
2022IT005…000000128	جنى محمود الشريف	Jana Mahmoud Elsherif	F	30110192301990	IT	Luxor	3.9	Excellent
2022IT006…000000129	مازن سامح غنيم	Mazen Sameh Ghoneim	M	30012252302000	IT	Aswan	3.1	Very Good
`;

function parseTable(text, year) {
  let lines = text.trim().split('\n');
  let result = [];
  let gIdx = 0;
  let groups = ['A', 'B', 'C', 'D'];
  for (let line of lines) {
    if (!line.trim()) continue;
    let parts = line.split('\t');
    let group = groups[gIdx % 4];
    gIdx++;
    
    let dept = null;
    let gpaIndex = 7;
    let standingIndex = 8;
    if (year === 3 || year === 4) {
      dept = parts[5];
      gpaIndex = 7;
      standingIndex = 8;
    }
    
    let gpa = parseFloat(parts[gpaIndex]);
    let uuidSuffix = parts[0].split('…')[1].padStart(12, '0');
    let uuid = `00000000-0000-0000-0000-${uuidSuffix}`;

    result.push({
      uuid: uuid,
      code: parts[0].split('…')[0],
      gpa: gpa,
      year: year,
      dept: dept,
      group: group
    });
  }
  return result;
}

let students = [
  ...parseTable(table1, 1),
  ...parseTable(table2, 2),
  ...parseTable(table3, 3),
  ...parseTable(table4, 4)
];

const HISTORICAL_COURSES = {
  Y1T1: [
    { c: 'BS112', dr: 'v_dr_aida', cr: 3 },
    { c: 'CS111', dr: 'v_dr_osama', cr: 3 },
    { c: 'IS111', dr: 'v_dr_omnia', cr: 3 },
    { c: 'BS111', dr: 'v_dr_nancy', cr: 3 },
    { c: 'BS116', dr: 'v_dr_shimaa', cr: 3 },
    { c: 'UNV113', dr: 'v_dr_walid_s', cr: 2 }
  ],
  Y1T2: [
    { c: 'BS115', dr: 'v_dr_aida', cr: 3 },
    { c: 'UNV112', dr: 'v_dr_ahmed', cr: 2 },
    { c: 'BS113', dr: 'v_dr_mostafa', cr: 3 },
    { c: 'UNV114', dr: 'v_dr_arwa', cr: 2 },
    { c: 'UNV111', dr: 'v_dr_shimaa', cr: 2 },
    { c: 'CS112', dr: 'v_dr_osama', cr: 3 }
  ],
  Y2T1: [
    { c: 'BS114', dr: 'v_dr_hanaa_h', cr: 3 },
    { c: 'BS117', dr: 'v_dr_nancy', cr: 3 },
    { c: 'CS211', dr: 'v_dr_osama', cr: 3 },
    { c: 'SE211', dr: 'v_dr_arwa', cr: 3 },
    { c: 'CS212', dr: 'v_dr_mostafa', cr: 3 },
    { c: 'IT211', dr: 'v_dr_aida', cr: 3 }
  ],
  Y2T2: [
    { c: 'IS211', dr: 'v_dr_omnia', cr: 3 },
    { c: 'CS214', dr: 'v_dr_hanaa_e', cr: 3 },
    { c: 'IT317', dr: 'v_dr_marian', cr: 3 },
    { c: 'IS212', dr: 'v_dr_nancy', cr: 3 },
    { c: 'CS213', dr: 'v_dr_osama', cr: 3 }
  ],
  Y3T1_CS: [
    { c: 'IT311', dr: 'v_dr_ahmed', cr: 3 },
    { c: 'CS313', dr: 'v_dr_ahmed', cr: 3 },
    { c: 'CS311', dr: 'v_dr_mostafa', cr: 3 },
    { c: 'IS311', dr: 'v_dr_shimaa', cr: 3 },
    { c: 'CS312', dr: 'v_dr_walid_k', cr: 3 },
    { c: 'CS331', dr: 'v_dr_osama', cr: 3 }
  ],
  Y3T1_IS: [
    { c: 'CS314', dr: 'v_dr_ahmed', cr: 3, section: 'IS-Main' },
    { c: 'IS313', dr: 'v_dr_hany', cr: 3 },
    { c: 'IS312', dr: 'v_dr_shimaa', cr: 3 },
    { c: 'IS351', dr: 'v_dr_omnia', cr: 3 },
    { c: 'IS311', dr: 'v_dr_shimaa', cr: 3 }, 
    { c: 'CS313', dr: 'v_dr_ahmed', cr: 3, section: 'IT-Main' }
  ]
};

function assignGrades(targetGpa, courses) {
  let gradePoints = [
    { g: 'A', p: 4.0 }, { g: 'B+', p: 3.5 }, { g: 'B', p: 3.0 },
    { g: 'C+', p: 2.5 }, { g: 'C', p: 2.0 }, { g: 'D+', p: 1.5 },
    { g: 'D', p: 1.0 }, { g: 'F', p: 0.0 }
  ];
  let res = [];
  for (let c of courses) {
    let gp = gradePoints.reduce((prev, curr) => Math.abs(curr.p - targetGpa) < Math.abs(prev.p - targetGpa) ? curr : prev);
    res.push({ ...c, grade: gp.g, grade_points: gp.p });
  }
  return res;
}

let sql = `-- =============================================================================
-- Seed 005b: Bug Fixes for seeds 004 and 005
-- Fixes: IS421 phantom, deactivation overreach, past-semester offerings,
--        multi-section ambiguity
-- =============================================================================

DO $$
DECLARE
  v_fall2022_id   INT;  v_spring2023_id INT;
  v_fall2023_id   INT;  v_spring2024_id INT;
  v_fall2024_id   INT;  v_spring2025_id INT;
  v_fall2025_id   INT;  v_spring2026_id INT;

  v_dr_ahmed   UUID;  v_dr_aida    UUID;  v_dr_osama   UUID;
  v_dr_omnia   UUID;  v_dr_nancy   UUID;  v_dr_shimaa  UUID;
  v_dr_walid_s UUID;  v_dr_mostafa UUID;  v_dr_arwa    UUID;
  v_dr_hanaa_h UUID;  v_dr_hanaa_e UUID;  v_dr_marian  UUID;
  v_dr_walid_k UUID;  v_dr_hany    UUID;  v_dr_tahani  UUID;
  v_dr_ibrahim UUID;  v_dr_iman    UUID;  v_dr_marwa   UUID;

  v_student_id  UUID;
  v_offering_id INT;
BEGIN
  IF EXISTS (SELECT 1 FROM seed_logs WHERE seed_name = '005b_fix_seeds.sql') THEN
    RAISE NOTICE 'Seed 005b already applied, skipping.';
    RETURN;
  END IF;

  SELECT id INTO v_fall2022_id   FROM semesters WHERE label = 'Fall 2022';
  SELECT id INTO v_spring2023_id FROM semesters WHERE label = 'Spring 2023';
  SELECT id INTO v_fall2023_id   FROM semesters WHERE label = 'Fall 2023';
  SELECT id INTO v_spring2024_id FROM semesters WHERE label = 'Spring 2024';
  SELECT id INTO v_fall2024_id   FROM semesters WHERE label = 'Fall 2024';
  SELECT id INTO v_spring2025_id FROM semesters WHERE label = 'Spring 2025';
  SELECT id INTO v_fall2025_id   FROM semesters WHERE label = 'Fall 2025';
  SELECT id INTO v_spring2026_id FROM semesters WHERE label = 'Spring 2026';

  SELECT id INTO v_dr_ahmed   FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000002';
  SELECT id INTO v_dr_aida    FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000010';
  SELECT id INTO v_dr_osama   FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000011';
  SELECT id INTO v_dr_omnia   FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000012';
  SELECT id INTO v_dr_nancy   FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000013';
  SELECT id INTO v_dr_shimaa  FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000014';
  SELECT id INTO v_dr_walid_s FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000015';
  SELECT id INTO v_dr_mostafa FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000016';
  SELECT id INTO v_dr_arwa    FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000017';
  SELECT id INTO v_dr_hanaa_h FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000018';
  SELECT id INTO v_dr_hanaa_e FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000019';
  SELECT id INTO v_dr_marian  FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000020';
  SELECT id INTO v_dr_walid_k FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000021';
  SELECT id INTO v_dr_hany    FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000022';
  SELECT id INTO v_dr_tahani  FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000023';
  SELECT id INTO v_dr_ibrahim FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000024';
  SELECT id INTO v_dr_iman    FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000025';
  SELECT id INTO v_dr_marwa   FROM doctors WHERE user_id='00000000-0000-0000-0000-000000000026';

  -- BUG 3 FIX: Remove IS421 phantom
  DELETE FROM doctor_schedule_slots WHERE offering_id IN (
    SELECT co.id FROM course_offerings co JOIN courses c ON c.id = co.course_id WHERE c.code = 'IS421'
  );
  DELETE FROM enrollments WHERE offering_id IN (
    SELECT co.id FROM course_offerings co JOIN courses c ON c.id = co.course_id WHERE c.code = 'IS421'
  );
  DELETE FROM course_offerings WHERE course_id = (SELECT id FROM courses WHERE code = 'IS421');
  UPDATE courses SET is_active = FALSE WHERE code = 'IS421';

  -- BUG 2 FIX: Repair over-broad deactivation
  UPDATE course_offerings SET is_active = TRUE
  WHERE doctor_id IS NULL AND is_active = FALSE AND semester_id NOT IN (v_fall2025_id, v_spring2026_id);

  -- BUG 4 FIX: Re-assign IS and IT Year 3 students to correct CS313 and IT311 section
  UPDATE enrollments SET offering_id = (SELECT id FROM course_offerings WHERE course_id=(SELECT id FROM courses WHERE code='CS313') AND semester_id=v_fall2025_id AND section_label='Section B')
  WHERE offering_id = (SELECT id FROM course_offerings WHERE course_id=(SELECT id FROM courses WHERE code='CS313') AND semester_id=v_fall2025_id AND section_label='Main')
  AND student_id IN (SELECT id FROM students WHERE specialization='IS' AND enrollment_year=2023);

  UPDATE enrollments SET offering_id = (SELECT id FROM course_offerings WHERE course_id=(SELECT id FROM courses WHERE code='CS313') AND semester_id=v_fall2025_id AND section_label='Section C')
  WHERE offering_id = (SELECT id FROM course_offerings WHERE course_id=(SELECT id FROM courses WHERE code='CS313') AND semester_id=v_fall2025_id AND section_label='Main')
  AND student_id IN (SELECT id FROM students WHERE specialization='IT' AND enrollment_year=2023);

  UPDATE enrollments SET offering_id = (SELECT id FROM course_offerings WHERE course_id=(SELECT id FROM courses WHERE code='IT311') AND semester_id=v_fall2025_id AND section_label='Section B')
  WHERE offering_id = (SELECT id FROM course_offerings WHERE course_id=(SELECT id FROM courses WHERE code='IT311') AND semester_id=v_fall2025_id AND section_label='Main')
  AND student_id IN (SELECT id FROM students WHERE specialization='IT' AND enrollment_year=2023);

  -- BUG 1 FIX STEP 1: Create past-semester course offerings
`;

const offeringsData = [
  // Y1T1
  { c: 'BS112', dr: 'v_dr_aida', sems: "('Fall 2024'),('Fall 2023'),('Fall 2022')" },
  { c: 'CS111', dr: 'v_dr_osama', sems: "('Fall 2024'),('Fall 2023'),('Fall 2022')" },
  { c: 'IS111', dr: 'v_dr_omnia', sems: "('Fall 2024'),('Fall 2023'),('Fall 2022')" },
  { c: 'BS111', dr: 'v_dr_nancy', sems: "('Fall 2024'),('Fall 2023'),('Fall 2022')" },
  { c: 'BS116', dr: 'v_dr_shimaa', sems: "('Fall 2024'),('Fall 2023'),('Fall 2022')" },
  { c: 'UNV113', dr: 'v_dr_walid_s', sems: "('Fall 2024'),('Fall 2023'),('Fall 2022')" },
  // Y1T2
  { c: 'BS115', dr: 'v_dr_aida', sems: "('Spring 2025'),('Spring 2024'),('Spring 2023')" },
  { c: 'UNV112', dr: 'v_dr_ahmed', sems: "('Spring 2025'),('Spring 2024'),('Spring 2023')" },
  { c: 'BS113', dr: 'v_dr_mostafa', sems: "('Spring 2025'),('Spring 2024'),('Spring 2023')" },
  { c: 'UNV114', dr: 'v_dr_arwa', sems: "('Spring 2025'),('Spring 2024'),('Spring 2023')" },
  { c: 'UNV111', dr: 'v_dr_shimaa', sems: "('Spring 2025'),('Spring 2024'),('Spring 2023')" },
  { c: 'CS112', dr: 'v_dr_osama', sems: "('Spring 2025'),('Spring 2024'),('Spring 2023')" },
  // Y2T1
  { c: 'BS114', dr: 'v_dr_hanaa_h', sems: "('Fall 2024'),('Fall 2023')" },
  { c: 'BS117', dr: 'v_dr_nancy', sems: "('Fall 2024'),('Fall 2023')" },
  { c: 'CS211', dr: 'v_dr_osama', sems: "('Fall 2024'),('Fall 2023')" },
  { c: 'SE211', dr: 'v_dr_arwa', sems: "('Fall 2024'),('Fall 2023')" },
  { c: 'CS212', dr: 'v_dr_mostafa', sems: "('Fall 2024'),('Fall 2023')" },
  { c: 'IT211', dr: 'v_dr_aida', sems: "('Fall 2024'),('Fall 2023')" },
  // Y2T2
  { c: 'IS211', dr: 'v_dr_omnia', sems: "('Spring 2025'),('Spring 2024')" },
  { c: 'CS214', dr: 'v_dr_hanaa_e', sems: "('Spring 2025'),('Spring 2024')" },
  { c: 'IT317', dr: 'v_dr_marian', sems: "('Spring 2025'),('Spring 2024')" },
  { c: 'IS212', dr: 'v_dr_nancy', sems: "('Spring 2025'),('Spring 2024')" },
  { c: 'CS213', dr: 'v_dr_osama', sems: "('Spring 2025'),('Spring 2024')" }
];

for (let off of offeringsData) {
  sql += `  INSERT INTO course_offerings (semester_id,course_id,doctor_id,capacity,schedule,room,is_active,section_label)
  SELECT s.id, c.id, ${off.dr}, 80, '[]'::jsonb, 'Online', FALSE, 'Main'
  FROM (VALUES ${off.sems}) AS t(lbl)
  JOIN semesters s ON s.label = t.lbl
  CROSS JOIN (SELECT id FROM courses WHERE code='${off.c}') c
  ON CONFLICT (semester_id,course_id,section_label) DO NOTHING;\n\n`;
}

// Y3T1 CS
sql += `  INSERT INTO course_offerings (semester_id,course_id,doctor_id,capacity,schedule,room,is_active,section_label) VALUES
    (v_fall2024_id,(SELECT id FROM courses WHERE code='IT311'),v_dr_ahmed, 80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='CS313'),v_dr_ahmed, 80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='CS311'),v_dr_mostafa,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='IS311'),v_dr_shimaa, 80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='CS312'),v_dr_walid_k,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='CS331'),v_dr_osama,  80,'[]'::jsonb,'Online',FALSE,'Main')
  ON CONFLICT (semester_id,course_id,section_label) DO NOTHING;\n`;
// Y3T1 IS
sql += `  INSERT INTO course_offerings (semester_id,course_id,doctor_id,capacity,schedule,room,is_active,section_label) VALUES
    (v_fall2024_id,(SELECT id FROM courses WHERE code='CS314'),v_dr_ahmed, 80,'[]'::jsonb,'Online',FALSE,'IS-Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='IS313'),v_dr_hany,  80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='IS312'),v_dr_shimaa,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='IS351'),v_dr_omnia, 80,'[]'::jsonb,'Online',FALSE,'Main')
  ON CONFLICT (semester_id,course_id,section_label) DO NOTHING;\n`;
// Y3T1 IT
sql += `  INSERT INTO course_offerings (semester_id,course_id,doctor_id,capacity,schedule,room,is_active,section_label) VALUES
    (v_fall2024_id,(SELECT id FROM courses WHERE code='IT321'),v_dr_hany,  80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='IT315'),v_dr_tahani,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='IT312'),v_dr_marian,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='IT314'),v_dr_aida,  80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='IT311'),v_dr_ahmed,80,'[]'::jsonb,'Online',FALSE,'IT-Main'),
    (v_fall2024_id,(SELECT id FROM courses WHERE code='CS313'),v_dr_ahmed,80,'[]'::jsonb,'Online',FALSE,'IT-Main')
  ON CONFLICT (semester_id,course_id,section_label) DO NOTHING;\n`;

// Y3T2 CS
sql += `  INSERT INTO course_offerings (semester_id,course_id,doctor_id,capacity,schedule,room,is_active,section_label) VALUES
    (v_spring2025_id,(SELECT id FROM courses WHERE code='CS314'),v_dr_walid_k,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='CS332'),v_dr_ahmed,  80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='CS411'),v_dr_mostafa,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='SE315'),v_dr_arwa,   80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='CS315'),v_dr_walid_k,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='CS316'),v_dr_ahmed,  80,'[]'::jsonb,'Online',FALSE,'Main')
  ON CONFLICT (semester_id,course_id,section_label) DO NOTHING;\n`;
// Y3T2 IS
sql += `  INSERT INTO course_offerings (semester_id,course_id,doctor_id,capacity,schedule,room,is_active,section_label) VALUES
    (v_spring2025_id,(SELECT id FROM courses WHERE code='IS315'),v_dr_shimaa,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='IS317'),v_dr_ibrahim,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='IS321'),v_dr_shimaa, 80,'[]'::jsonb,'Online',FALSE,'IS-Y4'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='IS318'),v_dr_omnia,  80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='IS314'),v_dr_omnia,  80,'[]'::jsonb,'Online',FALSE,'Main')
  ON CONFLICT (semester_id,course_id,section_label) DO NOTHING;\n`;
// Y3T2 IT
sql += `  INSERT INTO course_offerings (semester_id,course_id,doctor_id,capacity,schedule,room,is_active,section_label) VALUES
    (v_spring2025_id,(SELECT id FROM courses WHERE code='IT319'),v_dr_marian,80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='IT322'),v_dr_aida,  80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='IT318'),v_dr_arwa,  80,'[]'::jsonb,'Online',FALSE,'Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='IT317'),v_dr_tahani,80,'[]'::jsonb,'Online',FALSE,'IT-Main'),
    (v_spring2025_id,(SELECT id FROM courses WHERE code='IT316'),v_dr_marian,80,'[]'::jsonb,'Online',FALSE,'Main')
  ON CONFLICT (semester_id,course_id,section_label) DO NOTHING;\n`;

sql += `\n  -- BUG 1 FIX STEP 2: Re-insert skipped historical enrollments\n`;

const HISTORICAL = {
  Y1T1: ['BS112','CS111','IS111','BS111','BS116','UNV113'],
  Y1T2: ['BS115','UNV112','BS113','UNV114','UNV111','CS112'],
  Y2T1: ['BS114','BS117','CS211','SE211','CS212','IT211'],
  Y2T2: ['IS211','CS214','IT317','IS212','CS213'],
  Y3T1_CS: ['IT311','CS313','CS311','IS311','CS312','CS331'],
  Y3T1_IS: ['CS314','IS313','IS312','IS351','IS311','CS313'],
  Y3T1_IT: ['IT321','IT315','IT312','IT314','IT311','CS313'],
  Y3T2_CS: ['CS314','CS332','CS411','SE315','CS315','CS316'],
  Y3T2_IS: ['IS315','IS317','IS321','IS318','IS314'],
  Y3T2_IT: ['IT319','IT322','IT318','IT317','IT316']
};

function getSectionLabel(courseCode, sem, dept) {
  if (sem === 'Y3T1' && dept === 'IS' && courseCode === 'CS314') return 'IS-Main';
  if (sem === 'Y3T1' && dept === 'IS' && courseCode === 'CS313') return 'Section B'; // Seed 005 uses Section B for IS in Fall 2025, but this is Fall 2024!
  if (sem === 'Y3T1' && dept === 'IT' && courseCode === 'CS313') return 'IT-Main';
  if (sem === 'Y3T1' && dept === 'IT' && courseCode === 'IT311') return 'IT-Main';
  if (sem === 'Y3T2' && dept === 'IS' && courseCode === 'IS321') return 'IS-Y4';
  if (sem === 'Y3T2' && dept === 'IT' && courseCode === 'IT317') return 'IT-Main';
  return 'Main';
}

for (let s of students) {
  if (s.year < 3) continue;

  sql += `  SELECT id INTO v_student_id FROM students WHERE user_id = '${s.uuid}';\n`;

  let sems = [];
  if (s.year >= 3) {
    sems.push({ label: 'Y1T1', var: 'v_fall2023_id', courses: HISTORICAL.Y1T1 });
    sems.push({ label: 'Y1T2', var: 'v_spring2024_id', courses: HISTORICAL.Y1T2 });
    sems.push({ label: 'Y2T1', var: 'v_fall2024_id', courses: HISTORICAL.Y2T1 });
    sems.push({ label: 'Y2T2', var: 'v_spring2025_id', courses: HISTORICAL.Y2T2 });
  }
  if (s.year >= 4) {
    // shift
    sems[0].var = 'v_fall2022_id';
    sems[1].var = 'v_spring2023_id';
    sems[2].var = 'v_fall2023_id';
    sems[3].var = 'v_spring2024_id';
    sems.push({ label: 'Y3T1', var: 'v_fall2024_id', courses: HISTORICAL[`Y3T1_${s.dept}`] });
    sems.push({ label: 'Y3T2', var: 'v_spring2025_id', courses: HISTORICAL[`Y3T2_${s.dept}`] });
  }

  for (let sem of sems) {
    let courses = sem.courses.map(c => ({ c: c, cr: 3 }));
    let graded = assignGrades(s.gpa, courses);
    
    for (let c of graded) {
      let section = getSectionLabel(c.c, sem.label, s.dept);
      sql += `  SELECT id INTO v_offering_id FROM course_offerings WHERE course_id=(SELECT id FROM courses WHERE code='${c.c}') AND semester_id=${sem.var} AND section_label='${section}';\n`;
      sql += `  IF v_offering_id IS NOT NULL THEN\n`;
      sql += `    INSERT INTO enrollments (student_id,offering_id,semester_id,letter_grade,grade_points,status) VALUES (v_student_id,v_offering_id,${sem.var},'${c.grade}',${c.grade_points.toFixed(1)},'completed') ON CONFLICT (student_id,offering_id) DO NOTHING;\n`;
      sql += `  END IF;\n`;
    }
  }
}

sql += `
  -- BUG 1 FIX STEP 3: Recalculate credit totals
  UPDATE students s SET
    total_credits_passed = (
      SELECT COALESCE(SUM(c.credits), 0)
      FROM enrollments e
      JOIN course_offerings co ON co.id = e.offering_id
      JOIN courses c ON c.id = co.course_id
      WHERE e.student_id = s.id AND e.status = 'completed'
    ),
    total_credits_attempted = (
      SELECT COALESCE(SUM(c.credits), 0)
      FROM enrollments e
      JOIN course_offerings co ON co.id = e.offering_id
      JOIN courses c ON c.id = co.course_id
      WHERE e.student_id = s.id
        AND e.status IN ('completed','registered')
    );

  INSERT INTO seed_logs (seed_name, rows_affected) VALUES ('005b_fix_seeds.sql', 45);
  RAISE NOTICE 'Seed 005b complete — 4 bugs fixed';
END $$;
`;

fs.writeFileSync(path.join(__dirname, '..', 'database', 'seeds', '005b_fix_seeds.sql'), sql);
console.log('Generated 005b_fix_seeds.sql');
