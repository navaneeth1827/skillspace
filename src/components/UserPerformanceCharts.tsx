
import { Activity, Award, Target, Zap } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

// Sample data for demonstration - in a real app, this would come from API/database
const weeklyActivity = [
  { name: "Mon", applications: 2, interviews: 1 },
  { name: "Tue", applications: 5, interviews: 0 },
  { name: "Wed", applications: 3, interviews: 2 },
  { name: "Thu", applications: 4, interviews: 1 },
  { name: "Fri", applications: 6, interviews: 3 },
  { name: "Sat", applications: 2, interviews: 0 },
  { name: "Sun", applications: 1, interviews: 0 },
];

const skillsData = [
  { subject: 'JavaScript', A: 85, fullMark: 100 },
  { subject: 'React', A: 90, fullMark: 100 },
  { subject: 'Node.js', A: 70, fullMark: 100 },
  { subject: 'UI/UX', A: 65, fullMark: 100 },
  { subject: 'CSS', A: 75, fullMark: 100 },
  { subject: 'TypeScript', A: 60, fullMark: 100 },
];

const performanceMetrics = [
  { name: 'Profile Completeness', value: 85 },
  { name: 'Response Rate', value: 92 },
  { name: 'Interview Success', value: 70 },
  { name: 'Project Completion', value: 96 },
];

const UserPerformanceCharts = () => {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-10">
      {/* Activity Chart */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Weekly Activity
          </CardTitle>
          <CardDescription>Your job search activity over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer 
              config={{
                applications: {
                  label: "Applications",
                  color: "hsl(var(--primary))",
                },
                interviews: {
                  label: "Interviews",
                  color: "hsl(var(--primary) / 0.5)",
                },
              }}
            >
              <AreaChart data={weeklyActivity} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  fill="var(--color-applications)" 
                  stroke="var(--color-applications)" 
                  fillOpacity={0.6} 
                />
                <Area 
                  type="monotone" 
                  dataKey="interviews" 
                  fill="var(--color-interviews)" 
                  stroke="var(--color-interviews)" 
                  fillOpacity={0.6} 
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Skills Radar Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Skill Assessment
          </CardTitle>
          <CardDescription>Your skills proficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Skills" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Performance Metrics
          </CardTitle>
          <CardDescription>Your performance across key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer 
              config={{
                value: {
                  label: "Value (%)",
                  color: "hsl(var(--primary))",
                },
              }}
            >
              <BarChart
                data={performanceMetrics}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Legend />
                <Bar dataKey="value" fill="var(--color-value)" />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPerformanceCharts;
