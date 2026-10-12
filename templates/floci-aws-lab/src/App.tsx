import { useCallback, useState, type ReactNode } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import BreadcrumbGroup, {
  type BreadcrumbGroupProps,
} from '@cloudscape-design/components/breadcrumb-group';
import Flashbar from '@cloudscape-design/components/flashbar';
import Header from '@cloudscape-design/components/header';
import ContentLayout from '@cloudscape-design/components/content-layout';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import { ChallengePanel } from './challenges/ChallengePanel';
import { CHALLENGES } from './challenges/challenges';
import type { Challenge, CheckResult } from './challenges/types';
import { HomePage } from './HomePage';
import { useFlociHealth } from './lib/floci-health';
import { LanguageProvider } from './lib/i18n';
import { NotificationsProvider, useNotifications } from './lib/notifications';
import {
  followHandler,
  href,
  navigate,
  parseRoute,
  useRoute,
  type Route,
} from './lib/router';
import { BucketDetailPage } from './services/s3/BucketDetailPage';
import { BucketsPage } from './services/s3/BucketsPage';
import { CreateBucketPage } from './services/s3/CreateBucketPage';
import { CreateFunctionPage } from './services/lambda/CreateFunctionPage';
import { FunctionDetailPage } from './services/lambda/FunctionDetailPage';
import { FunctionsPage } from './services/lambda/FunctionsPage';
import { TutorialOverlay } from './tutorial/TutorialOverlay';
import { TUTORIALS } from './tutorial/tutorials';

export function App() {
  return (
    <LanguageProvider>
      <NotificationsProvider>
        <Console />
      </NotificationsProvider>
    </LanguageProvider>
  );
}

function breadcrumbsFor(route: Route): BreadcrumbGroupProps.Item[] {
  const s3 = { text: 'Amazon S3', href: href.buckets() };
  const lambda = { text: 'AWS Lambda', href: href.functions() };
  switch (route.page) {
    case 's3-buckets':
      return [s3, { text: 'Buckets', href: href.buckets() }];
    case 's3-create-bucket':
      return [
        s3,
        { text: 'Buckets', href: href.buckets() },
        { text: 'Create bucket', href: href.createBucket() },
      ];
    case 's3-bucket':
      return [
        s3,
        { text: 'Buckets', href: href.buckets() },
        { text: route.bucket, href: href.bucket(route.bucket) },
      ];
    case 'lambda-functions':
      return [lambda, { text: 'Functions', href: href.functions() }];
    case 'lambda-create-function':
      return [
        lambda,
        { text: 'Functions', href: href.functions() },
        { text: 'Create function', href: href.createFunction() },
      ];
    case 'lambda-function':
      return [
        lambda,
        { text: 'Functions', href: href.functions() },
        { text: route.functionName, href: href.fn(route.functionName) },
      ];
    default:
      return [];
  }
}

function Console() {
  const route = useRoute();
  const floci = useFlociHealth();
  const { items: notifications } = useNotifications();

  // Opening the console straight onto a Lambda page (say, after a reload) shows
  // the Lambda challenge rather than resetting to the first one.
  const [activeChallenge, setActiveChallenge] = useState<Challenge>(
    () =>
      CHALLENGES.find((c) =>
        route.page.startsWith(parseRoute(c.startHref).page.split('-')[0]),
      ) ?? CHALLENGES[0],
  );
  const [results, setResults] = useState<
    Record<string, Record<string, CheckResult>>
  >({});
  const [toolsOpen, setToolsOpen] = useState(true);
  const [tutorialFor, setTutorialFor] = useState<string | null>(null);

  const startChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setToolsOpen(true);
    navigate(challenge.startHref);
    setTutorialFor(challenge.id);
  };

  const reveal = useCallback((targetId: string) => {
    if (targetId === 'challenge-panel') setToolsOpen(true);
  }, []);

  const flociDown =
    floci === 'down'
      ? [
          {
            id: 'floci-down',
            type: 'error' as const,
            header: 'Floci is not running',
            content: (
              <>
                The console can&apos;t reach the AWS emulator on port 4566. In
                the Codespace terminal, run <code>docker compose up -d</code>{' '}
                and wait a few seconds.
              </>
            ),
          },
        ]
      : [];

  let content: ReactNode;
  switch (route.page) {
    case 'home':
      content = (
        <HomePage
          challenges={CHALLENGES}
          floci={floci}
          onStart={startChallenge}
        />
      );
      break;
    case 's3-buckets':
      content = <BucketsPage />;
      break;
    case 's3-create-bucket':
      content = <CreateBucketPage />;
      break;
    case 's3-bucket':
      content = <BucketDetailPage key={route.bucket} bucket={route.bucket} />;
      break;
    case 'lambda-functions':
      content = <FunctionsPage />;
      break;
    case 'lambda-create-function':
      content = <CreateFunctionPage />;
      break;
    case 'lambda-function':
      content = (
        <FunctionDetailPage
          key={route.functionName}
          functionName={route.functionName}
        />
      );
      break;
    default:
      content = (
        <ContentLayout header={<Header variant="h1">Page not found</Header>} />
      );
  }

  const activeHref = route.page.startsWith('s3')
    ? href.buckets()
    : route.page.startsWith('lambda')
      ? href.functions()
      : href.home();

  return (
    <>
      <div id="top-nav">
        <TopNavigation
          identity={{
            href: href.home(),
            title: 'FlipTheScript Labs · AWS Sandbox',
            onFollow: followHandler,
          }}
          utilities={[
            {
              type: 'button',
              text:
                floci === 'up'
                  ? 'Floci: connected'
                  : floci === 'down'
                    ? 'Floci: offline'
                    : 'Floci: checking',
              iconName:
                floci === 'up'
                  ? 'status-positive'
                  : floci === 'down'
                    ? 'status-negative'
                    : 'status-pending',
            },
            { type: 'button', text: 'us-east-1' },
          ]}
        />
      </div>
      <AppLayout
        headerSelector="#top-nav"
        breadcrumbs={
          route.page === 'home' ? undefined : (
            <BreadcrumbGroup
              items={breadcrumbsFor(route)}
              onFollow={followHandler}
              ariaLabel="Breadcrumbs"
            />
          )
        }
        notifications={<Flashbar items={[...flociDown, ...notifications]} />}
        navigation={
          <div id="side-nav">
            <SideNavigation
              header={{ text: 'Lab home', href: href.home() }}
              activeHref={activeHref}
              onFollow={followHandler}
              items={[
                { type: 'link', text: 'Amazon S3', href: href.buckets() },
                { type: 'link', text: 'AWS Lambda', href: href.functions() },
              ]}
            />
          </div>
        }
        tools={
          <ChallengePanel
            challenges={CHALLENGES}
            active={activeChallenge}
            onSelect={startChallenge}
            onStartTutorial={() => setTutorialFor(activeChallenge.id)}
            results={results}
            onResults={(id, res) =>
              setResults((prev) => ({ ...prev, [id]: res }))
            }
          />
        }
        toolsOpen={toolsOpen}
        onToolsChange={({ detail }) => setToolsOpen(detail.open)}
        toolsWidth={420}
        ariaLabels={{
          tools: 'Challenge',
          toolsToggle: 'Open challenge panel',
          toolsClose: 'Close challenge panel',
        }}
        content={content}
      />
      {tutorialFor && TUTORIALS[tutorialFor] && (
        <TutorialOverlay
          key={tutorialFor}
          content={TUTORIALS[tutorialFor]}
          onExit={() => setTutorialFor(null)}
          onReveal={reveal}
        />
      )}
    </>
  );
}
