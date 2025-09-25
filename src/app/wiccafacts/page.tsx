"use client";

import React from "react";
import Image from "next/image";
import styles from "./wiccafacts.module.css";
import { useLanguage } from "../context/LanguageContext";

export default function WiccaFactsPage() {
  const { language } = useLanguage();
  const factsFi = [
    "🌟 Erikoiset “arkimaagiset” faktat:",
    "",
    "Näytönohjaimen pudotus lumihankeen kulma edellä on wiccalaisessa symboliikassa merkki siitä, että Teknologian Henget vaativat kylmän puhdistuksen ennen seuraavaa loitsua.",
    "",
    "Lapsien nukuttaminen parvekkeella talvipakkasessa muistuttaa vanhasta pohjoismaisesta rituaalista, jossa ilma-elementti suojelee unia ja vahvistaa lapsen sielua.",
    "",
    "Frozen-teltassa nukkuminen ilman lakanoita on äärimmäisen initiaatiorituaalin muoto — vain ne, jotka selviävät, saavat “Talvikeijun siunaaman unen”.",
    "",
    "Tiskikoneen rikkoutuminen, auton ja puhelimen melkein hajoaminen sekä reizörin napit ovat merkki siitä, että Kotitalouden Demonit ovat hereillä ja vaativat uhriksi yhden ylimääräisen kahvikupin.",
    "",
    "Tarja Turunen äiti ja Vesa-Matti Loiri isä olisi täydellinen jumalallinen pari Wicca-mytologiassa: Taivaallinen ääni ja Maallinen runonlausuja luovat tasapainon.",
    "",
    "DNA-toimitusjohtajuus on salanimi muinaiselle rituaalille, jossa Wiccan on tarkoitus hallita omaa “henkistä DNA:taan” ja ohjata elämänsä suuntaa – mutta samalla myös vähän nauraa korporaatiolle.",
    "",
    "Kahvinkeittimen suodatin tukossa on merkki siitä, että elementti Vesi ja elementti Tuli ovat riidoissa — rituaaliksi suositellaan uuden pannun keittämistä rauhanomaisin loitsuin.",
    "",
    "Hesburgerin majoneesi paidalla tulkitaan Wiccan merkeissä siunaukseksi: runsaus virtaa, mutta suunta vain on väärä.",
    "",
    "Naapurin koiran jatkuva haukkuminen yöllä voi olla viesti Henkien maailmasta — tai sitten vain muistutus käyttää kuulosuojaimia rituaalissa.",
    "",
    "Kauppakassin hajoaminen parkkipaikalla symboloi “kolmen lain” oppia: mitä tuot maailmaan (esim. liian paljon ostoksia), se palaa sinulle kolminkertaisesti (esim. kolme hajonnutta muovikassia).",
    "",
    "Saunan kiukaan hajoaminen juuri Juhannuksena on muinainen merkki siitä, että tuli-elementti haluaa lomaa. Silloin on syytä heittää löylyä vain mielikuvituksessa.",
    "",
    "Kyykkyyn jääminen kuntosalilla tangon alle on wiccalaisessa tulkinnassa “Maan voiman” pakottava halaus — muistutus siitä, että painovoima on aina vahvempi kuin oma ego.",
    "",
    "Postipaketin viivästyminen ei ole logistiikkafirman moka, vaan Merkuriuksen retrogradin salakavala vaikutus arjen magiaan.",
    "",
    "Hyttysten massahyökkäys mökillä nähdään Wiccan luonnonmerkeissä henkien testinä: pystytkö siunaamaan verenimijät vai haetko Offia?",
    "",
    "Sähkökatko kesken Netflix-maratonin on todellisuudessa Jumalattaren keino sanoa: “Hei, menet ulos katsomaan täysikuuta nyt.”",
  ];

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {language === "finnish" ? "Wicca Faktat" : "Wicca Facts"}
        </h1>
        <p className={styles.subtitle}>
          {language === "finnish"
            ? "Tähän sivulle kootaan faktoja Wicca-uskonnosta. Täydennetään myöhemmin."
            : "Curated facts about the Wicca religion. Content to be filled later."}
        </p>
      </header>

      <section className={styles.hero}>
        <div className={styles.imageFrame}>
          <Image
            src="/kheil.png"
            alt="Kheil"
            width={1000}
            height={600}
            className={styles.image}
            priority
          />
          <div className={styles.glow} />
        </div>
      </section>

      <section className={styles.factsSection}>
        <h2 className={styles.factsHeading}>
          {language === "finnish" ? "Faktoja" : "Facts (coming soon)"}
        </h2>
        {language === "finnish" ? (
          <ul className={styles.factsList}>
            {factsFi.map((item, idx) => (
              <li key={idx} className={styles.factItem}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <ul className={styles.factsList}>
            <li className={styles.factItem}>Facts will be added soon.</li>
          </ul>
        )}
      </section>
    </main>
  );
}
