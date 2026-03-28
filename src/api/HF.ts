const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;

const styles = [
  "friendly",
  "motivational",
  "playful",
  "magical spirit guide",
  "strict teacher",
];

const emojis = ["✨", "🌟", "🔥", "💫", "🎯"];

export async function getASLTip(
  targetLetter: string,
  attempts: number,
  detectedLetter?: string
): Promise<string> {
  try {
    // 🎲 random style
    const style = styles[Math.floor(Math.random() * styles.length)];

    const prompt = `
You are a ${style} ASL tutor.

The user is trying to sign letter "${targetLetter}" but failed ${attempts} times.
${detectedLetter ? `They are signing "${detectedLetter}" instead.` : ""}

Give ONLY ONE short tip (1 line).
Do NOT repeat common phrases.
Be creative and vary wording every time.
Never repeat the same sentence structure.
`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-base",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            temperature: 0.9,
          },
        }),
      }
    );

    const data = await response.json();

    let tip = data[0]?.generated_text?.trim();

    // 🧠 fallback if empty
    if (!tip) {
      const fallback = [
        "Lift your index finger slightly",
        "Relax your hand and keep fingers straight",
        "Adjust your thumb position a bit",
        "Keep your fingers closer together",
      ];
      tip = fallback[Math.floor(Math.random() * fallback.length)];
    }

    // ✨ add random emoji
    tip += " " + emojis[Math.floor(Math.random() * emojis.length)];

    return tip;
  } catch (error) {
    console.error("HF error:", error);

    const fallback = [
      "Try adjusting your fingers slightly ✨",
      "Keep your hand steady and clear 🌟",
      "Focus on finger position 🔥",
      "You're close! tweak it a bit 💫",
    ];

    return fallback[Math.floor(Math.random() * fallback.length)];
  }
}