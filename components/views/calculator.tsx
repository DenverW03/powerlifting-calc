"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

// Types for competition data
interface Competition {
  id: string;
  date: string;
  gender: string;
  bodyWeight: number;
  squat: number;
  bench: number;
  deadlift: number;
}

interface FormData {
  date: string;
  gender: string;
  bodyWeight: string;
  squat: string;
  bench: string;
  deadlift: string;
}

// DOTS coefficient calculation
const calculateDots = (total: number, bodyWeight: number, isMale: boolean): number => {
  const coefficients = isMale
    ? [-307.75076, 24.0900756, -0.1918759221, 0.0007391293, -0.000001093]
    : [-57.96288, 13.6175032, -0.1126655495, 0.0005158568, -0.0000010706];
  
  const denominator = coefficients.reduce((acc, coeff, index) => 
    acc + coeff * Math.pow(bodyWeight, index), 0);
  
  return total * (500 / denominator);
};

// GL points calculation
const calculateGL = (total: number, bodyWeight: number, isMale: boolean): number => {
  const coefficients = isMale
    ? [1199.72839, 1025.18162, 0.00921]
    : [610.32796, 1045.59282, 0.03048];

  const glCoefficient = 100 / (coefficients[0] - (coefficients[1] * Math.pow(Math.E, (-coefficients[2] * bodyWeight))));
  
  const glPoints = (total != 0) ? glCoefficient * total : 0;
  
  return glPoints;
};

const PowerliftingCalculator: React.FC = () => {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [formData, setFormData] = useState<FormData>({
    date: "",
    gender: "",
    bodyWeight: "",
    squat: "",
    bench: "",
    deadlift: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedData = {
      bodyWeight: parseFloat(formData.bodyWeight),
      squat: parseFloat(formData.squat),
      bench: parseFloat(formData.bench),
      deadlift: parseFloat(formData.deadlift),
    };

    // Validation
    if (Object.values(parsedData).some(isNaN) || !formData.date) {
      setError("Please fill in all fields with valid numbers");
      return;
    }

    if (parsedData.bodyWeight <= 0 || Object.values(parsedData).some(v => v < 0)) {
      setError("Weights must be positive numbers");
      return;
    }

    if (formData.gender == "") {
      setError("Please enter a gender");
      return;
    }

    setCompetitions(prev => [...prev, {
      id: crypto.randomUUID(),
      date: formData.date,
      gender: formData.gender,
      ...parsedData,
    }]);
    setError(null);
    setFormData({ date: "", gender: "", bodyWeight: "", squat: "", bench: "", deadlift: "" });
  };

  // Calculate scores and prepare chart data
  const chartData = useMemo(() => {
    return competitions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(comp => {
        const total = comp.squat + comp.bench + comp.deadlift;
        return {
          date: new Date(comp.date).toLocaleDateString(),
          dots: Number(calculateDots(total, comp.bodyWeight, comp.gender == "male").toFixed(2)),
          gl: Number(calculateGL(total, comp.bodyWeight, comp.gender == "male").toFixed(2)),
        };
      });
  }, [competitions]);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Input Form */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Add Competition</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger className="w-full rounded-md">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyWeight">Body Weight (kg)</Label>
                  <Input
                    id="bodyWeight"
                    type="number"
                    step="0.1"
                    value={formData.bodyWeight}
                    onChange={e => setFormData(prev => ({ ...prev, bodyWeight: e.target.value }))}
                    className="rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="squat">Squat (kg)</Label>
                  <Input
                    id="squat"
                    type="number"
                    step="0.1"
                    value={formData.squat}
                    onChange={e => setFormData(prev => ({ ...prev, squat: e.target.value }))}
                    className="rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bench">Bench (kg)</Label>
                  <Input
                    id="bench"
                    type="number"
                    step="0.1"
                    value={formData.bench}
                    onChange={e => setFormData(prev => ({ ...prev, bench: e.target.value }))}
                    className="rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadlift">Deadlift (kg)</Label>
                  <Input
                    id="deadlift"
                    type="number"
                    step="0.1"
                    value={formData.deadlift}
                    onChange={e => setFormData(prev => ({ ...prev, deadlift: e.target.value }))}
                    className="rounded-md"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full rounded-md">
                Add Competition
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Display */}
        {competitions.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Competition Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitions.map(comp => {
                  const total = comp.squat + comp.bench + comp.deadlift;
                  return (
                    <div key={comp.id} className="border-b pb-4 last:border-b-0">
                      <p className="font-semibold">{new Date(comp.date).toLocaleDateString()}</p>
                      <p>Total: {total}kg | Squat: {comp.squat}kg | Bench: {comp.bench}kg | Deadlift: {comp.deadlift}kg</p>
                      <p>DOTS: {calculateDots(total, comp.bodyWeight, comp.gender == "male").toFixed(2)}</p>
                      <p>GL Points: {calculateGL(total, comp.bodyWeight, comp.gender == "male").toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chart */}
        {chartData.length > 1 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="dots" stroke="#8884d8" name="DOTS" />
                    <Line type="monotone" dataKey="gl" stroke="#82ca9d" name="GL Points" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default PowerliftingCalculator;