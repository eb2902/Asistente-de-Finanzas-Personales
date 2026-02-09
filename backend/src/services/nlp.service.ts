import OpenAI from 'openai';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

interface CategorizationResult {
  category: string;
  confidence: number;
  explanation?: string;
}

export class NLPCategorizationService {
  private openai: OpenAI;
  private readonly CATEGORIES = [
    'Alimentos',
    'Transporte', 
    'Servicios',
    'Entretenimiento',
    'Educación',
    'Salud',
    'Vivienda',
    'Ropa',
    'Tecnología',
    'Impuestos',
    'Regalos',
    'Otros'
  ];

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Categorize a transaction description using AI
   */
  async categorizeTransaction(description: string): Promise<CategorizationResult> {
    try {
      // Input validation
      if (!description || description.trim().length === 0) {
        throw new Error('Description cannot be empty');
      }

      // Use local keyword matching as fallback or primary method
      const localResult = this.categorizeWithKeywords(description);
      
      // If we have high confidence with keywords, use that
      if (localResult.confidence > 0.8) {
        return localResult;
      }

      // Otherwise, use AI for better categorization
      const aiResult = await this.categorizeWithAI(description);
      
      // Return the result with higher confidence
      return localResult.confidence > aiResult.confidence ? localResult : aiResult;

    } catch (error) {
      logger.error('Error in categorization:', error);
      
      // Fallback to keyword matching if AI fails
      try {
        return this.categorizeWithKeywords(description);
      } catch {
        // Final fallback
        return {
          category: 'Otros',
          confidence: 0.5,
          explanation: 'Categoría predeterminada por error en el sistema'
        };
      }
    }
  }

  /**
   * Categorize using keyword matching (fallback method)
   */
  private categorizeWithKeywords(description: string): CategorizationResult {
    const descLower = description.toLowerCase();
    const keywords: { [key: string]: { keywords: string[], confidence: number } } = {
      'Alimentos': {
        keywords: ['comida', 'restaurante', 'supermercado', 'mercado', 'almuerzo', 'desayuno', 'cena', 'comestible', 'pan', 'leche', 'carne', 'verdura', 'fruta'],
        confidence: 0.9
      },
      'Transporte': {
        keywords: ['transporte', 'bus', 'subte', 'colectivo', 'taxi', 'uber', 'movilidad', 'combustible', 'estacionamiento', 'peaje', 'subterráneo'],
        confidence: 0.9
      },
      'Servicios': {
        keywords: ['luz', 'agua', 'gas', 'internet', 'teléfono', 'electricidad', 'servicio', 'factura', 'pago'],
        confidence: 0.95
      },
      'Entretenimiento': {
        keywords: ['cine', 'teatro', 'música', 'juego', 'diversión', 'ocio', 'entretenimiento', 'streaming', 'netflix', 'spotify'],
        confidence: 0.85
      },
      'Educación': {
        keywords: ['escuela', 'universidad', 'curso', 'libro', 'material', 'educación', 'estudio', 'clase', 'taller'],
        confidence: 0.9
      },
      'Salud': {
        keywords: ['hospital', 'médico', 'farmacia', 'medicina', 'salud', 'consultorio', 'dentista', 'clínica', 'seguro'],
        confidence: 0.9
      },
      'Vivienda': {
        keywords: ['alquiler', 'hipoteca', 'casa', 'departamento', 'vivienda', 'expensas'],
        confidence: 0.95
      },
      'Ropa': {
        keywords: ['ropa', 'vestimenta', 'calzado', 'zapatos', 'tienda', 'moda', 'vestido', 'pantalón'],
        confidence: 0.85
      },
      'Tecnología': {
        keywords: ['computadora', 'celular', 'tecnología', 'software', 'hardware', 'internet', 'app', 'aplicación'],
        confidence: 0.8
      },
      'Impuestos': {
        keywords: ['impuesto', 'tributo', 'afip', 'declaración', 'ganancias', 'iva', 'patente'],
        confidence: 0.95
      },
      'Regalos': {
        keywords: ['regalo', 'cumpleaños', 'aniversario', 'navidad', 'regalos', 'obsequio'],
        confidence: 0.8
      }
    };

    let bestMatch = 'Otros';
    let highestConfidence = 0.3; // Default low confidence

    for (const [category, data] of Object.entries(keywords)) {
      for (const keyword of data.keywords) {
        if (descLower.includes(keyword)) {
          if (data.confidence > highestConfidence) {
            bestMatch = category;
            highestConfidence = data.confidence;
          }
          break; // Found a match, no need to check other keywords for this category
        }
      }
    }

    return {
      category: bestMatch,
      confidence: highestConfidence,
      explanation: bestMatch === 'Otros' ? undefined : `Coincidencia por palabra clave: ${bestMatch}`
    };
  }

  /**
   * Categorize using AI (OpenAI API)
   */
  private async categorizeWithAI(description: string): Promise<CategorizationResult> {
    try {
      const prompt = `
      Clasifica la siguiente descripción de gasto en una de estas categorías: ${this.CATEGORIES.join(', ')}.
      
      Descripción: "${description}"
      
      Responde en formato JSON con los siguientes campos:
      - category: La categoría elegida
      - confidence: Confianza de la clasificación (0.0 a 1.0)
      - explanation: Breve explicación de por qué se eligió esa categoría
      
      Importante: Responde SOLO con el JSON, sin texto adicional.
      `;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en clasificación de transacciones financieras. Debes responder siempre en español y solo con el JSON solicitado.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.1, // Low temperature for more consistent responses
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse the JSON response
      const result = JSON.parse(content.trim());
      
      // Validate the response
      if (!this.CATEGORIES.includes(result.category)) {
        result.category = 'Otros';
      }
      
      if (result.confidence < 0 || result.confidence > 1) {
        result.confidence = 0.7; // Default medium confidence
      }

      return {
        category: result.category,
        confidence: result.confidence,
        explanation: result.explanation
      };

      } catch (error) {
        logger.error('AI categorization failed:', error);
      throw error;
    }
  }
}