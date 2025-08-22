import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar } from "recharts";
import { Activity, Brain, Eye, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface InstrumentData {
  name: string;
  fullName: string;
  currentReading: number;
  classification: {
    type: string;
    confidence: number;
    intensity: string;
    earthDirected: boolean;
  };
  detection: {
    status: "ACTIVE" | "MONITORING" | "CLEAR";
    lastEvent: string;
    eventCount: number;
    threshold: number;
  };
  timeSeries: Array<{
    time: number;
    value: number;
    prediction?: number;
    anomaly?: boolean;
  }>;
}

interface InstrumentDetailPanelProps {
  instrument: InstrumentData;
  onClose: () => void;
}

const generateTimeSeriesWithPrediction = (baseValue: number) => {
  const data = [];
  const now = Date.now();
  
  // Historical data (last 2 hours)
  for (let i = 120; i >= 0; i--) {
    const time = now - (i * 60000);
    const variation = (Math.sin(i * 0.1) + Math.random() - 0.5) * 20;
    const value = Math.max(0, baseValue + variation);
    const isAnomaly = value > baseValue + 50 || Math.random() > 0.95;
    
    data.push({
      time,
      value,
      anomaly: isAnomaly,
    });
  }
  
  // Future predictions (next 2 hours)
  for (let i = 1; i <= 120; i++) {
    const time = now + (i * 60000);
    const trend = i * 0.1; // slight upward trend
    const variation = Math.sin(i * 0.15) * 15;
    const prediction = Math.max(0, baseValue + trend + variation);
    
    data.push({
      time,
      value: null,
      prediction,
    });
  }
  
  return data;
};

const InstrumentDetailPanel: React.FC<InstrumentDetailPanelProps> = ({ instrument, onClose }) => {
  const [timeSeriesData, setTimeSeriesData] = useState(generateTimeSeriesWithPrediction(instrument.currentReading));
  const [modelMetrics, setModelMetrics] = useState({
    accuracy: 94.2,
    precision: 91.8,
    recall: 96.1,
    f1Score: 93.9
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSeriesData(generateTimeSeriesWithPrediction(instrument.currentReading));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [instrument.currentReading]);

  const getClassificationColor = (type: string) => {
    switch (type) {
      case "Fast CME": return "destructive";
      case "Slow CME": return "warning";
      case "Halo CME": return "destructive";
      case "Partial CME": return "secondary";
      default: return "secondary";
    }
  };

  const getDetectionStatus = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" };
      case "MONITORING":
        return { icon: Eye, color: "text-warning", bg: "bg-warning/10" };
      default:
        return { icon: CheckCircle, color: "text-success", bg: "bg-success/10" };
    }
  };

  const statusConfig = getDetectionStatus(instrument.detection.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden border-border shadow-glow-cosmic">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{instrument.name} - {instrument.fullName}</CardTitle>
              <p className="text-muted-foreground mt-1">Multi-Modal CME Intelligence Analysis</p>
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </CardHeader>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="classification" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="classification" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                CME Classification
              </TabsTrigger>
              <TabsTrigger value="detection" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                CME Detection
              </TabsTrigger>
              <TabsTrigger value="timeseries" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Time Series Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classification" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Current Classification</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>CME Type:</span>
                      <Badge variant={getClassificationColor(instrument.classification.type) as any}>
                        {instrument.classification.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confidence:</span>
                      <span className="font-mono text-lg">{instrument.classification.confidence.toFixed(1)}%</span>
                    </div>
                    <div className="space-y-2">
                      <span>Classification Confidence:</span>
                      <Progress value={instrument.classification.confidence} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Intensity Level:</span>
                      <Badge variant={instrument.classification.intensity === "High" ? "destructive" : "secondary"}>
                        {instrument.classification.intensity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Earth-Directed:</span>
                      <Badge variant={instrument.classification.earthDirected ? "destructive" : "secondary"}>
                        {instrument.classification.earthDirected ? "YES" : "NO"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Model Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { metric: "Accuracy", value: modelMetrics.accuracy },
                        { metric: "Precision", value: modelMetrics.precision },
                        { metric: "Recall", value: modelMetrics.recall },
                        { metric: "F1-Score", value: modelMetrics.f1Score },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
                        <YAxis domain={[80, 100]} stroke="hsl(var(--muted-foreground))" />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Classification History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: "14:32", type: "Fast CME", confidence: 89.2, intensity: "High" },
                      { time: "14:15", type: "Slow CME", confidence: 76.4, intensity: "Medium" },
                      { time: "13:58", type: "Partial CME", confidence: 82.1, intensity: "Low" },
                      { time: "13:42", type: "No Event", confidence: 95.7, intensity: "N/A" },
                    ].map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-sm text-muted-foreground">{event.time}</span>
                          <Badge variant={getClassificationColor(event.type) as any}>
                            {event.type}
                          </Badge>
                          <span className="text-sm">Confidence: {event.confidence}%</span>
                        </div>
                        <Badge variant="outline">{event.intensity}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detection" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className={`border-border ${statusConfig.bg}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                      Detection Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{instrument.detection.status}</div>
                    <p className="text-muted-foreground">
                      Last Event: {instrument.detection.lastEvent}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Event Counter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{instrument.detection.eventCount}</div>
                    <p className="text-muted-foreground">Events detected today</p>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Detection Threshold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span className="font-mono">{instrument.currentReading.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Threshold:</span>
                        <span className="font-mono">{instrument.detection.threshold}</span>
                      </div>
                      <Progress 
                        value={(instrument.currentReading / instrument.detection.threshold) * 100} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Detection Algorithm Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart data={timeSeriesData.filter(d => d.anomaly)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(time) => new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis dataKey="value" stroke="hsl(var(--muted-foreground))" />
                      <Scatter dataKey="value" fill="hsl(var(--destructive))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-2">
                    Red dots indicate detected anomalies and potential CME events
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeseries" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Predictive Time Series Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        type="number"
                        scale="time"
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(time) => new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                        connectNulls={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="prediction" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-primary"></div>
                      <span className="text-sm">Historical Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-accent border-dashed border-t-2"></div>
                      <span className="text-sm">Predicted Values</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Forecasting Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Mean Absolute Error:</span>
                      <span className="font-mono">2.34</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Root Mean Square Error:</span>
                      <span className="font-mono">4.12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>R² Score:</span>
                      <span className="font-mono">0.847</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Forecast Horizon:</span>
                      <span className="font-mono">2 hours</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Model Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <span>LSTM + Transformer</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Training Window:</span>
                      <span>30 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Update Frequency:</span>
                      <span>Every 5 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Retrained:</span>
                      <span>2 hours ago</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default InstrumentDetailPanel;