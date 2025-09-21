import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, TextInput as RNTextInput, Alert, Modal } from 'react-native';
import { Text, Title, Paragraph, Button, TextInput, ProgressBar, Chip, Card, IconButton, Portal } from 'react-native-paper';
import { GradientButton, GradientCard } from '@/components';
import { router } from 'expo-router';
import { useTheme } from '@/utils/theme-context';
import { useAuth } from '@/utils/auth-context';
import { Subscription } from '@/types';
import { analyzeSubscriptionPricing, SubscriptionAnalysis } from '@/utils/gemini-service';

interface FormData {
  name: string;
  amount: string;
  currency: string;
  billingCycle: string;
  category: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}


interface Step {
  key: string;
  title: string;
  placeholder: string;
  type: 'text' | 'ai-analysis' | 'amount-selection' | 'select' | 'date' | 'amount' | 'savings-calculation' | 'payment-card';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  options?: string[];
  currencyOptions?: string[];
}

const steps: Step[] = [
  { 
    key: 'name', 
    title: 'What\'s the subscription name?', 
    placeholder: 'e.g., Netflix, Spotify, Adobe Creative Cloud',
    type: 'text'
  },
  { 
    key: 'ai-analysis', 
    title: 'AI Pricing Analysis', 
    placeholder: 'Analyzing pricing options...',
    type: 'ai-analysis'
  },
  { 
    key: 'amount', 
    title: 'Choose your payment amount', 
    placeholder: 'Select how much you want to pay',
    type: 'amount-selection'
  },
  { 
    key: 'category', 
    title: 'What category is this?', 
    placeholder: 'e.g., Entertainment, Software, Productivity',
    type: 'select',
    options: ['Entertainment', 'Software', 'Productivity', 'Music', 'Gaming', 'News', 'Fitness', 'Education', 'Other']
  },
  { 
    key: 'savingsCalculation', 
    title: 'Your Savings with Prepayment', 
    placeholder: 'See how much you can save by prepaying',
    type: 'savings-calculation'
  },
  { 
    key: 'paymentCard', 
    title: 'Pay using this card', 
    placeholder: 'Enter your payment details',
    type: 'payment-card'
  },
];

// Mock card generation functions (moved outside component for initialization)
const generateMockCardNumber = () => {
  // Generate a realistic-looking card number (Visa format: 4xxxxxxxxxxxxxxx)
  const randomDigits = Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0');
  return `4${randomDigits}`.replace(/(.{4})/g, '$1 ').trim();
};

const generateMockExpiryDate = () => {
  const currentYear = new Date().getFullYear();
  const randomYear = currentYear + Math.floor(Math.random() * 5) + 1; // 1-5 years from now
  const randomMonth = Math.floor(Math.random() * 12) + 1; // 1-12
  return `${randomMonth.toString().padStart(2, '0')}/${randomYear.toString().slice(-2)}`;
};

const generateMockCVV = () => {
  return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};

const generateMockCardName = (userName: string) => {
  // Use the user's name from auth context, or fallback to a generic name
  return userName || 'JOHN DOE';
};

export default function AddSubscriptionScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Generate mock card data
  const generateMockCardData = () => {
    const userName = user?.name || 'JOHN DOE';
    return {
      cardNumber: generateMockCardNumber(),
      expiryDate: generateMockExpiryDate(),
      cvv: generateMockCVV(),
      cardName: generateMockCardName(userName),
    };
  };

  const [formData, setFormData] = useState<FormData>(() => {
    const mockCard = generateMockCardData();
    return {
      name: '',
      amount: '',
      currency: 'USD',
      billingCycle: 'monthly',
      category: '',
      cardNumber: mockCard.cardNumber,
      expiryDate: mockCard.expiryDate,
      cvv: mockCard.cvv,
      cardName: mockCard.cardName,
    };
  });
  const [pricingAnalysis, setPricingAnalysis] = useState<SubscriptionAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const currentStepData = steps[currentStep];
  const progress = (currentStep + 1) / steps.length;

  // Trigger AI analysis when moving to analysis step
  useEffect(() => {
    if (currentStep === 1 && formData.name && !pricingAnalysis && !isAnalyzing) {
      startAIAnalysis();
    }
  }, [currentStep, formData.name]);

  const startAIAnalysis = async () => {
    if (!formData.name) return;
    
    setIsAnalyzing(true);
    
    try {
      const analysis = await analyzeSubscriptionPricing(formData.name);
      setPricingAnalysis(analysis);
      
      // Create simple text response without markdown
      const analysisText = createSimpleAnalysisText(analysis);
      setAnalysisText(analysisText);
      
      // Auto-fill form data with recommended pricing
      if (analysis.recommendedOption) {
        setFormData(prev => ({
          ...prev,
          amount: analysis.recommendedOption.price.toString(),
          billingCycle: analysis.recommendedOption.duration,
        }));
      }
    } catch (error) {
      console.error('Pricing analysis failed:', error);
      setAnalysisText('Unable to analyze pricing for this service. You can continue with manual entry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createSimpleAnalysisText = (analysis: SubscriptionAnalysis): string => {
    const recommended = analysis.recommendedOption;
    const savings = recommended.savings;
    const vaultYield = analysis.vaultYieldBenefit;
    const netSavings = savings - vaultYield;
    
    let pricingText = 'Pricing Options:\n';
    analysis.pricingOptions.forEach(option => {
      const period = option.duration === 'yearly' ? 'year' : 
                    option.duration === 'quarterly' ? 'quarter' : 'month';
      pricingText += `• ${option.duration.charAt(0).toUpperCase() + option.duration.slice(1)}: $${option.price}/${period}\n`;
    });
    
    let recommendationText = `Recommendation: ${recommended.duration.charAt(0).toUpperCase() + recommended.duration.slice(1)} billing at $${recommended.price}`;
    
    let reasoningText = '';
    if (savings > 0) {
      reasoningText = `Why this saves you money:
• You save $${savings.toFixed(2)} per year compared to monthly
• Even with your 7% APY vault ($${vaultYield.toFixed(2)} opportunity cost), you still save $${netSavings.toFixed(2)} net
• That's a ${Math.round((savings / (analysis.pricingOptions[0].price * 12)) * 100)}% discount!`;
    } else {
      reasoningText = `Note: This service only offers ${recommended.duration} billing. No quarterly or yearly discounts are available.`;
    }
    
    return `Pricing Analysis for ${analysis.serviceName}

${pricingText}
${recommendationText}

${reasoningText}

I've pre-selected the recommended option for you. Ready to continue?`;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      handleClose();
    }
  };

  const handleSubmit = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSubscription = () => {
    // Here you would typically save the subscription
    console.log('Subscription data:', formData);
    setShowConfirmation(false);
    router.back();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  // Helper functions for confirmation modal
  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}`;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getNextBillingDate = () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCardLastFour = () => {
    return formData.cardNumber.replace(/\s/g, '').slice(-4);
  };


  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Calculate savings for prepayment
  const calculateSavings = () => {
    const currentAmount = parseFloat(formData.amount);
    const currentCycle = formData.billingCycle;
    
    if (!currentAmount || !currentCycle) return null;
    
    // Calculate annual cost for current selection
    let annualCost = 0;
    switch (currentCycle) {
      case 'monthly':
        annualCost = currentAmount * 12;
        break;
      case 'quarterly':
        annualCost = currentAmount * 4;
        break;
      case 'yearly':
        annualCost = currentAmount;
        break;
    }
    
    // Calculate what monthly would cost annually (always compare to monthly)
    const monthlyAnnualCost = currentAmount * 12;
    
    // Calculate direct savings from prepayment discounts
    const directSavings = monthlyAnnualCost - annualCost;
    const directSavingsPercentage = monthlyAnnualCost > 0 ? (directSavings / monthlyAnnualCost) * 100 : 0;
    
    // Calculate vault yield benefit (7% APY on prepaid amount)
    // For yearly prepayment, the money sits in vault for average 6 months
    // For quarterly prepayment, the money sits in vault for average 1.5 months
    // For monthly, show what they'd save if they prepaid yearly instead
    let averageVaultTime = 0;
    let vaultYieldBenefit = 0;
    
    if (currentCycle === 'monthly') {
      // Show potential savings if they switched to yearly prepayment
      const yearlyCost = currentAmount * 12; // What yearly would cost
      averageVaultTime = 6; // 6 months average for yearly prepayment
      vaultYieldBenefit = yearlyCost * (0.07 * averageVaultTime / 12);
    } else {
      // Current selection is already prepaid
      switch (currentCycle) {
        case 'yearly':
          averageVaultTime = 6; // 6 months average
          break;
        case 'quarterly':
          averageVaultTime = 1.5; // 1.5 months average
          break;
      }
      vaultYieldBenefit = annualCost * (0.07 * averageVaultTime / 12);
    }
    
    // Total savings = direct savings + vault yield benefit
    const totalSavings = directSavings + vaultYieldBenefit;
    const totalSavingsPercentage = monthlyAnnualCost > 0 ? (totalSavings / monthlyAnnualCost) * 100 : 0;
    
    // Effective cost = annual cost - vault yield benefit
    const effectiveCost = annualCost - vaultYieldBenefit;
    
    return {
      annualCost,
      monthlyAnnualCost,
      directSavings,
      directSavingsPercentage,
      vaultYieldBenefit,
      totalSavings,
      totalSavingsPercentage,
      effectiveCost,
      currentCycle,
      averageVaultTime
    };
  };

  const isStepValid = () => {
    // AI analysis step is always valid (it's auto-analyzed)
    if (currentStepData.key === 'ai-analysis') {
      return true;
    }
    
    // Savings calculation step is always valid (it's calculated)
    if (currentStepData.type === 'savings-calculation') {
      return true;
    }
    
    // Payment card step is always valid (it's auto-generated)
    if (currentStepData.type === 'payment-card') {
      return true;
    }
    
    const value = formData[currentStepData.key as keyof FormData];
    if (!value || value.trim().length === 0) return false;
    
    // Additional validation for specific fields
    if (currentStepData.key === 'amount') {
      const numValue = parseFloat(formData.amount);
      return !isNaN(numValue) && numValue > 0 && formData.currency && formData.currency.trim().length > 0;
    }
    
    return true;
  };

  const selectAmountOption = (option: { price: number; duration: string }) => {
    setFormData(prev => ({
      ...prev,
      amount: option.price.toString(),
      billingCycle: option.duration,
    }));
  };

  const handleClose = () => {
    Alert.alert(
      'Exit Subscription Setup',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 20,
      paddingBottom: 20,
    },
    content: {
      padding: 24,
      paddingBottom: 100, // Extra padding for better scroll
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 32,
    },
    progressContainer: {
      flex: 1,
      marginRight: 16,
    },
    progressText: {
      textAlign: 'center',
      marginBottom: 8,
      fontSize: 14,
      color: theme.colors.onBackground,
      opacity: 0.7,
    },
    stepTitle: {
      fontSize: 32,
      fontWeight: '900',
      color: theme.colors.onBackground,
      marginBottom: 20,
      textAlign: 'center',
      lineHeight: 40,
      letterSpacing: -0.8,
    },
    stepSubtitle: {
      fontSize: 16,
      color: theme.colors.onBackground,
      opacity: 0.7,
      textAlign: 'center',
      marginBottom: 48,
      lineHeight: 24,
    },
    inputContainer: {
      marginBottom: 32,
    },
    input: {
      fontSize: 18,
      backgroundColor: theme.colors.surface,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 32,
    },
    backButton: {
      flex: 1,
      marginRight: 12,
    },
    nextButton: {
      flex: 2,
      marginLeft: 12,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 24,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    optionChip: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 28,
      borderWidth: 2,
      marginBottom: 12,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    optionText: {
      fontSize: 16,
      fontWeight: '500',
    },
    amountContainer: {
      gap: 24,
    },
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    amountInput: {
      flex: 1,
      fontSize: 18,
      backgroundColor: theme.colors.surface,
    },
    currencyLabel: {
      fontSize: 18,
      fontWeight: '600',
      minWidth: 50,
      textAlign: 'center',
    },
    currencyOptionsContainer: {
      gap: 12,
    },
    currencyTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    currencyChipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    currencyChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    currencyChipText: {
      fontSize: 14,
      fontWeight: '500',
    },
    // AI Analysis Styles
    analysisContainer: {
      width: '100%',
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      textAlign: 'center',
    },
    analysisCard: {
      padding: 24,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
    },
    analysisText: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'monospace',
    },
    // Amount Selection Styles
    amountSelectionContainer: {
      width: '100%',
    },
    selectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    amountOptionCard: {
      padding: 20,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 2,
    },
    selectedAmountCard: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryContainer + '20',
    },
    unselectedAmountCard: {
      borderColor: theme.colors.outline + '40',
      backgroundColor: theme.colors.surface,
    },
    amountOptionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    amountOptionDuration: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    recommendedChip: {
      backgroundColor: theme.colors.primary + '20',
    },
    amountOptionPrice: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    amountOptionPeriod: {
      fontSize: 16,
      fontWeight: 'normal',
    },
    amountOptionAnnual: {
      fontSize: 14,
    },
    amountOptionSavings: {
      fontWeight: '600',
    },
    // Fallback Amount Styles
    fallbackAmountContainer: {
      width: '100%',
    },
    fallbackTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    fallbackAmountInput: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    billingCycleContainer: {
      marginTop: 20,
    },
    billingCycleLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
    },
    billingCycleOptions: {
      flexDirection: 'row',
      gap: 12,
    },
    billingCycleChip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    billingCycleChipText: {
      fontSize: 14,
      fontWeight: '500',
    },
    // Payment Card Styles
    paymentCardContainer: {
      width: '100%',
      alignItems: 'center',
    },
    creditCard: {
      width: 320,
      height: 200,
      borderRadius: 16,
      padding: 24,
      marginBottom: 32,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 1,
    },
    cardChip: {
      width: 32,
      height: 24,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    chipText: {
      fontSize: 16,
    },
    cardNumberContainer: {
      marginBottom: 24,
    },
    cardNumber: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 2,
      fontFamily: 'monospace',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    cardNameContainer: {
      flex: 1,
    },
    cardExpiryContainer: {
      alignItems: 'flex-end',
    },
    cardLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.7)',
      letterSpacing: 1,
      marginBottom: 4,
    },
    cardName: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 1,
    },
    cardExpiry: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 1,
      fontFamily: 'monospace',
    },
    cardInputsContainer: {
      width: '100%',
      gap: 16,
    },
    cardInput: {
      backgroundColor: 'transparent',
    },
    cardInputRow: {
      flexDirection: 'row',
      gap: 16,
    },
    cardInputHalf: {
      flex: 1,
    },
    // Card Details Display Styles
    cardDetailsContainer: {
      width: '100%',
      marginTop: 24,
    },
    cardDetailsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 16,
      textAlign: 'center',
    },
    cardDetailsList: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    cardDetailItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + '20',
    },
    cardDetailLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurfaceVariant,
    },
    cardDetailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      fontFamily: 'monospace',
    },
    cardNote: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    // Close Button Styles
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    closeButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    // Confirmation Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    confirmationCard: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      maxHeight: '80%',
    },
    confirmationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    confirmationTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    confirmationContent: {
      marginBottom: 24,
    },
    confirmationSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline + '20',
    },
    detailLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurfaceVariant,
      flex: 1,
    },
    detailValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      textAlign: 'right',
      flex: 1,
    },
    confirmationActions: {
      flexDirection: 'row',
      gap: 12,
    },
    confirmationButton: {
      flex: 1,
    },
    // Savings Calculation Styles
    savingsContainer: {
      width: '100%',
    },
    savingsContent: {
      gap: 16,
    },
    savingsCard: {
      padding: 20,
      borderRadius: 16,
      marginBottom: 8,
    },
    savingsTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
    },
    savingsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    savingsLabel: {
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    savingsValue: {
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'right',
      flex: 1,
    },
    savingsHighlight: {
      alignItems: 'center',
      marginVertical: 12,
    },
    savingsAmount: {
      fontSize: 32,
      fontWeight: '800',
      marginBottom: 4,
    },
    savingsPercentage: {
      fontSize: 16,
      fontWeight: '600',
    },
    savingsDescription: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    savingsError: {
      fontSize: 16,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header with Close Button */}
        <View style={styles.headerContainer}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Step {currentStep + 1} of {steps.length}
            </Text>
            <ProgressBar 
              progress={progress} 
              color={theme.colors.primary}
              style={{ height: 4, borderRadius: 2 }}
            />
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Step Dots */}
        <View style={styles.stepIndicator}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.stepDot,
                {
                  backgroundColor: index <= currentStep 
                    ? theme.colors.primary 
                    : theme.colors.outline + '40'
                }
              ]}
            />
          ))}
        </View>

        {/* Step Content */}
        <Title style={styles.stepTitle}>
          {currentStepData.title}
        </Title>
        
        <Paragraph style={styles.stepSubtitle}>
          {currentStepData.placeholder}
        </Paragraph>

        {/* Input Field */}
        <View style={styles.inputContainer}>
          {currentStepData.type === 'ai-analysis' ? (
            <View style={styles.analysisContainer}>
              {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
                    Analyzing pricing for {formData.name}...
                  </Text>
                </View>
              ) : analysisText ? (
            <Card style={styles.analysisCard}>
              <Text style={[styles.analysisText, { color: theme.colors.onSurface }]}>
                {analysisText}
              </Text>
            </Card>
              ) : null}
            </View>
          ) : currentStepData.type === 'amount-selection' ? (
            <View style={styles.amountSelectionContainer}>
              {pricingAnalysis ? (
                <View>
                  <Text style={[styles.selectionTitle, { color: theme.colors.onBackground }]}>
                    Choose your preferred payment option:
                  </Text>
                  {pricingAnalysis.pricingOptions.map((option: any, index: number) => (
                    <TouchableOpacity
                      key={`${option.duration}-${option.price}-${index}`}
                      style={[
                        styles.amountOptionCard,
                        formData.amount === option.price.toString() && formData.billingCycle === option.duration
                          ? styles.selectedAmountCard
                          : styles.unselectedAmountCard
                      ]}
                      onPress={() => selectAmountOption(option)}
                    >
                      <View style={styles.amountOptionHeader}>
                        <Text style={[
                          styles.amountOptionDuration,
                          { color: theme.colors.onSurface }
                        ]}>
                          {option.duration.charAt(0).toUpperCase() + option.duration.slice(1)}
                        </Text>
                        {option.duration === pricingAnalysis.recommendedOption.duration && (
                          <Chip mode="outlined" style={[styles.recommendedChip, { borderColor: theme.colors.primary }]}>
                            Recommended
                          </Chip>
                        )}
                      </View>
                      <Text style={[
                        styles.amountOptionPrice,
                        { color: theme.colors.onSurface }
                      ]}>
                        ${option.price}
                        <Text style={[styles.amountOptionPeriod, { color: theme.colors.onSurfaceVariant }]}>
                          /{option.duration === 'yearly' ? 'year' : option.duration === 'quarterly' ? 'quarter' : 'month'}
                        </Text>
                      </Text>
                      <Text style={[
                        styles.amountOptionAnnual,
                        { color: theme.colors.onSurfaceVariant }
                      ]}>
                        Annual cost: ${option.totalAnnualCost.toFixed(2)}
                        {option.savings > 0 && (
                          <Text style={[styles.amountOptionSavings, { color: theme.colors.primary }]}>
                            {' '}(Save ${option.savings.toFixed(2)})
                          </Text>
                        )}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.fallbackAmountContainer}>
                  <Text style={[styles.fallbackTitle, { color: theme.colors.onBackground }]}>
                    Enter the amount you want to pay:
                  </Text>
                  <View style={styles.fallbackAmountInput}>
                    <TextInput
                      mode="outlined"
                      value={formData.amount}
                      onChangeText={(text) => updateFormData('amount', text)}
                      placeholder="e.g., 15.99"
                      keyboardType="numeric"
                      style={styles.amountInput}
                      outlineColor={theme.colors.outline}
                      activeOutlineColor={theme.colors.primary}
                    />
                    <Text style={[styles.currencyLabel, { color: theme.colors.onSurface }]}>
                      {formData.currency}
                    </Text>
                  </View>
                  <View style={styles.billingCycleContainer}>
                    <Text style={[styles.billingCycleLabel, { color: theme.colors.onSurface }]}>
                      Billing cycle:
                    </Text>
                    <View style={styles.billingCycleOptions}>
                      {['monthly', 'quarterly', 'yearly'].map((cycle) => (
                        <TouchableOpacity
                          key={cycle}
                          style={[
                            styles.billingCycleChip,
                            {
                              backgroundColor: formData.billingCycle === cycle
                                ? theme.colors.primaryContainer
                                : theme.colors.surface,
                              borderColor: formData.billingCycle === cycle
                                ? theme.colors.primary
                                : theme.colors.outline,
                            }
                          ]}
                          onPress={() => updateFormData('billingCycle', cycle)}
                        >
                          <Text
                            style={[
                              styles.billingCycleChipText,
                              {
                                color: formData.billingCycle === cycle
                                  ? theme.colors.primary
                                  : theme.colors.onSurface,
                              }
                            ]}
                          >
                            {cycle}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          ) : currentStepData.type === 'amount' ? (
            <View style={styles.amountContainer}>
              <View style={styles.amountInputContainer}>
                <TextInput
                  mode="outlined"
                  value={formData.amount}
                  onChangeText={(text) => updateFormData('amount', text)}
                  placeholder={currentStepData.placeholder}
                  keyboardType="numeric"
                  autoFocus
                  style={styles.amountInput}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                />
                <Text style={[styles.currencyLabel, { color: theme.colors.onSurface }]}>
                  {formData.currency}
                </Text>
              </View>
              <View style={styles.currencyOptionsContainer}>
                <Text style={[styles.currencyTitle, { color: theme.colors.onSurface }]}>
                  Select Currency:
                </Text>
                <View style={styles.currencyChipsContainer}>
                  {currentStepData.currencyOptions?.map((currency: string) => (
                    <TouchableOpacity
                      key={currency}
                      style={[
                        styles.currencyChip,
                        {
                          backgroundColor: formData.currency === currency
                            ? theme.colors.primaryContainer
                            : theme.colors.surface,
                          borderColor: formData.currency === currency
                            ? theme.colors.primary
                            : theme.colors.outline,
                        }
                      ]}
                      onPress={() => updateFormData('currency', currency)}
                    >
                      <Text
                        style={[
                          styles.currencyChipText,
                          {
                            color: formData.currency === currency
                              ? theme.colors.primary
                              : theme.colors.onSurface,
                          }
                        ]}
                      >
                        {currency}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : currentStepData.type === 'select' ? (
            <View style={styles.optionsContainer}>
              {currentStepData.options?.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: formData[currentStepData.key as keyof FormData] === option
                        ? theme.colors.primaryContainer
                        : theme.colors.surface,
                      borderColor: formData[currentStepData.key as keyof FormData] === option
                        ? theme.colors.primary
                        : theme.colors.outline,
                    }
                  ]}
                  onPress={() => updateFormData(currentStepData.key as keyof FormData, option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: formData[currentStepData.key as keyof FormData] === option
                          ? theme.colors.primary
                          : theme.colors.onSurface,
                      }
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : currentStepData.type === 'savings-calculation' ? (
            <View style={styles.savingsContainer}>
              {(() => {
                const savings = calculateSavings();
                if (!savings) {
                  return (
                    <Card style={[styles.savingsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text style={[styles.savingsError, { color: theme.colors.onSurfaceVariant }]}>
                        Unable to calculate savings. Please check your amount and billing cycle.
                      </Text>
                    </Card>
                  );
                }

                const isMonthly = savings.currentCycle === 'monthly';
                const hasDirectSavings = savings.directSavings > 0;
                const hasVaultBenefit = savings.vaultYieldBenefit > 0;
                const hasTotalSavings = savings.totalSavings > 0;

                return (
                  <View style={styles.savingsContent}>
                    {/* Current Selection Summary */}
                    <Card style={[styles.savingsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text style={[styles.savingsTitle, { color: theme.colors.onSurface }]}>
                        Your Selection
                      </Text>
                      <View style={styles.savingsRow}>
                        <Text style={[styles.savingsLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Billing Cycle:
                        </Text>
                        <Text style={[styles.savingsValue, { color: theme.colors.onSurface }]}>
                          {savings.currentCycle.charAt(0).toUpperCase() + savings.currentCycle.slice(1)}
                        </Text>
                      </View>
                      <View style={styles.savingsRow}>
                        <Text style={[styles.savingsLabel, { color: theme.colors.onSurfaceVariant }]}>
                          Annual Cost:
                        </Text>
                        <Text style={[styles.savingsValue, { color: theme.colors.onSurface }]}>
                          ${savings.annualCost.toFixed(2)} {formData.currency}
                        </Text>
                      </View>
                    </Card>

                    {/* Savings Analysis */}
                    {hasTotalSavings ? (
                      <Card style={[styles.savingsCard, { backgroundColor: theme.colors.primaryContainer }]}>
                        <Text style={[styles.savingsTitle, { color: theme.colors.primary }]}>
                          💰 You're Saving Money!
                        </Text>
                        <View style={styles.savingsHighlight}>
                          <Text style={[styles.savingsAmount, { color: theme.colors.primary }]}>
                            ${savings.totalSavings.toFixed(2)} {formData.currency}
                          </Text>
                          <Text style={[styles.savingsPercentage, { color: theme.colors.primary }]}>
                            ({savings.totalSavingsPercentage.toFixed(1)}% off)
                          </Text>
                        </View>
                        <Text style={[styles.savingsDescription, { color: theme.colors.onPrimaryContainer }]}>
                          Compared to monthly billing at ${savings.monthlyAnnualCost.toFixed(2)}/year
                        </Text>
                      </Card>
                    ) : (
                      <Card style={[styles.savingsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={[styles.savingsTitle, { color: theme.colors.onSurface }]}>
                          📊 No Direct Savings
                        </Text>
                        <Text style={[styles.savingsDescription, { color: theme.colors.onSurfaceVariant }]}>
                          {isMonthly 
                            ? "No prepayment discounts available, but you can still benefit from vault yield by prepaying."
                            : "This service doesn't offer prepayment discounts."
                          }
                        </Text>
                      </Card>
                    )}

                    {/* Vault Yield Analysis */}
                    {hasVaultBenefit && (
                      <Card style={[styles.savingsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                        <Text style={[styles.savingsTitle, { color: theme.colors.onSurface }]}>
                          🏦 Vault Yield Benefit
                        </Text>
                        <View style={styles.savingsRow}>
                          <Text style={[styles.savingsLabel, { color: theme.colors.onSurfaceVariant }]}>
                            Vault Yield (7% APY):
                          </Text>
                          <Text style={[styles.savingsValue, { color: theme.colors.primary }]}>
                            +${savings.vaultYieldBenefit.toFixed(2)} {formData.currency}
                          </Text>
                        </View>
                        <View style={styles.savingsRow}>
                          <Text style={[styles.savingsLabel, { color: theme.colors.onSurfaceVariant }]}>
                            Average Vault Time:
                          </Text>
                          <Text style={[styles.savingsValue, { color: theme.colors.onSurface }]}>
                            {savings.averageVaultTime} months
                          </Text>
                        </View>
                        <View style={styles.savingsRow}>
                          <Text style={[styles.savingsLabel, { color: theme.colors.onSurfaceVariant }]}>
                            Effective Cost:
                          </Text>
                          <Text style={[styles.savingsValue, { color: theme.colors.primary }]}>
                            ${savings.effectiveCost.toFixed(2)} {formData.currency}
                          </Text>
                        </View>
                        <Text style={[styles.savingsDescription, { color: theme.colors.onSurfaceVariant }]}>
                          {isMonthly 
                            ? "💡 If you prepaid yearly, your money would earn yield in the vault, reducing your effective subscription cost!"
                            : "💡 Your prepaid amount earns yield in the vault, reducing your effective subscription cost!"
                          }
                        </Text>
                      </Card>
                    )}

                    {/* Recommendation */}
                    <Card style={[
                      styles.savingsCard, 
                      { 
                        backgroundColor: hasTotalSavings 
                          ? theme.colors.primaryContainer 
                          : theme.colors.surfaceVariant 
                      }
                    ]}>
                      <Text style={[
                        styles.savingsTitle, 
                        { color: hasTotalSavings ? theme.colors.primary : theme.colors.onSurface }
                      ]}>
                        {hasTotalSavings ? '🎯 Recommended: Prepay!' : (isMonthly ? '💡 Consider Prepaying Yearly!' : '💡 Consider Monthly Billing')}
                      </Text>
                      <Text style={[
                        styles.savingsDescription, 
                        { color: hasTotalSavings ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant }
                      ]}>
                        {hasTotalSavings 
                          ? `You'll save ${savings.totalSavings.toFixed(2)} {formData.currency} annually through prepayment discounts and vault yield!`
                          : isMonthly 
                            ? `You could save ${savings.totalSavings.toFixed(2)} {formData.currency} annually by prepaying yearly and earning vault yield!`
                            : "Monthly billing would let you earn more through your vault's 7% APY."
                        }
                      </Text>
                    </Card>
                  </View>
                );
              })()}
            </View>
          ) : currentStepData.type === 'payment-card' ? (
            <View style={styles.paymentCardContainer}>
              {/* Credit Card Mockup */}
              <View style={[styles.creditCard, { backgroundColor: theme.colors.primary }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>SubSave Card</Text>
                  <View style={styles.cardChip}>
                    <Text style={styles.chipText}>💳</Text>
                  </View>
                </View>
                
                <View style={styles.cardNumberContainer}>
                  <Text style={styles.cardNumber}>
                    {formData.cardNumber || '•••• •••• •••• ••••'}
                  </Text>
                </View>
                
                <View style={styles.cardFooter}>
                  <View style={styles.cardNameContainer}>
                    <Text style={styles.cardLabel}>CARDHOLDER</Text>
                    <Text style={styles.cardName}>
                      {formData.cardName || 'YOUR NAME'}
                    </Text>
                  </View>
                  <View style={styles.cardExpiryContainer}>
                    <Text style={styles.cardLabel}>EXPIRES</Text>
                    <Text style={styles.cardExpiry}>
                      {formData.expiryDate || 'MM/YY'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card Details Display */}
              <View style={styles.cardDetailsContainer}>
                <Text style={styles.cardDetailsTitle}>Payment Method Details</Text>
                <View style={styles.cardDetailsList}>
                  <View style={styles.cardDetailItem}>
                    <Text style={styles.cardDetailLabel}>Card Number:</Text>
                    <Text style={styles.cardDetailValue}>{formData.cardNumber}</Text>
                  </View>
                  <View style={styles.cardDetailItem}>
                    <Text style={styles.cardDetailLabel}>Expiry Date:</Text>
                    <Text style={styles.cardDetailValue}>{formData.expiryDate}</Text>
                  </View>
                  <View style={styles.cardDetailItem}>
                    <Text style={styles.cardDetailLabel}>CVV:</Text>
                    <Text style={styles.cardDetailValue}>{formData.cvv}</Text>
                  </View>
                  <View style={styles.cardDetailItem}>
                    <Text style={styles.cardDetailLabel}>Cardholder:</Text>
                    <Text style={styles.cardDetailValue}>{formData.cardName}</Text>
                  </View>
                </View>
                <Text style={styles.cardNote}>
                  This is a mock payment method for demonstration purposes.
                </Text>
              </View>
            </View>
          ) : (
            <TextInput
              mode="outlined"
              value={formData[currentStepData.key as keyof FormData]}
              onChangeText={(text) => updateFormData(currentStepData.key as keyof FormData, text)}
              placeholder={currentStepData.placeholder}
              keyboardType={currentStepData.keyboardType || 'default'}
              autoFocus
              style={styles.input}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <GradientButton
            title={currentStep === 0 ? 'Cancel' : 'Back'}
            onPress={handleBack}
            variant="secondary"
            size="medium"
            style={styles.backButton}
          />
          
          <GradientButton
            title={currentStep === steps.length - 1 ? 'Create Subscription' : 'Next'}
            onPress={handleNext}
            disabled={!isStepValid()}
            variant="primary"
            size="medium"
            style={styles.nextButton}
          />
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Portal>
        <Modal
          visible={showConfirmation}
          onDismiss={handleCancelConfirmation}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmationCard}>
              <View style={styles.confirmationHeader}>
                <Text style={styles.confirmationTitle}>Confirm Subscription</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={handleCancelConfirmation}
                />
              </View>

              <View style={styles.confirmationContent}>
                {/* Service Details */}
                <View style={styles.confirmationSection}>
                  <Text style={styles.sectionTitle}>Service Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service Name:</Text>
                    <Text style={styles.detailValue}>{formData.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{formData.billingCycle}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Invoice Number:</Text>
                    <Text style={styles.detailValue}>{generateInvoiceNumber()}</Text>
                  </View>
                </View>

                {/* Billing Details */}
                <View style={styles.confirmationSection}>
                  <Text style={styles.sectionTitle}>Billing Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Date:</Text>
                    <Text style={styles.detailValue}>{getCurrentDate()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Next Billing:</Text>
                    <Text style={styles.detailValue}>{getNextBillingDate()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Subtotal:</Text>
                    <Text style={styles.detailValue}>${formData.amount} {formData.currency}</Text>
                  </View>
                </View>

                {/* Payment Method */}
                <View style={styles.confirmationSection}>
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Card:</Text>
                    <Text style={styles.detailValue}>•••• •••• •••• {getCardLastFour()}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expires:</Text>
                    <Text style={styles.detailValue}>{formData.expiryDate}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cardholder:</Text>
                    <Text style={styles.detailValue}>{formData.cardName}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.confirmationActions}>
                <GradientButton
                  title="Cancel"
                  onPress={handleCancelConfirmation}
                  variant="secondary"
                  size="medium"
                  style={styles.confirmationButton}
                />
                <GradientButton
                  title="Confirm & Create"
                  onPress={handleConfirmSubscription}
                  variant="primary"
                  size="medium"
                  style={styles.confirmationButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
}
