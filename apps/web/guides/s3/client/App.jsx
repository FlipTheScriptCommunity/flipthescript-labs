import React, { useEffect, useState } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';

import GeneralConfiguration from './sections/GeneralConfiguration';
import ObjectOwnership from './sections/ObjectOwnership';
import BlockPublicAccess from './sections/BlockPublicAccess';
import BucketVersioning from './sections/BucketVersioning';
import Tags from './sections/Tags';
import DefaultEncryption from './sections/DefaultEncryption';
import AdvancedSettings from './sections/AdvancedSettings';
import SummaryPanel from './sections/SummaryPanel';
import ObjectsList from './sections/ObjectsList';
import UploadPanel from './sections/UploadPanel';
import UploadSuccess from './sections/UploadSuccess';
import TutorialOverlay from './TutorialOverlay';
import { mockCreateBucket } from './mockCreateBucket';
import { mockUploadObject } from './mockUpload';

const initialFormState = {
  name: '',
  region: 'us-east-1',
  objectOwnership: 'bucket-owner-enforced',
  blockPublicAccess: {
    blockNewAcls: true,
    blockAnyAcls: true,
    blockNewPolicies: true,
    blockAnyPolicies: true,
  },
  publicAccessAcknowledged: false,
  versioning: 'disable',
  tags: [],
  encryptionType: 'SSE-S3',
  kmsKey: 'aws/s3',
  bucketKeyEnabled: true,
  objectLockEnabled: false,
};

const initialUploadState = { file: null, prefix: '', storageClass: 'STANDARD' };

export default function App() {
  const [formState, setFormState] = useState(initialFormState);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // 'create' | 'objects' | 'upload' | 'upload-success'
  const [view, setView] = useState('create');
  const [bucket, setBucket] = useState(null);
  const [objects, setObjects] = useState([]);
  const [showCreatedBanner, setShowCreatedBanner] = useState(false);

  const [uploadState, setUploadState] = useState(initialUploadState);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // The guided walkthrough opens automatically on the "create bucket" form —
  // this embed *is* the lab, so students should land straight in the
  // tutorial rather than needing to find it. A second, shorter walkthrough
  // auto-opens the first time the upload screen is shown.
  const [tutorialActive, setTutorialActive] = useState(true);
  const [tutorialSection, setTutorialSection] = useState('create');
  const [tutorialKey, setTutorialKey] = useState(0);
  const [uploadTutorialShown, setUploadTutorialShown] = useState(false);

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

  useEffect(() => {
    if (view === 'upload' && !uploadTutorialShown) {
      setTutorialSection('upload');
      setTutorialKey((k) => k + 1);
      setTutorialActive(true);
      setUploadTutorialShown(true);
      scrollEmbedIntoView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const openTutorial = () => {
    setTutorialSection(view === 'upload' ? 'upload' : 'create');
    setTutorialKey((k) => k + 1);
    setTutorialActive(true);
    scrollEmbedIntoView();
  };

  const closeTutorial = () => setTutorialActive(false);

  const handleCreateBucket = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const data = await mockCreateBucket(formState);
      setBucket({
        name: formState.name,
        region: data.region,
        versioning: formState.versioning,
        encryptionType: formState.encryptionType,
      });
      setShowCreatedBanner(true);
      setView('objects');
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleStartUpload = () => {
    setUploadError(null);
    setUploadState(initialUploadState);
    setView('upload');
  };

  const handleSubmitUpload = async () => {
    setUploading(true);
    setUploadError(null);
    try {
      const result = await mockUploadObject({
        bucketName: bucket.name,
        region: bucket.region,
        file: uploadState.file,
        prefix: uploadState.prefix,
        storageClass: uploadState.storageClass,
        encryptionType: bucket.encryptionType,
      });
      setUploadResult(result);
      setObjects((prev) => [...prev, result]);
      setView('upload-success');
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadSuccess = () => {
    setUploadResult(null);
    setView('objects');
  };

  const handleCancelUpload = () => setView('objects');

  const breadcrumbItems = (() => {
    const base = [
      { text: 'S3', href: '#' },
      { text: 'Buckets', href: '#/buckets' },
    ];
    if (view === 'create')
      return [...base, { text: 'Create bucket', href: '#' }];
    if (bucket) {
      const withBucket = [...base, { text: bucket.name, href: '#/bucket' }];
      if (view === 'upload' || view === 'upload-success') {
        return [...withBucket, { text: 'Upload', href: '#' }];
      }
      return withBucket;
    }
    return base;
  })();

  let content;
  if (view === 'create') {
    content = (
      <ContentLayout
        header={
          <Header
            variant="h1"
            description="Buckets are containers for data stored in S3."
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button onClick={() => setFormState(initialFormState)}>
                  Cancel
                </Button>
              </SpaceBetween>
            }
          >
            Create bucket
          </Header>
        }
      >
        <div className="launch-grid">
          <div className="launch-main">
            <SpaceBetween size="l">
              <div id="section-general-configuration">
                <GeneralConfiguration
                  state={formState}
                  setState={setFormState}
                />
              </div>
              <div id="section-object-ownership">
                <ObjectOwnership state={formState} setState={setFormState} />
              </div>
              <div id="section-block-public-access">
                <BlockPublicAccess state={formState} setState={setFormState} />
              </div>
              <div id="section-bucket-versioning">
                <BucketVersioning state={formState} setState={setFormState} />
              </div>
              <div id="section-tags">
                <Tags state={formState} setState={setFormState} />
              </div>
              <div id="section-default-encryption">
                <DefaultEncryption state={formState} setState={setFormState} />
              </div>
              <div id="section-advanced-settings">
                <AdvancedSettings state={formState} setState={setFormState} />
              </div>
            </SpaceBetween>
          </div>
          <div id="section-summary" className="launch-summary">
            <SummaryPanel
              state={formState}
              onCreate={handleCreateBucket}
              creating={creating}
              error={createError}
            />
          </div>
        </div>
      </ContentLayout>
    );
  } else if (view === 'objects' && bucket) {
    content = (
      <ObjectsList
        bucket={bucket}
        objects={objects}
        onUpload={handleStartUpload}
        showCreatedBanner={showCreatedBanner}
        onDismissBanner={() => setShowCreatedBanner(false)}
      />
    );
  } else if (view === 'upload' && bucket) {
    content = (
      <UploadPanel
        bucket={bucket}
        upload={uploadState}
        setUpload={setUploadState}
        onSubmit={handleSubmitUpload}
        uploading={uploading}
        error={uploadError}
        onCancel={handleCancelUpload}
      />
    );
  } else if (view === 'upload-success' && uploadResult) {
    content = (
      <UploadSuccess result={uploadResult} onClose={handleCloseUploadSuccess} />
    );
  }

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
            header={{ text: 'Amazon S3', href: '#' }}
            activeHref="#/buckets"
            items={[
              { type: 'link', text: 'Buckets', href: '#/buckets' },
              { type: 'link', text: 'Access Points', href: '#' },
              { type: 'link', text: 'Batch Operations', href: '#' },
              {
                type: 'section',
                text: 'Access Management',
                items: [
                  {
                    type: 'link',
                    text: 'Block Public Access settings for this account',
                    href: '#',
                  },
                  { type: 'link', text: 'Access Analyzer for S3', href: '#' },
                ],
              },
              {
                type: 'section',
                text: 'Insights',
                items: [{ type: 'link', text: 'Storage Lens', href: '#' }],
              },
            ]}
          />
        }
        breadcrumbs={<BreadcrumbGroup items={breadcrumbItems} />}
        toolsHide={true}
        content={content}
      />
      {tutorialActive && (view === 'create' || view === 'upload') && (
        <TutorialOverlay
          key={tutorialKey}
          section={tutorialSection}
          onExit={closeTutorial}
        />
      )}
    </>
  );
}
