import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Searchbar} from 'react-native-paper';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={value}
        onSubmitEditing={onSubmit}
        style={styles.searchbar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchbar: {
    elevation: 2,
  },
});