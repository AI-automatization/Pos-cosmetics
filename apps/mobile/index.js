import { enableScreens } from 'react-native-screens';
import { registerRootComponent } from 'expo';
import App from './src/App';

enableScreens();

registerRootComponent(App);
