/**
 * App.jsx — Root application component.
 *
 * Wraps the application with global providers and mounts route definitions.
 */

import { SessionProvider } from './context/SessionContext.jsx';
import { WorkflowProvider } from './context/WorkflowContext.jsx';
import { IntelligenceProvider } from './context/IntelligenceContext.jsx';
import AppRoutes from './routes/index.jsx';

const App = () => {
  return (
    <SessionProvider>
      <IntelligenceProvider>
        <WorkflowProvider>
          <AppRoutes />
        </WorkflowProvider>
      </IntelligenceProvider>
    </SessionProvider>
  );
};

export default App;
