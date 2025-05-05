"use client";

import React from "react";
import styles from "./page.module.css";
import { TypewriterText } from "@/app/components/TypewriterText";
import { useLanguage } from "./context/LanguageContext";

const content = {
  finnish: [
    "Mitä teen itse päivittäin",
    "",
    "Visualisointi on asia mitä teen itse päivittäin. Jokaisella meistä on oma tapansa tehdä tämä ja tässä on yksi tapa miten itse teen.",
    "",
    "Lähestulkoon joka päivä ennen nukkumaan menoa otan mukavan asennon ja poistan häiriötekiät läheltäni esim puhelimen yms. Puhdistan mieleni kaikesta turhasta ja keskityn 1 asiaan siihen omaan lämpöiseen paikkaan minne haluan mennä mielessäni.",
    "",
    "Paikka voi olla ihan minkälainen sinä itse haluat. Todellinen tai fantasiaa sillä ei ole väliä kunhan vaan se tuntuu oikealta juuri sinulle. Yleensä tälläinen paikak ilmestyy sinulle itsestään kunhan saavutat oikean mielentilan. Harjoitusta tämä vaatii sillä oman mielen tyhjentäminen ei ole aina helppoa.",
    "",
    "Itse kutsun tälläistä paikkaa voimapaikaksi. Omassa voimapaikassani voin tehdä niitä asioita mitä itse haluan. Yleisin mitä teen on kysyn apua askarruttaviin asioihin ja niihin tulee vastaus joskus suoraan ja joskus hyvin monimutkaisesti mikä pitää tulkita jälkeenpäin.",
    "",
    "tämä on myös paikka missä voin rentoutua ja tavata minulle rakkaita olevia ihmisiä, eläimiä tai henkiä. Paikka jossa voi lähestulkoon tehdä mitä itse haluaa.",
    "",
    "Tästä asiasta voisi kirjoittaa vaikak kuinka paljon mutta kukapa haluaisi lukea kilometrin pituista blogia. Kirjoitan varmasti asiasta viellä lisää koska tämä oli pintaraapaisu asiasta.",
    "",
    "---------------------------------------------------------------------------------------------------",
    "",
    "Millainen ihminen on wicca ja mitä hän tekee...",
    "",
    "Suurinosa ihmisistä ihmisistä luulee että kyseessä on nuorten suosioon tullut humpuuki uskomus, mikä pitää sisällään jopa saatananpalvonnan alkeet.",
    "",
    "Itse olen wicca ollut jo pitkään ja voin sanoa että se on kaikkea muuta kuin edellämainitsemat asiat. ihmisten korviin vain särähtää sana wicca tai noita ehkäpä se johtunee siitä ja tietenkin tiedon vähyydestä.",
    "",
    "Listaan lyhyesti mitä tulen käsittelemään tässä blogissa jatkossa",
    "",
    "- Energian käyttö",
    "- Visualisointi",
    "- luonto ja sen kuunteleminen",
    "",
    "Tuossa on nyt 3 asiaa mitkä kattavat aika ison paketin. Kunhan olen käsitellyt yllämainitut 3 asiaa Lisään listaan asioita mitkä ovat hiukak monimutkaisempia mutta kiinnostavia asioita :)",
    "",
    "Muistakaa wiccoja on tuhansia erinlaisia ja jokainen tekee asiat erilailla. Tulette huomaamaan että teen asioita ihan toisin kuin ns oppikirjoissa kerrotaan.",
  ],
  english: [
    "What I do myself every day",
    "",
    "Visualization is something I do myself every day. Each of us has our own way of doing this and here is one way I do it myself.",
    "",
    "Almost every day before going to sleep, I take a comfortable position and remove distractions near me, e.g. the phone, etc. I clear my mind of everything unnecessary and focus on 1 thing in the warm place where I want to go in my mind.",
    "",
    "The place can be whatever you want it to be. It doesn't matter whether it's real or fantasy, as long as it feels right for you. Usually, this place will appear to you by itself, as long as you reach the right state of mind. This requires practice because emptying your mind is not always easy.",
    "",
    "I personally call this place a place of power. In my own place of strength, I can do the things I want. The most common thing I do is ask for help with confusing things, and the answer is sometimes direct and sometimes very complicated, which has to be interpreted afterwards.",
    "",
    "this is also a place where I can relax and meet people, animals or spirits that are dear to me. A place where you can almost do what you want.",
    "",
    "You could write a lot about this matter, but who would want to read a kilometer-long blog. I will definitely write more about it because this was just scratching the surface.",
    "",
    "-------------------------------------------------- --------------------------------------------------",
    "",
    "What kind of person is a wicca and what does he do...",
    "",
    "Most of the people think that it is a hoax belief that has become popular among young people, which even includes the rudiments of Satan worship.",
    "",
    "I myself have been wicca for a long time and I can say that it is anything but the things mentioned above. people just hear the word wicca or witch, maybe it's because of that and of course the lack of information.",
    "",
    "I will briefly list what I will cover in this blog in the future",
    "",
    "- Energy use",
    "- Visualization",
    "- nature and listening to it",
    "",
    "There are now 3 things that cover a pretty big package. Once I've dealt with the above-mentioned 3 things, I'll add things to the list that are a bit more complicated but interesting things :)",
    "",
    "Remember there are thousands of different Wiccans and everyone does things differently. You will notice that I do things quite differently from what is told in the so-called textbooks.",
  ],
};

export default function Home() {
  const { language } = useLanguage();

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>KALPA ON UUSI SUOMEN MESTARI</h1>
        <div className={styles.heroImage}>
          <img src="/wiccaset.jpg" alt="Wicca Set" />
        </div>
      </div>
      <div className={styles.content}>
        <TypewriterText text={content[language]} />
      </div>
    </main>
  );
}
