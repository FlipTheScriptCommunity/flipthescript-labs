import React, { useEffect, useState } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';

import CreateFunction from './sections/CreateFunction';
import FunctionView from './sections/FunctionView';
import TutorialOverlay from './TutorialOverlay';
import { EXISTING_ROLES } from './data';
import { mockCreateFunction, validateFunctionName } from './mockCreateFunction';

const initialState = {
  name: '',
  runtime: 'nodejs22.x',
  architecture: 'x86_64',
  roleMode: 'create',
  existingRole: EXISTING_ROLES[0],
  functionUrl: false,
  functionUrlAuth: 'AWS_IAM',
};

export default function App() {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [fn, setFn] = useState(null);

  // Two screens ("Create function" and the function page), each with its own
  // walkthrough that opens automatically the first time the screen is shown —
  // this embed *is* the lab, so students land straight in the tutorial.
  const screen = fn ? 'function' : 'create';
  const [tutorialActive, setTutorialActive] = useState(true);
  const [tutorialSection, setTutorialSection] = useState('create');
  const [tutorialKey, setTutorialKey] = useState(0);
  const [functionTutorialShown, setFunctionTutorialShown] = useState(false);

  // This app lives inside an <iframe> on the course page. Modals/panels here
  // are portaled to this document's own body and positioned relative to the
  // iframe's viewport — but if the outer page hasn't scrolled the iframe
  // fully into view yet, that can land below the fold. Same-origin iframes
  // can reach their own <iframe> element via window.frameElement, so we ask
  // the outer page to scroll it into view whenever the tutorial opens.
  //
  // A plain scrollIntoView({block: 'start'}) would align the iframe's top
  // edge with the outer viewport's top edge — but the course page has its
  // own sticky header there, which would then cover the AWS top nav (and
  // the Help button in it). So instead we compute the scroll position
  // ourselves, landing just below that sticky header.
  const scrollEmbedIntoView = () => {
    if (typeof window === 'undefined' || !window.frameElement) return;
    try {
      const parentWindow = window.parent;
      const parentDocument = parentWindow.document;
      const headerHeight =
        parentDocument.querySelector('header')?.getBoundingClientRect()
          .height ?? 0;
      const rect = window.frameElement.getBoundingClientRect();
      const targetY = parentWindow.scrollY + rect.top - headerHeight - 8;
      parentWindow.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
    } catch {
      // Cross-origin or otherwise inaccessible — fall back to a plain scrollIntoView.
      window.frameElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  useEffect(() => {
    scrollEmbedIntoView();
  }, []);

  useEffect(() => {
    if (screen === 'function' && !functionTutorialShown) {
      setFunctionTutorialShown(true);
      setTutorialSection('function');
      setTutorialKey((k) => k + 1);
      setTutorialActive(true);
      scrollEmbedIntoView();
    } else if (screen !== tutorialSection) {
      setTutorialActive(false);
    }
    // Only react to screen changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const openTutorial = () => {
    setTutorialSection(screen);
    setTutorialKey((k) => k + 1);
    setTutorialActive(true);
    scrollEmbedIntoView();
  };

  const handleCreate = async () => {
    const nameError = validateFunctionName(state.name);
    setErrors({ name: nameError });
    setError(null);
    if (nameError) return;
    setCreating(true);
    try {
      setFn(await mockCreateFunction(state));
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const reset = () => {
    setFn(null);
    setState(initialState);
    setErrors({});
    setError(null);
  };

  return (
    <>
      <div id="top-nav">
        <TopNavigation
          identity={{ href: '#', title: 'AWS' }}
          utilities={[
            { type: 'button', text: 'N. Virginia', iconName: 'multiscreen' },
            {
              type: 'button',
              text: 'Help',
              iconName: 'status-info',
              variant: 'primary-button',
              onClick: openTutorial,
            },
            { type: 'button', iconName: 'notification' },
            { type: 'button', iconName: 'settings' },
            {
              type: 'menu-dropdown',
              text: 'student@flipthescript.dev',
              iconName: 'user-profile',
              items: [{ id: 'signout', text: 'Sign out' }],
            },
          ]}
          i18nStrings={{
            overflowMenuTriggerText: 'More',
            overflowMenuTitleText: 'All',
          }}
        />
      </div>
      <AppLayout
        headerSelector="#top-nav"
        navigation={
          <SideNavigation
            header={{ text: 'AWS Lambda', href: '#' }}
            activeHref="#/functions"
            items={[
              { type: 'link', text: 'Dashboard', href: '#' },
              { type: 'link', text: 'Applications', href: '#' },
              { type: 'link', text: 'Functions', href: '#/functions' },
              {
                type: 'section',
                text: 'Additional resources',
                items: [
                  {
                    type: 'link',
                    text: 'Code signing configurations',
                    href: '#',
                  },
                  { type: 'link', text: 'Event source mappings', href: '#' },
                  { type: 'link', text: 'Layers', href: '#' },
                  { type: 'link', text: 'Replicas', href: '#' },
                ],
              },
            ]}
          />
        }
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { text: 'Lambda', href: '#' },
              { text: 'Functions', href: '#/functions' },
              fn
                ? { text: fn.name, href: '#' }
                : { text: 'Create function', href: '#' },
            ]}
          />
        }
        toolsHide={true}
        content={
          fn ? (
            <FunctionView fn={fn} setFn={setFn} onCreateAnother={reset} />
          ) : (
            <CreateFunction
              state={state}
              setState={setState}
              errors={errors}
              error={error}
              creating={creating}
              onCreate={handleCreate}
              onCancel={reset}
            />
          )
        }
      />
      {tutorialActive && (
        <TutorialOverlay
          key={tutorialKey}
          section={tutorialSection}
          onExit={() => setTutorialActive(false)}
        />
      )}
    </>
  );
}
