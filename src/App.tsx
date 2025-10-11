import { CollectionsProvider } from "./context/CollectionsContext";
import { CurrentCollectionProvider } from "./context/CurrentCollectionContext";
import { HistoryProvider } from "./context/HistoryContext";
import { GlobalSettingsProvider } from "./context/GlobalSettingsContext";
import Layout from "./layout";
import "./App.css";

const App = () => {
  return (
    <CollectionsProvider>
      <CurrentCollectionProvider>
        <HistoryProvider>
          <GlobalSettingsProvider>
            <Layout />
          </GlobalSettingsProvider>
        </HistoryProvider>
      </CurrentCollectionProvider>
    </CollectionsProvider>
  );
};

export default App;
