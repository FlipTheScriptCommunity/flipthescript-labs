import React, { useEffect, useState } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';

import NameTag from './sections/NameTag';
import Ipv4Cidr from './sections/Ipv4Cidr';
import Ipv6Cidr from './sections/Ipv6Cidr';
import Tenancy from './sections/Tenancy';
import AzAndSubnets from './sections/AzAndSubnets';
import NatGateways from './sections/NatGateways';
import VpcEndpoints from './sections/VpcEndpoints';
import DnsOptions from './sections/DnsOptions';
import SummaryPanel from './sections/SummaryPanel';
import ResultView from './sections/ResultView';
import TutorialOverlay from './TutorialOverlay';
import { mockCreateVpc } from './mockCreateVpc';

const initialState = {
  namePrefix: '',
  ipv4Cidr: '10.0.0.0/16',
  ipv6: 'none',
  tenancy: 'default',
  azCount: 2,
  publicSubnetCount: 2,
  privateSubnetCount: 2,
  natGateways: 'one',
  vpcEndpoint: 'none',
  dnsHostnames: true,
  dnsResolution: true,
};

export default function App() {
  const [state, setState] = useState(initialState);
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
    } catch (e) {
      // Cross-origin or otherwise inaccessible — fall back to a plain scrollIntoView.
      window.frameElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
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

  const closeTutorial = () => setTutorialActive(false);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const data = await mockCreateVpc(state);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAnother = () => {
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
            header={{ text: 'VPC', href: '#' }}
            activeHref="#/vpcs"
            items={[
              { type: 'link', text: 'Your VPCs', href: '#/vpcs' },
              { type: 'link', text: 'Subnets', href: '#' },
              { type: 'link', text: 'Route tables', href: '#' },
              { type: 'link', text: 'Internet gateways', href: '#' },
              { type: 'link', text: 'NAT gateways', href: '#' },
              {
                type: 'section',
                text: 'Security',
                items: [{ type: 'link', text: 'Security groups', href: '#' }],
              },
              {
                type: 'section',
                text: 'Endpoints',
                items: [{ type: 'link', text: 'Endpoints', href: '#' }],
              },
            ]}
          />
        }
        breadcrumbs={
          <BreadcrumbGroup
            items={
              result
                ? [
                    { text: 'VPC', href: '#' },
                    { text: 'Your VPCs', href: '#/vpcs' },
                    { text: result.vpcId, href: '#' },
                  ]
                : [
                    { text: 'VPC', href: '#' },
                    { text: 'Your VPCs', href: '#/vpcs' },
                    { text: 'Create VPC', href: '#' },
                  ]
            }
          />
        }
        toolsHide={true}
        content={
          result ? (
            <ResultView result={result} onCreateAnother={handleCreateAnother} />
          ) : (
            <ContentLayout
              header={
                <Header
                  variant="h1"
                  description="Creates a VPC, plus subnets, route tables, and gateways, based on your configuration."
                  actions={
                    <SpaceBetween direction="horizontal" size="xs">
                      <Button onClick={() => setState(initialState)}>
                        Cancel
                      </Button>
                    </SpaceBetween>
                  }
                >
                  Create VPC
                </Header>
              }
            >
              <div className="launch-grid">
                <div className="launch-main">
                  <SpaceBetween size="l">
                    <div id="section-name-tag">
                      <NameTag state={state} setState={setState} />
                    </div>
                    <div id="section-ipv4-cidr">
                      <Ipv4Cidr state={state} setState={setState} />
                    </div>
                    <div id="section-ipv6-cidr">
                      <Ipv6Cidr state={state} setState={setState} />
                    </div>
                    <div id="section-tenancy">
                      <Tenancy state={state} setState={setState} />
                    </div>
                    <div id="section-az-subnets">
                      <AzAndSubnets state={state} setState={setState} />
                    </div>
                    <div id="section-nat-gateways">
                      <NatGateways state={state} setState={setState} />
                    </div>
                    <div id="section-vpc-endpoints">
                      <VpcEndpoints state={state} setState={setState} />
                    </div>
                    <div id="section-dns-options">
                      <DnsOptions state={state} setState={setState} />
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
        <TutorialOverlay key={tutorialKey} onExit={closeTutorial} />
      )}
    </>
  );
}
