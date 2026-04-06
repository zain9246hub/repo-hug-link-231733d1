import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { IndianRupee, Calculator, PieChart, TrendingUp } from 'lucide-react';

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState(5000000); // 50 Lakh
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20); // Years
  const [emi, setEmi] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, loanTenure]);

  const calculateEMI = () => {
    const monthlyRate = interestRate / (12 * 100);
    const numberOfPayments = loanTenure * 12;
    
    if (monthlyRate === 0) {
      const calculatedEMI = loanAmount / numberOfPayments;
      setEmi(calculatedEMI);
      setTotalAmount(loanAmount);
      setTotalInterest(0);
    } else {
      const emiNumerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
      const emiDenominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
      const calculatedEMI = emiNumerator / emiDenominator;
      
      setEmi(calculatedEMI);
      setTotalAmount(calculatedEMI * numberOfPayments);
      setTotalInterest((calculatedEMI * numberOfPayments) - loanAmount);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const principalPercentage = (loanAmount / totalAmount) * 100;
  const interestPercentage = (totalInterest / totalAmount) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Calculator className="h-8 w-8" />
          EMI Calculator
        </h1>
        <p className="text-muted-foreground">
          Calculate your home loan EMI and plan your finances
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Loan Amount */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Loan Amount
                </Label>
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  placeholder="Enter loan amount"
                />
                <div className="px-2">
                  <Slider
                    value={[loanAmount]}
                    onValueChange={(value) => setLoanAmount(value[0])}
                    max={50000000}
                    min={100000}
                    step={100000}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹1L</span>
                  <span className="font-medium">{formatCurrency(loanAmount)}</span>
                  <span>₹5Cr</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="space-y-3">
                <Label>Interest Rate (% per annum)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  placeholder="Enter interest rate"
                />
                <div className="px-2">
                  <Slider
                    value={[interestRate]}
                    onValueChange={(value) => setInterestRate(value[0])}
                    max={20}
                    min={6}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>6%</span>
                  <span className="font-medium">{interestRate}%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Loan Tenure */}
              <div className="space-y-3">
                <Label>Loan Tenure (Years)</Label>
                <Input
                  type="number"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(Number(e.target.value))}
                  placeholder="Enter loan tenure"
                />
                <div className="px-2">
                  <Slider
                    value={[loanTenure]}
                    onValueChange={(value) => setLoanTenure(value[0])}
                    max={30}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5 Years</span>
                  <span className="font-medium">{loanTenure} Years</span>
                  <span>30 Years</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Preset Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '₹25L', value: 2500000 },
                  { label: '₹50L', value: 5000000 },
                  { label: '₹75L', value: 7500000 },
                  { label: '₹1Cr', value: 10000000 }
                ].map((preset) => (
                  <Button
                    key={preset.value}
                    variant="outline"
                    onClick={() => setLoanAmount(preset.value)}
                    className={loanAmount === preset.value ? 'border-primary' : ''}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* EMI Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your EMI Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-gradient-primary rounded-lg text-primary-foreground">
                <p className="text-sm opacity-90 mb-1">Monthly EMI</p>
                <p className="text-3xl font-bold">{formatCurrency(emi)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-xl font-semibold">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Interest</p>
                  <p className="text-xl font-semibold text-red-600">{formatCurrency(totalInterest)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Payment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Visual representation */}
                <div className="flex h-8 rounded-lg overflow-hidden">
                  <div 
                    className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${principalPercentage}%` }}
                  >
                    Principal
                  </div>
                  <div 
                    className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                    style={{ width: `${interestPercentage}%` }}
                  >
                    Interest
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Principal Amount</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(loanAmount)} ({principalPercentage.toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Interest Amount</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(totalInterest)} ({interestPercentage.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Loan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Payments</span>
                <span className="font-medium">{loanTenure * 12} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Income Required*</span>
                <span className="font-medium">{formatCurrency(emi * 3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest to Principal Ratio</span>
                <span className="font-medium">{(totalInterest / loanAmount).toFixed(2)}:1</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                *Recommended minimum monthly income (3x EMI rule)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;