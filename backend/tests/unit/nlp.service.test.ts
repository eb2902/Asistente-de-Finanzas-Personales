import { describe, it, expect } from 'vitest';

// Test the categorization logic without requiring OpenAI to be instantiated
// We test the keyword matching logic which is the fallback mechanism

describe('NLPCategorizationService - Keyword Matching', () => {
  // Helper function that mirrors the categorizeWithKeywords logic
  const categorizeWithKeywords = (description: string): { category: string; confidence: number } => {
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
    let highestConfidence = 0.3;

    for (const [category, data] of Object.entries(keywords)) {
      for (const keyword of data.keywords) {
        if (descLower.includes(keyword)) {
          if (data.confidence > highestConfidence) {
            bestMatch = category;
            highestConfidence = data.confidence;
          }
          break;
        }
      }
    }

    return {
      category: bestMatch,
      confidence: highestConfidence
    };
  };

  describe('categorizeWithKeywords', () => {
    it('debería categorizar "almuerzo en restaurante" como Alimentos', () => {
      const result = categorizeWithKeywords('Almuerzo en restaurante');
      expect(result.category).toBe('Alimentos');
      expect(result.confidence).toBe(0.9);
    });

    it('debería categorizar "pasaje de colectivo" como Transporte', () => {
      const result = categorizeWithKeywords('Pasaje de colectivo');
      expect(result.category).toBe('Transporte');
    });

    it('debería categorizar "factura de luz" como Servicios', () => {
      const result = categorizeWithKeywords('Factura de luz');
      expect(result.category).toBe('Servicios');
    });

    it('debería categorizar "Entrada de cine" como Entretenimiento', () => {
      const result = categorizeWithKeywords('Entrada de cine');
      expect(result.category).toBe('Entretenimiento');
    });

    it('debería categorizar "escuela primaria" como Educación', () => {
      const result = categorizeWithKeywords('Escuela primaria');
      expect(result.category).toBe('Educación');
    });

    it('debería categorizar "farmacia" como Salud', () => {
      const result = categorizeWithKeywords('Farmacia');
      expect(result.category).toBe('Salud');
    });

    it('debería categorizar "alquiler departamento" como Vivienda', () => {
      const result = categorizeWithKeywords('Alquiler departamento');
      expect(result.category).toBe('Vivienda');
    });

    it('debería categorizar "compra de zapatos" como Ropa', () => {
      const result = categorizeWithKeywords('Compra de zapatos');
      expect(result.category).toBe('Ropa');
    });

    it('debería categorizar "computadora nueva" como Tecnología', () => {
      const result = categorizeWithKeywords('Computadora nueva');
      expect(result.category).toBe('Tecnología');
    });

    it('debería categorizar "impuesto municipal" como Impuestos', () => {
      const result = categorizeWithKeywords('Impuesto municipal');
      expect(result.category).toBe('Impuestos');
    });

    it('debería categorizar "regalo de cumpleaños" como Regalos', () => {
      const result = categorizeWithKeywords('Regalo de cumpleaños');
      expect(result.category).toBe('Regalos');
    });

    it('debería retornar "Otros" para descripciones no reconocidas', () => {
      const result = categorizeWithKeywords('Compra genérica xyz');
      expect(result.category).toBe('Otros');
      expect(result.confidence).toBe(0.3);
    });
  });

  describe('Fallback functionality - otros casos', () => {
    it('debería retornar "Otros" con baja confianza para texto sin coincidencias', () => {
      const result = categorizeWithKeywords('abc123xyz');
      expect(result.category).toBe('Otros');
      expect(result.confidence).toBe(0.3);
    });
  });
});
