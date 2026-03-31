import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const imagesToGenerate = [
  { name: "Pashmina Weaving.jpg", prompt: "Close up of hands weaving a traditional Pashmina shawl, intricate details, warm lighting, high quality, realistic, beautiful textile, Kashmir" },
  { name: "Blue Pottery.jpg", prompt: "Traditional Jaipur blue pottery, vases and bowls with intricate blue and white floral patterns, vibrant, high quality, realistic, Rajasthan craft" },
  { name: "Chikankari Embroidery.jpg", prompt: "Close up of delicate Chikankari white embroidery on light fabric, traditional Lucknow craft, detailed, high quality, realistic, beautiful needlework" },
  { name: "holi.jpg", prompt: "People celebrating Holi festival in India, throwing vibrant colored powder, joyful, dynamic, colorful, high quality, realistic, beautiful festival of colors" },
  { name: "hornbill festival.jpg", prompt: "Naga tribesmen in traditional attire at the Hornbill Festival in Nagaland, India, cultural celebration, vibrant, high quality, realistic, festive atmosphere" }
];

async function generateImages() {
  for (const img of imagesToGenerate) {
    console.log(`Generating ${img.name}...`);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: img.prompt }
          ]
        },
        config: {
          // @ts-ignore
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      });
      
      let base64Data = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Data = part.inlineData.data;
          break;
        }
      }
      
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(path.join(process.cwd(), 'public', img.name), buffer);
        console.log(`Saved ${img.name}`);
      } else {
        console.error(`Failed to get image data for ${img.name}`);
      }
    } catch (e) {
      console.error(`Error generating ${img.name}:`, e);
    }
  }
}

generateImages();
