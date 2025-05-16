import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Defensive wrapper to prevent .filter errors from undefined props
export default function SafeGooglePlacesAutocomplete(props) {
  // Defensive: always pass a defined query and styles
  const safeQuery = props.query || { key: '', language: 'en' };
  const safeStyles = props.styles || {};
  // Defensive: always pass an array for any array-like prop
  const safeData = Array.isArray(props.data) ? props.data : [];

  return (
    <GooglePlacesAutocomplete
      {...props}
      query={safeQuery}
      styles={safeStyles}
      data={safeData}
    />
  );
}
