// Model loader utility for Aditya L-1 CME prediction models
// This will handle loading and interfacing with the trained ML models

export interface ModelPrediction {
  classification?: {
    cmeType: string;
    confidence: number;
    intensity: string;
    earthDirected: boolean;
  };
  detection?: {
    isEvent: boolean;
    confidence: number;
    threshold: number;
  };
  timeSeries?: {
    predictions: Array<{
      time: number;
      value: number;
      confidence: number;
    }>;
    horizon: number;
  };
}

export interface InstrumentModel {
  name: string;
  classification: string; // Path to classification model
  detection: string; // Path to detection model
  timeSeries?: string; // Path to time series model
}

// Model registry for all 17 trained models
export const MODEL_REGISTRY: Record<string, InstrumentModel> = {
  STEP: {
    name: "Solar Terrestrial Environment Probe",
    classification: "/models/step_classification.pkl",
    detection: "/models/step_detection.pkl",
    timeSeries: "/models/proton_flux_prediction.pkl"
  },
  SUIT: {
    name: "Solar Ultraviolet Imaging Telescope", 
    classification: "/models/suit_classification.pkl",
    detection: "/models/suit_detection.pkl"
  },
  PAPA: {
    name: "Plasma Analyser Package",
    classification: "/models/papa_classification.pkl", 
    detection: "/models/papa_detection.pkl",
    timeSeries: "/models/solar_wind_prediction.pkl"
  },
  MAG: {
    name: "Magnetometer",
    classification: "/models/mag_classification.pkl",
    detection: "/models/mag_detection.pkl", 
    timeSeries: "/models/magnetic_field_prediction.pkl"
  },
  SoLEXS: {
    name: "Solar Low Energy X-ray Spectrometer",
    classification: "/models/solexs_classification.pkl",
    detection: "/models/solexs_detection.pkl"
  },
  SWISS: {
    name: "Solar Wind Ion Spectrometer", 
    classification: "/models/swiss_classification.pkl",
    detection: "/models/swiss_detection.pkl"
  }
};

// Additional specialized models
export const SPECIALIZED_MODELS = {
  unified_timeseries: "/models/unified_timeseries.pkl",
  cme_arrival_prediction: "/models/cme_arrival_prediction.pkl"
};

/**
 * Mock function to simulate model prediction
 * In production, this would interface with your actual ML models
 */
export async function predictWithModel(
  modelPath: string, 
  instrumentData: any,
  modelType: 'classification' | 'detection' | 'timeSeries'
): Promise<ModelPrediction> {
  
  // Simulate model loading and prediction delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock predictions based on model type and current data
  const mockPredictions: Record<string, ModelPrediction> = {
    classification: {
      classification: {
        cmeType: instrumentData.value > 80 ? "Fast Halo CME" : 
                instrumentData.value > 60 ? "Slow CME" : "No Event",
        confidence: Math.min(95, 70 + instrumentData.value * 0.3),
        intensity: instrumentData.value > 75 ? "High" : 
                  instrumentData.value > 50 ? "Medium" : "Low",
        earthDirected: instrumentData.value > 70
      }
    },
    detection: {
      detection: {
        isEvent: instrumentData.value > 65,
        confidence: Math.min(98, 60 + instrumentData.value * 0.4),
        threshold: 65
      }
    },
    timeSeries: {
      timeSeries: {
        predictions: Array.from({length: 24}, (_, i) => ({
          time: Date.now() + (i * 60000),
          value: instrumentData.value + Math.sin(i * 0.1) * 10 + (Math.random() - 0.5) * 5,
          confidence: Math.max(0.7, Math.min(0.95, 0.8 + (Math.random() - 0.5) * 0.2))
        })),
        horizon: 24
      }
    }
  };
  
  return mockPredictions[modelType] || {};
}

/**
 * Get available models for an instrument
 */
export function getInstrumentModels(instrumentName: string): InstrumentModel | null {
  return MODEL_REGISTRY[instrumentName] || null;
}

/**
 * Check if all required models are loaded
 */
export function validateModelAvailability(): {
  available: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  
  Object.entries(MODEL_REGISTRY).forEach(([instrument, models]) => {
    if (!models.classification) missing.push(`${instrument} classification model`);
    if (!models.detection) missing.push(`${instrument} detection model`);
  });
  
  return {
    available: missing.length === 0,
    missing
  };
}