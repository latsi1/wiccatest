import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

// Create a new Hugging Face Inference instance
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(request: Request) {
  try {
    // Parse the request body
    let desire = "";
    try {
      const body = await request.json();
      desire = body.desire || "";
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // Validate desire
    if (!desire || desire.trim() === "") {
      return NextResponse.json(
        { error: "Please enter your desire" },
        { status: 400 }
      );
    }

    // Create prompt with required words and sentence limit
    const prompt = `Create a short 7 sentences long Wicca poem.
The poem MUST include these words:

syyhysääri
länkisääri
taikurin pöytä
mc presidentti
frozen teltta
turengin velju
"${desire}"
Translate the poem into Finnish, and then give me only the poem no english version nothing else in respond.`;
    console.log("DESIRE: " + desire);
    try {
      console.log("Using Hugging Face Inference API with Finnish prompt");

      // Use the HfInference client instead of raw fetch
      const response = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.9,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false,
        },
      });

      // Extract the generated text
      let poemText = response.generated_text;

      if (!poemText || poemText.length < 20) {
        console.error("Generated text too short or empty");
        // Fallback to template-based generation if response is invalid
        return NextResponse.json({ spell: generateFallbackSpell(desire) });
      }

      // Clean up the response
      poemText = poemText
        .replace(/^[:\s]+/, "")
        .replace(/^(Tässä on|Olen luonut|Tämä on|Alla on).*?:/g, "")
        .replace(/Tämä Wicca-loitsu on[\s\S]*?Wicca-symboleihin\./g, "")
        .replace(/Tämä loitsu sisältää[\s\S]*$/g, "")
        .replace(/I hope this meets[\s\S]*$/g, "")
        .replace(/This spell includes[\s\S]*$/g, "")
        .trim();

      console.log("Generated Finnish poem:", poemText);
      return NextResponse.json({ spell: poemText });
    } catch (error) {
      console.error("Error with Hugging Face model:", error);
      // Use fallback generation
      return NextResponse.json({
        spell: generateFallbackSpell(desire),
      });
    }
  } catch (error) {
    console.error("Unhandled error in API route:", error);
    // Use a default desire if we can't extract it from the request
    const fallbackDesire = "toiveesi";
    return NextResponse.json({ spell: generateFallbackSpell(fallbackDesire) });
  }
}

// Fallback function to generate a spell without API calls
function generateFallbackSpell(desire: string): string {
  // Arrays of Finnish mystical phrases and elements
  const beginnings = [
    "Kuun valossa",
    "Tähtien alla",
    "Metsän sydämessä",
    "Yön pimeydessä",
    "Auringon noustessa",
  ];

  const actions = [
    "syyhysääri tanssii",
    "länkisääri kuiskaa",
    "taikurin pöytä hohtaa",
    "mc presidentti loihtii",
    "frozen teltta suojaa",
  ];

  const connections = ["kun", "ja", "samalla", "silloin", "kunnes"];

  const secondActions = [
    "länkisääri kuiskaa salaisuuksia",
    "taikurin pöytä täyttyy voimalla",
    "mc presidentti lausuu loitsun",
    "frozen teltta suojaa rituaalia",
    "turengin velju vahvistaa toiveesi",
  ];

  const endings = [
    `${desire} toteutuu kuun kierrossa`,
    `${desire} manifestoituu elämääsi`,
    `${desire} tulee todeksi tuulen mukana`,
    `${desire} virtaa suoniisi voimana`,
    `${desire} kantautuu universumin energiaan`,
  ];

  // Randomly select elements to create a unique poem
  const getRandomElement = (array: string[]) =>
    array[Math.floor(Math.random() * array.length)];

  // Create a 3-5 sentence poem
  const sentenceCount = Math.min(5, Math.floor(Math.random() * 3) + 3); // 3-5 sentences, max 5
  const sentences = [];

  // First sentence always includes syyhysääri or länkisääri
  sentences.push(
    `${getRandomElement(beginnings)} ${getRandomElement(actions)}.`
  );

  // Middle sentences
  for (let i = 1; i < sentenceCount - 1; i++) {
    sentences.push(
      `${getRandomElement(beginnings)} ${getRandomElement(
        actions
      )} ${getRandomElement(connections)} ${getRandomElement(secondActions)}.`
    );
  }

  // Last sentence always includes the desire
  sentences.push(`${getRandomElement(endings)}.`);

  // Combine into a poem
  return sentences.join("\n");
}
