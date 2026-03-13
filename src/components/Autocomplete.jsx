import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { TextInput, Surface, useTheme } from 'react-native-paper';
import { typography } from '../styles/typography';

const Autocomplete = ({
  data,
  value,
  onChangeText,
  onSelect,
  placeholder,
  label,
  style,
  renderItem,
  filterKey = 'name',
}) => {
  const [filteredData, setFilteredData] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (value && showSuggestions) {
      const lowerValue = value.toLowerCase();
      const filtered = data.filter(item => {
        const itemValue = item[filterKey] ? item[filterKey].toLowerCase() : '';
        return itemValue.includes(lowerValue);
      });
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [value, data, filterKey, showSuggestions]);

  const handleSelect = (item) => {
    onSelect(item);
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (value) setShowSuggestions(true);
  };

  const handleChangeText = (text) => {
    onChangeText(text);
    if (text) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <View style={[styles.container, style, { zIndex: 10 }]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={() => {
          // Delay hiding suggestions to allow press event to fire
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        mode="outlined"
        placeholder={placeholder}
        style={[styles.input, { backgroundColor: colors.surface }]}
      />
      {showSuggestions && filteredData.length > 0 && (
        <Surface style={[styles.suggestionsContainer, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            keyboardShouldPersistTaps="always"
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelect(item)} style={[styles.item, { borderBottomColor: colors.outline }]}>
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <Text style={[typography.body, { color: colors.onSurface }]}>{item[filterKey]}</Text>
                )}
              </TouchableOpacity>
            )}
            style={{ maxHeight: 200 }}
          />
        </Surface>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 55, // Adjusted for outlined mode
    left: 0,
    right: 0,
    elevation: 4,
    borderRadius: 4,
    borderWidth: 1,
    zIndex: 1000,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
  },
});

export default Autocomplete;
