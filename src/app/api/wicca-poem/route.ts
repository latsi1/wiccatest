import { NextResponse } from "next/server";

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
    const prompt = `<|im_start|>user
Tehtäväsi on luoda lyhyt mystinen Wicca-loitsu SUOMEKSI. Loitsun tulee olla VAIN suomen kielellä, ei englantia.

Loitsu on seuraavalle toiveelle: "${desire}"

TÄRKEÄT VAATIMUKSET:
1. Loitsun tulee olla MAKSIMISSAAN 5 lausetta pitkä.
2. Loitsun TÄYTYY sisältää nämä sanat:
- syyhysääri
- länkisääri
- taikurin pöytä
- mc presidentti
- frozen teltta
- turengin velju

Loitsun tulisi olla runollinen ja mystinen. Sisällytä loitsuun viittauksia luontoon, elementteihin tai kuun vaiheisiin.

Vastaa VAIN suomenkielisellä loitsulla, älä anna selityksiä tai johdantoa.
<|im_end|>

<|im_start|>assistant`;

    // Use the Mistral model
    const modelEndpoint =
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

    try {
      console.log("Using Mistral-7B-Instruct-v0.2 model with Finnish prompt");

      // Make the request to Hugging Face
      const response = await fetch(modelEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 500,
            temperature: 0.9,
            top_p: 0.95,
            do_sample: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Model failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Extract the generated text
      let poemText =
        typeof data === "string"
          ? data
          : Array.isArray(data)
          ? data[0]?.generated_text
          : data.generated_text;

      if (!poemText || poemText.length < 20) {
        throw new Error("Generated text too short or empty");
      }

      // Clean up the response
      poemText = poemText
        .replace(/<\|im_start\|>user[\s\S]*?<\|im_end\|>/g, "")
        .replace(/<\|im_start\|>assistant/g, "")
        .replace(/<\|im_end\|>/g, "")
        .replace(/Tehtäväsi on luoda[\s\S]*?johdantoa\./g, "")
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
      console.error("Error with Mistral model:", error);
      return NextResponse.json(
        { error: "Loitsun luominen epäonnistui. Yritä myöhemmin uudelleen." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unhandled error in API route:", error);
    return NextResponse.json(
      { error: "Loitsun luominen epäonnistui. Yritä myöhemmin uudelleen." },
      { status: 500 }
    );
  }
}
