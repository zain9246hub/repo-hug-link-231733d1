import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EMICalculator from "@/components/EMICalculator";

const EMICalculatorPage = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">EMI Calculator</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <EMICalculator />
        </CardContent>
      </Card>
    </div>
  );
};

export default EMICalculatorPage;