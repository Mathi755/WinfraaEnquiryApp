import { registerRootComponent } from 'expo';

// Switch between AppTest and App for debugging
// import App from './AppTest';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
