import ReactDOM from 'react-dom/client';
import { App } from './App';
import { applyAppearance } from './shared/utils/appearance';
import { usePreferencesStore } from './store/usePreferencesStore';
import './index.css';

// Apply saved preferences before the first render so there is no flash of
// the default theme.
const { accent, textSize } = usePreferencesStore.getState();
applyAppearance(accent, textSize);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
);
