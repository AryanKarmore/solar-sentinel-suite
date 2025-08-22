import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Activity, AlertTriangle, Radio, Satellite, Zap, Shield, Eye, Magnet, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useEffect, useState } from "react";
import heroImage from "@/assets/solar-cme-hero.jpg";
import InstrumentDetailPanel from "./InstrumentDetailPanel";
import ModelPredictionPanel from "./ModelPredictionPanel";
import { Brain } from "lucide-react";

// Hardcoded Aditya L-1 satellite data (realistic values)
const generateAdityaL1Data = () => ({
  step: 78.5, // Solar Terrestrial Environment Probe - Proton flux
  suit: 65.2, // Solar Ultraviolet Imaging Telescope - UV intensity
  papa: 42.8, // Plasma Analyser Package - Solar wind velocity
  mag: 89.3, // Magnetometer - Magnetic field strength
  solexs: 71.6, // Solar Low Energy X-ray Spectrometer - X-ray flux
  swiss: 56.4, // Solar Wind Ion Spectrometer - Ion density
  timestamp: Date.now()
});

const generateAdityaTimeSeriesData = () => {
  const data = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: now - (i * 60000), // Last 24 minutes
      solarWind: 420 + Math.sin(i * 0.1) * 50, // km/s - typical solar wind speed
      magneticField: 8.5 + Math.sin(i * 0.15) * 3, // nT - interplanetary magnetic field
      protonFlux: 250 + Math.sin(i * 0.2) * 100, // particles/cm²/s - proton flux
    });
  }
  return data;
};

const generateAdityaInstrumentData = (name: string, fullName: string, value: number) => {
  // Hardcoded realistic CME classifications based on Aditya L-1 observations
  const instrumentClassifications = {
    "STEP": { type: "Fast CME", confidence: 87.3, intensity: "High", earthDirected: true },
    "SUIT": { type: "Halo CME", confidence: 92.1, intensity: "High", earthDirected: true },
    "PAPA": { type: "Slow CME", confidence: 74.6, intensity: "Medium", earthDirected: false },
    "MAG": { type: "Fast CME", confidence: 89.8, intensity: "High", earthDirected: true },
    "SoLEXS": { type: "Partial CME", confidence: 81.2, intensity: "Medium", earthDirected: false },
    "SWISS": { type: "No Event", confidence: 95.4, intensity: "Low", earthDirected: false }
  };
  
  const classification = instrumentClassifications[name] || {
    type: "No Event",
    confidence: 85.0,
    intensity: "Low",
    earthDirected: false
  };
  
  return {
    name,
    fullName,
    currentReading: value,
    classification,
    detection: {
      status: value > 80 ? "ACTIVE" : value > 60 ? "MONITORING" : "CLEAR" as "ACTIVE" | "MONITORING" | "CLEAR",
      lastEvent: "14:32", // Hardcoded last event time
      eventCount: 3, // Hardcoded event count for today
      threshold: 75,
    },
    timeSeries: [] // Will be generated in the detail panel
  };
};

const SolarSentinelDashboard = () => {
  const [instrumentData, setInstrumentData] = useState(generateAdityaL1Data());
  const [timeSeriesData] = useState(generateAdityaTimeSeriesData());
  const [riskIndex, setRiskIndex] = useState(73.2); // Hardcoded high risk index
  const [cmeDetected, setCmeDetected] = useState(true); // Hardcoded CME detection
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [selectedModelInstrument, setSelectedModelInstrument] = useState(null);

  // Simulate real-time data updates with hardcoded variations
  useEffect(() => {
    const interval = setInterval(() => {
      const baseData = generateAdityaL1Data();
      // Add small variations to simulate real-time updates
      const newData = {
        step: baseData.step + (Math.random() - 0.5) * 5,
        suit: baseData.suit + (Math.random() - 0.5) * 3,
        papa: baseData.papa + (Math.random() - 0.5) * 4,
        mag: baseData.mag + (Math.random() - 0.5) * 2,
        solexs: baseData.solexs + (Math.random() - 0.5) * 3,
        swiss: baseData.swiss + (Math.random() - 0.5) * 4,
        timestamp: Date.now()
      };
      setInstrumentData(newData);
      
      // Update risk index with small variations
      setRiskIndex(prev => Math.max(65, Math.min(85, prev + (Math.random() - 0.5) * 2)));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getRiskLevel = (risk: number) => {
    if (risk < 30) return { label: "LOW", color: "success" };
    if (risk < 60) return { label: "MODERATE", color: "warning" };
    if (risk < 85) return { label: "HIGH", color: "destructive" };
    return { label: "EXTREME", color: "destructive" };
  };

  const riskLevel = getRiskLevel(riskIndex);

  const instruments = [
    {
      name: "STEP",
      fullName: "Solar Terrestrial Environment Probe",
      icon: Satellite,
      value: instrumentData.step,
      status: instrumentData.step > 80 ? "alert" : "normal",
      data: generateAdityaInstrumentData("STEP", "Solar Terrestrial Environment Probe", instrumentData.step)
    },
    {
      name: "SUIT",
      fullName: "Solar Ultraviolet Imaging Telescope",
      icon: Eye,
      value: instrumentData.suit,
      status: instrumentData.suit > 80 ? "alert" : "normal",
      data: generateAdityaInstrumentData("SUIT", "Solar Ultraviolet Imaging Telescope", instrumentData.suit)
    },
    {
      name: "PAPA",
      fullName: "Plasma Analyser Package",
      icon: Activity,
      value: instrumentData.papa,
      status: instrumentData.papa > 80 ? "alert" : "normal",
      data: generateAdityaInstrumentData("PAPA", "Plasma Analyser Package", instrumentData.papa)
    },
    {
      name: "MAG",
      fullName: "Magnetometer",
      icon: Magnet,
      value: instrumentData.mag,
      status: instrumentData.mag > 80 ? "alert" : "normal",
      data: generateAdityaInstrumentData("MAG", "Magnetometer", instrumentData.mag)
    },
    {
      name: "SoLEXS",
      fullName: "Solar Low Energy X-ray Spectrometer",
      icon: Zap,
      value: instrumentData.solexs,
      status: instrumentData.solexs > 80 ? "alert" : "normal",
      data: generateAdityaInstrumentData("SoLEXS", "Solar Low Energy X-ray Spectrometer", instrumentData.solexs)
    },
    {
      name: "SWISS",
      fullName: "Solar Wind Ion Spectrometer",
      icon: Radio,
      value: instrumentData.swiss,
      status: instrumentData.swiss > 80 ? "alert" : "normal",
      data: generateAdityaInstrumentData("SWISS", "Solar Wind Ion Spectrometer", instrumentData.swiss)
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Header */}
      <div 
        className="relative h-32 bg-cover bg-center flex items-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80"></div>
        <div className="relative z-10 px-8">
          <h1 className="text-4xl font-bold bg-gradient-solar bg-clip-text text-transparent">
            Solar Sentinel Suite
          </h1>
          <p className="text-muted-foreground mt-2">
            Multi-Modal CME Intelligence System - Classification • Detection • Forecasting
          </p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* CME Alert System */}
        {cmeDetected && (
          <Alert className="border-destructive bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive-foreground">
              <strong>ADITYA L-1 CME ALERT:</strong> Fast Halo CME detected at 14:32 UTC. 
              Speed: 1,200 km/s. Earth-directed event confirmed by SUIT and MAG instruments.
              Estimated Earth arrival: 36-48 hours. Geomagnetic storm warning issued.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Unified CME Risk Index */}
          <Card className="lg:col-span-1 border-border shadow-glow-cosmic">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Unified CME Risk Index</CardTitle>
              <p className="text-sm text-muted-foreground">Aditya L-1 Multi-Instrument Analysis</p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${riskIndex * 2.51} 251.2`}
                    className={`${
                      riskLevel.color === "success" ? "text-success" :
                      riskLevel.color === "warning" ? "text-warning" :
                      "text-destructive"
                    } transition-all duration-1000`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">{Math.round(riskIndex)}</div>
                  <div className="text-sm text-muted-foreground">UCRI</div>
                </div>
              </div>
              <Badge 
                variant={riskLevel.color === "success" ? "default" : "destructive"}
                className={`text-lg px-4 py-2 ${
                  riskLevel.color === "success" ? "bg-success text-success-foreground" :
                  riskLevel.color === "warning" ? "bg-warning text-warning-foreground" :
                  "bg-destructive text-destructive-foreground"
                }`}
              >
                {riskLevel.label} RISK
              </Badge>
            </CardContent>
          </Card>

          {/* Time Series Visualization */}
          <Card className="lg:col-span-2 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Solar Energetic Particle Flux - STEP Instrument
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                High-energy proton measurements from Solar Terrestrial Environment Probe
              </p>
              <p className="text-sm text-muted-foreground">
                Live data from L1 Lagrange point • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(time) => new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Line 
                    type="monotone" 
                    dataKey="solarWind" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="magneticField" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Instrument Grid with Enhanced Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instruments.map((instrument) => {
            const Icon = instrument.icon;
            return (
              <Card key={instrument.name} className="border-border hover:shadow-glow-solar transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {instrument.name}
                    </CardTitle>
                    <Badge 
                      variant={instrument.status === "alert" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {instrument.status === "alert" ? "ALERT" : "NORMAL"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{instrument.fullName}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold">{Math.round(instrument.value)}</span>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInstrument(instrument.data);
                          }}
                        >
                          <BarChart3 className="h-3 w-3" />
                          Analyze
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedModelInstrument({
                              name: instrument.name,
                              data: instrument
                            });
                          }}
                        >
                          <Brain className="h-3 w-3" />
                          Predict
                        </Button>
                      </div>
                    </div>
                    <Progress 
                      value={instrument.value} 
                      className={`h-2 ${
                        instrument.status === "alert" ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
                      }`}
                    />
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-accent">CME</div>
                        <div>{instrument.data.classification.type.split(' ')[0]}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-warning">Detection</div>
                        <div>{instrument.data.detection.status}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-success">Confidence</div>
                        <div>{Math.round(instrument.data.classification.confidence)}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Proton Flux Visualization */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Proton Flux Density - Multi-Instrument Correlation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(time) => new Date(time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Area 
                  type="monotone" 
                  dataKey="protonFlux" 
                  stroke="hsl(var(--accent))" 
                  fill="hsl(var(--accent) / 0.2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Instrument Detail Panel */}
      {selectedInstrument && (
        <InstrumentDetailPanel 
          instrument={selectedInstrument}
          onClose={() => setSelectedInstrument(null)}
        />
      )}

      {/* Model Prediction Panel */}
      {selectedModelInstrument && (
        <ModelPredictionPanel
          instrumentName={selectedModelInstrument.name}
          instrumentData={selectedModelInstrument.data}
          onClose={() => setSelectedModelInstrument(null)}
        />
      )}
    </div>
  );
};

export default SolarSentinelDashboard;