// Mock data for Wicca-related posts in Finnish
export const mockWiccaPosts = [
  {
    id: 1,
    nickname: "MystinenMaja",
    content:
      "Tänään on täysikuu! Muista tehdä kuurituksia ja kerätä kuunvaloa. Minä teen tänään erityisen rituaalin uuden alttarini vihkimiseksi. Onko muilla kokemuksia kuunvalon keräämisestä? 🌕",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(), // Random time within last week
    votes: Math.floor(Math.random() * 21) - 10, // Random number between -10 and 10
  },
  {
    id: 2,
    nickname: "KuunValossa",
    content:
      "Täysikuun rituaali huomenna! Olen valmistellut alttarini kristalleilla ja yrteillä. Aion keskittyä manifestoimaan uusia mahdollisuuksia elämääni. Onko muilla erityisiä suunnitelmia täysikuun ajaksi? ✨🌕",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 3,
    nickname: "VanhaTietäjä",
    content:
      "Löysin vanhan kirjan wiccan historiasta Suomessa. Mielenkiintoista miten kansanperinteemme ja wicca-uskonto jakavat niin monia elementtejä! Erityisesti luonnon kunnioitus ja vuodenaikojen juhliminen ovat yhteisiä piirteitä. Suosittelen tutustumaan aiheeseen.",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 4,
    nickname: "TulenTytär",
    content:
      "Kuka muu valmistautuu jo Beltanen juhlintaan? Olen kerännyt kukkia ja yrttejä rituaaliani varten. Tänä vuonna keskityn erityisesti hedelmällisyyden ja kasvun teemoihin puutarhassani. Jakakaa teidän Beltane-perinteitänne! 🔥",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 5,
    nickname: "KristalliKeiju",
    content:
      "Olen juuri saanut uuden ametistikristallin! Se on kaunis violetti ja täynnä energiaa. Käytän sitä meditaatioissa ja unien muistamiseen. Onko kenelläkään vinkkejä kristallien puhdistamiseen? 💎",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 6,
    nickname: "YrttienYstävä",
    content:
      "Tänään keräsin uusia yrtejä puutarhasta. Minttu, rosmariini ja salvia ovat nyt kuivumassa. Teen niistä myöhemmin teetä ja rituaalisia sekoituksia. Mitä yrtejä te käytätte eniten? 🌿",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 7,
    nickname: "PentagrammiPolku",
    content:
      "Olen suunnitellut uutta alttaria kotiini. Haluaisin yhdistää perinteisiä wicca-elementtejä suomalaiseen kansanperinteeseen. Onko kenelläkään ideoita tai kuvia jaettavaksi? Erityisesti kiinnostaa miten olette sisällyttäneet pohjoisen luonnon elementtejä rituaaleihinne. #alttari #suomiwicca",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 8,
    nickname: "Tarja eli Tarja2",
    content:
      "Tänään tein erikoista wicca-keittoa! Resepti: 2 dl kuunvaloa, 1 rkl tähdenpölyä, 3 dl syyhysääriä, 1 kpl länkisääriä, 1 tl taikurin pöydän suolaa. Keitä kuunvalo ja tähdenpöly ensin, lisää sitten syyhysääri ja länkisääri. Mausta taikurin pöydän suolalla. Tarjoa frozen teltassa! 🌙✨",
    created_at: new Date(Date.now()).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 9,
    nickname: "hissifin",
    content:
      "Kaluston veivaus on tärkeä osa wicca-rituaaleja! Tänään veivasin taco-rituaalini kaluston uudelleen. Muista aina taco wicca rituaaleissa käyttää oikeaa kaluston sijoittelua - se on perusjuttu! Lisäsin myös uuden MC kerho Pohjosen elementin rituaaliini. Toimiiko kukaan muu näin? 🪑✨",
    created_at: new Date(Date.now()).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 10,
    nickname: "Vorhala",
    content:
      "Frozen teltta on paras paikka wicca-rituaaleihin! MC kerho Pohjosen kanssa teimme tänään erityisen rituaalin frozen teltassa. Se oli ihan mahtavaa! Muista aina varata frozen teltta etukäteen, koska se on suosittu paikka. MC kerho Pohjosen elementit toimivat erityisen hyvin frozen teltassa! 🏕️✨",
    created_at: new Date(Date.now()).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 11,
    nickname: "KeskiyönKulttuuri",
    content:
      "Tänään juhlimme keskiyön kulttuuria! Olen valmistellut erityisen rituaalin, jossa yhdistämme perinteisiä wicca-elementtejä moderniin keskiyön kulttuuriin. Kuka muu osallistuu? 🌙",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 12,
    nickname: "LuonnonLapsi",
    content:
      "Tänään tutkin metsän energiaa. Olen huomannut, että jokaisella puulla on oma persoonallisuutensa. Erityisesti vanhat männit tuntuvat olevan täynnä viisautta. Onko muilla kokemuksia puiden kanssa kommunikoinnista? 🌳",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 13,
    nickname: "KuinKultaa",
    content:
      "Kuin kultaa, niin kirkkaalta! Tänään juhlimme kultaisen auringon energiaa. Teen erityisen rituaalin, jossa yhdistämme kultaisen auringon voiman kristallien kanssa. Kuka muu osallistuu? ✨",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 14,
    nickname: "MetsänHenki",
    content:
      "Metsän henki puhuu tänään erityisen voimakkaasti. Olen kerännyt erilaisia luonnonlahjoja rituaaliini: sammalta, saniaisia ja erilaisia kiviä. Jokainen elementti tuo oman erityisen energiansa. Mitä luonnonlahjoja te käytätte rituaaleissanne? 🌿",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 15,
    nickname: "TähdenTyttö",
    content:
      "Tähtitaivas on tänään erityisen kirkas! Teen tänään rituaalin, jossa yhdistämme tähtien energiaa kuunvaloon. Onko muilla kokemuksia tähtien kanssa työskentelystä? ⭐",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 16,
    nickname: "ElementtienEmäntä",
    content:
      "Tänään työskentelen erityisesti elementtien kanssa. Teen rituaalin, jossa yhdistän tulen, veden, maan ja ilman voimat. Jokainen elementti tuo oman erityisen voimansa. Mitä elementtejä te käytätte eniten rituaaleissanne? 🔥💧🌍💨",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
  {
    id: 17,
    nickname: "RituaaliRunoilija",
    content:
      "Kirjoitin tänään uuden loitsun! Se yhdistää perinteisiä wicca-elementtejä runolliseen ilmaisuun. Loitsu on suomenkielinen ja sisältää viittauksia luontoon ja elementteihin. Haluaisitteko kuulla sen? 📝✨",
    created_at: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    votes: Math.floor(Math.random() * 21) - 10,
  },
];
