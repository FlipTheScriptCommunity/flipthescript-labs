import React, { useEffect, useState } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';

import CreationMethod from './sections/CreationMethod';
import EngineOptions from './sections/EngineOptions';
import Templates from './sections/Templates';
import Availability from './sections/Availability';
import Settings from './sections/Settings';
import InstanceConfiguration from './sections/InstanceConfiguration';
import Storage from './sections/Storage';
import Connectivity from './sections/Connectivity';
import Authentication from './sections/Authentication';
import AdditionalConfiguration from './sections/AdditionalConfiguration';
import SummaryPanel from './sections/SummaryPanel';
import DatabaseView from './sections/DatabaseView';
import TutorialOverlay from './TutorialOverlay';
import { TEMPLATE_DEFAULTS, getEngine } from './data';
import { mockCreateDatabase, validateForm } from './mockCreateDatabase';

const initialState = {
  engine: 'mysql',
  engineVersion: getEngine('mysql').versions[0],
  template: 'free-tier',
  ...TEMPLATE_DEFAULTS['free-tier'],
  identifier: 'database-1',
  masterUsername: 'admin',
  credentialsMode: 'self',
  autoGeneratePassword: true,
  masterPassword: '',
  confirmPassword: '',
  iops: '3000',
  storageAutoscaling: true,
  maxStorage: '1000',
  publicAccess: 'no',
  securityGroupMode: 'existing',
  securityGroupName: '',
  availabilityZone: 'none',
  port: String(getEngine('mysql').port),
  authentication: 'password',
  databaseName: '',
  backups: true,
  encryption: true,
};

export default function App() {
  const [state, setState] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // The guided walkthrough opens automatically — this embed *is* the lab, so
  // students should land straight in the tutorial rather than needing to
  // find it.
  const [tutorialActive, setTutorialActive] = useState(true);
  const [tutorialKey, setTutorialKey] = useState(0);

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

  const openTutorial = () => {
    setTutorialKey((k) => k + 1);
    setTutorialActive(true);
    scrollEmbedIntoView();
  };

  // Field errors only show up after the first "Create database" attempt,
  // then update live as the student fixes them — like the real console.
  const errors = submitted ? validateForm(state) : {};

  // Switching engine resets the engine-specific defaults (version, port, and
  // the master username if the student hadn't changed it).
  const handleEngineChange = (engineId) => {
    const next = getEngine(engineId);
    setState((s) => {
      const previous = getEngine(s.engine);
      return {
        ...s,
        engine: engineId,
        engineVersion: next.versions[0],
        port: s.port === String(previous.port) ? String(next.port) : s.port,
        masterUsername:
          s.masterUsername === previous.defaultUser
            ? next.defaultUser
            : s.masterUsername,
      };
    });
  };

  // Picking a template pre-fills sensible defaults for that use case.
  const handleTemplateChange = (template) => {
    setState((s) => ({ ...s, template, ...TEMPLATE_DEFAULTS[template] }));
  };

  const handleCreate = async () => {
    setSubmitted(true);
    setError(null);
    if (Object.keys(validateForm(state)).length > 0) {
      setError(
        'Some settings need your attention. Fix the highlighted fields and try again.',
      );
      return;
    }
    setCreating(true);
    try {
      const data = await mockCreateDatabase(state);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const reset = () => {
    setResult(null);
    setSubmitted(false);
    setError(null);
    setState(initialState);
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
            header={{ text: 'Aurora and RDS', href: '#' }}
            activeHref="#/databases"
            items={[
              { type: 'link', text: 'Dashboard', href: '#' },
              { type: 'link', text: 'Databases', href: '#/databases' },
              { type: 'link', text: 'Query Editor', href: '#' },
              { type: 'link', text: 'Performance insights', href: '#' },
              { type: 'link', text: 'Snapshots', href: '#' },
              { type: 'link', text: 'Automated backups', href: '#' },
              { type: 'link', text: 'Reserved instances', href: '#' },
              { type: 'link', text: 'Proxies', href: '#' },
              { type: 'divider' },
              { type: 'link', text: 'Subnet groups', href: '#' },
              { type: 'link', text: 'Parameter groups', href: '#' },
              { type: 'link', text: 'Option groups', href: '#' },
              { type: 'link', text: 'Events', href: '#' },
            ]}
          />
        }
        breadcrumbs={
          <BreadcrumbGroup
            items={
              result
                ? [
                    { text: 'RDS', href: '#' },
                    { text: 'Databases', href: '#/databases' },
                    { text: result.identifier, href: '#' },
                  ]
                : [
                    { text: 'RDS', href: '#' },
                    { text: 'Databases', href: '#/databases' },
                    { text: 'Create database', href: '#' },
                  ]
            }
          />
        }
        toolsHide={true}
        content={
          result ? (
            <DatabaseView db={result} onCreateAnother={reset} />
          ) : (
            <ContentLayout
              header={
                <Header
                  variant="h1"
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button onClick={reset}>Cancel</Button>
                    </SpaceBetween>
                  }
                >
                  Create database
                </Header>
              }
            >
              <div className="launch-grid">
                <div className="launch-main">
                  <SpaceBetween size="l">
                    <div id="section-creation-method">
                      <CreationMethod />
                    </div>
                    <div id="section-engine">
                      <EngineOptions
                        state={state}
                        setState={setState}
                        onEngineChange={handleEngineChange}
                      />
                    </div>
                    <div id="section-templates">
                      <Templates
                        state={state}
                        onTemplateChange={handleTemplateChange}
                      />
                    </div>
                    <div id="section-availability">
                      <Availability state={state} setState={setState} />
                    </div>
                    <div id="section-settings">
                      <Settings
                        state={state}
                        setState={setState}
                        errors={errors}
                      />
                    </div>
                    <div id="section-instance-class">
                      <InstanceConfiguration
                        state={state}
                        setState={setState}
                      />
                    </div>
                    <div id="section-storage">
                      <Storage
                        state={state}
                        setState={setState}
                        errors={errors}
                      />
                    </div>
                    <div id="section-connectivity">
                      <Connectivity
                        state={state}
                        setState={setState}
                        errors={errors}
                      />
                    </div>
                    <div id="section-authentication">
                      <Authentication state={state} setState={setState} />
                    </div>
                    <div id="section-additional">
                      <AdditionalConfiguration
                        state={state}
                        setState={setState}
                        errors={errors}
                      />
                    </div>
                  </SpaceBetween>
                </div>
                <div id="section-summary" className="launch-summary">
                  <SummaryPanel
                    state={state}
                    onCreate={handleCreate}
                    creating={creating}
                    error={error}
                  />
                </div>
              </div>
            </ContentLayout>
          )
        }
      />
      {tutorialActive && !result && (
        <TutorialOverlay
          key={tutorialKey}
          onExit={() => setTutorialActive(false)}
        />
      )}
    </>
  );
}
