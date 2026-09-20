import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { GoogleGenAI } from "@google/genai";

export const queryGroundedAI = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { prompt, toolType } = req.body;
    
    if (!prompt) {
      res.status(400).json({ success: false, error: "Prompt is required" });
      return;
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ success: false, error: "GEMINI_API_KEY not configured" });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const tools: any[] = [];
    if (toolType === 'search') {
      tools.push({ googleSearch: {} });
    } else if (toolType === 'maps') {
      tools.push({ googleMaps: {} });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: tools.length > 0 ? { 
        tools: tools,
        toolConfig: { includeServerSideToolInvocations: true }
      } : undefined,
    });
    
    res.json({
      success: true,
      data: {
        response: response.text,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("Grounding error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
