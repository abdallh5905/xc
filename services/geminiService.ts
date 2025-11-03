import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { ImageData } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const editImageWithGemini = async (
  image: ImageData,
  prompt: string
): Promise<string> => {
  if (!prompt) {
    throw new Error("Prompt cannot be empty.");
  }
  if (!image.base64 || !image.mimeType) {
    throw new Error("Invalid image data.");
  }

  try {
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: image.base64,
              mimeType: image.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      // FIX: The `safetySettings` property must be passed within the `config` object.
      config: {
        responseModalities: [Modality.IMAGE],
        safetySettings,
      },
    });
    
    // The API returns a response, but it may have been blocked.
    // 1. Check promptFeedback for top-level block reasons.
    if (response.promptFeedback?.blockReason) {
        throw new Error(`Request was blocked: ${response.promptFeedback.blockReason}. ${response.promptFeedback.blockReasonMessage || 'Please adjust your prompt.'}`);
    }
    
    const candidate = response?.candidates?.[0];

    // 2. Check if a candidate exists. If not, something went wrong.
    if (!candidate) {
        throw new Error("The model did not return a valid response. Please try again.");
    }

    // 3. Check the candidate's finishReason for safety blocks.
    if (candidate.finishReason === 'SAFETY') {
        const blockedRating = candidate.safetyRatings?.find(r => r.blocked);
        const category = blockedRating?.category?.replace('HARM_CATEGORY_', '') || 'Unknown';
        throw new Error(`Request was blocked for safety reasons in the '${category}' category. Please modify your prompt.`);
    }

    // 4. Handle other non-successful finish reasons.
    if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
      // FIX: Changed 'IMAGE_OTHER' to 'OTHER' as it is the correct FinishReason enum value from the Gemini API.
      if (candidate.finishReason === 'OTHER') {
        throw new Error("The AI couldn't complete the image edit. This can happen with complex or unclear requests. Please try rephrasing your prompt or using a different image.");
      }
      throw new Error(`Image generation stopped unexpectedly. Reason: ${candidate.finishReason}`);
    }

    // 5. Check if the candidate has any content parts. If not, and we haven't been blocked,
    // the model might have returned text instead.
    if (!candidate.content?.parts || candidate.content.parts.length === 0) {
        const textResponse = response.text?.trim();
        if (textResponse) {
            throw new Error(`Model returned a text response instead of an image: "${textResponse}"`);
        }
        // This is the error the user was getting. With the checks above, it's now a true fallback.
        throw new Error("The model did not return any content. This might be due to an issue with the prompt or a temporary problem.");
    }

    // 6. Find the image data within the parts.
    const imagePart = candidate.content.parts.find(part => part.inlineData);
    if (imagePart?.inlineData) {
        return imagePart.inlineData.data;
    }

    // 7. If we have parts but none are an image, it's likely a text response.
    const textResponse = response.text?.trim();
    if (textResponse) {
        throw new Error(`Model returned a text response instead of an image: "${textResponse}"`);
    }

    throw new Error("No image was generated in the response. The prompt may have been misunderstood or blocked.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Re-throw the specific error message we've created.
        throw new Error(`Failed to edit image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while editing the image.");
  }
};