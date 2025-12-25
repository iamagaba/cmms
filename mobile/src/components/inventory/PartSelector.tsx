import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Button, SearchBar, Icon } from 'react-native-elements';
import { InventoryList } from './InventoryList';
import { PartScanner } from './PartScanner';
import { MobileInventoryItem } from '../../types';
import { theme } from '../../theme/theme';

interface PartSelectorProps {
  visible: boolean;
  onClose: () => void;
  onPartSelected: (part: MobileInventoryItem) => void;
  title?: string;
  showLowStockOnly?: boolean;
}

type SelectorMode = 'search' | 'scan';

export const PartSelector: React.FC<PartSelectorProps> = ({
  visible,
  onClose,
  onPartSelected,
  title = 'Select Part',
  showLowStockOnly = false,
}) => {
  const [mode, setMode] = useState<SelectorMode>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handlePartSelect = (part: MobileInventoryItem) => {
    onPartSelected(part);
    onClose();
  };

  const handleScanPress = () => {
    setShowScanner(true);
  };

  const handleScannerClose = () => {
    setShowScanner(false);
  };

  const handlePartFound = (part: MobileInventoryItem) => {
    setShowScanner(false);
    handlePartSelect(part);
  };

  const handleManualEntry = () => {
    setShowScanner(false);
    setMode('search');
  };

  const renderModeSelector = () => (
    <View style={styles.modeSelector}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          mode === 'search' && styles.activeModeButton,
        ]}
        onPress={() => setMode('search')}
      >
        <Icon
          name="search"
          type="material"
          size={20}
          color={mode === 'search' ? theme.colors.white : theme.colors.primary}
        />
        <Text
          style={[
            styles.modeButtonText,
            mode === 'search' && styles.activeModeButtonText,
          ]}
        >
          Search
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.modeButton,
          mode === 'scan' && styles.activeModeButton,
        ]}
        onPress={() => setMode('scan')}
      >
        <Icon
          name="qr-code-scanner"
          type="material"
          size={20}
          color={mode === 'scan' ? theme.colors.white : theme.colors.primary}
        />
        <Text
          style={[
            styles.modeButtonText,
            mode === 'scan' && styles.activeModeButtonText,
          ]}
        >
          Scan
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchMode = () => (
    <View style={styles.searchContainer}>
      <SearchBar
        placeholder="Search parts by name, SKU, or description..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInput}
        inputStyle={styles.searchBarText}
        searchIcon={{ size: 20 }}
        clearIcon={{ size: 20 }}
        platform="default"
      />
      <InventoryList
        onItemPress={handlePartSelect}
        showFilters={true}
        initialFilter={{
          searchTerm,
          lowStockOnly: showLowStockOnly,
        }}
        emptyMessage="No parts found. Try adjusting your search or scan a barcode."
      />
    </View>
  );

  const renderScanMode = () => (
    <View style={styles.scanContainer}>
      <View style={styles.scanInstructions}>
        <Icon
          name="qr-code-scanner"
          type="material"
          size={64}
          color={theme.colors.primary}
        />
        <Text style={styles.scanTitle}>Scan Part Barcode</Text>
        <Text style={styles.scanSubtitle}>
          Use your camera to scan a part barcode or QR code for quick identification
        </Text>
      </View>
      
      <View style={styles.scanActions}>
        <Button
          title="Start Scanning"
          onPress={handleScanPress}
          buttonStyle={styles.scanButton}
          titleStyle={styles.scanButtonText}
          icon={{
            name: 'camera-alt',
            type: 'material',
            size: 20,
            color: theme.colors.white,
          }}
        />
        
        <Button
          title="Manual Search Instead"
          onPress={() => setMode('search')}
          buttonStyle={styles.manualSearchButton}
          titleStyle={styles.manualSearchButtonText}
          type="outline"
        />
      </View>
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Mode Selector */}
          {renderModeSelector()}

          {/* Content */}
          <View style={styles.content}>
            {mode === 'search' ? renderSearchMode() : renderScanMode()}
          </View>
        </View>
      </Modal>

      {/* Scanner Modal */}
      <PartScanner
        visible={showScanner}
        onClose={handleScannerClose}
        onPartFound={handlePartFound}
        onManualEntry={handleManualEntry}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grey4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.grey0,
  },
  cancelButton: {
    fontSize: 16,
    color: theme.colors.grey2,
  },
  placeholder: {
    width: 60,
  },
  modeSelector: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: theme.colors.grey5,
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  activeModeButton: {
    backgroundColor: theme.colors.primary,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  activeModeButtonText: {
    color: theme.colors.white,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flex: 1,
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBarInput: {
    backgroundColor: theme.colors.grey5,
    borderRadius: 8,
    height: 40,
  },
  searchBarText: {
    fontSize: 14,
    color: theme.colors.grey0,
  },
  scanContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  scanInstructions: {
    alignItems: 'center',
    marginBottom: 48,
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.grey0,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  scanSubtitle: {
    fontSize: 16,
    color: theme.colors.grey2,
    textAlign: 'center',
    lineHeight: 22,
  },
  scanActions: {
    width: '100%',
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 16,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  manualSearchButton: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
  },
  manualSearchButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
  },
});