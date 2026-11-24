import React, { useEffect, useState } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';

import NameAndTags from './sections/NameAndTags';
import AmiSelection from './sections/AmiSelection';
import InstanceType from './sections/InstanceType';
import KeyPair from './sections/KeyPair';
import NetworkSettings from './sections/NetworkSettings';
import Storage from './sections/Storage';
import AdvancedDetails from './sections/AdvancedDetails';
import SummaryPanel from './sections/SummaryPanel';
import SuccessView from './sections/SuccessView';
import TutorialOverlay from './TutorialOverlay';
import { mockLaunchInstance } from './mockLaunch';

const initialState = {
  name: '',
  tags: [],
  amiKey: 'amazon-linux',
  instanceType: 't2.micro',
  keyPairMode: 'existing',
  keyPair: 'my-dev-keypair',
  vpc: 'vpc-0a1b2c3d4e5f60001',
  subnet: '',
  autoAssignIp: 'enable',
  securityGroupMode: 'create',
  securityGroupName: 'launch-wizard-1',
  securityGroupDescription: 'launch-wizard-1 created by EC2 mock console',
  sshSource: 'My IP',
  volumes: [{ device: '/dev/xvda', size: '8', type: 'gp3', root: true }],
  iamRole: 'None',
  shutdownBehavior: 'stop',
  terminationProtection: false,
  userData: '',
  numberOfInstances: 1,
};

export default function App() {
  const [state, setState] = useState(initialState);
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  // The guided walkthrough opens automatically — this embed *is* the lab, so
  // students should land straight in the tutorial rather than needing to find it.
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
      const headerHeight = parentDocument.querySelector('header')?.getBoundingClientRect().height ?? 0;
      const rect = window.frameElement.getBoundingClientRect();
      const targetY = parentWindow.scrollY + rect.top - headerHeight - 8;
      parentWindow.scrollTo({ top: Math.max(targetY, 0), behavior: 'smooth' });
    } catch (e) {
      // Cross-origin or otherwise inaccessible — fall back to a plain scrollIntoView.
      window.frameElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    scrollEmbedIntoView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openTutorial = () => {
    setTutorialKey((k) => k + 1);
    setTutorialActive(true);
    scrollEmbedIntoView();
  };

  const closeTutorial = () => {
    setTutorialActive(false);
  };

  const handleLaunch = async () => {
    setLaunching(true);
    setError(null);
    try {
      // This lab is embedded as a static bundle with no backend of its own,
      // so the "launch" is simulated entirely client-side.
      const data = await mockLaunchInstance(state);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLaunching(false);
    }
  };

  const handleBack = () => {
    setResult(null);
    setState(initialState);
  };

  return (
    <>
      <div id="top-nav">
        <TopNavigation
          identity={{ href: '#', title: 'AWS' }}
          utilities={[
            { type: 'button', text: 'N. Virginia', iconName: 'multiscreen' },
            { type: 'button', text: 'Help', iconName: 'status-info', variant: 'primary-button', onClick: openTutorial },
            { type: 'button', iconName: 'notification' },
            { type: 'button', iconName: 'settings' },
            {
              type: 'menu-dropdown',
              text: 'student@flipthescript.dev',
              iconName: 'user-profile',
              items: [
                { id: 'signout', text: 'Sign out' },
              ],
            },
          ]}
          i18nStrings={{ overflowMenuTriggerText: 'More', overflowMenuTitleText: 'All' }}
        />
      </div>
      <AppLayout
        headerSelector="#top-nav"
        navigation={
          <SideNavigation
            header={{ text: 'EC2', href: '#' }}
            activeHref="#/instances"
            items={[
              { type: 'link', text: 'EC2 Dashboard', href: '#' },
              {
                type: 'section',
                text: 'Instances',
                items: [
                  { type: 'link', text: 'Instances', href: '#/instances' },
                  { type: 'link', text: 'Instance Types', href: '#' },
                  { type: 'link', text: 'Launch Templates', href: '#' },
                  { type: 'link', text: 'Spot Requests', href: '#' },
                ],
              },
              {
                type: 'section',
                text: 'Images',
                items: [
                  { type: 'link', text: 'AMIs', href: '#' },
                ],
              },
              {
                type: 'section',
                text: 'Network & Security',
                items: [
                  { type: 'link', text: 'Security Groups', href: '#' },
                  { type: 'link', text: 'Key Pairs', href: '#' },
                ],
              },
            ]}
          />
        }
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { text: 'EC2', href: '#' },
              { text: 'Instances', href: '#/instances' },
              { text: 'Launch an instance', href: '#' },
            ]}
          />
        }
        toolsHide={true}
        content={
          result ? (
            <SuccessView result={result} onBack={handleBack} />
          ) : (
            <ContentLayout
              header={
                <Header
                  variant="h1"
                  description="Configuration required for this instance is broken up into multiple categories."
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button onClick={handleBack}>Cancel</Button>
                    </SpaceBetween>
                  }
                >
                  Launch an instance
                </Header>
              }
            >
              <div className="launch-grid">
                <div className="launch-main">
                  <SpaceBetween size="l">
                    <div id="section-name-and-tags">
                      <NameAndTags state={state} setState={setState} />
                    </div>
                    <div id="section-ami">
                      <AmiSelection state={state} setState={setState} />
                    </div>
                    <div id="section-instance-type">
                      <InstanceType state={state} setState={setState} />
                    </div>
                    <div id="section-key-pair">
                      <KeyPair state={state} setState={setState} />
                    </div>
                    <div id="section-network-settings">
                      <NetworkSettings state={state} setState={setState} />
                    </div>
                    <div id="section-storage">
                      <Storage state={state} setState={setState} />
                    </div>
                    <div id="section-advanced-details">
                      <AdvancedDetails state={state} setState={setState} />
                    </div>
                  </SpaceBetween>
                </div>
                <div id="section-summary" className="launch-summary">
                  <SummaryPanel state={state} setState={setState} onLaunch={handleLaunch} launching={launching} error={error} />
                </div>
              </div>
            </ContentLayout>
          )
        }
      />
      {tutorialActive && !result && <TutorialOverlay key={tutorialKey} onExit={closeTutorial} />}
    </>
  );
}
