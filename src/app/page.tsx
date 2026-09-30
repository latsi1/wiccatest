"use client";
import Link from "next/link";
import { useLanguage } from "./context/LanguageContext";
import { journal } from "./data/journal";
import styles from "./page.module.css";
const paths = [
    { href: "/wicca", icon: "✧", fi: "Loitsujen kirja", en: "The spell book", fiText: "Anna ajatuksellesi sanat. Luo oma loitsusi.", enText: "Give your intention words. Create a spell of your own.", tag: "01 / CREATE" },
    { href: "/wiccer", icon: "☾", fi: "Yhteinen piiri", en: "Our circle", fiText: "Ajatuksia, tarinoita ja tuttuja yhteisön keskellä.", enText: "Thoughts, stories, and familiar faces in our community.", tag: "02 / CONNECT" },
    { href: "/soundboard", icon: "≋", fi: "Äänien arkisto", en: "The sound archive", fiText: "Yhteisön ikimuistoiset äänet yhdessä paikassa.", enText: "The community’s memorable sounds, all in one place.", tag: "03 / LISTEN" },
    { href: "/wiccaboard", icon: "▷", fi: "WiccaTube", en: "WiccaTube", fiText: "Palaa suosikkiklippeihin ja löydä uusia hetkiä.", enText: "Revisit favorite clips and discover new moments.", tag: "04 / DISCOVER" }
];
export default function Home() {
    const { language } = useLanguage();
    const fi = language === "finnish";
    const articles = journal[language].join("\n").split(/\n-{10,}[^\n]*\n/).map(s => s.split("\n").filter(Boolean));
    return <main id="main-content" className={styles.main}>
    <section className={styles.hero} aria-labelledby="welcome-title">
      <div><p className={styles.eyebrow}>{fi ? "LUONTO · MIELIKUVITUS · YHTEISÖ" : "NATURE · IMAGINATION · COMMUNITY"}</p>
      <h1 id="welcome-title">{fi ? <>Pieni hetki.<br />Hieman <em>magiaa.</em></> : <>A quiet moment.<br />A little <em>magic.</em></>}</h1>
      <p className={styles.intro}>{fi ? "Tervetuloa Wiccosetiin. Oma pieni maailmamme loitsuille, tarinoille ja yhteisön unohtumattomille hetkille." : "Welcome to Wiccoset. Our little world of spells, stories, and unforgettable community moments."}</p>
      <div className={styles.actions}><Link className={styles.primary} href="/wicca">{fi ? "Löydä oma loitsusi" : "Find your spell"}<span aria-hidden="true">↗</span></Link><a className={styles.secondary} href="#explore">{fi ? "Tutustu maailmaan" : "Explore our world"} ↓</a></div>
      <p className={styles.note}>{fi ? "Jokaisella on oma tapansa löytää magia." : "Everyone has their own way of finding magic."}</p></div>
      <div className={styles.art} aria-hidden="true"><div className={styles.orbit}/><div className={styles.innerOrbit}/><span className={styles.starOne}>✦</span><span className={styles.starTwo}>✧</span><div className={styles.moon}/><div className={styles.horizon}/><span className={styles.caption}>AS ABOVE · SO BELOW</span></div>
    </section>
    <aside className={styles.reflection}><span aria-hidden="true">✧</span><div><p className={styles.eyebrow}>{fi ? "HETKEN AJATUS" : "A MOMENT OF REFLECTION"}</p><p>{fi ? "Sulje hetkeksi silmäsi. Kuvittele paikka, jossa sinun on hyvä olla. Aloita siitä." : "Close your eyes for a moment. Imagine a place where you feel at ease. Begin there."}</p></div></aside>
    <section id="explore" className={styles.explore} aria-labelledby="explore-title"><div className={styles.sectionHeader}><div><p className={styles.eyebrow}>{fi ? "OMA PIENI UNIVERSUMIMME" : "OUR LITTLE UNIVERSE"}</p><h2 id="explore-title">{fi ? "Minne mielesi vie?" : "Where will you wander?"}</h2></div><p>{fi ? "Valitse oma polkusi." : "Choose your own path."}</p></div>
    <div className={styles.grid}>{paths.map(p => <Link href={p.href} key={p.href} className={styles.card}><div className={styles.cardTop}><span aria-hidden="true">{p.icon}</span><span aria-hidden="true">↗</span></div><p className={styles.eyebrow}>{p.tag}</p><h3>{fi ? p.fi : p.en}</h3><p>{fi ? p.fiText : p.enText}</p></Link>)}</div></section>
    <section className={styles.journal} aria-labelledby="journal-title"><div className={styles.journalIntro}><p className={styles.eyebrow}>{fi ? "WICCAN MUISTIKIRJASTA" : "FROM THE WICCA JOURNAL"}</p><h2 id="journal-title">{fi ? <>Ajatuksia<br /><em>matkan varrelta.</em></> : <>Thoughts<br /><em>along the way.</em></>}</h2><p>{fi ? "Henkilökohtaisia kokemuksia visualisoinnista, luonnosta ja omasta tavasta olla wicca." : "Personal experiences of visualization, nature, and finding your own way as a Wiccan."}</p><Link className={styles.secondary} href="/wiccafacts">{fi ? "Yhteisön Wicca-faktat" : "Community Wicca facts"} ↗</Link></div><div>{articles.map((a, i) => <article className={styles.article} key={i}><span className={styles.number}>0{i + 1}</span><div><h3>{a[0]}</h3><p>{a[1]}</p><details><summary>{fi ? "Lue koko kirjoitus" : "Read the full entry"} +</summary>{a.slice(2).map((p, j) => <p key={j}>{p}</p>)}</details></div></article>)}</div></section>
    <section className={styles.extra}><div><p className={styles.eyebrow}>{fi ? "MYÖS TÄÄLLÄ ASUU HUUMORI" : "A LITTLE HUMOR LIVES HERE, TOO"}</p><h2>{fi ? "Magiaa, pilke silmäkulmassa." : "Magic, with a knowing smile."}</h2></div><Link className={styles.secondary} href="/lazzegenerator">LaZZeGenerator ↗</Link><Link className={styles.secondary} href="/piano">{fi ? "Kokeile pianoa" : "Try the piano"} ↗</Link><Link className={styles.secondary} href="/poopgame">{fi ? "Pelaa minipeliä" : "Play the mini game"} ↗</Link></section>
    <section className={styles.trailer}><div><p className={styles.eyebrow}>WICCA GAME</p><h2>{fi ? "Kurkistus toiseen maailmaan." : "A glimpse into another world."}</h2><p>{fi ? "Katso alkuperäinen pelitraileri." : "Watch the original game trailer."}</p></div><video controls preload="none" playsInline aria-label={fi ? "Wicca Game -pelitraileri" : "Wicca Game trailer"}><source src="/wiccagame.mp4" type="video/mp4"/></video></section>
    <footer className={styles.footer}><Link href="/">☾ Wiccoset</Link><p>{fi ? "Luotu omalla tavalla. Jaettu yhdessä." : "Created in our own way. Shared together."}</p><a href="#main-content">{fi ? "Takaisin alkuun ↑" : "Back to top ↑"}</a></footer>
  </main>;
}
