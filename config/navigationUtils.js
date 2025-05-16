import { Speech } from 'expo-speech';
import { calculateDistance } from './locationUtils';

// Start navigation with voice guidance
export const startNavigation = async (navigationInfo, speakInstruction) => {
  if (!navigationInfo || !navigationInfo.steps) return;
  
  speakInstruction(navigationInfo.steps[0].instructions);
};

// Stop navigation
export const stopNavigation = () => {
  Speech.stop();
};

// Handle navigation step changes
export const handleNavigationStepChange = (navigationInfo, currentStepIndex, speakInstruction) => {
  if (!navigationInfo || !navigationInfo.steps) return;
  
  const currentStep = navigationInfo.steps[currentStepIndex];
  if (currentStep) {
    speakInstruction(currentStep.instructions);
  }
};

// Get next navigation step
export const getNextStep = (navigationInfo, currentStepIndex) => {
  if (!navigationInfo || !navigationInfo.steps) return null;
  
  const nextIndex = currentStepIndex + 1;
  return nextIndex < navigationInfo.steps.length ? navigationInfo.steps[nextIndex] : null;
};

// Get previous navigation step
export const getPreviousStep = (navigationInfo, currentStepIndex) => {
  if (!navigationInfo || !navigationInfo.steps) return null;
  
  const prevIndex = currentStepIndex - 1;
  return prevIndex >= 0 ? navigationInfo.steps[prevIndex] : null;
};

// Format navigation instruction
export const formatNavigationInstruction = (step) => {
  if (!step) return '';
  
  const instruction = step.instructions.replace(/<[^>]*>/g, '');
  const distance = step.distance;
  const duration = step.duration;
  
  return `${instruction} in ${distance} (${duration})`;
};

// Check if user has reached destination
export const checkDestinationReached = (currentLocation, destination, threshold = 0.1) => {
  if (!currentLocation || !destination) return false;
  
  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    destination.latitude,
    destination.longitude
  );
  
  return distance <= threshold;
}; 