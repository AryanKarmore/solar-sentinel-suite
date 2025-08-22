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

// Mock data generation for real-time simulation
const generateMockData = () => ({
  step: Math.random() * 100 + 50,
  suit: Math.random() * 100 + 30,
  papa: Math.random() * 100 + 20,
  mag: Math.random() * 100 + 40,
  solexs: Math.random() * 100 + 60,
  swiss: Math.random() * 100 + 45,
  timestamp: Date.now()
});

const generateTimeSeriesData = () => {
  const data = [];
  const now = Date.now();
  for (let i = 23; i >= 0; i--) {
    data.push({
      time: now - (i * 60000), // Last 24 minutes
      solarWind: Math.random() * 500 + 300,
      magneticField: Math.random() * 20 + 5,
      protonFlux: Math.random() * 1000 + 100,
    });
  }
  return data;
};

const generateInstrumentData = (name: string, fullName: string, value: number) => {
  const cmeTypes = ["Fast CME", "Slow CME", "Halo CME", "Partial CME", "No Event"];
  const intensities = ["Low", "Medium", "High"];
  
  return {
    name,
    fullName,
    currentReading: value,
    classification: {
      type: cmeTypes[Math.floor(Math.random() * cmeTypes.length)],
      confidence: Math.random() * 30 + 70, // 70-100%
      intensity: intensities[Math.floor(Math.random() * intensities.length)],
      earthDirected: Math.random() > 0.7,
    },
    detection: {
      status: value > 80 ? "ACTIVE" : value > 60 ? "MONITORING" : "CLEAR" as "ACTIVE" | "MONITORING" | "CLEAR",
      lastEvent: `${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      eventCount: Math.floor(Math.random() * 12),
      threshold: 75,
    },
    timeSeries: [] // Will be generated in the detail panel
  };
};

const SolarSentinelDashboard = () => {
  const [instrumentData, setInstrumentData] = useState(generateMockData());
  const [timeSeriesData] = useState(generateTimeSeriesData());
  const [riskIndex, setRiskIndex] = useState(0);
  const [cmeDetected, setCmeDetected] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newData = generateMockData();
      setInstrumentData(newData);
      
      // Calculate unified CME risk index
      const avgReading = (newData.step + newData.suit + newData.papa + newData.mag + newData.solexs + newData.swiss) / 6;
      const riskScore = Math.min(Math.max((avgReading - 40) / 60 * 100, 0), 100);
      setRiskIndex(riskScore);
      
      // Detect CME events (simplified logic)
      setCmeDetected(riskScore > 75 && Math.random() > 0.7);
    }, 2000);

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
      data: generateInstrumentData("STEP", "Solar Terrestrial Environment Probe", instrumentData.step)
    },
    {
      name: "SUIT",
      fullName: "Solar Ultraviolet Imaging Telescope",
      icon: Eye,
      value: instrumentData.suit,
      status: instrumentData.suit > 80 ? "alert" : "normal",
      data: generateInstrumentData("SUIT", "Solar Ultraviolet Imaging Telescope", instrumentData.suit)
    },
    {
      name: "PAPA",
      fullName: "Plasma Analyser Package",
      icon: Activity,
      value: instrumentData.papa,
      status: instrumentData.papa > 80 ? "alert" : "normal",
      data: generateInstrumentData("PAPA", "Plasma Analyser Package", instrumentData.papa)
    },
    {
      name: "MAG",
      fullName: "Magnetometer",
      icon: Magnet,
      value: instrumentData.mag,
      status: instrumentData.mag > 80 ? "alert" : "normal",
      data: generateInstrumentData("MAG", "Magnetometer", instrumentData.mag)
    },
    {
      name: "SoLEXS",
      fullName: "Solar Low Energy X-ray Spectrometer",
      icon: Zap,
      value: instrumentData.solexs,
      status: instrumentData.solexs > 80 ? "alert" : "normal",
      data: generateInstrumentData("SoLEXS", "Solar Low Energy X-ray Spectrometer", instrumentData.solexs)
    },
    {
      name: "SWISS",
      fullName: "Solar Wind Ion Spectrometer",
      icon: Radio,
      value: instrumentData.swiss,
      status: instrumentData.swiss > 80 ? "alert" : "normal",
      data: generateInstrumentData("SWISS", "Solar Wind Ion Spectrometer", instrumentData.swiss)
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
              <strong>CME EVENT DETECTED:</strong> Coronal Mass Ejection in progress. 
              Multi-modal analysis shows {instruments.filter(i => i.status === "alert").length} instruments detecting anomalies.
              Estimated Earth arrival: 18-72 hours.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Unified CME Risk Index */}
          <Card className="lg:col-span-1 border-border shadow-glow-cosmic">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Unified CME Risk Index</CardTitle>
              <p className="text-sm text-muted-foreground">Multi-Modal Fusion Score</p>
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
                Solar Wind & Magnetic Field Data
              </CardTitle>
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
              <Card key={instrument.name} className="border-border hover:shadow-glow-solar transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedInstrument(instrument.data)}>
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
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Analyze
                      </Button>
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
    </div>
  );
};

export default SolarSentinelDashboard;