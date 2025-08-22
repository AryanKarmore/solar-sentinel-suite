import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Activity, TrendingUp, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { predictWithModel, getInstrumentModels, ModelPrediction } from "@/utils/modelLoader";

interface ModelPredictionPanelProps {
  instrumentName: string;
  instrumentData: any;
  onClose: () => void;
}

const ModelPredictionPanel: React.FC<ModelPredictionPanelProps> = ({ 
  instrumentName, 
  instrumentData, 
  onClose 
}) => {
  const [predictions, setPredictions] = useState<ModelPrediction>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("classification");

  const models = getInstrumentModels(instrumentName);

  const runPrediction = async (modelType: 'classification' | 'detection' | 'timeSeries') => {
    if (!models) return;
    
    setLoading(prev => ({ ...prev, [modelType]: true }));
    
    try {
      const modelPath = modelType === 'timeSeries' ? models.timeSeries : models[modelType];
      if (!modelPath) {
        throw new Error(`${modelType} model not available for ${instrumentName}`);
      }
      
      const result = await predictWithModel(modelPath, instrumentData, modelType);
      setPredictions(prev => ({ ...prev, ...result }));
    } catch (error) {
      console.error(`Error running ${modelType} prediction:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [modelType]: false }));
    }
  };

  const runAllPredictions = async () => {
    await Promise.all([
      runPrediction('classification'),
      runPrediction('detection'),
      models?.timeSeries ? runPrediction('timeSeries') : Promise.resolve()
    ]);
  };

  if (!models) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Models Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No trained models found for {instrumentName}. Please upload the required model files.
            </p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden border-border shadow-glow-cosmic">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {instrumentName} - ML Model Predictions
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {models.name} • Trained on Aditya L-1 Data
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={runAllPredictions}
                disabled={Object.values(loading).some(Boolean)}
                className="flex items-center gap-2"
              >
                {Object.values(loading).some(Boolean) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                Predict All
              </Button>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        </CardHeader>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="classification" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                CME Classification
              </TabsTrigger>
              <TabsTrigger value="detection" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Event Detection
              </TabsTrigger>
              <TabsTrigger 
                value="timeseries" 
                className="flex items-center gap-2"
                disabled={!models.timeSeries}
              >
                <TrendingUp className="h-4 w-4" />
                Time Series
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classification" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">CME Classification Model</h3>
                <Button 
                  onClick={() => runPrediction('classification')}
                  disabled={loading.classification}
                  size="sm"
                >
                  {loading.classification ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Run Classification"
                  )}
                </Button>
              </div>

              {predictions.classification ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-base">Predicted CME Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge 
                        variant={predictions.classification.cmeType.includes("Fast") ? "destructive" : "secondary"}
                        className="text-lg px-4 py-2"
                      >
                        {predictions.classification.cmeType}
                      </Badge>
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span className="font-mono">{predictions.classification.confidence.toFixed(1)}%</span>
                        </div>
                        <Progress value={predictions.classification.confidence} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-base">Event Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Intensity:</span>
                        <Badge variant={predictions.classification.intensity === "High" ? "destructive" : "secondary"}>
                          {predictions.classification.intensity}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Earth-Directed:</span>
                        <Badge variant={predictions.classification.earthDirected ? "destructive" : "secondary"}>
                          {predictions.classification.earthDirected ? "YES" : "NO"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Click "Run Classification" to get CME type predictions from the trained model.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="detection" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">CME Detection Model</h3>
                <Button 
                  onClick={() => runPrediction('detection')}
                  disabled={loading.detection}
                  size="sm"
                >
                  {loading.detection ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Run Detection"
                  )}
                </Button>
              </div>

              {predictions.detection ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={`border-border ${predictions.detection.isEvent ? 'bg-destructive/10' : 'bg-success/10'}`}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        {predictions.detection.isEvent ? (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-success" />
                        )}
                        Detection Result
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-2">
                        {predictions.detection.isEvent ? "EVENT DETECTED" : "NO EVENT"}
                      </div>
                      <p className="text-muted-foreground">
                        Model confidence: {predictions.detection.confidence.toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-base">Detection Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span>Threshold:</span>
                        <span className="font-mono">{predictions.detection.threshold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Value:</span>
                        <span className="font-mono">{instrumentData.value.toFixed(1)}</span>
                      </div>
                      <Progress 
                        value={(instrumentData.value / predictions.detection.threshold) * 100} 
                        className="h-2"
                      />
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Click "Run Detection" to check for CME events using the trained detection model.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="timeseries" className="space-y-6">
              {models.timeSeries ? (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Time Series Prediction Model</h3>
                    <Button 
                      onClick={() => runPrediction('timeSeries')}
                      disabled={loading.timeSeries}
                      size="sm"
                    >
                      {loading.timeSeries ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Run Prediction"
                      )}
                    </Button>
                  </div>

                  {predictions.timeSeries ? (
                    <Card className="border-border">
                      <CardHeader>
                        <CardTitle className="text-base">Future Value Predictions</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Next {predictions.timeSeries.horizon} hours forecast
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {predictions.timeSeries.predictions.slice(0, 6).map((pred, index) => (
                            <div key={index} className="flex justify-between items-center p-2 rounded bg-muted/30">
                              <span className="text-sm">
                                +{index + 1}h: {new Date(pred.time).toLocaleTimeString()}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{pred.value.toFixed(1)}</span>
                                <Badge variant="outline" className="text-xs">
                                  {(pred.confidence * 100).toFixed(0)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Click "Run Prediction" to generate time series forecasts using the trained model.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Time series prediction model not available for this instrument.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default ModelPredictionPanel;