import { Routes, Route } from 'react-router-dom';
import './inside-the-loop.css';
import InsideTheLoopLayout from './InsideTheLoopLayout';
import InsideTheLoopHub from './InsideTheLoopHub';
import InsideTheLoopDetailPage from './InsideTheLoopDetailPage';
import { Requirements } from './01-requirements';
import { Context } from './02-context';
import { Harness } from './03-harness';
import { CodeReview } from './04-code-review';
import { CodeQuality } from './05-quality';
import { Retro } from './06-retro';
import { ContinuousImprovement } from './07-improvement';
import { Onboarding } from './08-onboarding';
import { Tools } from './09-tools';
import { Infrastructure } from './10-infrastructure';

/**
 * One module, lazy-loaded as a single chunk from main.tsx — the hub and all
 * 10 detail pages share the same heavy chart/primitive dependencies, so
 * splitting them into separate chunks would duplicate that shared code
 * rather than save anything.
 */
export default function InsideTheLoopRoutes() {
  return (
    <Routes>
      <Route element={<InsideTheLoopLayout />}>
        <Route index element={<InsideTheLoopHub />} />
        <Route
          path="requirements"
          element={
            <InsideTheLoopDetailPage id="requirements">
              <Requirements />
            </InsideTheLoopDetailPage>
          }
        />
        <Route
          path="context"
          element={
            <InsideTheLoopDetailPage id="context">
              <Context />
            </InsideTheLoopDetailPage>
          }
        />
        <Route
          path="harness"
          element={
            <InsideTheLoopDetailPage id="harness">
              <Harness />
            </InsideTheLoopDetailPage>
          }
        />
        <Route
          path="infrastructure"
          element={
            <InsideTheLoopDetailPage id="infrastructure">
              <Infrastructure />
            </InsideTheLoopDetailPage>
          }
        />
        <Route
          path="tools"
          element={
            <InsideTheLoopDetailPage id="tools">
              <Tools />
            </InsideTheLoopDetailPage>
          }
        />
        <Route
          path="retro"
          element={
            <InsideTheLoopDetailPage id="retro">
              <Retro />
            </InsideTheLoopDetailPage>
          }
        />
        <Route
          path="onboarding"
          element={
            <InsideTheLoopDetailPage id="onboarding">
              <Onboarding />
            </InsideTheLoopDetailPage>
          }
        />
        <Route
          path="code-review"
          element={
            <InsideTheLoopDetailPage id="code-review">
              <CodeReview />
            </InsideTheLoopDetailPage>
          }
        />
        <Route
          path="quality"
          element={
            <InsideTheLoopDetailPage id="quality">
              <CodeQuality />
            </InsideTheLoopDetailPage>
          }
        />
        <Route
          path="improvement"
          element={
            <InsideTheLoopDetailPage id="improvement">
              <ContinuousImprovement />
            </InsideTheLoopDetailPage>
          }
        />
      </Route>
    </Routes>
  );
}
