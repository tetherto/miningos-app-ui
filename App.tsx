/**
 * MiningOS Android Mobile App
 * Main Application Entry Point
 */

import React from 'react';
import { StatusBar, StyleSheet, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from './src/store';
import { RootNavigator } from './src/navigation';
import { Spinner } from './src/components';
import { COLOR } from './src/theme/colors';

// Ignore specific warnings in development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <PersistGate loading={<Spinner fullScreen text="Loading..." />} persistor={persistor}>
          <SafeAreaProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor={COLOR.BLACK}
              translucent={false}
            />
            <RootNavigator />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR.BLACK,
  },
});

export default App;
