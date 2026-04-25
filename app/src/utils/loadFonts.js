import * as Font from 'expo-font';

/**
 * Load custom fonts (FontAwesome)
 * Gọi hàm này trong App.js nếu muốn dùng custom fonts
 */
export const loadFonts = async () => {
  try {
    await Font.loadAsync({
      'FontAwesome5_Brands': require('../assets/fonts/FontAwesome5_Brands.ttf'),
      'FontAwesome5_Regular': require('../assets/fonts/FontAwesome5_Regular.ttf'),
      'FontAwesome5_Solid': require('../assets/fonts/FontAwesome5_Solid.ttf'),
    });
    return true;
  } catch (error) {
    console.error('Error loading fonts:', error);
    return false;
  }
};

/**
 * Hook để load fonts
 * Usage:
 * 
 * import { useFonts } from './src/utils/loadFonts';
 * 
 * const App = () => {
 *   const fontsLoaded = useFonts();
 *   if (!fontsLoaded) return <LoadingScreen />;
 *   return <MainApp />;
 * };
 */
export const useFonts = () => {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    loadFonts().then(setLoaded);
  }, []);

  return loaded;
};
