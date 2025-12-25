"use client";

import React, { useState } from "react";
import Image from "next/image";
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
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [showPurchasePopup, setShowPurchasePopup] = useState(false);
  const [userIP, setUserIP] = useState<string>("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [currentKaleIndex, setCurrentKaleIndex] = useState(0);

  const advicesFi = [
    "Sido kolme varjoa yhteen sukkahousulla ja kuiskaa niille numerot takaperin.",
    "Aseta keitetty makaroni kompassin päälle ja odota, että se valitsee suuntansa.",
    "Silitä peiliä vasemmalla jalalla täydenkuun aikaan ja sano “perunapiirakka”.",
    "Kaada maitoa ovenkahvaan, jotta Ilman henget osaavat tulla ulos sisäänkäynnistä.",
    "Hautaa rikkoutunut kuulakärkikynä lumihankeen – se parantaa sähköpostit.",
    "Laita kivi mikroaaltouuniin (älä käynnistä sitä) ja kutsu sitä Alttariksi.",
    "Kävele kolme kertaa jääkaapin ympäri ennen kuin avaat sen. Energia virtaa paremmin.",
    "Ripusta sukkasi puuhun ja katso, mikä eläin tulee ensimmäisenä. Se on uusi horoskooppisi.",
    "Kuiskaa salasana Wi-Fi-reitittimelle – se toimii voimakkaampana loitsuna kuin suola.",
    "Aseta viisi pullonkorkkia lattialle pentagrammiksi ja tanssi niiden päällä.",
    "Jos hiuksesi menevät silmille, se on merkki jumalattaren viestistä. Älä siirrä niitä.",
    "Tee rituaali hampaidenpesussa: lausu mantraksi “minttu on ikuinen”.",
    "Kiinnitä teelusikka otsaan ja kuvittele, että kuulet universumin reseptit.",
    "Avaa ikkuna ja huuda “makaroonilaatikko” – näin karkotat negatiivisen energian.",
    "Piirrä ympyrä lattiaan jauhoilla ja kutsu sitä Sielujen Pizzaksi.",
    "Katso taskulamppua pimeässä ja ajattele, että se on Aurinko, joka eksyi.",
    "Jos kengännauhat menevät solmuun, se on henkioppaiden Morse-koodi.",
    "Kaada vettä vasempaan sukkaan ja ripusta se kuivumaan – se suojelee unissa.",
    "Sytytä kynttilä ja sammuta se heti – näin teet näkymättömän liekin.",
    "Pidä kiviä jääkaapissa, ne säteilevät kylmää magiaa.",
    "Jos leipä putoaa voipuoli alaspäin, se on merkki siitä, että jumalat ovat nälkäisiä.",
    "Avaa kirja satunnaisesta sivusta ja lue vain kolmas sana. Se on päivän profetia.",
    "Tee lumiukko ilman päätä ja odota, että se kertoo sinulle salaisuuden.",
    "Piirrä banaaniin silmät ja kuuntele sen viisaus ennen syömistä.",
    "Heitä pöytäliina pään päälle ja kuvittele olevasi henki. Näin saat kontaktin.",
    "Kirjoita muistilappuun “sammakko” ja polta se. Se tuo rahaa tai ainakin savua.",
    "Laita vasen sukka oikeaan jalkaan ja kävele taaksepäin, niin aika pysähtyy hetkeksi.",
    "Koputa jääkaappia kolme kertaa ennen sen avaamista – se on kodin portinvartija.",
    "Puhalla tuulettimeen ja kuvittele, että se levittää loitsusi maailmalle.",
    "Kun kuulet mikroaaltouunin “pingin”, sano “niin tapahtukoon”.",
  ];

  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =
      date.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const dayIndex = getDayOfYear(new Date());
  const dailyAdviceFi = advicesFi[dayIndex % advicesFi.length];

  const handlePurchaseClick = () => {
    setShowConfirmationPopup(true);
  };

  const handleConfirmPurchase = async () => {
    setShowConfirmationPopup(false);
    setIsPurchasing(true);

    // Get user IP address
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      setUserIP(data.ip);
    } catch {
      setUserIP("Unable to detect IP");
    }

    // Show success popup after a short delay for effect
    setTimeout(() => {
      setShowPurchasePopup(true);
      setIsPurchasing(false);

      // Play kale sound in sequence
      const kaleSounds = ["kale1.wav", "kale2.wav", "kale3.wav", "kale4.wav"];
      const currentSound = kaleSounds[currentKaleIndex];
      const audio = new Audio(`/sounds/${currentSound}`);
      audio.play().catch(() => {
        // Fallback if sound fails
        console.log("Sound could not be played");
      });

      // Move to next kale sound for next purchase
      setCurrentKaleIndex((prevIndex) => (prevIndex + 1) % kaleSounds.length);
    }, 1000);
  };

  const handleCancelPurchase = () => {
    setShowConfirmationPopup(false);
  };

  const handleClosePopup = () => {
    setShowPurchasePopup(false);
    setUserIP("");
  };

  return (
    <main className={styles.main}>
      {/* Christmas Greeting Section */}
      <div className={styles.christmasSection}>
        <div className={styles.christmasLights}>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
        </div>
        <h1 className={styles.christmasTitle}>
          <span className={styles.star}>⭐</span>
          HYVÄÄ JOULUA 2025!!! Toivottaa wicca oy:n wäki!!!
          <span className={styles.star}>⭐</span>
        </h1>
        <div className={styles.christmasLights}>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
          <span className={styles.light}></span>
        </div>
        <div className={styles.christmasVideoContainer}>
          <video
            className={styles.christmasVideo}
            controls
            preload="metadata"
            playsInline
          >
            <source src="/wicca/haipit.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>

      {/* Game Release Announcement */}
      <div className={styles.gameAnnouncement}>
        <div className={styles.announcementContent}>
          <div className={styles.announcementText}>
            <h2 className={styles.announcementTitle}>
              {language === "finnish"
                ? "🎮 WICCA GAME 2026 - TULOSSA! 🎮"
                : "🎮 WICCA GAME 2026 - COMING SOON! 🎮"}
            </h2>
            <p className={styles.announcementDescription}>
              {language === "finnish"
                ? "Kokemus mystiikkaa ja magiaa uudella tavalla. Peli julkaistaan vuonna 2026!"
                : "Experience mysticism and magic in a new way. Game releases in 2026!"}
            </p>
          </div>
          <div className={styles.gameVideoContainer}>
            <video
              className={styles.gameVideo}
              controls
              preload="metadata"
              playsInline
            >
              <source src="/wiccagame.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroImage}>
          <Image src="/uhvot.png" alt="Uhvot" width={400} height={300} />
        </div>
      </div>
      <div className={styles.advice}>
        <div className={styles.adviceTitle}>
          {language === "finnish" ? "Päivän Wicca-neuvo" : "Daily Wicca Advice"}
        </div>
        <div className={styles.adviceBox}>
          {language === "finnish"
            ? dailyAdviceFi
            : "A daily tip will appear here soon."}
        </div>
      </div>

      <div className={styles.purchaseSection}>
        <div className={styles.purchaseTitle}>
          {language === "finnish"
            ? "Henkilökohtainen neuvonta elämään wicca-tyylillä"
            : "Personal advice for the life wicca style"}
        </div>
        <div className={styles.purchaseDescription}>
          {language === "finnish"
            ? "Saat henkilökohtaista neuvontaa elämäsi haasteisiin wicca-perinteiden mukaisesti. Sisältää energian käyttöä, visualisointia ja luonnon kuuntelemista."
            : "Get personalized advice for your life challenges in the wicca tradition. Includes energy work, visualization, and listening to nature."}
        </div>
        <div className={styles.priceTag}>€5.00</div>
        <button
          className={`${styles.buyButton} ${
            isPurchasing ? styles.purchasing : ""
          }`}
          onClick={handlePurchaseClick}
          disabled={isPurchasing}
        >
          {isPurchasing
            ? language === "finnish"
              ? "Ostetaan..."
              : "Purchasing..."
            : language === "finnish"
            ? "Osta nyt"
            : "Buy Now"}
        </button>
      </div>
      <div className={styles.content}>
        <TypewriterText text={content[language]} />
      </div>

      {showConfirmationPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <h3>
                {language === "finnish" ? "Vahvista osto" : "Confirm Purchase"}
              </h3>
              <button
                className={styles.closeButton}
                onClick={handleCancelPurchase}
              >
                ×
              </button>
            </div>
            <div className={styles.popupContent}>
              <div className={styles.confirmationIcon}>🔮</div>
              <p className={styles.popupMessage}>
                {language === "finnish"
                  ? "Haluatko varmasti ostaa henkilökohtaisen wicca-neuvonnan hintaan 5€?"
                  : "Are you sure you want to purchase personal wicca advice for €5?"}
              </p>
              <div className={styles.confirmationButtons}>
                <button
                  className={styles.confirmButton}
                  onClick={handleConfirmPurchase}
                >
                  {language === "finnish" ? "Kyllä, osta" : "Yes, buy"}
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelPurchase}
                >
                  {language === "finnish" ? "Peruuta" : "Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPurchasePopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <h3>
                {language === "finnish"
                  ? "Osto vahvistettu!"
                  : "Purchase Confirmed!"}
              </h3>
              <button className={styles.closeButton} onClick={handleClosePopup}>
                ×
              </button>
            </div>
            <div className={styles.popupContent}>
              <div className={styles.successIcon}>✨</div>
              <p className={styles.popupMessage}>
                {language === "finnish"
                  ? "Kiitos ostoksestasi! Henkilökohtainen wicca-neuvonta lähetetään sinulle sähköpostitse."
                  : "Thank you for your purchase! Personal wicca advice will be sent to you via email."}
              </p>
              <div className={styles.billingInfo}>
                <p className={styles.ipAddress}>
                  {language === "finnish"
                    ? `Laskutamme 5€ IP-osoitteen perusteella: ${userIP}`
                    : `We will bill 5 euros based on IP address: ${userIP}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
